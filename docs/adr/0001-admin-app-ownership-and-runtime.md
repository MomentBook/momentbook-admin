# 0001: Admin App Ownership and Runtime

## Status

Active.

## Decision

MomentBook Admin is a standalone Next.js admin web app. It owns only admin
surfaces and admin session endpoints:

- `/` redirects to `/admin`.
- `/admin` renders the overview/review workspace shell.
- `/admin/reviews` redirects into the reviews tab.
- `/admin/reviews/[publicId]` renders review evidence detail.
- `/admin/articles`, `/admin/articles/new`, and
  `/admin/articles/[articleId]` render editorial article administration.
- `/admin/login`, `/admin/session`, `/admin/session/refresh`, and
  `/admin/session/invalidate` handle admin sign-in and session lifecycle.

Public MomentBook routes, SEO rendering, sitemaps, analytics, localized public
chrome, marketing, recap, archive, and community UX remain outside this app.

## Implementation Shape

- `app/layout.tsx` sets admin metadata and noindex robots, imports
  `app/globals.scss`, and wraps children with `AdminRootDocument`.
- `app/AdminRootDocument.tsx` owns admin-only document setup, fonts, and the
  `data-theme` bootstrap script. Do not import public `RootDocument`, public
  navigation, analytics, language sync, toaster/chrome, or marketing shell.
- `next.config.ts` sets CSP, image `remotePatterns`, `poweredByHeader: false`,
  and HTTPS production origin validation.
- `vercel.json` adds deployment headers and function limits for session routes.
- `resolveSiteUrl()` uses `NEXT_PUBLIC_ADMIN_SITE_URL`, allows localhost only in
  development or when `NEXT_PUBLIC_APP_IS_LOCAL=true`, and throws for invalid
  production HTTPS configuration.

## Runtime Configuration

Required variables are documented in `.env.example` and `AGENTS.md`:

- `NEXT_PUBLIC_ADMIN_SITE_URL`
- `NEXT_PUBLIC_API_BASE_URL`
- `NEXT_PUBLIC_PUBLIC_IMAGE_ORIGIN`
- `NEXT_PUBLIC_APP_ENV`
- `NEXT_PUBLIC_APP_IS_LOCAL`
- `ADMIN_ALLOWED_EMAIL`
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

