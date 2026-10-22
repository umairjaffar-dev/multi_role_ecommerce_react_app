import { useSearchParams } from "react-router";
import {
  AdminProductFiltersSchema,
  type AdminProductFiltersSchemaType,
} from "../schemas/product.schema";

type AdminParamKeyType = "page" | "search" | "categoryId" | "status" | "isActive";

const DEFAULTS: Partial<Record<AdminParamKeyType, string>> = { page: "1", status: "live" };

/** Admin table filters live in the URL, so a filtered view can be bookmarked or shared. */
export function useAdminProductFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters: AdminProductFiltersSchemaType = AdminProductFiltersSchema.parse({
    page: searchParams.get("page") ?? undefined,
    search: searchParams.get("search") ?? undefined,
    categoryId: searchParams.get("categoryId") ?? undefined,
    status: searchParams.get("status") ?? undefined,
    isActive: searchParams.get("isActive") ?? undefined,
  });

  /** Any filter change goes back to page 1; otherwise page 5 of a smaller result set is empty. */
  const updateFilters = (updates: Partial<Record<AdminParamKeyType, string>>) => {
    setSearchParams(
      (previous) => {
        const next = new URLSearchParams(previous);
        if (!("page" in updates)) next.delete("page");
        for (const [key, value] of Object.entries(updates)) {
          if (!value || DEFAULTS[key as AdminParamKeyType] === value) next.delete(key);
          else next.set(key, value);
        }
        return next;
      },
      { replace: !("page" in updates) },
    );
  };

  return { filters, updateFilters };
}
