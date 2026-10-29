import { data, type LoaderFunctionArgs } from "react-router";
import { queryClient } from "@/app/query-client";
import { requireAdminLoader } from "@/features/auth/lib/route-guards";
import { toApiError } from "@/lib/api/api-error";
import { cameraDetailQuery } from "../api/camera.queries";

/**
 * Loads the camera for its live page. Runs the admin guard first (parent and child loaders
 * run in parallel), same as adminProductEditLoader.
 */
export async function cameraDetailLoader(args: LoaderFunctionArgs): Promise<null> {
  await requireAdminLoader(args);
  const id = args.params.id ?? "";

  try {
    await queryClient.query(cameraDetailQuery(id));
  } catch (error) {
    const apiError = toApiError(error);
    if (apiError.status === 404 || apiError.status === 400) {
      throw data("This camera does not exist.", { status: 404, statusText: "Not Found" });
    }
    throw apiError;
  }
  return null;
}
