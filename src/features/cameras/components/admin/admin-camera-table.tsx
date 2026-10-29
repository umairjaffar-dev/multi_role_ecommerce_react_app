import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Pencil, Play } from "lucide-react";
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
import { getErrorMessage } from "@/lib/api/api-error";
import { cn } from "@/lib/utils";
import { ADMIN_CAMERA_PAGE_SIZE, adminCameraListQuery } from "../../api/camera.queries";
import { useAdminCameraFilters } from "../../hooks/use-admin-camera-filters";
import { CameraActiveSwitch } from "./camera-active-switch";
import { DeleteCameraButton } from "./delete-camera-button";

const COLUMN_COUNT = 5;

export function AdminCameraTable() {
  const { filters, updateFilters } = useAdminCameraFilters();
  const query = useQuery(adminCameraListQuery(filters));

  if (query.isError) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-lg border py-12 text-center">
        <p className="font-medium">Could not load cameras</p>
        <p className="text-sm text-muted-foreground">{getErrorMessage(query.error)}</p>
        <Button variant="outline" onClick={() => void query.refetch()}>
          Try again
        </Button>
      </div>
    );
  }

  const cameras = query.data?.data ?? [];
  const meta = query.data?.meta;
  const hasFilters = Boolean(filters.search ?? filters.isActive);

  return (
    <div className="space-y-4">
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
              <TableHead>Camera</TableHead>
              <TableHead className="hidden sm:table-cell">Stream path</TableHead>
              <TableHead className="hidden lg:table-cell">Source</TableHead>
              <TableHead>Active</TableHead>
              <TableHead className="w-28 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {query.isPending &&
              Array.from({ length: 4 }, (_, index) => (
                <TableRow key={index}>
                  <TableCell colSpan={COLUMN_COUNT}>
                    <Skeleton className="h-10 w-full" />
                  </TableCell>
                </TableRow>
              ))}

            {!query.isPending && cameras.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={COLUMN_COUNT}
                  className="py-12 text-center text-muted-foreground"
                >
                  {hasFilters ? "No cameras match these filters." : "No cameras yet."}
                </TableCell>
              </TableRow>
            )}

            {cameras.map((camera) => (
              <TableRow key={camera.id}>
                <TableCell className="max-w-56">
                  <p className="truncate font-medium">{camera.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {camera.location ?? "No location"}
                  </p>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <code className="text-xs">{camera.streamPath}</code>
                </TableCell>
                <TableCell className="hidden max-w-72 lg:table-cell">
                  <code className="block truncate text-xs text-muted-foreground">
                    {camera.rtspUrlMasked}
                  </code>
                </TableCell>
                <TableCell>
                  <CameraActiveSwitch
                    cameraId={camera.id}
                    cameraName={camera.name}
                    isActive={camera.isActive}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-1">
                    {camera.isActive && (
                      <Button variant="ghost" size="icon-sm" asChild>
                        <Link
                          to={`/admin/cameras/${camera.id}`}
                          aria-label={`Watch ${camera.name}`}
                        >
                          <Play />
                        </Link>
                      </Button>
                    )}
                    <Button variant="ghost" size="icon-sm" asChild>
                      <Link
                        to={`/admin/cameras/${camera.id}/edit`}
                        aria-label={`Edit ${camera.name}`}
                      >
                        <Pencil />
                      </Link>
                    </Button>
                    <DeleteCameraButton cameraId={camera.id} cameraName={camera.name} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {meta && meta.total > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
          <p className="text-muted-foreground">
            Showing {(meta.page - 1) * ADMIN_CAMERA_PAGE_SIZE + 1}–
            {Math.min(meta.page * ADMIN_CAMERA_PAGE_SIZE, meta.total)} of {meta.total} cameras
          </p>
          {meta.totalPages > 1 && (
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
          )}
        </div>
      )}
    </div>
  );
}
