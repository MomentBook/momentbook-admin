# MomentBook Admin

Standalone Next.js admin app for MomentBook moderation and editorial operations.

## Scope

- Owns `/admin`, `/admin/login`, `/admin/reviews`, `/admin/articles`, and admin session routes.
- Talks to the Nest API for authentication, role/RBAC enforcement, review mutations, and article mutations.
- Sends signed cache revalidation requests to `momentbook-web` after public-surface mutations.
- Does not own public journeys, guides, sitemaps, analytics, public chrome, or app marketing pages.

## Local Development

```bash
yarn install --immutable
yarn dev
```

Local admin runs on port `3200`. The public web app remains on port `3100`.

Copy `.env.example` and provide real secrets for:

- `ADMIN_SESSION_SECRET`
- `WEB_REVALIDATION_SECRET`

## Deployment

Deploy this repository as a standalone Vercel Next.js project. Production defaults assume:

- Admin app: `https://admin.momentbook.app`
- Public web app: `https://momentbook.app`
- Revalidation webhook: `https://momentbook.app/api/internal/revalidate`

Configure Vercel Deployment Protection in addition to the in-app admin login.

## Backend Dependency

The Nest API must allow the production admin origin and selected Vercel preview origins in CORS for browser-direct login/API calls. Backend role/RBAC remains authoritative and must not be replaced by client-side checks.

## Verification

```bash
yarn eslint
yarn tsc --noEmit
yarn vitest run scripts/__tests__/admin-session-routes.test.ts scripts/__tests__/admin-actions.test.ts scripts/__tests__/admin-article-actions.test.ts scripts/__tests__/admin-paths.test.ts scripts/__tests__/admin-reviews.test.ts
yarn build
```
