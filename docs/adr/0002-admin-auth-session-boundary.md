# 0002: Admin Auth and Session Boundary

## Status

Active.

## Decision

The Nest API is authoritative for authentication, token claims, admin role/RBAC,
and admin mutations. The local `momentbook_admin_session` cookie is only an
encrypted web-session wrapper around backend access and refresh tokens.

Login, session bootstrap, refresh, and action/session guards must preserve both:

- normalized `ADMIN_ALLOWED_EMAIL` allow-list enforcement
- `role === "admin"` validation from trusted backend token claims

## Implementation Shape

- `app/admin/login/actions.ts` posts the read-only allowed email and password to
  `/v2/auth/email/login`, decodes backend access token claims, checks email and
  admin role, then creates the encrypted admin cookie.
- `app/admin/session/route.ts` bootstraps a web session from backend login
  payloads and rejects malformed payloads, non-admin roles, and disallowed
  emails.
- `lib/admin/session.ts` encrypts/decrypts the cookie with `jose`, scopes it to
  `/admin`, refreshes access tokens inside a 60 second window, and clears local
  sessions when refresh fails.
- `requireAdminApiSession` redirects near-expiry sessions to
  `/admin/session/refresh`; server actions use `requireAdminActionSession` so
  they can refresh before mutation.
- `app/admin/session/refresh/route.ts` and
  `app/admin/session/invalidate/route.ts` redirect through the canonical admin
  origin from `resolveSiteUrl()`, not the incoming request origin.
- `logoutAdminAction` attempts backend logout but clears the local admin session
  even if backend logout fails.

## Redirect and Path Rules

- Keep admin paths centralized in `lib/admin/paths.ts`.
- Sanitize return targets with `sanitizeAdminPath` before redirecting.
- Drop external or non-admin return targets.
- Whitelist session redirect errors through
  `sanitizeAdminSessionRedirectError`.

## Consequences

- Do not replace backend RBAC with client-only or cookie-only checks.
- Do not silently ignore backend 401/403 responses; map them to session
  invalidation or access-denied login notices.
- Session or auth changes should run:
  `yarn vitest run scripts/__tests__/admin-session-routes.test.ts scripts/__tests__/admin-paths.test.ts`
- Also run `yarn tsc --noEmit` for shared session, route, or config type
  changes, and `yarn build` for deployment/origin behavior changes.

