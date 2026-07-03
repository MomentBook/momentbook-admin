# ADR Index

This directory is the architecture decision record index for MomentBook Admin. Treat it as the map of durable architecture, ownership, data, and operations decisions. Do not read every ADR at startup; read this index first, then open feature-specific ADRs only when a task touches that area.

## Source Order

1. Runtime, system, and developer instructions.
2. Current user task, unless it conflicts with repository invariants.
3. `AGENTS.md` for execution rules.
4. This ADR index and relevant ADRs for architecture/domain/data/ownership decisions.
5. `docs/DESIGN.md` for product and UX intent.
6. `docs/CODEX.md` for repository-specific Codex workflow.
7. Local code, tests, generated types, and environment templates for implementation truth.

## ADR Records

No standalone ADR records have been split out yet. Until they exist, the current decisions below are the durable architecture baseline inferred from the repository, `README.md`, `AGENTS.md`, and current implementation.

When adding a feature-specific ADR, use a short numbered filename such as `0001-admin-session-boundary.md`, add it to this table, and keep this index compact.

| ADR | Status | Area | Summary |
| --- | --- | --- | --- |
| Current baseline | Active | Admin app split | MomentBook Admin is a standalone admin-only Next.js app backed by the Nest API and public web revalidation webhook. |

## Current Architecture Decisions

### Standalone Admin Ownership

- This repository owns `/admin`, `/admin/login`, `/admin/reviews`, `/admin/articles`, and admin session routes.
- The public MomentBook web app remains the owner of public journey consumption, guides, sitemaps, analytics, localized public chrome, marketing, recap, archive, and community UX.
- Existing public/editorial helpers in this repo are support code for admin workflows and project split compatibility, not permission to add public product surfaces.

### Auth and Session Boundary

- The Nest API is authoritative for authentication, token claims, role/RBAC, and admin mutations.
- The local encrypted `momentbook_admin_session` cookie is a web-session wrapper around backend access/refresh tokens, scoped to `/admin`.
- Login, session creation, token refresh, and admin API entrypoints must preserve the allowed-admin-email check and `role === "admin"` validation.
- Invalid, expired, non-admin, or no-longer-allowed sessions redirect through the admin session refresh/invalidate/login flow rather than bypassing backend authority.

### Backend Contract Boundary

- `src/apis/client.ts` is generated from the backend OpenAPI contract by `yarn generate:api`.
- Do not hand-edit generated API types or clients unless explicitly copying the current generated contract during a project split.
- Admin API wrappers in `lib/admin/api.ts` are the local integration boundary for session-aware backend calls and admin error mapping.

### Public Web Revalidation

- Admin mutations that affect public web visibility or editorial public content call `requestWebRevalidation` in `lib/admin/revalidation.ts`.
- This app sends signed webhook requests to the public web app using `WEB_REVALIDATION_URL` and `WEB_REVALIDATION_SECRET`.
- Public cache revalidation is best-effort after a successful backend mutation. Failure must be surfaced as an admin warning, currently `revalidation=failed`, and must not roll back the backend mutation.
- Admin mutations must not directly import Next cache mutation APIs such as `revalidatePath`, `revalidateTag`, or `updateTag`.

### Runtime and Deployment Boundary

- Production admin origin must be HTTPS unless `NEXT_PUBLIC_APP_IS_LOCAL=true`.
- Vercel Deployment Protection is expected in addition to in-app admin login.
- The Nest API must allow production admin and selected preview origins through CORS for browser-direct login/API calls.
- Admin pages should remain noindex and should preserve CSP/security headers defined in `next.config.ts`.

## Default Change Policy

- Prefer small changes that follow existing admin route, path, session, action, and banner patterns.
- Preserve contract compatibility unless a task explicitly includes backend/API contract work.
- For auth, security, data, public visibility, environment, or deployment behavior, inspect the relevant code and tests before planning or editing.
- If a task would move ownership between public web and admin app, require a new ADR before implementation.

## External References Used for Agent Guidance

- OpenAI Codex manual: https://developers.openai.com/codex/codex-manual.md
- AGENTS.md convention: https://agents.md/
- DeepSeek API docs: https://api-docs.deepseek.com/
- Context degradation research: https://www.trychroma.com/research/context-rot
- AGENTS.md studies: https://arxiv.org/abs/2602.11988 and https://arxiv.org/abs/2606.15828
