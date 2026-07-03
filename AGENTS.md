# AGENTS.md

MomentBook Admin is a standalone Next.js admin web app. Runtime, system, and developer instructions override this file; the current user task defines scope unless it conflicts with these repository invariants.

## Source of Truth

- Execution rules: this file.
- Architecture, ownership, and current decisions: `docs/adr/README.md` plus any feature-specific ADRs.
- Product and UX intent: `docs/DESIGN.md`.
- Repository-specific Codex workflow: `docs/CODEX.md`.
- API shape: generated `src/apis/client.ts` from the Nest backend contract.

## Product Boundary

- This app owns only admin surfaces: `/admin`, `/admin/login`, `/admin/reviews`, `/admin/articles`, and admin session routes.
- The public MomentBook web app owns public journey consumption, guides, sitemaps, analytics, localized public chrome, marketing, recap, archive, and community UX.
- Do not add public-facing product surfaces here unless a later ADR explicitly changes ownership.
- Existing public/editorial helper code in this repo supports the admin split and public revalidation contracts; do not expand it into public UX.

## Architecture Invariants

- Keep admin authentication backed by Nest API role/RBAC checks. The local encrypted admin cookie is only a web-session wrapper around backend tokens.
- Preserve the allowed-admin-email check and `role === "admin"` validation in login/session/refresh flows.
- Admin mutations must not import `revalidatePath`, `revalidateTag`, or `updateTag` directly. Call the public web signed revalidation webhook through `lib/admin/revalidation.ts`.
- Public cache revalidation failures must not roll back successful backend mutations. Surface them as the admin warning query `revalidation=failed`.
- Do not edit `src/apis/client.ts` by hand except when explicitly copying the current generated contract during a project split; otherwise regenerate from the backend contract.
- Keep root/layout utilities admin-only. Do not import public `RootDocument`, analytics, language sync, public navigation, public toaster/chrome, or public marketing shell.
- Keep admin route helpers centralized in `lib/admin/paths.ts`; sanitize admin return targets before redirecting.
- Preserve noindex admin metadata, CSP/security headers, HTTPS production origin validation, and Vercel Deployment Protection assumptions.

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

- `NEXT_PUBLIC_ADMIN_SITE_URL` must be an absolute `https` URL unless `NEXT_PUBLIC_APP_IS_LOCAL=true`.
- Configure Vercel Deployment Protection in addition to in-app admin login.
- The Nest API must allow the production admin origin and selected Vercel preview origins in CORS for browser-direct login/API calls. Backend role/RBAC remains authoritative.

## Working Rules

- Inspect relevant code, call sites, types, tests, configs, generated boundaries, and docs before editing.
- Keep changes narrow, local, and verifiable; prefer existing architecture, naming, state management, error handling, i18n, and testing patterns.
- Preserve user/uncommitted changes. Never revert unrelated work.
- Do not install dependencies, rotate secrets, modify infrastructure/production config, run migrations, force-push, create external side effects, or use subagents unless explicitly requested.
- Use `rg` for search. Use English for code, comments, commit messages, identifiers, and technical artifacts.
- Explain work to the user in Korean unless they request otherwise.
- For code reviews, lead with bugs, regressions, security/data/auth risks, and missing tests, with file/line references.

## Verification

Use the smallest sufficient checks for the change:

- Docs only: `git diff --check`.
- Changed code: `yarn eslint <changed-files>`.
- Shared types, routing, auth, config, or generated-contract consumers: `yarn tsc --noEmit`.
- Admin behavior changes: `yarn vitest run scripts/__tests__/admin-session-routes.test.ts scripts/__tests__/admin-actions.test.ts scripts/__tests__/admin-article-actions.test.ts scripts/__tests__/admin-paths.test.ts scripts/__tests__/admin-reviews.test.ts`.
- Routing, config, metadata, security headers, or deployment behavior changes: `yarn build`.
