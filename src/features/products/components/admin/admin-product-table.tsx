import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Pencil } from "lucide-react";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCategoryVisibility } from "@/features/categories/hooks/use-category-visibility";
import { getErrorMessage } from "@/lib/api/api-error";
import { formatPaisa } from "@/lib/money";
import { cn } from "@/lib/utils";
import { adminProductListQuery, ADMIN_PAGE_SIZE } from "../../api/product.queries";
import { useAdminProductFilters } from "../../hooks/use-admin-product-filters";
import { ProductImage } from "../product-image";
import { DeleteProductButton } from "./delete-product-button";
import { ProductStatusBadge } from "./product-status-badge";

const COLUMN_COUNT = 7;

export function AdminProductTable() {
  const { filters, updateFilters } = useAdminProductFilters();
  const { isCategoryActive } = useCategoryVisibility();
  const query = useQuery(adminProductListQuery(filters));

  if (query.isError) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-lg border py-12 text-center">
        <p className="font-medium">Could not load products</p>
        <p className="text-sm text-muted-foreground">{getErrorMessage(query.error)}</p>
        <Button variant="outline" onClick={() => void query.refetch()}>
          Try again
        </Button>
      </div>
    );
  }

  const products = query.data?.data ?? [];
  const meta = query.data?.meta;

  return (
    <div className="space-y-4">
      {/* Previous page stays visible (dimmed) while the next page loads: no layout jump. */}
      <div
        className={cn(
          "rounded-lg border transition-opacity",
          query.isPlaceholderData && "opacity-60",
        )}
        aria-busy={query.isFetching}
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-14">Image</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-right">Stock</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-24 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {query.isPending &&
              Array.from({ length: 5 }, (_, index) => (
                <TableRow key={index}>
                  <TableCell colSpan={COLUMN_COUNT}>
                    <Skeleton className="h-10 w-full" />
                  </TableCell>
                </TableRow>
              ))}

            {!query.isPending && products.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={COLUMN_COUNT}
                  className="py-12 text-center text-muted-foreground"
                >
                  No products match these filters.
                </TableCell>
              </TableRow>
            )}

            {products.map((product) => {
              const isDeleted = product.deletedAt !== null;
              return (
                <TableRow key={product.id}>
                  <TableCell>
                    <ProductImage
                      src={product.imageUrl}
                      alt={product.name}
                      className="size-10 rounded-md [&_svg]:size-4"
                    />
                  </TableCell>
                  <TableCell className="max-w-64">
                    <p className="truncate font-medium">{product.name}</p>
                    <p className="truncate text-xs text-muted-foreground">/{product.slug}</p>
                  </TableCell>
                  <TableCell>{product.category.name}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatPaisa(product.priceInPaisa)}
                  </TableCell>
                  <TableCell
                    className={cn(
                      "text-right tabular-nums",
                      product.stock === 0 && "text-destructive",
                    )}
                  >
                    {product.stock}
                  </TableCell>
                  <TableCell>
                    <ProductStatusBadge
                      isActive={product.isActive}
                      deletedAt={product.deletedAt}
                      isCategoryActive={isCategoryActive(product.category.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon-sm" asChild>
                        <Link
                          to={`/admin/products/${product.id}/edit`}
                          aria-label={`${isDeleted ? "View" : "Edit"} ${product.name}`}
                        >
                          <Pencil />
                        </Link>
                      </Button>
                      {!isDeleted && (
                        <DeleteProductButton productId={product.id} productName={product.name} />
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {meta && meta.total > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
          <p className="text-muted-foreground">
            Showing {(meta.page - 1) * ADMIN_PAGE_SIZE + 1}–
            {Math.min(meta.page * ADMIN_PAGE_SIZE, meta.total)} of {meta.total} products
          </p>
          <nav className="flex items-center gap-2" aria-label="Pagination">
            <Button
              variant="outline"
              size="sm"
              disabled={!meta.hasPreviousPage || query.isPlaceholderData}
              onClick={() => {
                updateFilters({ page: String(meta.page - 1) });
              }}
            >
              <ChevronLeft />
              Previous
            </Button>
            <span className="tabular-nums">
              Page {meta.page} of {meta.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={!meta.hasNextPage || query.isPlaceholderData}
              onClick={() => {
                updateFilters({ page: String(meta.page + 1) });
              }}
            >
              Next
              <ChevronRight />
            </Button>
          </nav>
        </div>
      )}
    </div>
  );
}
