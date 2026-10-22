import { ChevronLeft } from "lucide-react";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useCreateProductMutation } from "@/features/products/api/product.mutations";
import {
  ProductForm,
  type ProductFormSubmitType,
} from "@/features/products/components/admin/product-form";
import { PRODUCT_FORM_ERROR_MAPPING } from "@/features/products/lib/product-form-errors";
import { EMPTY_PRODUCT_FORM, toProductPayload } from "@/features/products/schemas/product.schema";
import { applyServerErrors } from "@/lib/forms/apply-server-errors";

export function AdminProductCreatePage() {
  const navigate = useNavigate();
  const createMutation = useCreateProductMutation();

  const handleSubmit = ({ values, setError }: ProductFormSubmitType) => {
    createMutation.mutate(toProductPayload(values), {
      onSuccess: (product) => {
        toast.success(`"${product.name}" created. Now add some images.`);
        // Images need a product id, so the next step happens on the edit page.
        void navigate(`/admin/products/${product.id}/edit`, { replace: true });
      },
      onError: (error) => {
        applyServerErrors(error, setError, PRODUCT_FORM_ERROR_MAPPING);
      },
    });
  };

  return (
    <section className="max-w-3xl space-y-6">
      <Link
        to="/admin/products"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="size-4" />
        Back to products
      </Link>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">New product</CardTitle>
          <CardDescription>Images can be added after the product is created.</CardDescription>
        </CardHeader>
        <CardContent>
          <ProductForm
            mode="create"
            defaultValues={EMPTY_PRODUCT_FORM}
            isPending={createMutation.isPending}
            onSubmit={handleSubmit}
          />
        </CardContent>
      </Card>
    </section>
  );
}
