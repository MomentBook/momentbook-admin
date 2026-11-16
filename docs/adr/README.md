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
6. Local code, tests, the generated API types (read through the aliases in
   `src/lib/api/types/`), and environment templates for implementation truth.

## ADR Records

| ADR | Status | Area | Read When |
| --- | --- | --- | --- |
| [0014](0014-source-layout-and-layer-boundaries.md) | Active | Source layout and layer boundaries | Adding or moving a file, a screen, a shared part, a route loader or a server action; a boundary lint error; where code named in an older ADR lives now. |
| [0015](0015-library-adoption.md) | Active | Library adoption | The API client or generator, env validation, URL params, tables, charts, the Markdown preview, the photo lightbox, forms, theme, or a dependency bump. |
| [0001](0001-admin-app-ownership-and-runtime.md) | Active, amended by [0011](0011-operator-surfaces-users-comments-metrics-audit.md), [0013](0013-storage-overview.md) and [0014](0014-source-layout-and-layer-boundaries.md) | Admin app ownership and runtime | Routes, layouts, metadata, env, deployment, headers, or ownership boundaries change. |
| [0002](0002-admin-auth-session-boundary.md) | Active, amended by [0008](0008-backend-rbac-only-admin-login.md) and [0014](0014-source-layout-and-layer-boundaries.md) | Auth and session boundary | Login, session cookie, refresh, invalidation, logout, or RBAC behavior changes. |
| [0008](0008-backend-rbac-only-admin-login.md) | Active | Backend-RBAC-only admin login | Login authorization, allow-list, session bootstrap, or admin access changes. |
| [0003](0003-backend-contract-and-api-wrapper.md) | Superseded by [0007](0007-hand-written-api-types-and-service-layer.md) | Backend contract and API wrapper (old) | Historic — code generation approach replaced by ADR 0007. |
| [0007](0007-hand-written-api-types-and-service-layer.md) | Historic: types and envelope parsing superseded by [0012](0012-generated-api-types-and-contract-v3.md); the service layer stays, now `src/lib/api/` on `openapi-fetch` ([0015](0015-library-adoption.md)) | Hand-written API types and service layer | Why the service layer is organized by domain. |
| [0012](0012-generated-api-types-and-contract-v3.md) | Active for the contract v3 rules (decisions 2–6); the generator (decision 1) superseded by [0015](0015-library-adoption.md) | Generated API types and wire contract v3 | Response or error parsing, admin list paging, login/refresh/logout parsing, enum and input mapping, or the deploy order with an API change. |
| [0004](0004-public-web-revalidation-boundary.md) | Active | Public web freshness | Admin mutations affect public journeys, guides, sitemap visibility, or public freshness behavior. |
| [0005](0005-moderation-workspace-and-review-evidence.md) | Active, amended by [0010](0010-server-side-review-counts-and-workspace-shell.md), [0014](0014-source-layout-and-layer-boundaries.md) and [0015](0015-library-adoption.md) | Moderation workspace and evidence | `/`, `/reviews`, review detail, evidence grouping, the photo viewer, or review mutations change. |
| [0010](0010-server-side-review-counts-and-workspace-shell.md) | Active, amended by [0011](0011-operator-surfaces-users-comments-metrics-audit.md), [0014](0014-source-layout-and-layer-boundaries.md) and [0015](0015-library-adoption.md) | Server-side review counts and workspace shell | Attention counts, sidebar badges, queue tabs/totals, overview loading, `WorkspaceShell`, or backend call budget change. |
| [0011](0011-operator-surfaces-users-comments-metrics-audit.md) | Active, amended by [0014](0014-source-layout-and-layer-boundaries.md) and [0015](0015-library-adoption.md) | Operator surfaces | `/users`, `/comments`, `/metrics`, `/audit-log`, user sanctions or sign-out, comment moderation, or the visibility boundary change. |
| [0013](0013-storage-overview.md) | Active, amended by [0014](0014-source-layout-and-layer-boundaries.md) | Storage overview | `/storage`, the byte formatting, the allowance figures, or where an account's allowance is changed. |
| [0006](0006-editorial-articles-and-guide-support.md) | Active, amended by [0014](0014-source-layout-and-layer-boundaries.md) and [0015](0015-library-adoption.md) | Editorial articles and guide support | `/articles`, article editor/list/actions, the Markdown preview, or editorial helpers change. |
| [0009](0009-reports-moderation-and-user-sanction.md) | Active, amended by [0010](0010-server-side-review-counts-and-workspace-shell.md), [0011](0011-operator-surfaces-users-comments-metrics-audit.md), [0012](0012-generated-api-types-and-contract-v3.md), [0014](0014-source-layout-and-layer-boundaries.md) and [0015](0015-library-adoption.md) | Reports moderation and user sanctions | `/reports`, reports queues, report detail, user ban/unban, or moderation status changes. |

## Repository Baseline

- MomentBook Admin is a standalone Next.js admin-only app backed by the Nest API.
- The app owns `/` (attention overview), `/reviews`, `/reports`, `/comments`,
  `/users`, `/articles`, `/metrics`, `/storage`, `/audit-log`, `/login`, and the `/session*` routes only, at the root of the admin origin.
- Public journey consumption, public guides, SEO rendering, sitemaps,
  analytics, localized public chrome, marketing, recap, archive, and community
  UX belong to the public MomentBook web app.
- The remaining editorial helpers in this repo serve the admin article
  workflow. They are not permission to add public product surfaces here.
- The Nest API contract (wire contract v3) is represented by path types
  generated from its OpenAPI documents into `src/lib/api/generated/` and read
  through the aliases in `src/lib/api/types/`. API calls go through the
  domain-organized services in `src/lib/api/`, on typed `openapi-fetch`
  clients (ADR 0015).
- Sources live under `src/` in five layers — `lib` → `components`/`hooks` →
  `entities/<e>` → `features/<f>` → `app` — and `yarn lint` fails an import
  that goes up a layer or across two entities or two features (ADR 0014).

## Default Change Policy

- Keep changes narrow and follow existing admin route, path, session, action,
  banner, and shadcn/Tailwind patterns: a page through `renderWorkspacePage`,
  an action through `runAdminAction`, a result as a `FlashBanner` (ADR 0014).
- Keep the layer boundaries. When two screens need the same part, move it
  down (an entity or `lib`) or compose it in the `app` route; never relax the
  rule (ADR 0014).
- Preserve backend contract compatibility unless the task explicitly includes
  backend/API contract work.
- For auth, security, data, public visibility, environment, or deployment
  behavior, inspect the relevant ADR, code, tests, and configs before editing.
- If a task would move ownership between the public web app and this admin app,
  require a new ADR or explicit ADR update before implementation.
- API types are generated (ADR 0012, 0015): when the backend contract
  changes, run `yarn generate:api` with `API_SPEC_DIR=<dir>` (committed
  documents, such as `../momentbook-api/docs/openapi`) or `API_SPEC_URL=<url>`
  (a running API) and commit `src/lib/api/generated/`, which is never edited by
  hand. `src/lib/api/types/` holds aliases, and a hand-written type only for
  what the documents do not describe, with a comment saying why.

## External References Used for Agent Guidance

- AGENTS.md convention: https://agents.md/
