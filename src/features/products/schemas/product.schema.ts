import { z } from "zod";
import {
  createApiListSchema,
  createApiSuccessSchema,
  CursorMetaSchema,
  PageMetaSchema,
} from "@/lib/api/api-response";
import { rupeesToPaisa } from "@/lib/money";

/* ===========================================================================
 * Response schemas: mirror backend products.service.ts / productImages.service.ts
 * ========================================================================= */

export const ProductImageSchema = z.object({
  id: z.uuid(),
  url: z.string(),
});

export const AdminProductImageSchema = ProductImageSchema.extend({
  sortOrder: z.number().int(),
});

export type AdminProductImageSchemaType = z.infer<typeof AdminProductImageSchema>;

/** Backend `PublicProductType`: no stock number, only `inStock`. */
const PublicProductBaseSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
  priceInPaisa: z.number().int(),
  createdAt: z.string(),
  inStock: z.boolean(),
  category: z.object({ name: z.string(), slug: z.string() }),
});

export const PublicProductListItemSchema = PublicProductBaseSchema.extend({
  imageUrl: z.string().nullable(),
});

export type PublicProductListItemSchemaType = z.infer<typeof PublicProductListItemSchema>;

export const PublicProductDetailSchema = PublicProductBaseSchema.extend({
  images: z.array(ProductImageSchema),
});

export type PublicProductDetailSchemaType = z.infer<typeof PublicProductDetailSchema>;

