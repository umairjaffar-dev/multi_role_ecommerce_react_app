import { Loader2 } from "lucide-react";

/** Shown while the root loader restores the session on first page load. */
export function AppLoadingScreen() {
  return (
    <div className="flex min-h-svh items-center justify-center" role="status" aria-live="polite">
      <Loader2 className="size-6 animate-spin text-muted-foreground" />
      <span className="sr-only">Loading…</span>
    </div>
  );
}
