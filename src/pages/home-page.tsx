import { useInfiniteQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { publicProductListQuery } from "@/features/products/api/product.queries";
import { ProductCard } from "@/features/products/components/product-card";
import { ProductGridSkeleton } from "@/features/products/components/product-grid-skeleton";
import { DEFAULT_PRODUCT_LIST_FILTERS } from "@/features/products/schemas/product.schema";

const NEW_ARRIVALS_COUNT = 8;

export function HomePage() {
  // Same query key as the default /products list, so the products page opens from cache.
  const newArrivals = useInfiniteQuery(publicProductListQuery(DEFAULT_PRODUCT_LIST_FILTERS));
  const products = newArrivals.data?.pages[0]?.data.slice(0, NEW_ARRIVALS_COUNT) ?? [];

  return (
    <div className="space-y-12">
      <section className="flex flex-col items-center gap-4 rounded-2xl bg-muted px-6 py-16 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Shop the latest arrivals</h1>
        <p className="max-w-md text-muted-foreground">
          Quality products at fair prices, delivered across Pakistan.
        </p>
        <Button size="lg" asChild>
          <Link to="/products">
            Browse products
            <ArrowRight />
          </Link>
        </Button>
      </section>

      <section className="space-y-4">
        <div className="flex items-end justify-between">
          <h2 className="text-2xl font-semibold tracking-tight">New arrivals</h2>
          <Link to="/products" className="text-sm font-medium hover:underline">
            View all
          </Link>
        </div>

        {newArrivals.isPending ? (
          <ProductGridSkeleton count={4} />
        ) : products.length === 0 ? (
          <p className="text-muted-foreground">No products yet. Check back soon.</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
