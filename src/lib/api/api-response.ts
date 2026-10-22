import { z } from "zod";

/**
 * Builds a schema for the backend success envelope: { success: true, data: <T> }.
 * Every endpoint hook validates its response with this, so a backend contract change
 * fails loudly at the boundary instead of deep inside a component.
 */
export function createApiSuccessSchema<TData extends z.ZodType>(dataSchema: TData) {
  return z.object({
    success: z.literal(true),
    data: dataSchema,
  });
}

/** Offset pagination meta (admin lists, categories): backend `buildPaginationMeta`. */
export const PageMetaSchema = z.object({
  page: z.number().int(),
  limit: z.number().int(),
  total: z.number().int(),
  totalPages: z.number().int(),
  hasNextPage: z.boolean(),
  hasPreviousPage: z.boolean(),
});

export type PageMetaSchemaType = z.infer<typeof PageMetaSchema>;

/** Cursor pagination meta (public product list): send `nextCursor` back as ?cursor=. */
export const CursorMetaSchema = z.object({
  limit: z.number().int(),
  hasNextPage: z.boolean(),
  nextCursor: z.string().nullable(),
});

export type CursorMetaSchemaType = z.infer<typeof CursorMetaSchema>;

/** { success, data: Array<T>, meta } */
export function createApiListSchema<TItem extends z.ZodType, TMeta extends z.ZodType>(
  itemSchema: TItem,
  metaSchema: TMeta,
) {
  return z.object({
    success: z.literal(true),
    data: z.array(itemSchema),
    meta: metaSchema,
  });
}
