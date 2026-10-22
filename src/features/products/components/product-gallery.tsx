import { useState } from "react";
import { cn } from "@/lib/utils";
import type { PublicProductDetailSchemaType } from "../schemas/product.schema";
import { ProductImage } from "./product-image";

/** Main image + thumbnail strip. Index 0 is the cover (backend orders by sortOrder). */
export function ProductGallery({
  images,
  name,
}: {
  images: PublicProductDetailSchemaType["images"];
  name: string;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeImage = images[activeIndex] ?? images[0];

  return (
    <div className="flex flex-col gap-3">
      <div className="overflow-hidden rounded-xl border">
        <ProductImage src={activeImage?.url ?? null} alt={name} loading="eager" />
      </div>

      {images.length > 1 && (
        <ul className="grid grid-cols-5 gap-2" aria-label="Product images">
          {images.map((image, index) => (
            <li key={image.id}>
              <button
                type="button"
                aria-label={`Show image ${index + 1} of ${images.length}`}
                aria-current={index === activeIndex}
                onClick={() => {
                  setActiveIndex(index);
                }}
                className={cn(
                  "w-full overflow-hidden rounded-md border-2 transition-colors",
                  index === activeIndex
                    ? "border-primary"
                    : "border-transparent opacity-70 hover:opacity-100",
                )}
              >
                <ProductImage src={image.url} alt="" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
