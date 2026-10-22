/**
 * Single source of truth for backend paths (relative to env.VITE_API_BASE_URL).
 * Modules add their endpoints here as they are built.
 */
export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: "/auth/register",
    LOGIN: "/auth/login",
    REFRESH: "/auth/refresh",
    LOGOUT: "/auth/logout",
  },
} as const;
