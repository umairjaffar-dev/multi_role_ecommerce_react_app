import { ChevronLeft } from "lucide-react";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useCreateCameraMutation } from "@/features/cameras/api/camera.mutations";
import {
  CameraForm,
  type CameraFormSubmitType,
} from "@/features/cameras/components/admin/camera-form";
import { CAMERA_FORM_ERROR_MAPPING } from "@/features/cameras/lib/camera-form-errors";
import { EMPTY_CAMERA_FORM, toCameraPayload } from "@/features/cameras/schemas/camera.schema";
import { applyServerErrors } from "@/lib/forms/apply-server-errors";

export function AdminCameraCreatePage() {
  const navigate = useNavigate();
  const createMutation = useCreateCameraMutation();

  const handleSubmit = ({ values, setError }: CameraFormSubmitType) => {
    createMutation.mutate(toCameraPayload(values), {
      onSuccess: (camera) => {
        toast.success(`"${camera.name}" added`);
        // Straight to its live page: the admin sees right away whether the address works.
        void navigate(camera.isActive ? `/admin/cameras/${camera.id}` : "/admin/cameras/manage", {
          replace: true,
        });
      },
      onError: (error) => {
        applyServerErrors(error, setError, CAMERA_FORM_ERROR_MAPPING);
      },
    });
  };

  return (
    <section className="max-w-3xl space-y-6">
      <Link
        to="/admin/cameras/manage"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="size-4" />
        Back to cameras
      </Link>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Add camera</CardTitle>
          <CardDescription>
            The backend saves the camera and tells the media server to start pulling its video.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CameraForm
            mode="create"
            defaultValues={EMPTY_CAMERA_FORM}
            isPending={createMutation.isPending}
            onSubmit={handleSubmit}
          />
        </CardContent>
      </Card>
    </section>
  );
}
