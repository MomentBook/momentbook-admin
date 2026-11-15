# MomentBook Admin

Admin-only Next.js app (App Router) for MomentBook moderation and editorial
work. Port 3200. Deployed on Vercel Hobby.

## Tech

| Area | Version |
|---|---|
| next / eslint-config-next | 16.3.8 |
| react / react-dom | 19.2.x (`~19.2.9`) |
| typescript | 5.9.3 |
| tailwindcss / @tailwindcss/postcss | 4.3.3 |
| UI | shadcn/ui `new-york` (v4 registry) in `src/components/ui`, `radix-ui ~1.6.7`, `tw-animate-css ~1.4.0`, `lucide-react` 1.8.0 |
| API | `openapi-fetch` 0.17.0 on types from `openapi-typescript` 7.13.0 |
| Validation, env | `zod` 4.6.7, `@t3-oss/env-nextjs` 0.13.11 |
| URL state | `nuqs` 2.10.2 (`nuqs/server` loaders and serializers only) |
| Tables, charts | `@tanstack/react-table` 9.3.1; shadcn `chart` on `recharts` 3.8.0 |
| Forms | `react-hook-form` 7.84.0, `@hookform/resolvers` 7.0.3 |
| Article preview, photos | `react-markdown` 10.1.0; `yet-another-react-lightbox` 3.33.0 |
| Layer lint | `eslint-plugin-boundaries` 7.4.2 |
| vitest | 4.1.x (node env) |

New dependencies are pinned exactly, and a release younger than seven days is
not taken (ADR 0015). Auth: Nest API role/RBAC-backed, encrypted
`momentbook_admin_session` cookie (`jose`).

## Commands

- `yarn verify` — `scripts/check-mock-paths.mjs` (every `vi.mock` path
  resolves) → `yarn typecheck` (`next typegen && tsc --noEmit`) → `yarn lint`
  (with the layer rule) → `yarn test` (`vitest run`). Gate before done:
  `yarn verify && yarn build`.
- `yarn build` validates the environment (`src/lib/env.ts`): a missing
  `ADMIN_SESSION_SECRET`, or an http admin or API URL in a production build
  that is not local, fails it. Tests run with `SKIP_ENV_VALIDATION=true`.
- `yarn generate:api` writes path types to `src/lib/api/generated/` (committed,
  never edited by hand; ADR 0012, 0015). Pass `API_SPEC_DIR=<dir>` (committed
  documents, such as `../momentbook-api/docs/openapi`) or `API_SPEC_URL=<url>`
  (a running API).
- The edit hook runs eslint on each edited file in the background and reports
  only errors. It exists only in a Claude Code session started in this
  repository; a session that works here over ssh runs `yarn lint` itself.

shadcn components are added only with `npx shadcn@4.22.1 add <name>`. Rewrite
its `import { cn } from "cn"` to `@/lib/utils`, do not keep the `cn` package,
keep `radix-ui` at `~1.6.7`, and restore any existing component the CLI
overwrote.

## Structure

`@/` is `src/`. Five layers; a module imports its own layer and the ones
below, and `yarn lint` fails anything else (`eslint.boundaries.mjs`, ADR 0014):

| Layer | Holds |
|---|---|
| `src/lib/` | env, API clients and services (`api/`), session (`auth/`), `runAdminAction` (`actions/`), paths, route loaders and flash (`navigation/`), shell data (`workspace/`), formatting |
| `src/components/`, `src/hooks/` | shadcn `ui/`, the shell and `renderWorkspacePage` (`layout/`), `data-table/`, shared parts |
| `src/entities/<e>/` | what several screens share: labels, tones, mappings, the ban form, report history |
| `src/features/<f>/` | one screen: `loader.ts` (server-only), `actions.ts`, `schema.ts`, `flash.ts`, `components/` |
| `src/app/` | route files only; workspace routes sit in the `(workspace)` group with `loading.tsx` and `error.tsx` |

- No entity imports another entity, and no feature another feature. A part
  two screens need moves down, or the `app` route composes it.
- A page returns `renderWorkspacePage(...)`; an action calls
  `runAdminAction(...)`; a result is a `FlashBanner` from the URL. Search
  params are read with the route's nuqs loader in
  `src/lib/navigation/<f>-routes.ts`, and links are built there or in
  `paths.ts`.
- Files are kebab-case. A server-only module starts with
  `import "server-only"`; a `"use server"` file exports only async functions.
  Imports are `@/…` across folders and `./…` inside one, never `../`.

## Tests

Tests live in `scripts/__tests__/` (helpers in `helpers/`, fixtures in
`__fixtures__/`). A refactor may change a test's import or `vi.mock` path and
how it calls the code, never an expected value; if an expectation looks wrong,
stop and ask. New modules are written test-first there.

## Boundary
Admin-only, at the root of the admin origin: `/` (attention overview),
`/reviews`, `/reports`, `/comments`, `/users`, `/articles`, `/metrics`,
`/storage`, `/audit-log`, `/login`, `/session/refresh`, `/session/invalidate`.
Do not expand into public UX. Ownership transfers require an ADR.

## Architecture
Design decisions: `docs/adr/README.md` (15 ADRs). Product and UX intent:
`docs/DESIGN.md`.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
