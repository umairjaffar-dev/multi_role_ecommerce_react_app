import { useQuery } from "@tanstack/react-query";
import { adminCategoryOptionsQuery } from "../api/category.queries";

/**
 * Looks up whether a category is visible in the store (admin pages only).
 * Unknown/not-yet-loaded categories count as active, so no false warning flashes while loading.
 */
export function useCategoryVisibility() {
  const { data: categories } = useQuery(adminCategoryOptionsQuery());

  const isCategoryActive = (categoryId: string): boolean =>
    categories?.find((category) => category.id === categoryId)?.isActive ?? true;

  const getCategoryName = (categoryId: string): string | undefined =>
    categories?.find((category) => category.id === categoryId)?.name;

  return { isCategoryActive, getCategoryName };
}
