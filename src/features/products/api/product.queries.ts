import { infiniteQueryOptions, keepPreviousData, queryOptions } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/api-client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import {
  AdminProductDetailResponseSchema,
  AdminProductListResponseSchema,
  PublicProductDetailResponseSchema,
  PublicProductListResponseSchema,
  type AdminProductFiltersSchemaType,
  type ProductListFiltersSchemaType,
} from "../schemas/product.schema";

const PUBLIC_PAGE_SIZE = 12;
export const ADMIN_PAGE_SIZE = 10;

/**
 * Query key factory: every key is built here, so invalidation is precise and typo-proof.
 * e.g. invalidate productKeys.admin() after an edit refreshes every admin list and detail.
 */
export const productKeys = {
  all: ["products"] as const,
  publicLists: () => [...productKeys.all, "public", "list"] as const,
  publicList: (filters: ProductListFiltersSchemaType) =>
    [...productKeys.publicLists(), filters] as const,
  publicDetail: (slug: string) => [...productKeys.all, "public", "detail", slug] as const,
  admin: () => [...productKeys.all, "admin"] as const,
  adminList: (filters: AdminProductFiltersSchemaType) =>
    [...productKeys.admin(), "list", filters] as const,
  adminDetail: (id: string) => [...productKeys.admin(), "detail", id] as const,
};

/*
 * queryOptions() objects keep key + fetcher + config together. The same object is used by
 * components (useQuery), route loaders (ensureQueryData) and hover prefetching, so they can
 * never drift apart.
 */

/** Storefront list: cursor pagination ("Load more"). */
export function publicProductListQuery(filters: ProductListFiltersSchemaType) {
  return infiniteQueryOptions({
    queryKey: productKeys.publicList(filters),
    queryFn: async ({ pageParam, signal }) => {
      const response = await apiClient.get(API_ENDPOINTS.PRODUCTS.LIST, {
        params: { ...filters, limit: PUBLIC_PAGE_SIZE, cursor: pageParam },
        signal,
      });
      return PublicProductListResponseSchema.parse(response.data);
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.meta.nextCursor ?? undefined,
  });
}

export function publicProductDetailQuery(slug: string) {
  return queryOptions({
    queryKey: productKeys.publicDetail(slug),
    queryFn: async ({ signal }) => {
      const response = await apiClient.get(API_ENDPOINTS.PRODUCTS.DETAIL(slug), { signal });
      return PublicProductDetailResponseSchema.parse(response.data).data;
    },
  });
}

/** Admin table: page pagination. Keeps the previous page visible while the next one loads. */
export function adminProductListQuery(filters: AdminProductFiltersSchemaType) {
  return queryOptions({
    queryKey: productKeys.adminList(filters),
    queryFn: async ({ signal }) => {
      const response = await apiClient.get(API_ENDPOINTS.ADMIN.PRODUCTS, {
        params: { ...filters, limit: ADMIN_PAGE_SIZE },
        signal,
      });
      return AdminProductListResponseSchema.parse(response.data);
    },
    placeholderData: keepPreviousData,
    // Admins expect to see their own edits immediately.
    staleTime: 0,
  });
}

export function adminProductDetailQuery(id: string) {
  return queryOptions({
    queryKey: productKeys.adminDetail(id),
    queryFn: async ({ signal }) => {
      const response = await apiClient.get(API_ENDPOINTS.ADMIN.PRODUCT(id), { signal });
      return AdminProductDetailResponseSchema.parse(response.data).data;
    },
    staleTime: 0,
  });
}
