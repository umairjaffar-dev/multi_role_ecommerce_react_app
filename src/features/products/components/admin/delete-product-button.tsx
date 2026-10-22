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
import { useDeleteProductMutation } from "../../api/product.mutations";

/** Confirmed soft delete. The dialog stays open (with a spinner) until the request finishes. */
export function DeleteProductButton({
  productId,
  productName,
  variant = "icon",
  onDeleted,
}: {
  productId: string;
  productName: string;
  variant?: "icon" | "full";
  onDeleted?: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const deleteMutation = useDeleteProductMutation();

  const handleConfirm = (event: MouseEvent<HTMLButtonElement>) => {
    // Keep the dialog open until the request settles (Radix closes it on click by default).
    event.preventDefault();
    deleteMutation.mutate(productId, {
      onSuccess: () => {
        toast.success(`"${productName}" deleted`);
        setIsOpen(false);
        onDeleted?.();
      },
      onError: (error) => {
        toast.error(getErrorMessage(error));
      },
    });
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        {variant === "icon" ? (
          <Button variant="ghost" size="icon-sm" aria-label={`Delete ${productName}`}>
            <Trash2 className="text-destructive" />
          </Button>
        ) : (
          <Button variant="destructive">
            <Trash2 />
            Delete product
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete “{productName}”?</AlertDialogTitle>
          <AlertDialogDescription>
            The product disappears from the store and can no longer be edited. Past orders keep
            their reference to it.
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
