import type { ComponentProps } from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

/**
 * shadcn "Field" primitives: layout + label + error for a single form control.
 * Works with React Hook Form via `register` or `Controller`.
 */
function FieldGroup({ className, ...props }: ComponentProps<"div">) {
  return (
    <div data-slot="field-group" className={cn("flex flex-col gap-5", className)} {...props} />
  );
}

function Field({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      role="group"
      data-slot="field"
      className={cn("group flex flex-col gap-2 data-[invalid=true]:text-destructive", className)}
      {...props}
    />
  );
}

function FieldLabel({ className, ...props }: ComponentProps<typeof Label>) {
  return <Label data-slot="field-label" className={className} {...props} />;
}

function FieldDescription({ className, ...props }: ComponentProps<"p">) {
  return (
    <p
      data-slot="field-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

function FieldError({
  className,
  message,
  ...props
}: ComponentProps<"p"> & { message?: string | undefined }) {
  if (!message) return null;

  return (
    <p
      role="alert"
      data-slot="field-error"
      className={cn("text-sm text-destructive", className)}
      {...props}
    >
      {message}
    </p>
  );
}

export { Field, FieldGroup, FieldLabel, FieldDescription, FieldError };
