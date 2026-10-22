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
npm run dev        # http://localhost:3000
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

- Access token: kept **in memory only** (Zustand), sent as `Authorization: Bearer <token>`.
- Refresh token: httpOnly cookie set by the backend; JavaScript never sees it.
- On a `401`, the API client calls `POST /auth/refresh` once (shared promise for parallel
  requests, because the backend rotates refresh tokens and treats reuse as theft), then replays
  the original request.
