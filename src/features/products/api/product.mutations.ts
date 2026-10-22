import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/api-client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { invalidateQueriesEverywhere } from "@/lib/query/cross-tab-invalidation";
import {
  AdminProductImageResponseSchema,
  ProductResponseSchema,
  type AdminProductDetailSchemaType,
  type ProductPayloadType,
} from "../schemas/product.schema";
import { productKeys } from "./product.queries";

/*
 * After any admin write, both admin data and the public storefront cache are invalidated
 * (productKeys.all) in this tab AND in every other open tab, so a new product or price change
 * shows up in the shop without a hard reload.
 */

export function useCreateProductMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: ProductPayloadType) => {
      const response = await apiClient.post(API_ENDPOINTS.ADMIN.PRODUCTS, payload);
      return ProductResponseSchema.parse(response.data).data;
    },
    onSuccess: () => invalidateQueriesEverywhere(queryClient, productKeys.all),
  });
}

export function useUpdateProductMutation(productId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: Partial<ProductPayloadType>) => {
      const response = await apiClient.patch(API_ENDPOINTS.ADMIN.PRODUCT(productId), payload);
      return ProductResponseSchema.parse(response.data).data;
    },
    onSuccess: (product) => {
      // Write the fresh row into the detail cache (keeping its images) for an instant UI update.
      queryClient.setQueryData<AdminProductDetailSchemaType>(
        productKeys.adminDetail(productId),
        (previous) => (previous ? { ...previous, ...product } : previous),
      );
      return invalidateQueriesEverywhere(queryClient, productKeys.all);
    },
  });
}

/** Soft delete (backend sets deletedAt; past orders keep pointing at the product). */
export function useDeleteProductMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productId: string) => {
      await apiClient.delete(API_ENDPOINTS.ADMIN.PRODUCT(productId));
    },
    onSuccess: () => invalidateQueriesEverywhere(queryClient, productKeys.all),
  });
}

export function useUploadProductImageMutation(productId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      file,
      onProgress,
    }: {
      file: File;
      onProgress?: (percent: number) => void;
    }) => {
      const formData = new FormData();
      formData.append("image", file);

      const response = await apiClient.post(
        API_ENDPOINTS.ADMIN.PRODUCT_IMAGES(productId),
        formData,
        {
          onUploadProgress: (event) => {
            if (event.total) onProgress?.(Math.round((event.loaded / event.total) * 100));
          },
        },
      );
      return AdminProductImageResponseSchema.parse(response.data).data;
    },
    onSuccess: (image) => {
      queryClient.setQueryData<AdminProductDetailSchemaType>(
        productKeys.adminDetail(productId),
        (previous) => (previous ? { ...previous, images: [...previous.images, image] } : previous),
      );
      return invalidateQueriesEverywhere(queryClient, productKeys.all);
    },
  });
}
