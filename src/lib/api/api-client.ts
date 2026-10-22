import axios, { type InternalAxiosRequestConfig } from "axios";
import { z } from "zod";
import { env } from "@/config/env";
import { useAuthStore } from "@/stores/auth.store";
import { toApiError } from "./api-error";
import { createApiSuccessSchema } from "./api-response";
import { API_ENDPOINTS } from "./endpoints";

/**
 * Shared Axios instance for every API call.
 * `withCredentials` lets the browser send the httpOnly refresh-token cookie.
 */
export const apiClient = axios.create({
  baseURL: env.VITE_API_BASE_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

/**
 * Bare instance for the refresh call only. It has no interceptors,
 * so a failing refresh can never trigger another refresh (infinite loop).
 */
const refreshClient = axios.create({
  baseURL: env.VITE_API_BASE_URL,
  withCredentials: true,
});

const RefreshResponseSchema = createApiSuccessSchema(z.looseObject({ accessToken: z.string() }));

/** Endpoints where a 401 means "wrong credentials", not "token expired". */
const AUTH_PATHS_WITHOUT_REFRESH: ReadonlyArray<string> = [
  API_ENDPOINTS.AUTH.LOGIN,
  API_ENDPOINTS.AUTH.REGISTER,
  API_ENDPOINTS.AUTH.REFRESH,
];

/** Requests already retried once after a refresh; a second 401 must not loop. */
const retriedRequests = new WeakSet<InternalAxiosRequestConfig>();

/**
 * Single-flight refresh: when several requests get 401 at the same time, they all await
 * the same promise. Only one POST /auth/refresh is sent. This matters because the backend
 * rotates the refresh token and treats reuse (after a 10s grace) as theft, revoking all sessions.
 */
let refreshPromise: Promise<string> | null = null;

export function refreshAccessToken(): Promise<string> {
  refreshPromise ??= refreshClient
    .post(API_ENDPOINTS.AUTH.REFRESH)
    .then((response) => {
      const { accessToken } = RefreshResponseSchema.parse(response.data).data;
      useAuthStore.getState().setAccessToken(accessToken);
      return accessToken;
    })
    .catch((error: unknown) => {
      useAuthStore.getState().clearSession();
      throw toApiError(error);
    })
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
}

// Attach the current access token. Read via getState() so no React hook or effect is needed.
apiClient.interceptors.request.use((config) => {
  const { accessToken } = useAuthStore.getState();
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// On 401: refresh once, then replay the original request. Every other error is normalised to ApiError.
apiClient.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (!axios.isAxiosError(error) || !error.config) {
      throw toApiError(error);
    }

    const originalRequest = error.config;
    const isUnauthorized = error.response?.status === 401;
    const isAuthPath = AUTH_PATHS_WITHOUT_REFRESH.some((path) =>
      originalRequest.url?.startsWith(path),
    );

    if (!isUnauthorized || isAuthPath || retriedRequests.has(originalRequest)) {
      throw toApiError(error);
    }

    retriedRequests.add(originalRequest);
    const newAccessToken = await refreshAccessToken();
    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
    return apiClient(originalRequest);
  },
);
