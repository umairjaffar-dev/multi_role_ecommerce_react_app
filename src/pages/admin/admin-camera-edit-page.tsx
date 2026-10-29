import { useSuspenseQuery } from "@tanstack/react-query";
import { ChevronLeft, Play } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useUpdateCameraMutation } from "@/features/cameras/api/camera.mutations";
import { cameraDetailQuery } from "@/features/cameras/api/camera.queries";
import {
  CameraForm,
  type CameraFormSubmitType,
} from "@/features/cameras/components/admin/camera-form";
import { DeleteCameraButton } from "@/features/cameras/components/admin/delete-camera-button";
import { CAMERA_FORM_ERROR_MAPPING } from "@/features/cameras/lib/camera-form-errors";
import {
  toCameraPayload,
  type CameraFormInputType,
  type CameraPayloadType,
  type CameraSchemaType,
} from "@/features/cameras/schemas/camera.schema";
import { applyServerErrors } from "@/lib/forms/apply-server-errors";

function toFormValues(camera: CameraSchemaType): CameraFormInputType {
  return {
    name: camera.name,
    location: camera.location ?? "",
    // The real address never reaches the browser; empty means "keep it"
    rtspUrl: "",
    streamPath: camera.streamPath,
    isActive: camera.isActive,
  };
}

export function AdminCameraEditPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const { data: camera } = useSuspenseQuery(cameraDetailQuery(id));
  const updateMutation = useUpdateCameraMutation();

  const handleSubmit = ({ values, dirtyFields, setError }: CameraFormSubmitType) => {
    // PATCH only what changed. Fewer MediaMTX updates too: renaming a camera does not
    // touch its stream at all on the backend.
    const fullPayload = toCameraPayload(values);
    const payload: Partial<CameraPayloadType> = {};
    for (const key of Object.keys(fullPayload) as Array<keyof CameraPayloadType>) {
      if (!dirtyFields[key]) continue;
      if (key === "rtspUrl" && values.rtspUrl === "") continue;
      Object.assign(payload, { [key]: fullPayload[key] });
    }

    if (Object.keys(payload).length === 0) {
      toast.info("Nothing to save");
      return;
    }

    updateMutation.mutate(
      { id, payload },
      {
        onSuccess: () => {
          toast.success("Camera saved");
        },
        onError: (error) => {
          applyServerErrors(error, setError, CAMERA_FORM_ERROR_MAPPING);
        },
      },
    );
  };

  return (
    <section className="max-w-3xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Link
          to="/admin/cameras/manage"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="size-4" />
          Back to cameras
        </Link>
        {camera.isActive && (
          <Button variant="outline" size="sm" asChild>
            <Link to={`/admin/cameras/${camera.id}`}>
              <Play />
              Watch live
            </Link>
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <CardTitle className="text-2xl">{camera.name}</CardTitle>
            <Badge variant={camera.isActive ? "success" : "secondary"}>
              {camera.isActive ? "Active" : "Disabled"}
            </Badge>
          </div>
          <CardDescription>
            Last updated {new Date(camera.updatedAt).toLocaleString()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* key: after a save the form remounts with the saved values, so it is no longer "dirty" */}
          <CameraForm
            key={camera.updatedAt}
            mode="edit"
            defaultValues={toFormValues(camera)}
            currentRtspUrlMasked={camera.rtspUrlMasked}
            isPending={updateMutation.isPending}
            onSubmit={handleSubmit}
          />
        </CardContent>
      </Card>

      <Card className="border-destructive/40">
        <CardHeader>
          <CardTitle>Danger zone</CardTitle>
          <CardDescription>
            Deleting removes the camera and stops its stream for good.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DeleteCameraButton
            cameraId={camera.id}
            cameraName={camera.name}
            variant="full"
            onDeleted={() => void navigate("/admin/cameras/manage", { replace: true })}
          />
        </CardContent>
      </Card>
    </section>
  );
}
