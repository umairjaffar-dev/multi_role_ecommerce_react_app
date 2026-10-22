import { data, redirect, type LoaderFunctionArgs } from "react-router";
import { useAuthStore } from "@/stores/auth.store";
import { buildLoginPath, getSafeRedirectPath, REDIRECT_PARAM } from "./safe-redirect";
import { restoreSession } from "./session";

/*
 * Guards run as route loaders, i.e. BEFORE the page renders. Compared with checking inside
 * a component (useEffect + navigate), there is no flash of protected content and the page's
 * own data requests never start for a user who will be redirected anyway.
 *
 * React Router runs the loaders of nested routes in parallel, so every guard awaits
 * restoreSession() itself (it is memoised: one refresh per page load at most).
 */

/** Root loader: restores the session once so the header knows who is logged in. */
export async function rootSessionLoader(): Promise<null> {
  await restoreSession();
  return null;
}

/** Logged-in users only (account pages, checkout). */
export async function requireAuthLoader({ request }: LoaderFunctionArgs): Promise<null> {
  await restoreSession();
  if (!useAuthStore.getState().user) {
    throw redirect(buildLoginPath(request.url));
  }
  return null;
}

/** Guests only (login, register). A logged-in user is sent on to `redirectTo` or home. */
export async function requireGuestLoader({ request }: LoaderFunctionArgs): Promise<null> {
  await restoreSession();
  if (useAuthStore.getState().user) {
    const redirectTo = new URL(request.url).searchParams.get(REDIRECT_PARAM);
    throw redirect(getSafeRedirectPath(redirectTo));
  }
  return null;
}

/**
 * Admins only. A guest is sent to login; a logged-in customer gets a 403 page
 * (redirecting them to login would be confusing, they are already logged in).
 * The backend still enforces requireRole("admin"): this guard is UX, not security.
 */
export async function requireAdminLoader({ request }: LoaderFunctionArgs): Promise<null> {
  await restoreSession();
  const { user } = useAuthStore.getState();

  if (!user) {
    throw redirect(buildLoginPath(request.url));
  }
  if (user.role !== "admin") {
    throw data("You do not have permission to view this page.", {
      status: 403,
      statusText: "Forbidden",
    });
  }
  return null;
}
