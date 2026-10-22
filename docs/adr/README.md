# ADR Index

This directory is the durable architecture map for MomentBook Admin. Read this
index first, then open only the ADRs that match the task area. Do not read every
ADR during startup.

## Source Order

1. Runtime, system, and developer instructions.
2. Current user task, unless it conflicts with repository invariants.
3. `AGENTS.md` for execution rules.
4. This index plus relevant ADRs for architecture, ownership, data, and
   operations decisions.
5. `docs/DESIGN.md` for product and UX intent.
6. Local code, tests, hand-written API types, and environment templates for
   implementation truth.

## ADR Records

| ADR | Status | Area | Read When |
| --- | --- | --- | --- |
| [0001](0001-admin-app-ownership-and-runtime.md) | Active, amended by [0011](0011-operator-surfaces-users-comments-metrics-audit.md) | Admin app ownership and runtime | Routes, layouts, metadata, env, deployment, headers, or ownership boundaries change. |
| [0002](0002-admin-auth-session-boundary.md) | Active | Auth and session boundary | Login, session cookie, refresh, invalidation, logout, or RBAC behavior changes. |
| [0008](0008-backend-rbac-only-admin-login.md) | Active | Backend-RBAC-only admin login | Login authorization, allow-list, session bootstrap, or admin access changes. |
| [0003](0003-backend-contract-and-api-wrapper.md) | Superseded by [0007](0007-hand-written-api-types-and-service-layer.md) | Backend contract and API wrapper (old) | Historic — code generation approach replaced by ADR 0007. |
| [0007](0007-hand-written-api-types-and-service-layer.md) | Active | Hand-written API types and service layer | API type changes, API service layer changes, or `lib/api/*` modifications. |
| [0004](0004-public-web-revalidation-boundary.md) | Active | Public web freshness | Admin mutations affect public journeys, guides, sitemap visibility, or public freshness behavior. |
| [0005](0005-moderation-workspace-and-review-evidence.md) | Active, amended by [0010](0010-server-side-review-counts-and-workspace-shell.md) | Moderation workspace and evidence | `/`, `/reviews`, review detail, evidence grouping, or review mutations change. |
| [0010](0010-server-side-review-counts-and-workspace-shell.md) | Active | Server-side review counts and workspace shell | Attention counts, sidebar badges, queue tabs/totals, overview loading, `WorkspaceShell`, or backend call budget change. |
| [0011](0011-operator-surfaces-users-comments-metrics-audit.md) | Active | Operator surfaces | `/users`, `/comments`, `/metrics`, `/audit-log`, user sanctions or sign-out, comment moderation, or the visibility boundary change. |
| [0006](0006-editorial-articles-and-guide-support.md) | Active | Editorial articles and guide support | `/articles`, article editor/list/actions, markdown parsing, or editorial helpers change. |
| [0009](0009-reports-moderation-and-user-sanction.md) | Active, amended by [0010](0010-server-side-review-counts-and-workspace-shell.md) | Reports moderation and user sanctions | `/reports`, reports queues, report detail, user ban/unban, or moderation status changes. |

## Repository Baseline

- MomentBook Admin is a standalone Next.js admin-only app backed by the Nest API.
- The app owns `/` (attention overview), `/reviews`, `/reports`, `/comments`,
  `/users`, `/articles`, `/metrics`, `/audit-log`, `/login`, and the `/session*` routes only, at the root of the admin origin.
- Public journey consumption, public guides, SEO rendering, sitemaps,
  analytics, localized public chrome, marketing, recap, archive, and community
  UX belong to the public MomentBook web app.
- The remaining editorial helpers in this repo serve the admin article
  workflow. They are not permission to add public product surfaces here.
- The Nest API contract is represented by hand-written types in `src/apis/types/`.
  API calls use the domain-organized service layer in `lib/api/`.

## Default Change Policy

- Keep changes narrow and follow existing admin route, path, session, action,
  banner, and shadcn/Tailwind patterns.
- Preserve backend contract compatibility unless the task explicitly includes
  backend/API contract work.
- For auth, security, data, public visibility, environment, or deployment
  behavior, inspect the relevant ADR, code, tests, and configs before editing.
- If a task would move ownership between the public web app and this admin app,
  require a new ADR or explicit ADR update before implementation.
- API types in `src/apis/types/` are hand-written; update them directly when the
  backend contract changes. There is no code generation step.

## External References Used for Agent Guidance

- AGENTS.md convention: https://agents.md/
