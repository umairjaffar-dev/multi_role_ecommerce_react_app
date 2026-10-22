import { useState } from "react";
import { ImageOff } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Product image with a placeholder for products without images, and for broken or expired
 * signed URLs. Square aspect ratio reserves space up front, so the layout does not jump.
 */
export function ProductImage({
  src,
  alt,
  className,
  loading = "lazy",
}: {
  src: string | null;
  alt: string;
  className?: string;
  loading?: "lazy" | "eager";
}) {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return (
      <div
        className={cn(
          "flex aspect-square items-center justify-center bg-muted text-muted-foreground",
          className,
        )}
        role="img"
        aria-label={`${alt} (no image)`}
      >
        <ImageOff className="size-8" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading={loading}
      decoding="async"
      onError={() => {
        setHasError(true);
      }}
      className={cn("aspect-square w-full bg-muted object-cover", className)}
    />
  );
}