/** Backend `ProductType`: the full products table row (admin only). */
export const ProductSchema = z.object({
  id: z.uuid(),
  categoryId: z.uuid(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
  priceInPaisa: z.number().int(),
  stock: z.number().int(),
  isActive: z.boolean(),
  deletedAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type ProductSchemaType = z.infer<typeof ProductSchema>;

export const AdminProductListItemSchema = ProductSchema.extend({
  category: z.object({ id: z.uuid(), name: z.string(), slug: z.string() }),
  imageUrl: z.string().nullable(),
});

export type AdminProductListItemSchemaType = z.infer<typeof AdminProductListItemSchema>;

export const AdminProductDetailSchema = ProductSchema.extend({
  images: z.array(AdminProductImageSchema),
});

export type AdminProductDetailSchemaType = z.infer<typeof AdminProductDetailSchema>;

export const PublicProductListResponseSchema = createApiListSchema(
  PublicProductListItemSchema,
  CursorMetaSchema,
);
export const PublicProductDetailResponseSchema = createApiSuccessSchema(PublicProductDetailSchema);
export const AdminProductListResponseSchema = createApiListSchema(
  AdminProductListItemSchema,
  PageMetaSchema,
);
export type AdminProductListResponseSchemaType = z.infer<typeof AdminProductListResponseSchema>;
export const AdminProductDetailResponseSchema = createApiSuccessSchema(AdminProductDetailSchema);
export const ProductResponseSchema = createApiSuccessSchema(ProductSchema);
export const AdminProductImageResponseSchema = createApiSuccessSchema(AdminProductImageSchema);

/* ===========================================================================
 * URL filter schemas
 * Search params are user-editable text, so each field uses .catch(): a hand-typed bad
 * value (?sort=banana) falls back to the default instead of crashing the page.
 * ========================================================================= */

export const PRODUCT_SORTS = ["newest", "price_asc", "price_desc"] as const;
export type ProductSortType = (typeof PRODUCT_SORTS)[number];

export const PRODUCT_SORT_LABELS: Record<ProductSortType, string> = {
  newest: "Newest",
  price_asc: "Price: low to high",
  price_desc: "Price: high to low",
};

const OptionalTextParamSchema = z
  .string()
  .trim()
  .max(100)
  .optional()
  .transform((value) => (value === "" ? undefined : value))
  .catch(undefined);

/** Prices are shown to shoppers in rupees in the URL (?minPrice=1500), converted to paisa for the API. */
const OptionalRupeeParamSchema = z
  .string()
  .optional()
  .transform((value) => (value ? (rupeesToPaisa(value) ?? undefined) : undefined))
  .catch(undefined);

export const ProductListFiltersSchema = z.object({
  search: OptionalTextParamSchema,
  category: OptionalTextParamSchema,
  minPrice: OptionalRupeeParamSchema,
  maxPrice: OptionalRupeeParamSchema,
  sort: z.enum(PRODUCT_SORTS).catch("newest"),
});

export type ProductListFiltersSchemaType = z.infer<typeof ProductListFiltersSchema>;

/** No filters, newest first: the default /products list. */
export const DEFAULT_PRODUCT_LIST_FILTERS: ProductListFiltersSchemaType =
  ProductListFiltersSchema.parse({});

export const PRODUCT_STATUSES = ["live", "deleted", "all"] as const;
export type ProductStatusType = (typeof PRODUCT_STATUSES)[number];

export const AdminProductFiltersSchema = z.object({
  page: z.coerce.number().int().min(1).catch(1),
  search: OptionalTextParamSchema,
  categoryId: z.uuid().optional().catch(undefined),
  status: z.enum(PRODUCT_STATUSES).catch("live"),
  isActive: z.enum(["true", "false"]).optional().catch(undefined),
});

export type AdminProductFiltersSchemaType = z.infer<typeof AdminProductFiltersSchema>;

/* ===========================================================================
 * Admin product form: inputs hold text; the output is the API payload.
 * Rules mirror backend CreateProductSchema.
 * ========================================================================= */

const MAX_PRICE_IN_PAISA = 1_000_000_000;
const MAX_STOCK = 1_000_000;
const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const ProductFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(200, "Name must be at most 200 characters"),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .refine((value) => value === "" || (value.length >= 2 && value.length <= 120), {
      message: "Slug must be 2-120 characters",
    })
    .refine((value) => value === "" || SLUG_REGEX.test(value), {
      message: "Use lowercase letters, numbers and single hyphens (e.g. blue-cotton-shirt)",
    }),
  description: z.string().trim().max(5000, "Description must be at most 5000 characters"),
  categoryId: z.uuid("Select a category"),
  price: z
    .string()
    .trim()
    .min(1, "Price is required")
    .transform((value, ctx) => {
      const paisa = rupeesToPaisa(value);
      if (paisa === null) {
        ctx.addIssue({ code: "custom", message: "Enter a price like 1499 or 1499.50" });
        return z.NEVER;
      }
      if (paisa > MAX_PRICE_IN_PAISA) {
        ctx.addIssue({ code: "custom", message: "Price is too high" });
        return z.NEVER;
      }
      return paisa;
    }),
  stock: z
    .string()
    .trim()
    .regex(/^\d+$/, "Stock must be a whole number")
    .transform(Number)
    .refine((value) => value <= MAX_STOCK, `Stock must be at most ${MAX_STOCK}`),
  isActive: z.boolean(),
});

export type ProductFormInputType = z.input<typeof ProductFormSchema>;

export const EMPTY_PRODUCT_FORM: ProductFormInputType = {
  name: "",
  slug: "",
  description: "",
  categoryId: "",
  price: "",
  stock: "0",
  isActive: true,
};
export type ProductFormOutputType = z.output<typeof ProductFormSchema>;

/** Body for POST /admin/products (and, partially, PATCH /admin/products/:id). */
export type ProductPayloadType = {
  name: string;
  slug?: string;
  description: string | null;
  categoryId: string;
  priceInPaisa: number;
  stock: number;
  isActive: boolean;
};

export function toProductPayload(values: ProductFormOutputType): ProductPayloadType {
  return {
    name: values.name,
    // Empty slug: let the backend build it from the name
    ...(values.slug ? { slug: values.slug } : {}),
    description: values.description === "" ? null : values.description,
    categoryId: values.categoryId,
    priceInPaisa: values.price,
    stock: values.stock,
    isActive: values.isActive,
  };
}

/* ===========================================================================
 * Image upload rules (mirror backend uploadImage middleware + service)
 * ========================================================================= */

export const MAX_IMAGES_PER_PRODUCT = 8;
export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
