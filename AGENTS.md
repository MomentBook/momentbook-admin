# AGENTS.md — MomentBook Admin

Repository contract. Global workflow rules: `~/.claude/CLAUDE.md`.
Architecture decisions: `docs/adr/`. Product/UX: `docs/DESIGN.md`.

## Source Order

1. Active task / user instructions (override all)
2. Accepted ADRs in `docs/adr/` (use `README.md` as index)
3. This file
4. `docs/DESIGN.md` (product/UX), `docs/CODEX.md` (session workflows)

## Codebase Snapshot

- **Runtime**: Next.js 14 (App Router), TypeScript, React 18, Astryx Design System.
- **Port**: 3200 (dev + prod).
- **Auth**: Nest API role/RBAC-backed, encrypted `momentbook_admin_session` cookie.
- **Generated**: `src/apis/client.ts` — do not edit, regenerate from backend contract.
- **Scripts**: `yarn dev`, `yarn build`, `yarn lint`, `yarn vitest run`.

## Product Boundary

Admin-only surfaces: `/admin`, `/admin/login`, `/admin/reviews`, `/admin/articles`, admin session routes.
- Public web owns journey consumption, guides, sitemaps, analytics, community UX.
- Do not expand admin into public UX. Ownership transfers require an ADR.

## Feature ADR Routing

Read `docs/adr/README.md` first, then relevant ADRs only:
- Routes/layouts/deployment: `0001-admin-app-ownership-and-runtime.md`
- Auth/session/RBAC: `0002-admin-auth-session-boundary.md`
- API contract: `0003-backend-contract-and-api-wrapper.md`
- Public freshness policy: `0004-public-web-revalidation-boundary.md`
- Moderation workspace: `0005-moderation-workspace-and-review-evidence.md`
- Editorial articles: `0006-editorial-articles-and-guide-support.md`

## Architecture Invariants

- Auth backed by Nest API role/RBAC. Cookie is web-session wrapper only.
- `role === "admin"` validation in login, session, refresh, and action flows.
- Admin route helpers centralized in `lib/admin/paths.ts`.
- Admin mutations complete at the Nest API boundary; public-web freshness is provided by that app's no-cache rendering policy. Never call Next.js `revalidatePath`/`revalidateTag` directly.
- No import of public `RootDocument`, analytics, language sync, public navigation, public chrome.
- Preserve noindex admin metadata, CSP/security headers, HTTPS origin validation.
- Do not edit `src/apis/client.ts` by hand.

## Environment

Required: `NEXT_PUBLIC_ADMIN_SITE_URL`, `NEXT_PUBLIC_API_BASE_URL`, `NEXT_PUBLIC_PUBLIC_IMAGE_ORIGIN`, `NEXT_PUBLIC_APP_ENV`, `NEXT_PUBLIC_APP_IS_LOCAL`, `ADMIN_ALLOWED_EMAIL`, `ADMIN_SESSION_SECRET`.
Production: `ADMIN_SITE_URL` must be absolute `https` unless `APP_IS_LOCAL=true`.

## Verification

```bash
yarn eslint <changed-files>                    # default
yarn tsc --noEmit                               # types/routing/auth
yarn vitest run scripts/__tests__/admin-*.ts    # admin behavior
yarn build                                      # routing/metadata/headers
```

## Astryx Design System

```bash
yarn astryx build "<idea>"    # returns kit: page + blocks + components
yarn astryx template <name>   # scaffold reference layout
yarn astryx component <Name>  # props + usage examples
```

Key rules:
- No `<div>` — components do all layout/spacing.
- Frame first: pick shell before writing content.
- Status → StatusDot/Token. Badge only for counts/enumerated states.
- Custom styling: component props first, else tokens (`var(--color-*|--spacing-*|--radius-*)`). No raw hex/px.
