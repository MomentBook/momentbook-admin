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
6. `docs/CODEX.md` for repository-specific Codex workflow.
7. Local code, tests, generated types, and environment templates for
   implementation truth.

## ADR Records

| ADR | Status | Area | Read When |
| --- | --- | --- | --- |
| [0001](0001-admin-app-ownership-and-runtime.md) | Active | Admin app ownership and runtime | Routes, layouts, metadata, env, deployment, headers, or ownership boundaries change. |
| [0002](0002-admin-auth-session-boundary.md) | Active | Auth and session boundary | Login, session cookie, refresh, invalidation, logout, allowed email, or RBAC behavior changes. |
| [0003](0003-backend-contract-and-api-wrapper.md) | Active | Backend contract and API wrapper | Generated API types, backend calls, admin API wrappers, or backend error mapping changes. |
| [0004](0004-public-web-revalidation-boundary.md) | Active | Public web revalidation | Admin mutations affect public journeys, guides, sitemap visibility, cache invalidation, or warning banners. |
| [0005](0005-moderation-workspace-and-review-evidence.md) | Active | Moderation workspace and evidence | `/admin`, review queues, review detail, overview metrics, evidence grouping, or review mutations change. |
| [0006](0006-editorial-articles-and-guide-support.md) | Active | Editorial articles and guide support | `/admin/articles`, article editor/list/actions, markdown parsing, guide sitemap support, or editorial helpers change. |

## Repository Baseline

- MomentBook Admin is a standalone Next.js admin-only app backed by the Nest API.
- The app owns `/admin`, `/admin/login`, `/admin/reviews`,
  `/admin/articles`, and admin session routes only.
- Public journey consumption, public guides, SEO rendering, sitemaps,
  analytics, localized public chrome, marketing, recap, archive, and community
  UX belong to the public MomentBook web app.
- Existing public/editorial helpers in this repo support admin split
  compatibility and public revalidation path discovery. They are not permission
  to add public product surfaces here.
- The Nest API contract is represented by generated `src/apis/client.ts`.

## Default Change Policy

- Keep changes narrow and follow existing admin route, path, session, action,
  banner, and SCSS patterns.
- Preserve backend contract compatibility unless the task explicitly includes
  backend/API contract work.
- For auth, security, data, public visibility, environment, or deployment
  behavior, inspect the relevant ADR, code, tests, and configs before editing.
- If a task would move ownership between the public web app and this admin app,
  require a new ADR or explicit ADR update before implementation.

## External References Used for Agent Guidance

- AGENTS.md convention: https://agents.md/
