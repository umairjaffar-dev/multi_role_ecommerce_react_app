import { isRouteErrorResponse, Link, useRouteError } from "react-router";
import { Button } from "@/components/ui/button";
import { getErrorMessage } from "@/lib/api/api-error";

/**
 * Route-level error boundary. A crash in one page renders this screen
 * instead of a blank white page.
 */
export function RouteErrorPage() {
  const error = useRouteError();

  const message = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : getErrorMessage(error);

  return (
    <section className="flex min-h-svh flex-col items-center justify-center gap-4 p-4 text-center">
      <h1 className="text-2xl font-semibold">Something went wrong</h1>
      <p className="max-w-md text-muted-foreground">{message}</p>
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={() => {
            window.location.reload();
          }}
        >
          Try again
        </Button>
        <Button asChild>
          <Link to="/">Go home</Link>
        </Button>
      </div>
    </section>
  );
}
