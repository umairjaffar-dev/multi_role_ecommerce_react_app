import { Badge } from "@/components/ui/badge";

/** Deleted wins over hidden: a soft-deleted product is gone regardless of isActive. */
export function ProductStatusBadge({
  isActive,
  deletedAt,
}: {
  isActive: boolean;
  deletedAt: string | null;
}) {
  if (deletedAt) return <Badge variant="destructive">Deleted</Badge>;
  if (!isActive) return <Badge variant="warning">Hidden</Badge>;
  return <Badge variant="success">Active</Badge>;
}
