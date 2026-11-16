# 0014: Source Layout and Layer Boundaries

## Status

Active. Date: 2026-11-16 (branch `refactor/admin-rebuild`, base `fc4b9da`).
Amends [0001](0001-admin-app-ownership-and-runtime.md) (implementation paths,
`POST /session` removed), [0002](0002-admin-auth-session-boundary.md)
(implementation paths), [0005](0005-moderation-workspace-and-review-evidence.md),
[0007](0007-hand-written-api-types-and-service-layer.md),
[0010](0010-server-side-review-counts-and-workspace-shell.md) and
[0011](0011-operator-surfaces-users-comments-metrics-audit.md) (where loaders,
actions and the shell live). The libraries the rebuild brought in are
[0015](0015-library-adoption.md).

## Context

- Shared code sat in three roots (`lib/`, `src/`, `app/`). The ban action
  `updateAdminUserStatusAction` lived in `app/reports/actions.ts` and users and
  reviews imported it; `ReportHistoryList` lived in the reports folder and three
  screens used it. The `*-shared.ts` (pure) and server-only split was broken in
  both directions, and `env.server.ts` had no `server-only` guard.
- Each rule was written several times: 13 pages repeated the same
  session/try/catch/shell code; `readText` existed in more than 10 places, 401
  handling in 9, `buildReturnEntries` in 7, pagination in 6, banner resolvers
  in 6 (320 lines), the count formatter in 9.
- About 900 lines were dead or belonged to the public web (a nine-language
  i18n config, guide copy, SEO metadata helpers imported 16 times while the
  root layout already set `robots`).
- `POST /session`, which nothing called, turned the tokens in its body into an
  admin cookie without verifying them: a login-CSRF path.
- There were no `loading` or `error` boundaries, and an error page had no
  sidebar.
- Nothing stopped one screen from importing another screen's internals.

## Decision

1. **One source root, five layers.** `@/` resolves to `src/`. A module imports
   its own layer and the layers below it:

   ```
   src/
     lib/          0  env · api (openapi-fetch clients, services, generated types)
                      · auth (session) · actions (runAdminAction) · navigation
                      (paths, route loaders, flash) · workspace (shell data,
                      attention counts, list paging) · format · utils
     components/   1  ui/ (shadcn) · layout/ (shell, sidebar, renderWorkspacePage)
                      · data-table/ · shared parts (flash-banner, url-pagination,
                      filter-tabs, filter-chips, status-badge, stat-tile,
                      detail-parts, reason-field, confirm-action-form, time,
                      back-link)
     hooks/        1  shared hooks
     entities/<e>/ 2  domain several screens share: article · audit-event ·
                      comment · journey · report · storage · subscription · user
     features/<f>/ 3  one screen each: articles · audit-log · auth · comments ·
                      metrics · overview · reports · reviews · storage · users
     app/          4  routes only: (workspace)/ pages with error.tsx, login/,
                      session/{refresh,invalidate}/, not-found.tsx
   ```

2. **The boundary is a lint error.** `eslint.boundaries.mjs`
   (`eslint-plugin-boundaries`, deny by default, spliced into
   `eslint.config.mjs`) allows exactly: `lib` → `lib`; `components` and
   `hooks` → `lib`, `components`, `hooks`; an entity → those and its own
   entity; a feature → those, any entity and its own feature; `app` →
   anything. One entity never imports another, nor one feature another.
   Element patterns are `<dir>/**` (`<dir>/**/*` misses files directly in the
   directory). Only `src/**` is checked; tests and config are not.
3. **When two screens need the same part, it moves down, or `app` composes
   it.** The ban/unban form and action are `entities/user`
   (`components/user-status-form.tsx`, `status-action.ts`); report history and
   its loader are `entities/report`. Route search params and link builders are
   `lib/navigation/<f>-routes.ts` (nuqs loaders) and `paths.ts`, because links
   cross screens. The article category spelling map is
   `lib/api/article-category.ts` (the service maps it to the API enum);
   `logoutAdminAction` is `lib/auth/logout-action.ts` (the sidebar posts to
   it).
4. **A feature folder** holds `loader.ts` (`import "server-only"`; calls
   `lib/api` services only), `actions.ts` (`"use server"`, every action through
   `runAdminAction`), `schema.ts` (zod) where it has a form, `flash.ts` (its
   banner messages for `resolveFlash`), and `components/`: views are markup;
   a paged list is `<f>-table.tsx` (`"use client"`, its columns), fed
   serializable rows whose links the server built.
5. **Pages are thin.** A workspace page reads its params with its route
   loader and returns `renderWorkspacePage({ active, errorHeading?, returnTo,
   load, render(data, counts, session) })`
   (`components/layout/workspace-page.tsx`). It loads the session and the four
   attention counts (`lib/workspace/load-workspace-page.ts`), renders a
   `BackendApiError` as `WorkspaceError` inside the shell, and rethrows anything
   else to `app/(workspace)/error.tsx`. The shell is still rendered per page,
   not in a layout (ADR 0010).
6. **The `(workspace)` route group** scopes `error.tsx` (retry and a link
   home) to the workspace screens and keeps `/login` out of it. It changes no
   URL. It has no `loading.tsx` (see Alternatives).
