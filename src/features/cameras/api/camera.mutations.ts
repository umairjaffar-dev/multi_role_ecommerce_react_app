import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/api-client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { invalidateQueriesEverywhere } from "@/lib/query/cross-tab-invalidation";
import {
  CameraDetailResponseSchema,
  type CameraPayloadType,
  type CameraSchemaType,
} from "../schemas/camera.schema";
import { cameraKeys } from "./camera.queries";

/*
 * Every camera write invalidates cameraKeys.all in this tab and in other open tabs:
 * the live grid, the management table and the status badges all refresh. A wall screen
 * showing the grid in another tab picks up a new or disabled camera without a reload.
 */

export function useCreateCameraMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CameraPayloadType) => {
      const response = await apiClient.post(API_ENDPOINTS.ADMIN.CAMERAS, payload);
      return CameraDetailResponseSchema.parse(response.data).data;
    },
    onSuccess: () => invalidateQueriesEverywhere(queryClient, cameraKeys.all),
  });
}

export function useUpdateCameraMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: Partial<CameraPayloadType> }) => {
      const response = await apiClient.patch(API_ENDPOINTS.ADMIN.CAMERA(id), payload);
      return CameraDetailResponseSchema.parse(response.data).data;
    },
    onSuccess: (camera) => {
      // Fresh row straight into the detail cache, so the edit page updates instantly
      queryClient.setQueryData<CameraSchemaType>(cameraKeys.detail(camera.id), camera);
      return invalidateQueriesEverywhere(queryClient, cameraKeys.all);
    },
  });
}

/** Hard delete: the backend also removes the camera's MediaMTX path. */
export function useDeleteCameraMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(API_ENDPOINTS.ADMIN.CAMERA(id));
    },
    onSuccess: (_data, id) => {
      // The deleted camera's detail must not be refetched (it would 404)
      queryClient.removeQueries({ queryKey: cameraKeys.detail(id) });
      queryClient.removeQueries({ queryKey: cameraKeys.status(id) });
      return invalidateQueriesEverywhere(queryClient, cameraKeys.all);
    },
  });
}
