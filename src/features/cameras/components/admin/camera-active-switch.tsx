import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { getErrorMessage } from "@/lib/api/api-error";
import { useUpdateCameraMutation } from "../../api/camera.mutations";

/**
 * Enable / disable straight from the table. Not optimistic on purpose: the backend only
 * commits after MediaMTX accepted the change, so the switch flips when the server says so.
 */
export function CameraActiveSwitch({
  cameraId,
  cameraName,
  isActive,
}: {
  cameraId: string;
  cameraName: string;
  isActive: boolean;
}) {
  const updateMutation = useUpdateCameraMutation();

  return (
    <Switch
      checked={isActive}
      disabled={updateMutation.isPending}
      aria-label={`${isActive ? "Disable" : "Enable"} ${cameraName}`}
      onCheckedChange={(checked) => {
        updateMutation.mutate(
          { id: cameraId, payload: { isActive: checked } },
          {
            onSuccess: () => {
              toast.success(`"${cameraName}" ${checked ? "enabled" : "disabled"}`);
            },
            onError: (error) => {
              toast.error(getErrorMessage(error));
            },
          },
        );
      }}
    />
  );
}
