import { data, type LoaderFunctionArgs } from "react-router";
import { queryClient } from "@/app/query-client";
import { requireAdminLoader } from "@/features/auth/lib/route-guards";
import { toApiError } from "@/lib/api/api-error";
import { adminProductDetailQuery } from "../api/product.queries";

/**
 * Loads the product for the admin edit page.
 * React Router runs parent and child loaders in parallel, so this loader runs the admin
 * guard itself first: otherwise the admin API call could start before the session is restored.
 */
export async function adminProductEditLoader(args: LoaderFunctionArgs): Promise<null> {
  await requireAdminLoader(args);
  const id = args.params.id ?? "";

  try {
    await queryClient.query(adminProductDetailQuery(id));
  } catch (error) {
    const apiError = toApiError(error);
    if (apiError.status === 404 || apiError.status === 400) {
      throw data("This product does not exist.", { status: 404, statusText: "Not Found" });
    }
    throw apiError;
  }
  return null;
}
