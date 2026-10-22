import { CircleAlert } from "lucide-react";

/** Form-level error (wrong credentials, rate limit, network) shown above the submit button. */
export function FormAlert({ message }: { message: string | undefined }) {
  if (!message) return null;

  return (
    <div
      role="alert"
      className="flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
    >
      <CircleAlert className="mt-0.5 size-4 shrink-0" />
      <span>{message}</span>
    </div>
  );
}
