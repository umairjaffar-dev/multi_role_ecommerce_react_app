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

Routes: `/login`, `/register`, `/account` (logged in), `/admin` (admin only).
To test admin locally, register a user and run `npm run admin:promote -- <email>` in the backend.
