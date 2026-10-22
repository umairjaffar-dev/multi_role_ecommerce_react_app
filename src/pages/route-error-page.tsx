import { isRouteErrorResponse, Link, useRouteError } from "react-router";
import { Button } from "@/components/ui/button";
import { getErrorMessage } from "@/lib/api/api-error";

/**
 * Route-level error boundary. A crash or a thrown response (403 from a guard)
 * renders this screen instead of a blank white page.
 */
export function RouteErrorPage() {
  const error = useRouteError();

  const isResponse = isRouteErrorResponse(error);
  const title = isResponse ? `${error.status} ${error.statusText}` : "Something went wrong";
  const message = isResponse
    ? typeof error.data === "string"
      ? error.data
      : "The page could not be loaded."
    : getErrorMessage(error);

  return (
    <section className="flex flex-col items-center justify-center gap-4 py-24 text-center">
      <h1 className="text-2xl font-semibold">{title}</h1>
      <p className="max-w-md text-muted-foreground">{message}</p>
      <div className="flex gap-2">
        {!isResponse && (
          <Button
            variant="outline"
            onClick={() => {
              window.location.reload();
            }}
          >
            Try again
          </Button>
        )}
        <Button asChild>
          <Link to="/">Go home</Link>
        </Button>
      </div>
    </section>
  );
}
