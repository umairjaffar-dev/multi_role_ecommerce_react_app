import { Badge } from "@/components/ui/badge";

export function StockBadge({ inStock }: { inStock: boolean }) {
  return inStock ? (
    <Badge variant="success">In stock</Badge>
  ) : (
    <Badge variant="destructive">Out of stock</Badge>
  );
}
