# AGENTS.md

This repository is the standalone MomentBook admin web app. Runtime, system, and developer instructions override this file.

## Product Boundary

- This app owns the admin surface only: `/admin`, `/admin/login`, `/admin/reviews`, `/admin/articles`, and admin session routes.
- The public MomentBook web app remains the source of public read-only journeys, guides, sitemaps, analytics, and localized public chrome.
- Do not add public marketing, journey consumption, recap, archive, or community UX here unless a later ADR changes ownership.

## Architecture Invariants

- Keep admin authentication backed by the Nest API role/RBAC checks. The local encrypted admin cookie is only a web-session wrapper around backend tokens.
- Preserve the allowed-admin-email and role checks in the login/session flow.
- Admin mutations must not import `revalidatePath`, `revalidateTag`, or `updateTag` directly. They call the public web signed revalidation webhook through `lib/admin/revalidation.ts`.
- Public cache revalidation failures must not roll back successful backend mutations. Surface them as an admin warning query, currently `revalidation=failed`.
- `src/apis/client.ts` is generated from the backend contract. Do not edit it by hand except when copying the current generated contract during a project split; regenerate instead.
- Keep root/layout utilities admin-only. Do not import public `RootDocument`, analytics, language sync, public navigation, or public toaster/chrome.

## Environment

Required variables:

- `NEXT_PUBLIC_ADMIN_SITE_URL`
- `NEXT_PUBLIC_API_BASE_URL`
- `NEXT_PUBLIC_PUBLIC_IMAGE_ORIGIN`
- `NEXT_PUBLIC_APP_ENV`
- `NEXT_PUBLIC_APP_IS_LOCAL`
- `ADMIN_SESSION_SECRET`
- `WEB_REVALIDATION_URL`
- `WEB_REVALIDATION_SECRET`

Production notes:

- `NEXT_PUBLIC_ADMIN_SITE_URL` must be an absolute `https` URL unless `NEXT_PUBLIC_APP_IS_LOCAL=true`.
- Configure Vercel Deployment Protection in addition to the in-app admin login.
- The Nest API must allow the production admin origin and selected Vercel preview origins in CORS for browser-direct login/API calls. Backend role/RBAC remains authoritative.

## Verification

Use the smallest sufficient checks for the change:

- `yarn eslint <changed-files>`
- `yarn tsc --noEmit`
- `yarn vitest run scripts/__tests__/admin-session-routes.test.ts scripts/__tests__/admin-actions.test.ts scripts/__tests__/admin-article-actions.test.ts scripts/__tests__/admin-paths.test.ts scripts/__tests__/admin-reviews.test.ts`
- `yarn build` when routing, config, metadata, or deployment behavior changes.
