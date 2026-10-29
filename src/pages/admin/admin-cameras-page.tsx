import { Columns2, LayoutGrid, Plus, Rows2, Settings2 } from "lucide-react";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { CameraGrid } from "@/features/cameras/components/camera-grid";
import { useCameraGridColumns } from "@/features/cameras/hooks/use-camera-grid-columns";
import type { CameraGridColumnsSchemaType } from "@/features/cameras/schemas/camera.schema";

const LAYOUT_OPTIONS: Array<{
  value: CameraGridColumnsSchemaType;
  label: string;
  icon: typeof Rows2;
}> = [
  { value: "1", label: "1 column", icon: Rows2 },
  { value: "2", label: "2 columns", icon: Columns2 },
  { value: "3", label: "3 columns", icon: LayoutGrid },
];

export function AdminCamerasPage() {
  const { columns, setColumns } = useCameraGridColumns();

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Cameras</h1>
          <p className="text-sm text-muted-foreground">
            Live view. Tiles play only while on screen.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div role="group" aria-label="Grid layout" className="flex gap-1">
            {LAYOUT_OPTIONS.map(({ value, label, icon: Icon }) => (
              <Button
                key={value}
                variant={columns === value ? "secondary" : "ghost"}
                size="icon"
                aria-label={label}
                aria-pressed={columns === value}
                onClick={() => {
                  setColumns(value);
                }}
              >
                <Icon />
              </Button>
            ))}
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link to="/admin/cameras/manage">
              <Settings2 />
              Manage
            </Link>
          </Button>
          <Button size="sm" asChild>
            <Link to="/admin/cameras/new">
              <Plus />
              Add camera
            </Link>
          </Button>
        </div>
      </div>
      <CameraGrid columns={columns} />
    </section>
  );
}
