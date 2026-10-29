import type { ReactNode } from "react";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { ArrowLeft, Pencil } from "lucide-react";
import { Link, useParams } from "react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cameraDetailQuery, cameraStatusQuery } from "@/features/cameras/api/camera.queries";
import { CameraStatusBadge } from "@/features/cameras/components/camera-status-badge";
import { HlsPlayer } from "@/features/cameras/components/hls-player";

function DetailRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid gap-1 sm:grid-cols-[140px_1fr]">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="min-w-0 text-sm break-all">{children}</dd>
    </div>
  );
}

/** One camera full width, with native controls (fullscreen) and its live stream details. */
export function AdminCameraDetailPage() {
  const { id = "" } = useParams();
  // The route loader already fetched it, so this never suspends on navigation.
  const { data: camera } = useSuspenseQuery(cameraDetailQuery(id));
  const statusQuery = useQuery(cameraStatusQuery(id));
  const status = statusQuery.data;

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/admin/cameras" aria-label="Back to all cameras">
            <ArrowLeft />
          </Link>
        </Button>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-2xl font-bold tracking-tight">{camera.name}</h1>
          <p className="text-sm text-muted-foreground">{camera.location ?? "No location"}</p>
        </div>
        <CameraStatusBadge state={camera.isActive ? status?.state : "disabled"} />
        <Button variant="outline" size="sm" asChild>
          <Link to={`/admin/cameras/${camera.id}/edit`}>
            <Pencil />
            Edit
          </Link>
        </Button>
      </div>

      {camera.isActive ? (
        <HlsPlayer
          src={camera.hlsUrl}
          title={`Live video: ${camera.name}`}
          controls
          className="rounded-xl"
          onStateChange={(state) => {
            if (state === "playing" || state === "reconnecting") void statusQuery.refetch();
          }}
        />
      ) : (
        <p className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
          This camera is disabled, so there is no live video.
        </p>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Stream details</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="space-y-3">
            <DetailRow label="Viewers">{status?.viewers ?? "–"}</DetailRow>
            <DetailRow label="Live since">
              {status?.liveSince ? new Date(status.liveSince).toLocaleString() : "–"}
            </DetailRow>
            <DetailRow label="Codec">
              {status && status.tracks.length > 0 ? status.tracks.join(", ") : "–"}
            </DetailRow>
            <DetailRow label="Stream path">
              <code>{camera.streamPath}</code>
            </DetailRow>
            <DetailRow label="Camera source">
              <code>{camera.rtspUrlMasked}</code>
            </DetailRow>
            <DetailRow label="Playback URL">
              <code>{camera.hlsUrl}</code>
            </DetailRow>
            <DetailRow label="Last checked">
              {status ? new Date(status.checkedAt).toLocaleTimeString() : "–"}
            </DetailRow>
          </dl>
        </CardContent>
      </Card>
    </section>
  );
}
