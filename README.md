# E-Commerce Frontend

Frontend for the Multi-Role E-Commerce platform (storefront, customer account and admin portal).
Talks to the Express + Drizzle backend (`multi_role_ecommerce_node_app`).

## Tech stack

| Concern          | Choice                                                     |
| ---------------- | ---------------------------------------------------------- |
| Build            | Vite 8 (Rolldown) + React Compiler                         |
| UI               | React 19, TypeScript 6 (strict)                            |
| Styling          | Tailwind CSS v4 + shadcn/ui (Radix, "Nova" preset)         |
| Routing          | React Router v8 (data mode, lazy routes)                   |
| Server state     | TanStack Query v5                                          |
| Client state     | Zustand (auth token in memory, theme persisted)            |
| Forms/validation | React Hook Form + Zod 4                                    |
| HTTP             | Axios with single-flight token refresh                     |
| Toasts / icons   | Sonner, lucide-react                                       |
| Quality          | ESLint 10 (type-checked), Prettier + Tailwind class sorter |

## Getting started

```bash
cp .env.example .env
npm install
npm run dev        # http://localhost:5173
```

The dev server proxies `/api/*` to the backend at `http://localhost:4000`, so the httpOnly
refresh-token cookie works without CORS issues. Change the target in `vite.config.ts` if needed.

## Scripts

| Script              | What it does                              |
| ------------------- | ----------------------------------------- |
| `npm run dev`       | Start the dev server                      |
| `npm run build`     | Type-check and build for production       |
| `npm run preview`   | Serve the production build locally        |
| `npm run typecheck` | TypeScript only                           |
| `npm run lint`      | ESLint (`lint:fix` to auto-fix)           |
| `npm run format`    | Prettier write (`format:check` to verify) |
| `npm run check`     | typecheck + lint + format check (CI gate) |

## Folder structure

```
src/
  app/            app wiring: providers, router, query client
  config/         Zod-validated environment variables
  lib/
    api/          axios client, error normalisation, response envelope, endpoint paths
    forms/        React Hook Form helpers (map server errors onto fields)
    utils.ts      cn() helper
  stores/         Zustand stores (auth, theme)
  components/
    ui/           shadcn/ui primitives (generated: `npx shadcn add <name>`)
    layout/       page shells (store layout, later account/admin layouts)
    shared/       reusable app components (theme toggle, ...)
  features/       one folder per business module (auth, products, cart, orders, ...)
    <feature>/
      api/        query/mutation hooks + query keys
      components/ feature-specific UI
      lib/        non-UI logic (e.g. auth session, route guards)
      schemas/    Zod schemas and inferred types
  pages/          route-level components (thin: compose feature components)
  hooks/          app-wide custom hooks
```

## Conventions

- Arrays as `Array<Type>`, `type` instead of `interface` (except `.d.ts` declaration merging).
- Zod schemas end with `Schema`, inferred types with `SchemaType`, other types with `Type`.
- `import type` for type-only imports (`verbatimModuleSyntax`).
- File names in kebab-case (`product-card.tsx`), matching shadcn/ui.
- Path alias `@/` maps to `src/`.
- Every API response is validated with Zod at the boundary.
- Code, comments and commit messages in English.

## Auth model

| Piece                | How it works                                                                                                                                                                                                                                          |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Access token         | In memory only (Zustand), sent as `Authorization: Bearer <token>`. Never in localStorage.                                                                                                                                                             |
| Refresh token        | httpOnly cookie set by the backend (path `/api/v1/auth`); JavaScript never sees it.                                                                                                                                                                   |
| Page reload          | Root route loader calls `POST /auth/refresh` once to restore the session. A localStorage hint flag (`auth:has-session`, not a secret) lets guests skip this call.                                                                                     |
| Expired token        | On `401 AUTH_TOKEN_EXPIRED` the API client refreshes once and replays the request. Parallel requests share one refresh (single-flight); tabs refresh one at a time (Web Locks), because the backend rotates refresh tokens and treats reuse as theft. |
| Register             | Backend only creates the account, so the frontend logs in right after with the same credentials.                                                                                                                                                      |
| Logout               | `POST /auth/logout`, then local session and query cache are cleared even if the request fails. Other tabs are notified via `BroadcastChannel`.                                                                                                        |
| Route guards         | Route `loader`s run before rendering: `requireGuestLoader` (/login, /register), `requireAuthLoader` (/account), `requireAdminLoader` (/admin, 403 for non-admins). The backend still enforces roles; guards are UX.                                   |
| Redirect after login | `?redirectTo=` is accepted only for same-app paths (open-redirect protection).                                                                                                                                                                        |
| Server errors        | `VALIDATION_ERROR` details and codes like `EMAIL_ALREADY_EXISTS` appear under the matching input; other errors appear above the submit button.                                                                                                        |

