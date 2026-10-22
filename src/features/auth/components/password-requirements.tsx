import { Check, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import { PASSWORD_RULES } from "../schemas/auth.schema";

/** Live checklist under the password field, using the same rules the backend enforces. */
export function PasswordRequirements({ password }: { password: string }) {
  return (
    <ul className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs" aria-label="Password requirements">
      {PASSWORD_RULES.map((rule) => {
        const isMet = rule.test(password);
        return (
          <li
            key={rule.id}
            className={cn(
              "flex items-center gap-1.5",
              isMet ? "text-success" : "text-muted-foreground",
            )}
          >
            {isMet ? <Check className="size-3.5" /> : <Circle className="size-3.5" />}
            <span>{rule.label}</span>
            <span className="sr-only">{isMet ? "(met)" : "(not met)"}</span>
          </li>
        );
      })}
    </ul>
  );
}
