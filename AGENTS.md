# AGENTS.md

MomentBook Admin is a standalone Next.js admin web app. Runtime, system, and
developer instructions override this file; the current user task defines scope
unless it conflicts with repository invariants.

## Source of Truth

- Execution rules: this file.
- Architecture, ownership, and current decisions: `docs/adr/README.md` plus the
  feature ADRs relevant to the task.
- Product and UX intent: `docs/DESIGN.md`.
- Repository-specific Codex workflow: `docs/CODEX.md`.
- API shape: generated `src/apis/client.ts` from the Nest backend contract.
- Implementation truth: local code, tests, configs, generated types, and
  `.env.example`.

## Feature ADR Routing

Read `docs/adr/README.md` first, then open only the relevant ADRs:

- Routes, layouts, metadata, env, deployment, ownership:
  `docs/adr/0001-admin-app-ownership-and-runtime.md`
- Login, sessions, refresh, invalidation, logout, allowed email, RBAC:
  `docs/adr/0002-admin-auth-session-boundary.md`
- Backend calls, generated contract, admin API wrappers, error mapping:
  `docs/adr/0003-backend-contract-and-api-wrapper.md`
- Public web cache/webhook revalidation, sitemap paths, public visibility:
  `docs/adr/0004-public-web-revalidation-boundary.md`
- Overview, review queue, review detail, evidence grouping, review mutation:
  `docs/adr/0005-moderation-workspace-and-review-evidence.md`
- Articles, markdown editor, editorial helpers, guide sitemap support:
  `docs/adr/0006-editorial-articles-and-guide-support.md`

Do not read every ADR at startup.

## Product Boundary

- This app owns only admin surfaces: `/admin`, `/admin/login`,
  `/admin/reviews`, `/admin/articles`, and admin session routes.
- The public MomentBook web app owns public journey consumption, guides,
  sitemaps, analytics, localized public chrome, marketing, recap, archive, and
  community UX.
- Existing public/editorial helper code in this repo supports the admin split,
  sitemap path discovery, and public revalidation contracts. Do not expand it
  into public UX.
- Moving ownership between public web and admin app requires an ADR update.

## Architecture Invariants

- Keep admin authentication backed by Nest API role/RBAC checks. The local
  encrypted `momentbook_admin_session` cookie is only a web-session wrapper
  around backend tokens.
- Preserve the allowed-admin-email check and `role === "admin"` validation in
  login, session bootstrap, refresh, and action/session flows.
- Keep admin route helpers centralized in `lib/admin/paths.ts`; sanitize admin
  return targets before redirecting.
- Do not edit `src/apis/client.ts` by hand except when explicitly copying the
  current generated contract during a project split; otherwise regenerate from
  the backend contract.
- Admin mutations must not import `revalidatePath`, `revalidateTag`, or
  `updateTag` directly. Call the signed public web revalidation webhook through
  `lib/admin/revalidation.ts`.
- Public cache revalidation failures must not roll back successful backend
  mutations. Surface them as the admin warning query `revalidation=failed`.
- Keep root/layout utilities admin-only. Do not import public `RootDocument`,
  analytics, language sync, public navigation, public toaster/chrome, or public
  marketing shell.
- Preserve noindex admin metadata, CSP/security headers, HTTPS production origin
  validation, and Vercel Deployment Protection assumptions.

## Environment

Required variables:

- `NEXT_PUBLIC_ADMIN_SITE_URL`
- `NEXT_PUBLIC_API_BASE_URL`
- `NEXT_PUBLIC_PUBLIC_IMAGE_ORIGIN`
- `NEXT_PUBLIC_APP_ENV`
- `NEXT_PUBLIC_APP_IS_LOCAL`
- `ADMIN_ALLOWED_EMAIL`
- `ADMIN_SESSION_SECRET`
- `WEB_REVALIDATION_URL`
- `WEB_REVALIDATION_SECRET`

Production notes:

- `NEXT_PUBLIC_ADMIN_SITE_URL` must be an absolute `https` URL unless
  `NEXT_PUBLIC_APP_IS_LOCAL=true`.
- Configure Vercel Deployment Protection in addition to in-app admin login.
- The Nest API must allow the production admin origin and selected Vercel
  preview origins in CORS for browser-direct login/API calls. Backend role/RBAC
  remains authoritative.

## Working Rules

- Inspect relevant code, call sites, types, tests, configs, generated
  boundaries, and docs before editing.
- Keep changes narrow, local, and verifiable; prefer existing architecture,
  naming, state management, error handling, i18n, and testing patterns.
- Preserve user/uncommitted changes. Never revert unrelated work.
- Do not install dependencies, rotate secrets, modify infrastructure/production
  config, run migrations, force-push, create external side effects, or use
  subagents unless explicitly requested.
- Use `rg` for search. Use English for code, comments, commit messages,
  identifiers, and technical artifacts.
- Explain work to the user in Korean unless they request otherwise.
- For code reviews, lead with bugs, regressions, security/data/auth risks, and
  missing tests, with file/line references.

## Verification

Use the smallest sufficient checks for the change:

- Docs only: `git diff --check`.
- Changed code: `yarn eslint <changed-files>`.
- Shared types, routing, auth, config, or generated-contract consumers:
  `yarn tsc --noEmit`.
- Admin behavior changes:
  `yarn vitest run scripts/__tests__/admin-session-routes.test.ts scripts/__tests__/admin-actions.test.ts scripts/__tests__/admin-article-actions.test.ts scripts/__tests__/admin-paths.test.ts scripts/__tests__/admin-reviews.test.ts`.
- Routing, config, metadata, security headers, or deployment behavior changes:
  `yarn build`.

<!-- ASTRYX:START -->
Astryx v0.1.4 · 149 components
CLI: run every command as `yarn astryx <cmd>` (shown below as `astryx ...`).

SETUP (once, in your app entry e.g. main.tsx) — without these, components render unstyled:
  import "@astryxdesign/core/reset.css";
  import "@astryxdesign/core/astryx.css";

WORKFLOW — discover, don't guess. Before writing UI:
1. `astryx build "<idea>"` — START HERE: returns a kit (closest [page] + [block]s + [component]s). No args = full playbook.
2. `astryx template <name> [--skeleton]` — scaffold the [page]/[block]s it named, or study their layout. Templates are reference code.
3. `astryx component <Name>` — props + examples for every component you use.

RULES:
- No <div> — components do all layout/spacing. Full page → AppShell; sidebar nav → SideNav.
- Frame first: pick the shell (AppShell / Layout+LayoutPanel) and budget regions in px BEFORE writing content (`astryx docs layout`).
- Dense data = rows (Table, List/Item) edge-to-edge — never Card-wrapped list items. Card = dashboard widgets, galleries, settings groups only.
- Status → StatusDot/Token; Badge only for counts and enumerated states, never decoration.
- Custom styling: component props first; else style/className with tokens — var(--color-*|--spacing-*|--radius-*). No raw hex/px. (No StyleX/Tailwind compiler here — don't use xstyle/utility classes.)
- Tokens for every value (`astryx docs tokens`). Brand/accent via `astryx theme` — never override --color-* in :root.

MORE CLI:
  search "<query>"   find any component / hook / doc / template / block
  component --list   149 components by category
  template --list    page + block recipes
  docs <topic>       color, elevation, icons, illustrations, layout, migration, motion, principles, shape, spacing, styling, theme, tokens, typography
  swizzle <Name>     eject component source for deep customization
  upgrade --apply    run after any @astryxdesign/core bump
<!-- ASTRYX:END -->
