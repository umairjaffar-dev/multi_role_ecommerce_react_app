import { useSearchParams } from "react-router";
import {
  AdminCameraFiltersSchema,
  type AdminCameraFiltersSchemaType,
} from "../schemas/camera.schema";

type CameraParamKeyType = "page" | "search" | "isActive";

/** Management table filters live in the URL, same as useAdminProductFilters. */
export function useAdminCameraFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters: AdminCameraFiltersSchemaType = AdminCameraFiltersSchema.parse({
    page: searchParams.get("page") ?? undefined,
    search: searchParams.get("search") ?? undefined,
    isActive: searchParams.get("isActive") ?? undefined,
  });

  /** Any filter change goes back to page 1. */
  const updateFilters = (updates: Partial<Record<CameraParamKeyType, string>>) => {
    setSearchParams(
      (previous) => {
        const next = new URLSearchParams(previous);
        if (!("page" in updates)) next.delete("page");
        for (const [key, value] of Object.entries(updates)) {
          if (!value || (key === "page" && value === "1")) next.delete(key);
          else next.set(key, value);
        }
        return next;
      },
      { replace: !("page" in updates) },
    );
  };

  return { filters, updateFilters };
}
