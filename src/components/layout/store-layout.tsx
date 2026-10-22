import { ShoppingBag } from "lucide-react";
import { Link, NavLink, Outlet } from "react-router";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { env } from "@/config/env";
import { UserMenu } from "@/features/auth/components/user-menu";

/** Public storefront shell: header, page content, footer. */
export function StoreLayout() {
  return (
    <div className="flex min-h-svh flex-col">
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2 font-semibold">
              <ShoppingBag className="size-5" />
              <span className="hidden sm:inline">{env.VITE_APP_NAME}</span>
            </Link>
            <nav aria-label="Main">
              <NavLink
                to="/products"
                className={({ isActive }) =>
                  isActive
                    ? "text-sm font-medium"
                    : "text-sm text-muted-foreground transition-colors hover:text-foreground"
                }
              >
                Products
              </NavLink>
            </nav>
          </div>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <UserMenu />
          </div>
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
