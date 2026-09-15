# 0008: Backend RBAC as the Only Admin Login Authorization

## Status

Active.

## Context

ADR 0002 introduced a local `ADMIN_ALLOWED_EMAIL` allow-list in addition to
backend RBAC. Because the Nest API already enforces `role === admin` and an
active account status on every admin endpoint, the local allow-list added a
second, environment-managed source of truth that had to stay in sync with
backend accounts. A mismatch between the Vercel `ADMIN_ALLOWED_EMAIL` value and
the backend admin account blocked admin login even though the backend
considered the account authorized.

## Decision

Admin login authorization relies on trusted backend token claims only:

- The web app validates `role === "admin"` (case-insensitive) from the backend
  access token on login, session bootstrap, and refresh.
- The encrypted `momentbook_admin_session` cookie stays a wrapper around
  backend tokens; it is not an authorization source.
- `ADMIN_ALLOWED_EMAIL` is removed from code, `.env.example`, and README. Any
  remaining Vercel copy is unused and can be deleted.
- The Nest API remains authoritative for admin role, account status, token
  issuance, and every admin mutation.

## Consequences

- Any active backend account with the `admin` role can sign in to the admin
  web app; backend role hygiene is the access-control boundary.
- A wrong admin email now fails at the backend login instead of a local
  allow-list check, so there is no Vercel-side filter to keep in sync.
- Keep role claim comparisons case-insensitive so database enum casing never
  leaks into authorization decisions.
