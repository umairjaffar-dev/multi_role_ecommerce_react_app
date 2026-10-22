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
