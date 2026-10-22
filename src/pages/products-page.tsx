import { useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductFilters } from "@/features/products/components/product-filters";
import { ProductList } from "@/features/products/components/product-list";
import { useProductListFilters } from "@/features/products/hooks/use-product-list-filters";
import { cn } from "@/lib/utils";

export function ProductsPage() {
  // Mobile: filters collapse behind a toggle so products are visible on the first screen.
  // Desktop (lg+): always visible as a sidebar.
  const [areFiltersOpen, setAreFiltersOpen] = useState(false);
  const { hasActiveFilters } = useProductListFilters();

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Products</h1>
        <Button
          variant="outline"
          size="sm"
          className="lg:hidden"
          aria-expanded={areFiltersOpen}
          aria-controls="product-filters"
          onClick={() => {
            setAreFiltersOpen((isOpen) => !isOpen);
          }}
        >
          <SlidersHorizontal />
          Filters
          {hasActiveFilters && <span className="size-2 rounded-full bg-primary" aria-hidden />}
        </Button>
      </div>
      <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
        <div id="product-filters" className={cn(!areFiltersOpen && "hidden", "lg:block")}>
          <ProductFilters />
        </div>
        <ProductList />
      </div>
    </section>
  );
}
