import { useSearchParams } from "react-router";
import {
  ProductListFiltersSchema,
  type ProductListFiltersSchemaType,
} from "../schemas/product.schema";

export type ProductListParamKeyType = "search" | "category" | "minPrice" | "maxPrice" | "sort";

/**
 * The URL is the single source of truth for storefront filters:
 * shareable links, working back button, and filters that survive a reload.
 *
 * - `filters`: validated values for the API (prices converted to paisa).
 * - `params`: the raw text in the URL (prices in rupees), for pre-filling inputs.
 */
export function useProductListFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters: ProductListFiltersSchemaType = ProductListFiltersSchema.parse({
    search: searchParams.get("search") ?? undefined,
    category: searchParams.get("category") ?? undefined,
    minPrice: searchParams.get("minPrice") ?? undefined,
    maxPrice: searchParams.get("maxPrice") ?? undefined,
    sort: searchParams.get("sort") ?? undefined,
  });

  const params: Record<ProductListParamKeyType, string> = {
    search: searchParams.get("search") ?? "",
    category: searchParams.get("category") ?? "",
    minPrice: searchParams.get("minPrice") ?? "",
    maxPrice: searchParams.get("maxPrice") ?? "",
    sort: searchParams.get("sort") ?? "newest",
  };

  /** Empty values are removed so the URL stays clean (?sort=newest is the default anyway). */
  const updateParams = (updates: Partial<Record<ProductListParamKeyType, string>>) => {
    setSearchParams(
      (previous) => {
        const next = new URLSearchParams(previous);
        for (const [key, value] of Object.entries(updates)) {
          if (!value || (key === "sort" && value === "newest")) next.delete(key);
          else next.set(key, value);
        }
        return next;
      },
      // Typing in search should not create one history entry per keystroke.
      { replace: true },
    );
  };

  const clearFilters = () => {
    setSearchParams(new URLSearchParams(), { replace: true });
  };

  const hasActiveFilters = Boolean(
    params.search || params.category || params.minPrice || params.maxPrice,
  );

  return { filters, params, updateParams, clearFilters, hasActiveFilters };
}
