import { data, type LoaderFunctionArgs } from "react-router";
import { queryClient } from "@/app/query-client";
import { toApiError } from "@/lib/api/api-error";
import { publicProductDetailQuery } from "../api/product.queries";

/**
 * Render-as-you-fetch: the product request starts in the route loader, in parallel with
 * the page's JS chunk, instead of after the component mounts. queryClient.query() reuses the
 * cache (e.g. from hover prefetch) while it is fresh, and fetches otherwise.
 */
export async function productDetailLoader({ params }: LoaderFunctionArgs): Promise<null> {
  const slug = params.slug ?? "";

  try {
    await queryClient.query(publicProductDetailQuery(slug));
  } catch (error) {
    const apiError = toApiError(error);
    // Hidden, deleted and missing products all come back as 404 from the backend.
    if (apiError.status === 404 || apiError.status === 400) {
      throw data("This product does not exist or is no longer available.", {
        status: 404,
        statusText: "Not Found",
      });
    }
    throw apiError;
  }
  return null;
}
