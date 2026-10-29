import { useSearchParams } from "react-router";
import {
  CameraGridColumnsSchema,
  type CameraGridColumnsSchemaType,
} from "../schemas/camera.schema";

const DEFAULT_COLUMNS: CameraGridColumnsSchemaType = "2";

/** Grid layout lives in the URL (?cols=3), so a wall-screen view can be bookmarked. */
export function useCameraGridColumns() {
  const [searchParams, setSearchParams] = useSearchParams();
  const columns = CameraGridColumnsSchema.parse(searchParams.get("cols") ?? DEFAULT_COLUMNS);

  const setColumns = (next: CameraGridColumnsSchemaType) => {
    setSearchParams(
      (previous) => {
        const params = new URLSearchParams(previous);
        if (next === DEFAULT_COLUMNS) params.delete("cols");
        else params.set("cols", next);
        return params;
      },
      { replace: true },
    );
  };

  return { columns, setColumns };
}
