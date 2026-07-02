# MomentBook Admin

Standalone Next.js admin app for MomentBook moderation and editorial operations.

## Scope

- Owns `/admin`, `/admin/login`, `/admin/reviews`, `/admin/articles`, and admin session routes.
- Talks to the Nest API for authentication, role/RBAC enforcement, review mutations, and article mutations.
- Sends signed cache revalidation requests to `momentbook-web` after public-surface mutations.
- Does not own public journeys, guides, sitemaps, analytics, public chrome, or app marketing pages.

## Environment Variables

Three tiers of env files, following Next.js conventions:

| File | Git | Contents | Next.js auto-load |
|---|---|---|---|
| `.env.development` | Committed | Non-sensitive vars for local dev | `next dev` |
| `.env.production` | Committed | Non-sensitive vars for production | `next build`, `next start`, Vercel Production |
| `.env.local` | gitignored | **Secrets** (`ADMIN_SESSION_SECRET`, `WEB_REVALIDATION_SECRET`) | Overrides `.env.*` |

### Local Development

```bash
yarn install --immutable
cp .env.example .env.local
# Fill in ADMIN_SESSION_SECRET and WEB_REVALIDATION_SECRET in .env.local
yarn dev
```

Local admin runs on port `3200`. The public web app remains on port `3100`.

Non-sensitive vars (site URL, API base, image origin, etc.) are pre-configured in `.env.development` (committed). Only secrets need to be added to `.env.local`.

## Vercel Deployment

Deploy from the repository root. Vercel auto-detects the Next.js framework.

### Vercel auto-loads `.env.production`

`.env.production` is committed to git and contains all **non-sensitive** production values. Vercel automatically loads it for Production deployments (main branch). No manual env var setup needed in Vercel Dashboard for these.

**Secrets** (`ADMIN_SESSION_SECRET`, `WEB_REVALIDATION_SECRET`) must be set in **Vercel Project Settings > Environment Variables** (Production) — they override the committed files.

### Hobby Plan Suitability

| Resource | Hobby Limit | This App Usage | Status |
|---|---|---|---|
| Function Invocations | 1M / month | Admin-only, low traffic | Fine |
| Active CPU | 4 CPU-hrs / month | Lightweight SSR, sub-second API calls | Fine |
| Provisioned Memory | 360 GB-hrs / month | Default 512 MB per function | Fine |
| Fast Data Transfer | 100 GB / month | Images served from CloudFront CDN | Fine |
| Function Duration | 300s max | All endpoints complete in seconds | Fine |
| Deployments / Day | 100 | Admin project, low change frequency | Fine |

### Vercel Dashboard Secrets

Set these **only** in Vercel Project Settings > Environment Variables (Production). All other vars are in `.env.production` (committed, auto-loaded):

| Variable | Description |
|---|---|
| `ADMIN_SESSION_SECRET` | Random 64-char hex string |
| `WEB_REVALIDATION_SECRET` | Shared revalidation HMAC secret |

> `NEXT_PUBLIC_APP_IS_LOCAL` is set to `false` in `.env.production` to disable localhost connection fallbacks and enforce HTTPS origin validation.

### Post-Deployment Checklist

1. Enable **Vercel Deployment Protection** (Vercel Dashboard > Project > Settings > Deployment Protection)
2. Verify Nest API CORS allows the Vercel admin origin and preview deployment origins
3. Confirm `WEB_REVALIDATION_URL` is reachable from Vercel Functions
4. Confirm `NEXT_PUBLIC_API_BASE_URL` is reachable from Vercel Functions (check Nest API firewall/security groups)

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
