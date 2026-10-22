import axios, { type InternalAxiosRequestConfig } from "axios";
import { env } from "@/config/env";
import { refreshSession } from "@/features/auth/lib/session";
import { useAuthStore } from "@/stores/auth.store";
import { toApiError } from "./api-error";

/**
 * Shared Axios instance for every API call.
 * `withCredentials` lets the browser send the httpOnly refresh-token cookie.
 *
 * No default Content-Type on purpose: Axios sets application/json for plain objects and
 * multipart/form-data (with the boundary) for FormData. A fixed JSON header would make
 * Axios serialise FormData image uploads as JSON.
 */
export const apiClient = axios.create({
  baseURL: env.VITE_API_BASE_URL,
  withCredentials: true,
});

/** Requests already retried once after a refresh; a second 401 must not loop. */
const retriedRequests = new WeakSet<InternalAxiosRequestConfig>();

// Attach the current access token. Read via getState() so no React hook or effect is needed.
apiClient.interceptors.request.use((config) => {
  const { accessToken } = useAuthStore.getState();
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

/**
 * Refresh only when the backend says the access token EXPIRED (code AUTH_TOKEN_EXPIRED).
 * Other 401s (wrong password, missing/invalid token) are real failures, not a refresh signal.
 * Every error leaving the client is normalised to ApiError.
 */
apiClient.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    const apiError = toApiError(error);

    if (
      !axios.isAxiosError(error) ||
      !error.config ||
      apiError.code !== "AUTH_TOKEN_EXPIRED" ||
      retriedRequests.has(error.config)
    ) {
      throw apiError;
    }

    const originalRequest = error.config;
    retriedRequests.add(originalRequest);

    const newAccessToken = await refreshSession();
    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
    return apiClient(originalRequest);
  },
);
