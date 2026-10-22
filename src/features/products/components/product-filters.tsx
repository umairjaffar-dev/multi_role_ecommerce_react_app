import { useEffect, useState, type SubmitEvent } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { publicCategoryOptionsQuery } from "@/features/categories/api/category.queries";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { rupeesToPaisa } from "@/lib/money";
import { useProductListFilters } from "../hooks/use-product-list-filters";
import { PRODUCT_SORT_LABELS, PRODUCT_SORTS } from "../schemas/product.schema";

const SEARCH_DEBOUNCE_MS = 400;

/** Search (debounced), category, sort apply immediately; price range applies on submit. */
export function ProductFilters() {
  const { params, updateParams, clearFilters, hasActiveFilters } = useProductListFilters();
  const categoriesQuery = useQuery(publicCategoryOptionsQuery());

  const [search, setSearch] = useState(params.search);
  const debouncedSearch = useDebouncedValue(search, SEARCH_DEBOUNCE_MS);

  const [minPrice, setMinPrice] = useState(params.minPrice);
  const [maxPrice, setMaxPrice] = useState(params.maxPrice);
  const [priceError, setPriceError] = useState<string>();

  // Push the search term to the URL only after the user pauses typing (fewer API calls).
  useEffect(() => {
    if (debouncedSearch.trim() !== params.search) {
      updateParams({ search: debouncedSearch.trim() });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only react to the debounced value
  }, [debouncedSearch]);

  const handlePriceSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    const min = minPrice ? rupeesToPaisa(minPrice) : null;
    const max = maxPrice ? rupeesToPaisa(maxPrice) : null;

    if ((minPrice && min === null) || (maxPrice && max === null)) {
      setPriceError("Enter prices like 1500 or 1499.50");
      return;
    }
    if (min !== null && max !== null && min > max) {
      setPriceError("Min price must be less than max price");
      return;
    }
    setPriceError(undefined);
    updateParams({ minPrice, maxPrice });
  };

  const handleClear = () => {
    setSearch("");
    setMinPrice("");
    setMaxPrice("");
    setPriceError(undefined);
    clearFilters();
  };

  return (
    <aside className="flex flex-col gap-5" aria-label="Product filters">
      <Field>
        <FieldLabel htmlFor="product-search">Search</FieldLabel>
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="product-search"
            type="search"
            placeholder="Search products…"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
            }}
            className="pl-9"
          />
        </div>
      </Field>

      <Field>
        <FieldLabel htmlFor="product-category">Category</FieldLabel>
        <NativeSelect
          id="product-category"
          value={params.category}
          disabled={categoriesQuery.isPending}
          onChange={(event) => {
            updateParams({ category: event.target.value });
          }}
        >
          <option value="">All categories</option>
          {categoriesQuery.data?.map((category) => (
            <option key={category.id} value={category.slug}>
              {category.name}
            </option>
          ))}
        </NativeSelect>
      </Field>

      <Field>
        <FieldLabel htmlFor="product-sort">Sort by</FieldLabel>
        <NativeSelect
          id="product-sort"
          value={params.sort}
          onChange={(event) => {
            updateParams({ sort: event.target.value });
          }}
        >
          {PRODUCT_SORTS.map((sort) => (
            <option key={sort} value={sort}>
              {PRODUCT_SORT_LABELS[sort]}
            </option>
          ))}
        </NativeSelect>
      </Field>

      <form onSubmit={handlePriceSubmit} noValidate>
        <Field data-invalid={Boolean(priceError)}>
          <FieldLabel htmlFor="min-price">Price (PKR)</FieldLabel>
          <div className="flex items-center gap-2">
            <Input
              id="min-price"
              inputMode="decimal"
              placeholder="Min"
              aria-label="Minimum price"
              value={minPrice}
              onChange={(event) => {
                setMinPrice(event.target.value);
              }}
            />
            <span className="text-muted-foreground">–</span>
            <Input
              id="max-price"
              inputMode="decimal"
              placeholder="Max"
              aria-label="Maximum price"
              value={maxPrice}
              onChange={(event) => {
                setMaxPrice(event.target.value);
              }}
            />
          </div>
          <FieldError message={priceError} />
          <Button type="submit" variant="outline" size="sm">
            Apply price
          </Button>
        </Field>
      </form>

      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={handleClear} className="self-start">
          <X />
          Clear filters
        </Button>
      )}
    </aside>
  );
}
