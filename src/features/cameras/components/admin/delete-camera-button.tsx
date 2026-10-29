import { useState, type MouseEvent } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { getErrorMessage } from "@/lib/api/api-error";
import { useDeleteCameraMutation } from "../../api/camera.mutations";

/** Confirmed hard delete. The dialog stays open (with a spinner) until the request finishes. */
export function DeleteCameraButton({
  cameraId,
  cameraName,
  variant = "icon",
  onDeleted,
}: {
  cameraId: string;
  cameraName: string;
  variant?: "icon" | "full";
  onDeleted?: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const deleteMutation = useDeleteCameraMutation();

  const handleConfirm = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    deleteMutation.mutate(cameraId, {
      onSuccess: () => {
        toast.success(`"${cameraName}" deleted`);
        setIsOpen(false);
        onDeleted?.();
      },
      onError: (error) => {
        // e.g. 502: the media server is down, so the backend kept the camera
        toast.error(getErrorMessage(error));
      },
    });
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        {variant === "icon" ? (
          <Button variant="ghost" size="icon-sm" aria-label={`Delete ${cameraName}`}>
            <Trash2 className="text-destructive" />
          </Button>
        ) : (
          <Button variant="destructive">
            <Trash2 />
            Delete camera
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete “{cameraName}”?</AlertDialogTitle>
          <AlertDialogDescription>
            The camera is removed for good and its live stream stops for everyone watching. To pause
            it instead, disable it.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteMutation.isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction disabled={deleteMutation.isPending} onClick={handleConfirm}>
            {deleteMutation.isPending && <Loader2 className="animate-spin" />}
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
