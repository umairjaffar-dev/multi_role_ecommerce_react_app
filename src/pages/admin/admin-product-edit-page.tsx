import { useSuspenseQuery } from "@tanstack/react-query";
import { ChevronLeft, ExternalLink } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useUpdateProductMutation } from "@/features/products/api/product.mutations";
import { adminProductDetailQuery } from "@/features/products/api/product.queries";
import { DeleteProductButton } from "@/features/products/components/admin/delete-product-button";
import {
  ProductForm,
  type ProductFormSubmitType,
} from "@/features/products/components/admin/product-form";
import { ProductImageManager } from "@/features/products/components/admin/product-image-manager";
import { ProductStatusBadge } from "@/features/products/components/admin/product-status-badge";
import { PRODUCT_FORM_ERROR_MAPPING } from "@/features/products/lib/product-form-errors";
import {
  toProductPayload,
  type AdminProductDetailSchemaType,
  type ProductFormInputType,
  type ProductPayloadType,
} from "@/features/products/schemas/product.schema";
import { applyServerErrors } from "@/lib/forms/apply-server-errors";
import { paisaToRupeeInput } from "@/lib/money";

/** Form field -> API payload field. */
const FORM_TO_PAYLOAD_KEY = {
  name: "name",
  slug: "slug",
  description: "description",
  categoryId: "categoryId",
  price: "priceInPaisa",
  stock: "stock",
  isActive: "isActive",
} as const satisfies Record<keyof ProductFormInputType, keyof ProductPayloadType>;

function toFormValues(product: AdminProductDetailSchemaType): ProductFormInputType {
  return {
    name: product.name,
    slug: product.slug,
    description: product.description ?? "",
    categoryId: product.categoryId,
    price: paisaToRupeeInput(product.priceInPaisa),
    stock: String(product.stock),
    isActive: product.isActive,
  };
}

export function AdminProductEditPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const { data: product } = useSuspenseQuery(adminProductDetailQuery(id));
  const updateMutation = useUpdateProductMutation(id);
  const isDeleted = product.deletedAt !== null;

  const handleSubmit = ({ values, dirtyFields, setError }: ProductFormSubmitType) => {
    // PATCH only what changed: smaller request, and no accidental overwrite of fields
    // another admin edited in the meantime.
    const fullPayload = toProductPayload(values);
    const payload: Partial<ProductPayloadType> = {};
    for (const [formKey, payloadKey] of Object.entries(FORM_TO_PAYLOAD_KEY)) {
      if (dirtyFields[formKey as keyof ProductFormInputType]) {
        Object.assign(payload, { [payloadKey]: fullPayload[payloadKey] });
      }
    }

    updateMutation.mutate(payload, {
      onSuccess: () => {
        toast.success("Product saved");
      },
      onError: (error) => {
        applyServerErrors(error, setError, PRODUCT_FORM_ERROR_MAPPING);
      },
    });
  };

  return (
    <section className="max-w-3xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Link
          to="/admin/products"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="size-4" />
          Back to products
        </Link>
        {!isDeleted && product.isActive && (
          <Link
            to={`/products/${product.slug}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-sm font-medium hover:underline"
          >
            View in store
            <ExternalLink className="size-4" />
          </Link>
        )}
      </div>

      {isDeleted && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
          This product was deleted on {new Date(product.deletedAt ?? "").toLocaleDateString()}. It
          is read-only.
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <CardTitle className="text-2xl">{product.name}</CardTitle>
            <ProductStatusBadge isActive={product.isActive} deletedAt={product.deletedAt} />
          </div>
          <CardDescription>
            Last updated {new Date(product.updatedAt).toLocaleString()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* key: after a save the form remounts with the saved values, so it is no longer "dirty". */}
          <ProductForm
            key={product.updatedAt}
            mode="edit"
            defaultValues={toFormValues(product)}
            isPending={updateMutation.isPending}
            disabled={isDeleted}
            onSubmit={handleSubmit}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Images</CardTitle>
        </CardHeader>
        <CardContent>
          <ProductImageManager
            productId={product.id}
            images={product.images}
            disabled={isDeleted}
          />
        </CardContent>
      </Card>

      {!isDeleted && (
        <Card className="border-destructive/40">
          <CardHeader>
            <CardTitle>Danger zone</CardTitle>
            <CardDescription>
              Deleting hides the product everywhere and makes it read-only.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DeleteProductButton
              productId={product.id}
              productName={product.name}
              variant="full"
              onDeleted={() => void navigate("/admin/products", { replace: true })}
            />
          </CardContent>
        </Card>
      )}
    </section>
  );
}
