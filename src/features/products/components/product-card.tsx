import { useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router";
import { formatPaisa } from "@/lib/money";
import { publicProductDetailQuery } from "../api/product.queries";
import type { PublicProductListItemSchemaType } from "../schemas/product.schema";
import { ProductImage } from "./product-image";
import { StockBadge } from "./stock-badge";

export function ProductCard({ product }: { product: PublicProductListItemSchemaType }) {
  const queryClient = useQueryClient();

  // Start loading the detail page while the pointer hovers, so the click feels instant.
  const prefetchDetail = () => {
    // A failed prefetch is ignored: the page loader will fetch again and show the error.
    queryClient.query(publicProductDetailQuery(product.slug)).catch(() => undefined);
  };

  return (
    <Link
      to={`/products/${product.slug}`}
      onMouseEnter={prefetchDetail}
      onFocus={prefetchDetail}
      className="group flex flex-col overflow-hidden rounded-xl border bg-card transition-shadow hover:shadow-md focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
    >
      <div className="overflow-hidden">
        <ProductImage
          src={product.imageUrl}
          alt={product.name}
          className="transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <p className="text-xs text-muted-foreground">{product.category.name}</p>
        <h3 className="line-clamp-2 font-medium">{product.name}</h3>
        <div className="mt-auto flex flex-wrap items-center justify-between gap-x-2 gap-y-1 pt-2">
          <span className="font-semibold">{formatPaisa(product.priceInPaisa)}</span>
          <StockBadge inStock={product.inStock} />
        </div>
      </div>
    </Link>
  );
}
