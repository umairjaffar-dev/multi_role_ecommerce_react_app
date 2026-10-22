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
  CATEGORIES: {
    LIST: "/categories",
  },
  PRODUCTS: {
    LIST: "/products",
    DETAIL: (slug: string) => `/products/${encodeURIComponent(slug)}`,
  },
  ADMIN: {
    CATEGORIES: "/admin/categories",
    PRODUCTS: "/admin/products",
    PRODUCT: (id: string) => `/admin/products/${encodeURIComponent(id)}`,
    PRODUCT_IMAGES: (id: string) => `/admin/products/${encodeURIComponent(id)}/images`,
  },
} as const;
