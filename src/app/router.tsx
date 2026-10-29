import { createBrowserRouter } from "react-router";
import { AdminLayout } from "@/components/layout/admin-layout";
import { StoreLayout } from "@/components/layout/store-layout";
import { AppLoadingScreen } from "@/components/shared/app-loading-screen";
import {
  requireAdminLoader,
  requireAuthLoader,
  requireGuestLoader,
  rootSessionLoader,
} from "@/features/auth/lib/route-guards";
import { endSession, refreshSession, subscribeToAuthEvents } from "@/features/auth/lib/session";
import { cameraDetailLoader } from "@/features/cameras/lib/camera-loaders";
import { adminProductEditLoader } from "@/features/products/lib/admin-product-loaders";
import { productDetailLoader } from "@/features/products/lib/product-loaders";
import { RouteErrorPage } from "@/pages/route-error-page";
import { queryClient } from "./query-client";

/**
 * Data-mode router.
 * - Pages are lazy-loaded: each route ships as its own JS chunk (smaller first load).
 * - Guards are plain `loader`s defined outside `lazy`, so the auth check and the page chunk
 *   download run in parallel instead of one after the other.
 *
 * Route groups:
 *   public:  /, /products, /products/:slug
 *   guest:   /login, /register         (logged-in users are redirected away)
 *   auth:    /account                  (guests are redirected to /login?redirectTo=...)
 *   admin:   /admin, /admin/products, /admin/products/new, /admin/products/:id/edit,
 *            /admin/cameras, /admin/cameras/:id
 *            (role "admin"; others get a 403 page)
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

          // Storefront catalogue (public)
          {
            path: "products",
            lazy: async () => {
              const { ProductsPage } = await import("@/pages/products-page");
              return { Component: ProductsPage };
            },
          },
          {
            path: "products/:slug",
            // Data request starts here, in parallel with downloading the page chunk.
            loader: productDetailLoader,
            lazy: async () => {
              const { ProductDetailPage } = await import("@/pages/product-detail-page");
              return { Component: ProductDetailPage };
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

          // Admins: guard on the layout route covers every /admin/* page
          {
            path: "admin",
            loader: requireAdminLoader,
            Component: AdminLayout,
            children: [
              {
                index: true,
                lazy: async () => {
                  const { AdminDashboardPage } = await import("@/pages/admin/admin-dashboard-page");
                  return { Component: AdminDashboardPage };
                },
              },
              {
                path: "products",
                lazy: async () => {
                  const { AdminProductsPage } = await import("@/pages/admin/admin-products-page");
                  return { Component: AdminProductsPage };
                },
              },
              {
                path: "products/new",
                lazy: async () => {
                  const { AdminProductCreatePage } =
                    await import("@/pages/admin/admin-product-create-page");
                  return { Component: AdminProductCreatePage };
                },
              },
              {
                path: "products/:id/edit",
                loader: adminProductEditLoader,
                lazy: async () => {
                  const { AdminProductEditPage } =
                    await import("@/pages/admin/admin-product-edit-page");
                  return { Component: AdminProductEditPage };
                },
              },
              {
                path: "cameras",
                lazy: async () => {
                  const { AdminCamerasPage } = await import("@/pages/admin/admin-cameras-page");
                  return { Component: AdminCamerasPage };
                },
              },
              {
                path: "cameras/:id",
                loader: cameraDetailLoader,
                lazy: async () => {
                  const { AdminCameraDetailPage } =
                    await import("@/pages/admin/admin-camera-detail-page");
                  return { Component: AdminCameraDetailPage };
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
