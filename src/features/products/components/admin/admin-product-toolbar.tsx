import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { adminCategoryOptionsQuery } from "@/features/categories/api/category.queries";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useAdminProductFilters } from "../../hooks/use-admin-product-filters";

export function AdminProductToolbar() {
  const { filters, updateFilters } = useAdminProductFilters();
  const categoriesQuery = useQuery(adminCategoryOptionsQuery());

  const [search, setSearch] = useState(filters.search ?? "");
  const debouncedSearch = useDebouncedValue(search, 400);

  useEffect(() => {
    if (debouncedSearch.trim() !== (filters.search ?? "")) {
      updateFilters({ search: debouncedSearch.trim() });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only react to the debounced value
  }, [debouncedSearch]);

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_200px_160px_160px]">
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          aria-label="Search products by name"
          placeholder="Search by name…"
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
          }}
          className="pl-9"
        />
      </div>

      <NativeSelect
        aria-label="Filter by category"
        value={filters.categoryId ?? ""}
        onChange={(event) => {
          updateFilters({ categoryId: event.target.value });
        }}
      >
        <option value="">All categories</option>
        {categoriesQuery.data?.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </NativeSelect>

      <NativeSelect
        aria-label="Filter by visibility"
        value={filters.isActive ?? ""}
        onChange={(event) => {
          updateFilters({ isActive: event.target.value });
        }}
      >
        <option value="">Any visibility</option>
        <option value="true">Active</option>
        <option value="false">Hidden</option>
      </NativeSelect>

      <NativeSelect
        aria-label="Filter by status"
        value={filters.status}
        onChange={(event) => {
          updateFilters({ status: event.target.value });
        }}
      >
        <option value="live">Not deleted</option>
        <option value="deleted">Deleted</option>
        <option value="all">All</option>
      </NativeSelect>
    </div>
  );
}
