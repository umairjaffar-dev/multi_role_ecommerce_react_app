import { z } from "zod";
import { createApiListSchema, PageMetaSchema } from "@/lib/api/api-response";

/** Mirrors backend `CategoryType` (categories table row). */
export const CategorySchema = z.object({
  id: z.uuid(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
  imageKey: z.string().nullable(),
  isActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type CategorySchemaType = z.infer<typeof CategorySchema>;

export const CategoryListResponseSchema = createApiListSchema(CategorySchema, PageMetaSchema);
