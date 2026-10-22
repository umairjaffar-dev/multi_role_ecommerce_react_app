import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { Controller, useForm, useWatch, type UseFormSetError } from "react-hook-form";
import { FormAlert } from "@/components/shared/form-alert";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { adminCategoryOptionsQuery } from "@/features/categories/api/category.queries";
import { slugify } from "@/lib/slugify";
import {
  ProductFormSchema,
  type ProductFormInputType,
  type ProductFormOutputType,
} from "../../schemas/product.schema";

export type ProductFormSubmitType = {
  values: ProductFormOutputType;
  /** Fields the admin actually changed; the edit page PATCHes only these. */
  dirtyFields: Partial<Record<keyof ProductFormInputType, boolean>>;
  setError: UseFormSetError<ProductFormInputType>;
};

/** Shared create/edit form. Rupee text in, paisa payload out (via ProductFormSchema). */
export function ProductForm({
  mode,
  defaultValues,
  isPending,
  disabled = false,
  onSubmit,
}: {
  mode: "create" | "edit";
  defaultValues: ProductFormInputType;
  isPending: boolean;
  disabled?: boolean;
  onSubmit: (submit: ProductFormSubmitType) => void;
}) {
  const categoriesQuery = useQuery(adminCategoryOptionsQuery());

  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { errors, dirtyFields, isDirty },
  } = useForm<ProductFormInputType, unknown, ProductFormOutputType>({
    resolver: zodResolver(ProductFormSchema),
    defaultValues,
    mode: "onTouched",
  });

  const name = useWatch({ control, name: "name" });
  const slug = useWatch({ control, name: "slug" });
  const generatedSlug = slugify(name);

  const submit = (values: ProductFormOutputType) => {
    // On edit an empty slug would mean "regenerate", which the backend never does; keep it required.
    if (mode === "edit" && values.slug === "") {
      setError("slug", { type: "required", message: "Slug is required when editing" });
      return;
    }
    onSubmit({ values, dirtyFields, setError });
  };

  const isFormDisabled = disabled || isPending;

  return (
    <form onSubmit={(event) => void handleSubmit(submit)(event)} noValidate>
      <fieldset disabled={isFormDisabled} className="contents">
        <FieldGroup>
          <Field data-invalid={Boolean(errors.name)}>
            <FieldLabel htmlFor="name">Name</FieldLabel>
            <Input id="name" aria-invalid={Boolean(errors.name)} {...register("name")} />
            <FieldError message={errors.name?.message} />
          </Field>

          <Field data-invalid={Boolean(errors.slug)}>
            <FieldLabel htmlFor="slug">
              Slug {mode === "create" && <span className="text-muted-foreground">(optional)</span>}
            </FieldLabel>
            <Input
              id="slug"
              placeholder={mode === "create" ? generatedSlug || "auto-generated-from-name" : ""}
              aria-invalid={Boolean(errors.slug)}
              {...register("slug")}
            />
            <FieldDescription>
              URL: /products/{slug || generatedSlug || "…"}
              {mode === "edit" && " · Changing it breaks links customers already have."}
            </FieldDescription>
            <FieldError message={errors.slug?.message} />
          </Field>

          <Field data-invalid={Boolean(errors.categoryId)}>
            <FieldLabel htmlFor="categoryId">Category</FieldLabel>
            {/*
              Controlled (Controller, not register): the options arrive after the first render,
              and an uncontrolled <select> cannot pre-select an option that does not exist yet.
            */}
            <Controller
              control={control}
              name="categoryId"
              render={({ field }) => (
                <NativeSelect
                  id="categoryId"
                  aria-invalid={Boolean(errors.categoryId)}
                  disabled={categoriesQuery.isPending}
                  name={field.name}
                  ref={field.ref}
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                >
                  <option value="">
                    {categoriesQuery.isPending ? "Loading…" : "Select a category"}
                  </option>
                  {categoriesQuery.data?.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                      {category.isActive ? "" : " (hidden)"}
                    </option>
                  ))}
                </NativeSelect>
              )}
            />
            <FieldError message={errors.categoryId?.message} />
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field data-invalid={Boolean(errors.price)}>
              <FieldLabel htmlFor="price">Price (PKR)</FieldLabel>
              <Input
                id="price"
                inputMode="decimal"
                placeholder="1499.50"
                aria-invalid={Boolean(errors.price)}
                {...register("price")}
              />
              <FieldError message={errors.price?.message} />
            </Field>

            <Field data-invalid={Boolean(errors.stock)}>
              <FieldLabel htmlFor="stock">Stock</FieldLabel>
              <Input
                id="stock"
                inputMode="numeric"
                aria-invalid={Boolean(errors.stock)}
                {...register("stock")}
              />
              <FieldError message={errors.stock?.message} />
            </Field>
          </div>

          <Field data-invalid={Boolean(errors.description)}>
            <FieldLabel htmlFor="description">Description</FieldLabel>
            <Textarea
              id="description"
              rows={5}
              aria-invalid={Boolean(errors.description)}
              {...register("description")}
            />
            <FieldError message={errors.description?.message} />
          </Field>

          <Controller
            control={control}
            name="isActive"
            render={({ field }) => (
              <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
                <div className="space-y-1">
                  <FieldLabel htmlFor="isActive">Visible in store</FieldLabel>
                  <FieldDescription>
                    Hidden products stay saved but customers cannot see them.
                  </FieldDescription>
                </div>
                <Switch
                  id="isActive"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  onBlur={field.onBlur}
                />
              </div>
            )}
          />

          <FormAlert message={errors.root?.server?.message} />

          <div className="flex justify-end">
            <Button type="submit" disabled={isFormDisabled || (mode === "edit" && !isDirty)}>
              {isPending && <Loader2 className="animate-spin" />}
              {mode === "create" ? "Create product" : "Save changes"}
            </Button>
          </div>
        </FieldGroup>
      </fieldset>
    </form>
  );
}