7. **Server actions** all go through `runAdminAction`
   (`lib/actions/admin-action.ts`): fields are read with a zod schema before
   the session; `returnTo` passes `sanitizeAdminPath` or the fallback is used;
   a 401 clears the session and opens login; a 403 signs out except on the
   users endpoints, where it is a banner (ADR 0011); the redirect query keeps
   each action's keys in the order its tests pin.
8. **Names.** Files are kebab-case; the `Admin` prefix and `PageView` suffix
   are gone (`review-detail-view.tsx`). A server-only module starts with
   `import "server-only"`; a `"use server"` file exports only async functions.
   Imports are `@/…` across folders and `./…` inside one; never `../`.
9. **Tests** stay in `scripts/__tests__/`. Moving code changed only import
   and `vi.mock` paths and call style, never an expected value.
   `scripts/check-mock-paths.mjs`, the first step of `yarn verify`, fails
   when a `vi.mock` path no longer resolves (vitest ignores such a mock
   silently).
10. **Removed:** `POST /session`; the public-web leftovers (the i18n config
    beyond what the article editor and dates use, guide marketing copy, the
    SEO metadata helper, `sharp`, `images.remotePatterns` under
    `unoptimized: true`). Articles with an empty summary or no `updatedAt` are
    no longer dropped from the list.

### Where the code named in older ADRs went

| Before | Now |
| --- | --- |
| `app/<route>/page.tsx` | `src/app/(workspace)/<route>/page.tsx` (`login`, `session` under `src/app/`) |
| `app/_workspace/workspace-data.ts` | `src/lib/workspace/load-workspace-page.ts`, used by `src/components/layout/workspace-page.tsx` |
| `app/_workspace/actions.ts` (`logoutAdminAction`) | `src/lib/auth/logout-action.ts` |
| `app/<f>/actions.ts`, `app/<f>/<f>-banner.ts` | `src/features/<f>/actions.ts`, `src/features/<f>/flash.ts` |
| `app/reports/actions.ts` (`updateAdminUserStatusAction`) | `src/entities/user/status-action.ts` |
| `app/reports/ReportHistoryList.tsx` | `src/entities/report/components/report-history-list.tsx` (loader `history.ts`) |
| `lib/admin/session.ts`, `token.ts` | `src/lib/auth/session.ts`, `token.ts`, `session-schema.ts` |
| `lib/admin/paths.ts` | `src/lib/navigation/paths.ts` and `<f>-routes.ts` |
| `lib/admin/attention.ts`, `section-load.ts` | `src/lib/workspace/` |
| `lib/admin/<f>.ts` (page loaders) | `src/features/<f>/loader.ts` |
| `lib/admin/review-queue.ts`, `reviews.ts` | `src/features/reviews/queue-loader.ts`, `loader.ts`, `detail-model.ts`; shared labels `src/entities/journey/model.ts` |
| `lib/admin/<x>-shared.ts` | `src/entities/<x>/model.ts` (metrics: `src/features/metrics/model.ts`) |
| `lib/admin/subscriptions.ts` | `src/features/users/loader.ts`, `src/features/storage/loader.ts` |
| `lib/editorial/*`, `lib/editorial/admin.ts` | `src/entities/article/*`, `src/features/articles/loader.ts` |
| `lib/api/*`, `src/apis/types/*`, `src/apis/generated/*` | `src/lib/api/*`, `src/lib/api/types/*`, `src/lib/api/generated/*` |
| `src/configs/env.server.ts` | `src/lib/env.ts` |
| `components/**` | `src/components/**` (kebab-case) |

## Alternatives Considered

- **A new app built from scratch, screen by screen** — rejected: the 262
  tests pin behaviour (47 redirect URLs among it) that a rewrite would have to
  rediscover.
- **Remove the duplication in place** — rejected: the three roots and the
  cross-screen imports would stay, with nothing to stop them coming back.
- **Full Feature-Sliced Design (pages, widgets, shared)** — rejected: ten
  screens do not need seven layers; `entities` and `features` are the two that
  carry a rule.
- **Search params beside each screen (`features/<f>/params.ts`)** — rejected:
  links to a screen are built on other screens, and a feature may not import
  another.
- **A `loading.tsx` skeleton for the workspace** — tried and removed before
  merge: it makes every workspace response stream, so the session redirects
  (to login, to `/session/refresh`) arrive as a 200 with a client-side
  redirect and a one-second meta refresh instead of a 307. On a slow load the
  meta refresh can send a second `/session/refresh` carrying the same refresh
  token, and a rotated token would then sign the operator out.
- **The shell in `app/(workspace)/layout.tsx`** — rejected again for ADR
  0010's reason: a layout is not re-rendered after a mutation redirect, so the
  badges would go stale.

## Consequences

- Positive: changing a screen means one feature folder and its route file; a
  cross-screen import fails `yarn lint`; each shared rule is written once.
- Negative: a screen's search params and links live in `lib/navigation/`, away
  from the screen. Two list loaders keep their old keys because tests pin them
  (`users` on the user directory, `actions` on the audit log), where the other
  lists return `ListPage` `items`.
- Every change runs `yarn verify` (mock paths, typecheck, lint with the
  boundary rule, tests) and `yarn build`.
