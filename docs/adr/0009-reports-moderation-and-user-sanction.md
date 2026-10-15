# 0009: Reports Moderation and User Sanctions

## Status

Active.

## Decision

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
- Hand-written types defined in `src/apis/types/reports.ts` and `src/apis/types/users.ts` matching NestJS DTOs.
- Domain-organized API services in `lib/api/reports.ts` (`listAdminReports`, `getAdminReportStats`, `getAdminReport`, `updateAdminReport`) and `lib/api/users.ts` (`updateAdminUserStatus`).
- Re-exported via `src/apis/types/index.ts` and `lib/api/index.ts`.

### Routing and Navigation
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
