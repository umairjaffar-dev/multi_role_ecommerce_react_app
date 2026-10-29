import { queryOptions } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/api-client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import {
  CameraDetailResponseSchema,
  CameraListResponseSchema,
  CameraStatusResponseSchema,
} from "../schemas/camera.schema";

// Backend maximum page size. Enough for a lab; a real VMS would page or group by site.
const LIVE_GRID_LIMIT = 100;
// How often a tile re-checks its stream state. Each visible tile polls on its own.
const STATUS_REFRESH_MS = 10_000;

/** Query key factory, same pattern as productKeys. */
export const cameraKeys = {
  all: ["cameras"] as const,
  liveList: () => [...cameraKeys.all, "list", "live"] as const,
  detail: (id: string) => [...cameraKeys.all, "detail", id] as const,
  status: (id: string) => [...cameraKeys.all, "status", id] as const,
};

/** Active cameras only: disabled cameras have no MediaMTX path, so nothing to play. */
export function liveCameraListQuery() {
  return queryOptions({
    queryKey: cameraKeys.liveList(),
    queryFn: async ({ signal }) => {
      const response = await apiClient.get(API_ENDPOINTS.ADMIN.CAMERAS, {
        params: { isActive: true, limit: LIVE_GRID_LIMIT },
        signal,
      });
      return CameraListResponseSchema.parse(response.data);
    },
  });
}

export function cameraDetailQuery(id: string) {
  return queryOptions({
    queryKey: cameraKeys.detail(id),
    queryFn: async ({ signal }) => {
      const response = await apiClient.get(API_ENDPOINTS.ADMIN.CAMERA(id), { signal });
      return CameraDetailResponseSchema.parse(response.data).data;
    },
  });
}

/**
 * Live stream state from MediaMTX (through the backend). Polled while the tab is visible;
 * TanStack Query pauses the interval in background tabs by default.
 */
export function cameraStatusQuery(id: string) {
  return queryOptions({
    queryKey: cameraKeys.status(id),
    queryFn: async ({ signal }) => {
      const response = await apiClient.get(API_ENDPOINTS.ADMIN.CAMERA_STATUS(id), { signal });
      return CameraStatusResponseSchema.parse(response.data).data;
    },
    refetchInterval: STATUS_REFRESH_MS,
    staleTime: 0,
  });
}
