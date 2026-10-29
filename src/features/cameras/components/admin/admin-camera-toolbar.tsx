import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useAdminCameraFilters } from "../../hooks/use-admin-camera-filters";

export function AdminCameraToolbar() {
  const { filters, updateFilters } = useAdminCameraFilters();

  const [search, setSearch] = useState(filters.search ?? "");
  const debouncedSearch = useDebouncedValue(search, 400);

  useEffect(() => {
    if (debouncedSearch.trim() !== (filters.search ?? "")) {
      updateFilters({ search: debouncedSearch.trim() });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only react to the debounced value
  }, [debouncedSearch]);

  return (
    <div className="grid gap-3 sm:grid-cols-[1fr_180px]">
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          aria-label="Search cameras"
          placeholder="Search name, location or stream path…"
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
          }}
          className="pl-9"
        />
      </div>
      <NativeSelect
        aria-label="Filter by state"
        value={filters.isActive ?? ""}
        onChange={(event) => {
          updateFilters({ isActive: event.target.value });
        }}
      >
        <option value="">All cameras</option>
        <option value="true">Active</option>
        <option value="false">Disabled</option>
      </NativeSelect>
    </div>
  );
}