Auth routes: `/login`, `/register`, `/account` (logged in).
To test admin locally, register a user and run `npm run admin:promote -- <email>` in the backend.

## Products module

| Area       | Routes                                                               | Notes                                                                                                                                                                                                                                                                                                            |
| ---------- | -------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Storefront | `/products`, `/products/:slug`                                       | Search (debounced), category, price range and sort live in the URL (`?category=shoes&sort=price_asc`), validated with Zod; bad values fall back to defaults. Cursor pagination with infinite scroll + "Load more". Detail data starts loading in the route loader and on card hover (prefetch).                  |
| Admin      | `/admin/products`, `/admin/products/new`, `/admin/products/:id/edit` | Page-based table with search, category, visibility and status (live/deleted/all) filters in the URL. Create/edit share one form; edit sends only changed fields (PATCH). Images upload one by one with progress (max 8, 5 MB, JPEG/PNG/WebP). Delete is a confirmed soft delete; deleted products are read-only. |

- Money is always an integer number of paisa, like the backend. The admin types rupees ("1,499.50"); the form converts text to paisa without floats. Display uses `Intl.NumberFormat` (PKR).
- Query keys come from one factory (`productKeys`), and every admin write invalidates `productKeys.all`, so the storefront shows changes immediately.
- Backend has no image delete/reorder endpoint yet; the gallery shows upload order (first image = cover).

## Cameras module (live view)

| Area   | Routes                                                                   | Notes                                                                                                                                                                                       |
| ------ | ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Live   | `/admin/cameras`, `/admin/cameras/:id`                                   | Grid of active cameras (1/2/3 columns, kept in `?cols=`), each tile with live video and a stream state badge. Detail page: one camera with native controls (fullscreen) and stream details. |
| Manage | `/admin/cameras/manage`, `/admin/cameras/new`, `/admin/cameras/:id/edit` | Table of all cameras with search and active/disabled filter in the URL, inline enable/disable switch, edit and confirmed delete.                                                            |

- **Video never goes through the backend.** The backend returns `hlsUrl` (MediaMTX, port 8888) and the browser plays it directly, like product images come straight from object storage.
- **Player** (`features/cameras/components/hls-player.tsx`): hls.js where Media Source Extensions exist, native HLS otherwise (iOS Safari). hls.js is imported on demand and lives in its own `vendor-hls` chunk, so other pages never download it.
- **Only visible tiles play.** An off-screen tile stops downloading segments, and MediaMTX can disconnect an on-demand camera nobody watches.
- **Reconnect:** a dropped stream (camera offline, MediaMTX restart) retries with exponential backoff (2 s up to 30 s). The backend reconcile job re-creates MediaMTX paths after a restart, so the grid heals by itself.
- **Status badge** polls `GET /admin/cameras/:id/status` every 10 s and re-checks right away when the tile's own playback starts or drops. `Standby` means nobody is watching (with on-demand pulling, an offline camera looks the same); `Media server down` means MediaMTX is unreachable.
- **RTSP URL is write-only.** The backend stores it encrypted and only ever returns it with the password masked, so the edit form starts empty ("leave empty to keep the current address") and PATCHes it only when the admin types a new one.
- **Form rules mirror the backend** (`rtsp://`/`rtsps://` only, stream path `^[a-z0-9][a-z0-9_-]{1,63}$`). An empty stream path on create is built from the name. Server answers land on the right field: a taken or reserved stream path (409) under "Stream path"; a media server outage (502) above the submit button.
- **Enable/disable is not optimistic.** The backend commits only after MediaMTX accepted the change, so the switch flips when the server confirms; on a 502 it stays put and a toast explains why.
- Every camera write invalidates `cameraKeys.all` in all open tabs, so a wall screen showing the live grid picks up new or disabled cameras without a reload.
- Local stack: backend (`npm run dev`) + `npm run services:up` in the backend repo (MediaMTX, fake cameras).
