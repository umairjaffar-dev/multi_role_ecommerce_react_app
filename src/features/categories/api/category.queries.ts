import { queryOptions } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/api-client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { CategoryListResponseSchema, type CategorySchemaType } from "../schemas/category.schema";

// Backend max page size; enough for filter dropdowns until there are >100 categories.
const CATEGORY_OPTIONS_LIMIT = 100;

export const categoryKeys = {
  all: ["categories"] as const,
  publicOptions: () => [...categoryKeys.all, "public-options"] as const,
  adminOptions: () => [...categoryKeys.all, "admin-options"] as const,
};

/** Active categories for the storefront filter (public endpoint). */
export function publicCategoryOptionsQuery() {
  return queryOptions({
    queryKey: categoryKeys.publicOptions(),
    queryFn: async ({ signal }): Promise<Array<CategorySchemaType>> => {
      const response = await apiClient.get(API_ENDPOINTS.CATEGORIES.LIST, {
        params: { limit: CATEGORY_OPTIONS_LIMIT },
        signal,
      });
      return CategoryListResponseSchema.parse(response.data).data;
    },
    // Categories rarely change; avoid refetching on every filter interaction.
    staleTime: 5 * 60_000,
  });
}

/** All categories, including hidden ones, for the admin product form and filters. */
export function adminCategoryOptionsQuery() {
  return queryOptions({
    queryKey: categoryKeys.adminOptions(),
    queryFn: async ({ signal }): Promise<Array<CategorySchemaType>> => {
      const response = await apiClient.get(API_ENDPOINTS.ADMIN.CATEGORIES, {
        params: { limit: CATEGORY_OPTIONS_LIMIT },
        signal,
      });
      return CategoryListResponseSchema.parse(response.data).data;
    },
    staleTime: 5 * 60_000,
  });
}
