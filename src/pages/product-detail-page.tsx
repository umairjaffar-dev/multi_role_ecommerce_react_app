import { useSuspenseQuery } from "@tanstack/react-query";
import { ChevronLeft, ShoppingCart } from "lucide-react";
import { Link, useParams } from "react-router";
import { Button } from "@/components/ui/button";
import { publicProductDetailQuery } from "@/features/products/api/product.queries";
import { ProductGallery } from "@/features/products/components/product-gallery";
import { StockBadge } from "@/features/products/components/stock-badge";
import { formatPaisa } from "@/lib/money";

export function ProductDetailPage() {
  const { slug = "" } = useParams();
  // The route loader already filled the cache, so this never suspends on navigation;
  // useSuspenseQuery gives a non-undefined `product` type.
  const { data: product } = useSuspenseQuery(publicProductDetailQuery(slug));

  return (
    <article className="space-y-6">
      <Link
        to={`/products?category=${product.category.slug}`}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="size-4" />
        {product.category.name}
      </Link>

      <div className="grid gap-8 md:grid-cols-2">
        <ProductGallery images={product.images} name={product.name} />

        <div className="flex flex-col gap-4">
          <h1 className="text-3xl font-bold tracking-tight">{product.name}</h1>
          <div className="flex items-center gap-3">
            <span className="text-2xl font-semibold">{formatPaisa(product.priceInPaisa)}</span>
            <StockBadge inStock={product.inStock} />
          </div>

          {/* Cart module is next; the button is a placeholder until then. */}
          <Button size="lg" disabled className="w-full sm:w-fit">
            <ShoppingCart />
            {product.inStock ? "Add to cart (coming soon)" : "Out of stock"}
          </Button>

          {product.description && (
            <div className="space-y-2 border-t pt-4">
              <h2 className="font-semibold">Description</h2>
              <p className="whitespace-pre-line text-muted-foreground">{product.description}</p>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
