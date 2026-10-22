import { ShieldCheck } from "lucide-react";
import { selectUser, useAuthStore } from "@/stores/auth.store";

/** Placeholder admin landing page (admin role only). Admin modules are added later. */
export function AdminDashboardPage() {
  const user = useAuthStore(selectUser);

  return (
    <section className="space-y-2">
      <div className="flex items-center gap-2">
        <ShieldCheck className="size-6" />
        <h1 className="text-3xl font-bold tracking-tight">Admin dashboard</h1>
      </div>
      <p className="text-muted-foreground">
        Signed in as {user?.name}. Product, category and order management will appear here.
      </p>
    </section>
  );
}
