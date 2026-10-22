import { Skeleton } from "@/components/ui/skeleton";

/** Same shape as the real grid, so content does not jump when it arrives. */
export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div
      className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4"
      aria-busy="true"
      aria-label="Loading products"
    >
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="overflow-hidden rounded-xl border">
          <Skeleton className="aspect-square rounded-none" />
          <div className="space-y-2 p-4">
            <Skeleton className="h-3 w-1/3" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}
