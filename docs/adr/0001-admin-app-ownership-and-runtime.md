# 0001: Admin App Ownership and Runtime

## Status

Active.

## Decision

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
- `/login`, `/session`, `/session/refresh`, and `/session/invalidate` handle
  admin sign-in and session lifecycle.

Public MomentBook routes, SEO rendering, sitemaps, analytics, localized public
chrome, marketing, recap, archive, and community UX remain outside this app.

## Implementation Shape

- `app/layout.tsx` sets admin metadata and noindex robots, imports
  `app/globals.css` (Tailwind v4, shadcn tokens), and wraps children with
  `AdminRootDocument`.
- `app/AdminRootDocument.tsx` owns admin-only document setup, fonts, the
  `next-themes` provider, and the theme bootstrap script (`.dark` class). Do not import public `RootDocument`, public
  navigation, analytics, language sync, toaster/chrome, or marketing shell.
- `next.config.ts` sets CSP, image `remotePatterns`, `poweredByHeader: false`,
  and HTTPS production origin validation.
- `vercel.json` adds deployment security headers.
- `resolveSiteUrl()` uses `NEXT_PUBLIC_ADMIN_SITE_URL`, allows localhost only in
  development or when `NEXT_PUBLIC_APP_IS_LOCAL=true`, and throws for invalid
  production HTTPS configuration.

## Runtime Configuration

Required variables are documented in `.env.example` and `README.md`:

- `NEXT_PUBLIC_ADMIN_SITE_URL`
- `NEXT_PUBLIC_API_BASE_URL`
- `NEXT_PUBLIC_PUBLIC_IMAGE_ORIGIN`
- `NEXT_PUBLIC_APP_ENV`
- `NEXT_PUBLIC_APP_IS_LOCAL`
- `ADMIN_SESSION_SECRET`

Production must use an absolute HTTPS admin URL unless
`NEXT_PUBLIC_APP_IS_LOCAL=true`. Vercel Deployment Protection is expected in
addition to in-app admin login.

## Consequences

- Admin pages must remain noindex.
- Root/layout utilities must stay admin-only.
- Public helper code can exist for split compatibility, but public UX must not
  be added here without an ADR update.
- Routing, metadata, CSP, security header, deployment, or environment behavior
  changes require `yarn build` after focused checks.

