import { useQuery } from "@tanstack/react-query";
import { Cctv, Plus } from "lucide-react";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getErrorMessage } from "@/lib/api/api-error";
import { cn } from "@/lib/utils";
import { liveCameraListQuery } from "../api/camera.queries";
import type { CameraGridColumnsSchemaType } from "../schemas/camera.schema";
import { CameraTile } from "./camera-tile";

const GRID_COLUMNS: Record<CameraGridColumnsSchemaType, string> = {
  "1": "grid-cols-1",
  "2": "grid-cols-1 md:grid-cols-2",
  "3": "grid-cols-1 md:grid-cols-2 xl:grid-cols-3",
};

export function CameraGrid({ columns }: { columns: CameraGridColumnsSchemaType }) {
  const camerasQuery = useQuery(liveCameraListQuery());

  if (camerasQuery.isPending) {
    return (
      <div className={cn("grid gap-4", GRID_COLUMNS[columns])}>
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="aspect-video rounded-xl" />
        ))}
      </div>
    );
  }

  if (camerasQuery.isError) {
    return (
      <p className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
        Could not load cameras: {getErrorMessage(camerasQuery.error)}
      </p>
    );
  }

  const cameras = camerasQuery.data.data;

  if (cameras.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed py-16 text-center">
        <Cctv className="size-8 text-muted-foreground" />
        <h2 className="font-medium">No active cameras</h2>
        <p className="max-w-sm text-sm text-muted-foreground">
          Add a camera to see it here. Disabled cameras are not shown in the live view.
        </p>
        <Button size="sm" asChild>
          <Link to="/admin/cameras/new">
            <Plus />
            Add camera
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className={cn("grid gap-4", GRID_COLUMNS[columns])}>
      {cameras.map((camera) => (
        <CameraTile key={camera.id} camera={camera} />
      ))}
    </div>
  );
}
