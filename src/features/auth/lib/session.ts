import axios from "axios";
import { env } from "@/config/env";
import { toApiError } from "@/lib/api/api-error";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { useAuthStore } from "@/stores/auth.store";
import { AuthSessionResponseSchema, type AuthSessionSchemaType } from "../schemas/auth.schema";

/**
 * Bare Axios instance for the refresh call only. It has no interceptors,
 * so a failing refresh can never trigger another refresh (infinite loop).
 */
const refreshHttp = axios.create({
  baseURL: env.VITE_API_BASE_URL,
  withCredentials: true,
});

/* ---------------------------------------------------------------------------
 * Session hint
 * A non-secret "1" flag in localStorage meaning "this browser probably has a refresh cookie".
 * Guests skip the refresh call on page load entirely: no wasted request and no hits on the
 * backend refresh rate limiter (30 requests / 15 min).
 * ------------------------------------------------------------------------- */
const SESSION_HINT_KEY = "auth:has-session";

function hasSessionHint(): boolean {
  try {
    return localStorage.getItem(SESSION_HINT_KEY) === "1";
  } catch {
    return false;
  }
}

function setSessionHint(isActive: boolean): void {
  try {
    if (isActive) localStorage.setItem(SESSION_HINT_KEY, "1");
    else localStorage.removeItem(SESSION_HINT_KEY);
  } catch {
    // Storage can be unavailable (private mode); the app still works without the hint.
  }
}

/* ---------------------------------------------------------------------------
 * Cross-tab sync
 * Logging out (or in) in one tab updates every open tab.
 * ------------------------------------------------------------------------- */
type AuthEventType = "login" | "logout";

const authChannel = typeof BroadcastChannel === "undefined" ? null : new BroadcastChannel("auth");

export function subscribeToAuthEvents(handler: (event: AuthEventType) => void): () => void {
  if (!authChannel) return () => undefined;

  const listener = (message: MessageEvent<unknown>) => {
    if (message.data === "login" || message.data === "logout") handler(message.data);
  };
  authChannel.addEventListener("message", listener);
  return () => {
    authChannel.removeEventListener("message", listener);
  };
}

/* ---------------------------------------------------------------------------
 * Session lifecycle
 * ------------------------------------------------------------------------- */

/** Called after a successful login (or refresh). */
export function startSession(session: AuthSessionSchemaType, options = { broadcast: true }): void {
  useAuthStore.getState().setSession(session);
  setSessionHint(true);
  if (options.broadcast) authChannel?.postMessage("login" satisfies AuthEventType);
}

/** Called on logout, failed refresh, or a logout event from another tab. */
export function endSession(options = { broadcast: true }): void {
  useAuthStore.getState().clearSession();
  setSessionHint(false);
  if (options.broadcast) authChannel?.postMessage("logout" satisfies AuthEventType);
}

async function requestRefresh(): Promise<AuthSessionSchemaType> {
  const response = await refreshHttp.post(API_ENDPOINTS.AUTH.REFRESH);
  return AuthSessionResponseSchema.parse(response.data).data;
}

/**
 * Two protections, because the backend rotates the refresh token on every call and treats
 * reuse of an old token (after a 10s grace period) as theft, revoking all sessions:
 *
 * 1. Single-flight (same tab): parallel 401s share one promise, so only one request is sent.
 * 2. Web Locks (across tabs): tabs refresh one after another. The second tab's request carries
 *    the cookie the first tab just received (cookies are shared), so it does not reuse a
 *    rotated token.
 */
let refreshPromise: Promise<string> | null = null;

export function refreshSession(): Promise<string> {
  refreshPromise ??= (async () => {
    try {
      const session =
        typeof navigator !== "undefined" && "locks" in navigator
          ? await navigator.locks.request("auth-refresh", requestRefresh)
          : await requestRefresh();

      startSession(session, { broadcast: false });
      return session.accessToken;
    } catch (error) {
      endSession({ broadcast: false });
      throw toApiError(error);
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

/**
 * Restores the session once per page load (from the root route loader).
 * Never throws: a failed restore simply means the visitor is a guest.
 */
let restorePromise: Promise<void> | null = null;

export function restoreSession(): Promise<void> {
  restorePromise ??= (async () => {
    if (useAuthStore.getState().accessToken || !hasSessionHint()) return;
    try {
      await refreshSession();
    } catch {
      // Expired/revoked refresh token: continue as guest (endSession already ran).
    }
  })();

  return restorePromise;
}
