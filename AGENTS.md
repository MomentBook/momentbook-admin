# MomentBook Admin

Next.js 14 (App Router), TypeScript, React 18, Astryx Design System. Port 3200.

## Tech
Auth: Nest API role/RBAC-backed, encrypted `momentbook_admin_session` cookie.
Scripts: `yarn dev`, `yarn build`, `yarn lint`, `yarn vitest run`.

## Boundary
Admin-only: `/admin`, `/admin/login`, `/admin/reviews`, `/admin/articles`.
Do not expand into public UX. Ownership transfers require an ADR.

## Architecture
Design decisions: `docs/adr/README.md` (8 ADRs).
