# 0009: Reports Moderation and User Sanctions

## Status

Active.

## Decision

> **Amended by [0011](0011-operator-surfaces-users-comments-metrics-audit.md):**
> 2026-10-23, the sanction reason (and the linked report) is stored in the API's
> admin action log, and Sign out is added beside Ban and Unban.

> **Amended by [0012](0012-generated-api-types-and-contract-v3.md), [0014](0014-source-layout-and-layer-boundaries.md)
> and [0015](0015-library-adoption.md):** the report and user types are aliases of the generated contract
> in `src/lib/api/types/`; the services are `src/lib/api/reports.ts` and
> `src/lib/api/users.ts`; `updateAdminUserStatusAction` is
> `src/entities/user/status-action.ts` and its form
> `src/entities/user/components/user-status-form.tsx`, shared by reports,
> reviews and users.

Integrate the backend `admin/reports` and `admin/users` controllers into a dedicated **Reports Moderation** tab (`/reports` and `/reports/[reportId]`), expanding the moderation workspace to support report triage, evidence inspection, resolution state mutations, and direct user account sanctioning (ban/unban).

## Context

`momentbook-api` provides four `@AdminOnly()` controller groups:
1. `apps/core/src/journeys/published/review/publish-journey-admin.controller.ts` (`/core/admin/journeys`) — Publication reviews
2. `apps/core/src/articles/articles-admin.controller.ts` (`/core/admin/articles`) — Editorial articles
3. `apps/core/src/reports/admin-reports.controller.ts` (`/core/admin/reports`) — Report queues and resolution
4. `apps/core/src/users/admin-users.controller.ts` (`/core/admin/users`) — Account status and sanctions

Previously, `momentbook-admin` only implemented interfaces for journeys (Reviews) and editorial content (Articles). Reports filed by users on inappropriate journeys or malicious user accounts remained unmanageable from the admin interface.

## Implementation Shape

### API Contract and Service Layer
- ~~Hand-written types defined in `src/apis/types/reports.ts` and `src/apis/types/users.ts` matching NestJS DTOs.~~ Generated aliases in `src/lib/api/types/` (ADR 0012).
- Domain-organized API services in `src/lib/api/reports.ts` (`listAdminReports`, `getAdminReportStats`, `getAdminReport`, `updateAdminReport`) and `src/lib/api/users.ts` (`updateAdminUserStatus`).
- ~~Types are re-exported via `src/apis/types/index.ts`~~; callers import
  services from their domain module (`src/lib/api/reports`,
  `src/lib/api/users`).

### Routing and Navigation

> **Amended by [0010](0010-server-side-review-counts-and-workspace-shell.md):**
> one `AdminSidebar` rendered by the per-page `WorkspaceShell` replaces the
> per-screen sidebars named below, and the overview is the attention overview
> at `/`.
- Tab: `"reports"` added to `AdminWorkspaceTab`.
- Paths: `/reports` (queue list) and `/reports/[reportId]` (detail & mutation).
- Sidebar: Navigation item added across `AdminSidebar`, `AdminWorkspace`, and `AdminArticleShell`, displaying a badge with the current open report count.
- Overview integration: `AdminOverviewPanel` displays a dedicated summary card and KPI metric for open/pending reports with deep links to filtered queue views.

### Server Actions
- `updateAdminReportAction`: Modifies report resolution status (`PENDING`, `REVIEWED`, `RESOLVED`, `REJECTED`) and records administrator memos (`adminNote`).
- `updateAdminUserStatusAction`: Triggers account sanctions (`status: banned`) revoking active sessions, or restores banned accounts (`status: active`).

## Consequences

- Report moderation is fully actionable within the administrator surface with zero changes to public UX boundaries.
- Administrators can seamlessly jump between reported journey publications and the Journey Review workspace (`/reviews/[publicId]`).
- Verification: `yarn vitest run scripts/__tests__/admin-reports.test.ts`
