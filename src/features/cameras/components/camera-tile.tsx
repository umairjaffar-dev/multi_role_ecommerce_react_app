import { useQuery } from "@tanstack/react-query";
import { Eye, Maximize2 } from "lucide-react";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { cameraStatusQuery } from "../api/camera.queries";
import type { CameraSchemaType } from "../schemas/camera.schema";
import { CameraStatusBadge } from "./camera-status-badge";
import { HlsPlayer } from "./hls-player";

/** One camera in the live grid: video on top, name and live state below. */
export function CameraTile({ camera }: { camera: CameraSchemaType }) {
  const statusQuery = useQuery(cameraStatusQuery(camera.id));
  const status = statusQuery.data;

  return (
    <article className="overflow-hidden rounded-xl border bg-card shadow-sm">
      <HlsPlayer
        src={camera.hlsUrl}
        title={`Live video: ${camera.name}`}
        onStateChange={(state) => {
          // Our own player just started or lost the stream: the status changed, check now
          // instead of waiting for the next poll.
          if (state === "playing" || state === "reconnecting") void statusQuery.refetch();
        }}
      />
      <div className="flex items-start justify-between gap-3 p-3">
        <div className="min-w-0 space-y-1">
          <h2 className="truncate font-medium">{camera.name}</h2>
          <p className="truncate text-sm text-muted-foreground">
            {camera.location ?? "No location"} · {camera.streamPath}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {status && status.viewers > 0 && (
            <span
              className="flex items-center gap-1 text-xs text-muted-foreground tabular-nums"
              title="Open viewer sessions, this tile included. A closed tab still counts for a few seconds until the media server drops its session."
            >
              <Eye className="size-3.5" />
              {status.viewers}
            </span>
          )}
          <CameraStatusBadge state={status?.state} />
          <Button variant="ghost" size="icon" asChild>
            <Link to={`/admin/cameras/${camera.id}`} aria-label={`Open ${camera.name}`}>
              <Maximize2 />
            </Link>
          </Button>
        </div>
      </div>
    </article>
  );
}
