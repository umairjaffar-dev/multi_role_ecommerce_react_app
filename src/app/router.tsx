import { createBrowserRouter } from "react-router";
import { StoreLayout } from "@/components/layout/store-layout";
import { RouteErrorPage } from "@/pages/route-error-page";

/**
 * Data-mode router. Pages are lazy-loaded so each route ships as its own JS chunk
 * (smaller first load). Layout and error page stay eager because every route needs them.
 *
 * Planned route groups (added module by module):
 *   - storefront: /, /products, /products/:slug, /cart, /checkout
 *   - auth:       /login, /register (guest-only guard)
 *   - account:    /account/orders, /account/favorites (auth guard)
 *   - admin:      /admin/* (role guard: admin)
 */
export const router = createBrowserRouter([
  {
    path: "/",
    Component: StoreLayout,
    ErrorBoundary: RouteErrorPage,
    children: [
      {
        index: true,
        lazy: async () => {
          const { HomePage } = await import("@/pages/home-page");
          return { Component: HomePage };
        },
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
]);
