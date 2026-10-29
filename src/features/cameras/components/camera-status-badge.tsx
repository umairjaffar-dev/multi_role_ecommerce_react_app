import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { CameraStreamStateSchemaType } from "../schemas/camera.schema";

const STATE_DISPLAY: Record<
  CameraStreamStateSchemaType,
  {
    label: string;
    variant: "success" | "secondary" | "warning" | "destructive";
    dot: string;
    hint: string;
  }
> = {
  live: {
    label: "Live",
    variant: "success",
    dot: "bg-success animate-pulse",
    hint: "Video is flowing from the camera",
  },
  standby: {
    label: "Standby",
    variant: "secondary",
    dot: "bg-muted-foreground",
    hint: "Nobody is watching, so the camera is not connected. With on-demand pulling a camera that is offline looks the same.",
  },
  not_synced: {
    label: "Syncing",
    variant: "warning",
    dot: "bg-warning",
    hint: "The media server has no path for this camera yet; the backend adds it within a minute.",
  },
  disabled: {
    label: "Disabled",
    variant: "secondary",
    dot: "bg-muted-foreground/50",
    hint: "The camera is switched off",
  },
  unknown: {
    label: "Media server down",
    variant: "destructive",
    dot: "bg-destructive",
    hint: "The media server could not be reached",
  },
};

/** Stream state from GET /admin/cameras/:id/status. `undefined` while the first check runs. */
export function CameraStatusBadge({ state }: { state: CameraStreamStateSchemaType | undefined }) {
  if (!state) return <Badge variant="outline">Checking…</Badge>;

  const { label, variant, dot, hint } = STATE_DISPLAY[state];
  return (
    <Badge variant={variant} title={hint}>
      <span aria-hidden="true" className={cn("size-1.5 rounded-full", dot)} />
      {label}
    </Badge>
  );
}
