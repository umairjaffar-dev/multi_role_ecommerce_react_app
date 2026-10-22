import type { ProductFormInputType } from "../schemas/product.schema";

/**
 * How backend errors land on the product form:
 * API field names (priceInPaisa) map to form fields (price), and known error codes
 * appear under the input they belong to.
 */
export const PRODUCT_FORM_ERROR_MAPPING = {
  fields: ["name", "slug", "description", "categoryId", "stock", "isActive"],
  fieldMap: { priceInPaisa: "price" },
  codeToField: {
    PRODUCT_SLUG_EXISTS: "slug",
    INVALID_CATEGORY_ID: "categoryId",
    INVALID_PRODUCT_NAME: "name",
  },
} as const satisfies {
  fields: ReadonlyArray<keyof ProductFormInputType>;
  fieldMap: Partial<Record<string, keyof ProductFormInputType>>;
  codeToField: Partial<Record<string, keyof ProductFormInputType>>;
};
