import { ShoppingBag } from "lucide-react";
import { Link, Outlet } from "react-router";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { env } from "@/config/env";

/** Public storefront shell: header, page content, footer. */
export function StoreLayout() {
  return (
    <div className="flex min-h-svh flex-col">
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2 font-semibold">
            <ShoppingBag className="size-5" />
            <span>{env.VITE_APP_NAME}</span>
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8">
        <Outlet />
      </main>

      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} {env.VITE_APP_NAME}
      </footer>
    </div>
  );
}
