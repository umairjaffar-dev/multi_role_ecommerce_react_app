import { useEffect } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Loader2, PackageSearch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useInView } from "@/hooks/use-in-view";
import { getErrorMessage } from "@/lib/api/api-error";
import { publicProductListQuery } from "../api/product.queries";
import { useProductListFilters } from "../hooks/use-product-list-filters";
import { ProductCard } from "./product-card";
import { ProductGridSkeleton } from "./product-grid-skeleton";

/**
 * Cursor-paginated grid. The next page loads automatically when the sentinel scrolls into
 * view; the "Load more" button is the keyboard/screen-reader fallback.
 */
export function ProductList() {
  const { filters, clearFilters, hasActiveFilters } = useProductListFilters();
  const query = useInfiniteQuery(publicProductListQuery(filters));
  const { ref: sentinelRef, isInView } = useInView<HTMLDivElement>();

  const { hasNextPage, isFetchingNextPage, fetchNextPage } = query;

  useEffect(() => {
    if (isInView && hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  }, [isInView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (query.isPending) {
    return <ProductGridSkeleton />;
  }

  if (query.isError) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <p className="font-medium">Could not load products</p>
        <p className="text-sm text-muted-foreground">{getErrorMessage(query.error)}</p>
        <Button variant="outline" onClick={() => void query.refetch()}>
          Try again
        </Button>
      </div>
    );
  }

  const products = query.data.pages.flatMap((page) => page.data);

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <PackageSearch className="size-10 text-muted-foreground" />
        <p className="font-medium">No products found</p>
        {hasActiveFilters && (
          <Button variant="outline" onClick={clearFilters}>
            Clear filters
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      <div ref={sentinelRef} className="flex justify-center">
        {hasNextPage ? (
          <Button
            variant="outline"
            disabled={isFetchingNextPage}
            onClick={() => void fetchNextPage()}
          >
            {isFetchingNextPage && <Loader2 className="animate-spin" />}
            {isFetchingNextPage ? "Loading…" : "Load more"}
          </Button>
        ) : (
          <p className="text-sm text-muted-foreground">You have reached the end.</p>
        )}
      </div>
    </div>
  );
}
