import { Badge } from "@/components/ui/badge";

/**
 * Store visibility, in the same order the backend checks it (isPubliclyVisible):
 * deleted -> product hidden -> category hidden -> active.
 * A product is only shown to customers when it AND its category are active.
 */
export function ProductStatusBadge({
  isActive,
  deletedAt,
  isCategoryActive = true,
}: {
  isActive: boolean;
  deletedAt: string | null;
  isCategoryActive?: boolean;
}) {
  if (deletedAt) return <Badge variant="destructive">Deleted</Badge>;
  if (!isActive) return <Badge variant="warning">Hidden</Badge>;
  if (!isCategoryActive) {
    return (
      <Badge variant="warning" title="The product is active, but its category is hidden">
        Category hidden
      </Badge>
    );
  }
  return <Badge variant="success">Active</Badge>;
}
