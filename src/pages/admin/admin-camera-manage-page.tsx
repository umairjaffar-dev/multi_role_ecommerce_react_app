import { ChevronLeft, Plus } from "lucide-react";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { AdminCameraTable } from "@/features/cameras/components/admin/admin-camera-table";
import { AdminCameraToolbar } from "@/features/cameras/components/admin/admin-camera-toolbar";

export function AdminCameraManagePage() {
  return (
    <section className="space-y-6">
      <Link
        to="/admin/cameras"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="size-4" />
        Back to live view
      </Link>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Manage cameras</h1>
          <p className="text-sm text-muted-foreground">
            Disabling a camera keeps it saved but stops its stream.
          </p>
        </div>
        <Button asChild>
          <Link to="/admin/cameras/new">
            <Plus />
            Add camera
          </Link>
        </Button>
      </div>
      <AdminCameraToolbar />
      <AdminCameraTable />
    </section>
  );
}
