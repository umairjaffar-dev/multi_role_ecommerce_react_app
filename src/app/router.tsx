import { createBrowserRouter } from "react-router";
import { StoreLayout } from "@/components/layout/store-layout";
import { AppLoadingScreen } from "@/components/shared/app-loading-screen";
import {
  requireAdminLoader,
  requireAuthLoader,
  requireGuestLoader,
  rootSessionLoader,
} from "@/features/auth/lib/route-guards";
import { endSession, refreshSession, subscribeToAuthEvents } from "@/features/auth/lib/session";
import { RouteErrorPage } from "@/pages/route-error-page";
import { queryClient } from "./query-client";

/**
 * Data-mode router.
 * - Pages are lazy-loaded: each route ships as its own JS chunk (smaller first load).
 * - Guards are plain `loader`s defined outside `lazy`, so the auth check and the page chunk
 *   download run in parallel instead of one after the other.
 *
 * Route groups:
 *   public:  /                         (home, later /products, /cart)
 *   guest:   /login, /register         (logged-in users are redirected away)
 *   auth:    /account                  (guests are redirected to /login?redirectTo=...)
 *   admin:   /admin                    (role "admin", others get a 403 page)
 */
export const router = createBrowserRouter([
  {
    id: "root",
    path: "/",
    Component: StoreLayout,
    loader: rootSessionLoader,
    HydrateFallback: AppLoadingScreen,
    ErrorBoundary: RouteErrorPage,
    children: [
      {
        // Pathless wrapper: page-level errors render inside the layout, so the header stays.
        ErrorBoundary: RouteErrorPage,
        children: [
          {
            index: true,
            lazy: async () => {
              const { HomePage } = await import("@/pages/home-page");
              return { Component: HomePage };
            },
          },

          // Guest-only
          {
            loader: requireGuestLoader,
            children: [
              {
                path: "login",
                lazy: async () => {
                  const { LoginPage } = await import("@/pages/login-page");
                  return { Component: LoginPage };
                },
              },
              {
                path: "register",
                lazy: async () => {
                  const { RegisterPage } = await import("@/pages/register-page");
                  return { Component: RegisterPage };
                },
              },
            ],
          },

          // Logged-in users
          {
            loader: requireAuthLoader,
            children: [
              {
                path: "account",
                lazy: async () => {
                  const { AccountPage } = await import("@/pages/account-page");
                  return { Component: AccountPage };
                },
              },
            ],
          },

          // Admins
          {
            path: "admin",
            loader: requireAdminLoader,
            children: [
              {
                index: true,
                lazy: async () => {
                  const { AdminDashboardPage } = await import("@/pages/admin-dashboard-page");
                  return { Component: AdminDashboardPage };
                },
              },
            ],
          },

          {
            path: "*",
            lazy: async () => {
              const { NotFoundPage } = await import("@/pages/not-found-page");
              return { Component: NotFoundPage };
            },
          },
        ],
      },
    ],
  },
]);

/**
 * Another tab logged in or out: sync this tab, then re-run the guards (revalidate) so a
 * protected page redirects to /login, or /login moves on, without the user clicking anything.
 */
subscribeToAuthEvents((event) => {
  if (event === "logout") {
    endSession({ broadcast: false });
    queryClient.clear();
    void router.revalidate();
    return;
  }

  refreshSession()
    .catch(() => undefined)
    .finally(() => {
      void router.revalidate();
    });
});
