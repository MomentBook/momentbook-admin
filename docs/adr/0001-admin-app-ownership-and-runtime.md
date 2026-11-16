# 0001: Admin App Ownership and Runtime

## Status

Active.

## Decision

> **Amended by [0011](0011-operator-surfaces-users-comments-metrics-audit.md):**
> 2026-10-23, the route list below gains `/users`, `/comments`, `/audit-log`
> and `/metrics`.

> **Amended by [0013](0013-storage-overview.md) and [0014](0014-source-layout-and-layer-boundaries.md):** the route
> list gains `/storage` (0013). On 2026-11-16 `POST /session` was removed and
> the sources moved under `src/` (0014); the paths below are updated.

MomentBook Admin is a standalone Next.js admin web app. It owns only admin
surfaces and admin session endpoints:

> **Corrected 2026-10-22:** the routes live at the root of the admin origin;
> the earlier `/admin/*` route list no longer matched the code.

- `/` renders the attention overview; legacy `/?tab=…` links redirect to the
  pages below.
- `/reviews` renders the review queue and `/reviews/[publicId]` review evidence
  detail.
- `/reports` and `/reports/[reportId]` render report moderation (ADR 0009).
- `/articles`, `/articles/new`, and `/articles/[articleId]` render editorial
  article administration.
- `/users`, `/users/[userId]`, `/comments`, `/audit-log`, and `/metrics` render
  the operator surfaces (ADR 0011), and `/storage` the storage overview
  (ADR 0013).
- `/login`, `/session/refresh`, and `/session/invalidate` handle admin sign-in
  and session lifecycle. `POST /session` was removed (ADR 0014): nothing
  called it, and it made an admin cookie from tokens it never verified.

Public MomentBook routes, SEO rendering, sitemaps, analytics, localized public
chrome, marketing, recap, archive, and community UX remain outside this app.

## Implementation Shape

- `src/app/layout.tsx` sets admin metadata and noindex robots, imports
  `src/app/globals.css` (Tailwind v4, shadcn tokens), loads the fonts, and
  wraps children in the `next-themes` provider (`.dark` class, following the
  OS; ADR 0015). Do not import public `RootDocument`, public navigation,
  analytics, language sync, toaster/chrome, or marketing shell.
- `next.config.ts` imports `src/lib/env.ts`, so `yarn build` validates the
  environment, HTTPS production origins included (ADR 0015), and sets CSP and
  `poweredByHeader: false`.
- `vercel.json` adds deployment security headers.
- `resolveSiteUrl()` (`src/lib/navigation/site-url.ts`) uses
  `NEXT_PUBLIC_ADMIN_SITE_URL`, allows localhost only in
  development or when `NEXT_PUBLIC_APP_IS_LOCAL=true`, and throws for invalid
  production HTTPS configuration.

## Runtime Configuration

Required variables are documented in `.env.example` and `README.md` and
validated at build by `src/lib/env.ts`:

- `NEXT_PUBLIC_ADMIN_SITE_URL`
- `NEXT_PUBLIC_API_BASE_URL`
- `NEXT_PUBLIC_PUBLIC_IMAGE_ORIGIN`
- `NEXT_PUBLIC_APP_ENV`
- `NEXT_PUBLIC_APP_IS_LOCAL`
- `ADMIN_SESSION_SECRET`

Production must use absolute HTTPS admin and API URLs unless
`NEXT_PUBLIC_APP_IS_LOCAL=true`. Vercel Deployment Protection is expected in
addition to in-app admin login.

## Consequences

- Admin pages must remain noindex.
- Root/layout utilities must stay admin-only.
- Public helper code can exist for split compatibility, but public UX must not
  be added here without an ADR update.
- Routing, metadata, CSP, security header, deployment, or environment behavior
  changes require `yarn build` after focused checks.

