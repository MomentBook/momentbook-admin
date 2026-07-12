# MomentBook Admin

Standalone Next.js admin app for MomentBook moderation and editorial operations.

## Scope

- Owns `/admin`, `/admin/login`, `/admin/reviews`, `/admin/articles`, and admin session routes.
- Talks to the Nest API for authentication, role/RBAC enforcement, review mutations, and article mutations.
- Completes public-surface mutations through the Nest API; `momentbook-web` serves fresh public content with its no-cache policy.
- Does not own public journeys, guides, sitemaps, analytics, public chrome, or app marketing pages.

## Environment Variables

| File | Git | Contents |
|---|---|---|
| `.env` | gitignored | All variables for local development |
| `.env.example` | Committed | Template with descriptions and dev/prod examples |
| Vercel Dashboard | — | All production values (no `.env.production` file) |

### Local Development

```bash
yarn install --immutable
cp .env.example .env
# Fill in values from the comments in .env.example
yarn dev
```

Local admin runs on port `3200`. The public web app remains on port `3100`.

### Vercel Deployment

All environment variables must be set in **Vercel Project Settings > Environment Variables** (Production). No `.env.production` file is committed — all production values live in Vercel Dashboard.

This keeps the repo safe for public visibility.

### Hobby Plan Suitability

| Resource | Hobby Limit | This App Usage | Status |
|---|---|---|---|
| Function Invocations | 1M / month | Admin-only, low traffic | Fine |
| Active CPU | 4 CPU-hrs / month | Lightweight SSR, sub-second API calls | Fine |
| Provisioned Memory | 360 GB-hrs / month | Default 512 MB per function | Fine |
| Fast Data Transfer | 100 GB / month | Images served from CloudFront CDN | Fine |
| Function Duration | 300s max | All endpoints complete in seconds | Fine |
| Deployments / Day | 100 | Admin project, low change frequency | Fine |

### Vercel Dashboard Environment Variables

Set **all** variables from `.env.example` in Vercel Project Settings > Environment Variables (Production). No env files are committed to the public repo.

| Variable | Notes |
|---|---|
| `NEXT_PUBLIC_ADMIN_SITE_URL` | Must be HTTPS URL (production origin) |
| `NEXT_PUBLIC_API_BASE_URL` | Nest API production URL |
| `NEXT_PUBLIC_PUBLIC_IMAGE_ORIGIN` | CloudFront CDN origin |
| `NEXT_PUBLIC_APP_ENV` | Set to `production` |
| `NEXT_PUBLIC_APP_IS_LOCAL` | Set to `false` (disables localhost fallbacks, enforces HTTPS) |
| `ADMIN_ALLOWED_EMAIL` | Allowed admin email for login |
| `ADMIN_SESSION_SECRET` | Random 64-char hex string (secret) |

### Post-Deployment Checklist

1. Enable **Vercel Deployment Protection** (Vercel Dashboard > Project > Settings > Deployment Protection)
2. Verify Nest API CORS allows the Vercel admin origin and preview deployment origins
3. Confirm `NEXT_PUBLIC_API_BASE_URL` is reachable from Vercel Functions (check Nest API firewall/security groups)

### Runtime Logs

Hobby plan retains runtime logs for **1 hour** only. For longer retention:
- Use **Log Drains** (Vercel integration) to ship logs to an external service
- Or check Vercel Dashboard > Deployments > Runtime Logs immediately after operations

## Backend Dependency

The Nest API must allow the production admin origin and selected Vercel preview origins in CORS for browser-direct login/API calls. Backend role/RBAC remains authoritative and must not be replaced by client-side checks.

## Verification

```bash
yarn eslint
yarn tsc --noEmit
yarn vitest run \
  scripts/__tests__/admin-session-routes.test.ts \
  scripts/__tests__/admin-actions.test.ts \
  scripts/__tests__/admin-article-actions.test.ts \
  scripts/__tests__/admin-paths.test.ts \
  scripts/__tests__/admin-reviews.test.ts
yarn build
```
