# Admin Workspace Restructure Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the MomentBook admin trustworthy (counts from the same backend filters Slack uses), fast to review (one-click decisions with auto-advance), stable (Tailwind v4 shadcn components, stack = momentbook-web), and Vercel-Hobby-safe (bounded backend calls per page).

**Architecture:** Server components + server actions stay. Journey data is read through the API's server-side filters and `total` instead of a full scan. A per-page `WorkspaceShell` server component renders one sidebar with fresh attention counts (layouts are not re-rendered on navigation). View-model loaders live in `lib/admin/*`, HTTP in `lib/api/*`, contract types in `src/apis/types/*` (ADR 0007).

**Tech Stack:** Next.js 16.3.8 App Router, React 19.2, TypeScript 5.9, Tailwind CSS 4.3, shadcn/ui `new-york-v4` + `radix-ui`, `tw-animate-css`, Vitest 4.1 (node env), Yarn 3.6.4 (node-modules linker).

**Spec:** `docs/superpowers/specs/2026-10-21-admin-workspace-restructure-design.md` (approved 2026-10-21). Read it before starting; section numbers below (§x.y) refer to it.

## Global Constraints

- Work on branch `feat/admin-workspace-restructure` (from `develop`). Commit per task. No push/merge.
- No changes to `momentbook-api`. Only the 14 existing `@AdminOnly()` operations (spec §6.10).
- Versions: `next` and `eslint-config-next` `16.3.8`; `react`/`react-dom` `~19.2.9`; `typescript` `5.9.3`; `tailwindcss`/`@tailwindcss/postcss` `^4.3.3`; `vitest` `^4.1.12`; `lucide-react` `1.8.0`. New runtime deps allowed: `radix-ui`, `tw-animate-css` only.
- shadcn CLI pinned: `npx shadcn@4.22.1`.
- No `revalidatePath` / `revalidateTag` / `updateTag` imports (ADR 0004).
- Attention counts must render in a page-level server component, never in a `layout.tsx` (spec §3).
- No page may make a number of backend calls that grows with the number of journeys (spec §6.9).
- Admin copy is English, short, operational. Routes stay at the root (`/`, `/reviews`, `/reports`, `/articles`, `/login`, `/session/*`).
- Backend 401 → session invalidation/login redirect; 403 on admin endpoints → access-denied redirect, except the users-status endpoint where 403 means "target is an admin/self" and is an error banner (existing behaviour). Never swallow 401/403/409.
- Confirmation dialogs only for Ban, Unban, Approve-without-translation, Delete article. Approve/Reject/Move-to-pending submit immediately.
- Test rule (spec §6.12): only the tests named in spec §6.12 may have assertions rewritten. Any other test that starts failing → stop and ask.
- Gate after every task: `yarn typecheck && yarn lint && yarn test` green. `yarn build` at Tasks 2, 3, 9, 11.

## Review Focus

1. Admin decides a journey whose owner republished meanwhile → `REVIEW_STATE_CONFLICT` banner on the **same** journey, no auto-advance, no retry. (Task 7 test `conflict stays on the journey`.)
2. The only pending journey is the one just decided (list still returns it first) → auto-advance must skip it and land on the queue "All clear". (Task 5 test `findNextPendingPublicId skips the excluded id`, Task 7 test `advances to the queue when nothing else is pending`.)
3. Stale or hand-edited URLs (`?tab=reviews`, `?status=all`, `?status=garbage`, `?page=0`, `?page=999999`) → sane defaults, never forwarded to the API out of range (API max page 100000, max limit 50). (Task 5 test `parseReviewQueuePage clamps`, Task 6 test `legacy tab redirect`.)
4. Old bookmark `?reason=HARASSMENT` on `/reports` → ignored (API would 400), list still loads. (Task 8 test `parseReportReason drops unknown values`.)
5. Report stats endpoint fails with 500 while journeys work → review pages still render, Reports badge shows nothing; a 401 still redirects. (Task 5 test `report stats failure degrades to null`.)

---

### Task 1: Branch, green baseline, scripts

**Files:**
- Modify: `package.json` (scripts)
- Modify: `scripts/__tests__/admin-actions.test.ts`, `scripts/__tests__/admin-article-actions.test.ts`, `scripts/__tests__/admin-reviews.test.ts` (mocks only)
- Add (commit): `docs/superpowers/specs/2026-10-21-admin-workspace-restructure-design.md`, this plan

**Interfaces:**
- Produces: scripts `test` = `vitest run`, `typecheck` = `next typegen && tsc --noEmit`, `verify` = `yarn typecheck && yarn lint && yarn test`.

- [ ] **Step 1:** `git switch -c feat/admin-workspace-restructure` from `develop`; commit the spec and plan (`docs: add admin workspace restructure spec and plan`).
- [ ] **Step 2:** Add the three scripts to `package.json`. Run `yarn test` → Expected: 9 failed / 13 passed (baseline).
- [ ] **Step 3:** Repoint mocks from the removed `@/lib/admin/api` to the real modules, keeping every outcome assertion:
  - `@/lib/api/client` → `BackendApiError` (class with `statusCode`, optional `errorCode`), `isBackendApiError` (structural check like the real one).
  - `@/lib/api/journeys` → `listPublishedJourneys` (was `getAdminPublishedJourneysPage`), `getPublishedJourneyDetail` (was `getAdminPublishedJourneyDetail`), `updateReviewStatus` (was `updatePublishedJourneyReviewStatus`), `requeueJourneyReview`.
  - `@/lib/api/auth` → `logoutAdmin` (was `logoutAdminFromBackend`).
  - `@/lib/api/articles` → `createAdminArticle`, `updateAdminArticle`, `deleteAdminArticle`.
  Call-argument assertions follow the real signatures in `lib/api/*.ts` (e.g. `listPublishedJourneys({ accessToken, page, limit })`).
- [ ] **Step 4:** Run `yarn test` → Expected: 22 passed. Run `yarn typecheck && yarn lint` → exit 0.
- [ ] **Step 5:** Commit `test: mock the lib/api modules that replaced lib/admin/api`.

### Task 2: Align stack versions with momentbook-web

**Files:** Modify `package.json`, `yarn.lock`.

- [ ] **Step 1:** `yarn add next@16.3.8 react@~19.2.9 react-dom@~19.2.9` and `yarn add -D eslint-config-next@16.3.8 vitest@^4.1.12`. Keep `typescript` `^5` resolving to 5.9.3 (`yarn why typescript`).
- [ ] **Step 2:** `node -e 'for (const p of ["next","react","react-dom","vitest"]) console.log(p, require(p+"/package.json").version)'` → Expected: `next 16.3.8`, `react 19.2.9`, `react-dom 19.2.9`, `vitest 4.1.x` (x ≥ 12).
- [ ] **Step 3:** `yarn verify && yarn build` → exit 0. Fix only what the upgrade breaks (record any fix in the commit body).
- [ ] **Step 4:** Commit `chore: align next/react/vitest with momentbook-web`.

### Task 3: Regenerate shadcn components for Tailwind v4 and fix the sidebar

**Files:**
- Modify: `components.json` (`"style": "new-york"`), `app/globals.css`, `components/ui/*` (regenerated), `hooks/use-mobile.tsx` (if the CLI rewrites it), `components/layout/admin-sidebar.tsx`, `components/layout/admin-shell.tsx`, `package.json`, `yarn.lock`
- Create: `components/ui/alert-dialog.tsx` (CLI)
- Delete: `components/ui/breadcrumb.tsx`, `components/ui/dropdown-menu.tsx`, `components/ui/form.tsx`

**Interfaces:**
- Produces: `AdminShell({ children, sidebar, defaultOpen = true }: { children: ReactNode; sidebar: ReactNode; defaultOpen?: boolean })` (Task 6's `WorkspaceShell` passes the `sidebar_state` cookie value).
- Produces: `components/layout/admin-nav.ts`:
  `export type AdminNavKey = "attention" | "reviews" | "reports" | "articles";`
  `export const ADMIN_NAV_ITEMS: ReadonlyArray<{ key: AdminNavKey; label: string; href: string; icon: LucideIcon }>` — Attention `/` `Inbox`; Reviews `/reviews` `ClipboardCheck`; Reports `/reports` `Flag`; Articles `/articles` `FileText`.
- Produces: `AdminSidebar({ active, badges, session }: { active: AdminNavKey; badges: Partial<Record<AdminNavKey, number | null>>; session: AdminSession })` — renders `ADMIN_NAV_ITEMS` with icon + label + `SidebarMenuBadge` (only when the value is a number > 0), tooltip = label, logo `Link href="/"`.

- [ ] **Step 1:** Set `components.json` style to `new-york`. Run `npx shadcn@4.22.1 add alert alert-dialog badge button card dialog input label select separator sheet sidebar skeleton table textarea tooltip --overwrite --yes`.
- [ ] **Step 2:** In `app/globals.css`: replace `@plugin "tailwindcss-animate";` with `@import "tw-animate-css";`; map `--color-sidebar*` in `@theme inline` to the `:root`/`.dark` `--sidebar*` variables (remove the hard-coded gray mapping); keep the MomentBook tokens, fonts and radius. Remove packages no file imports any more: `yarn remove tailwindcss-animate` and every `@radix-ui/react-*` with zero importers (`grep -rn "@radix-ui/" components app`).
- [ ] **Step 3:** Delete the three unused ui files. Point every current sidebar caller (`AdminWorkspace` → `attention`/`reviews`, `AdminReviewDetailPageView` → `reviews`, `AdminReportsShell` → `reports`, `AdminArticleShell` → `articles`) at the new `AdminSidebar` props, passing the badge numbers they already have. The four call sites are replaced again in Task 6; here they only need to compile and render.
- [ ] **Step 4:** Verify v3 syntax is gone: `grep -rnE "\[--[a-z]|theme\(spacing" components/ui` → no output. `yarn verify && yarn build` → exit 0. Then `grep -o "width:--[a-z-]*" .next/static/chunks/*.css | wc -l` → `0`, and `grep -c "width:var(--sidebar-width)" .next/static/chunks/*.css` → ≥ 1.
- [ ] **Step 5:** Commit `fix(ui): regenerate shadcn components for Tailwind v4 (sidebar width)`.

### Task 4: Contract corrections and API service options

**Files:**
- Modify: `src/apis/types/reports.ts`, `src/apis/types/users.ts`, `src/apis/types/journeys.ts`, `lib/api/journeys.ts`, `lib/admin/reports-shared.ts`, `app/reports/actions.ts` (type only), `scripts/__tests__/admin-reports.test.ts`
- Test: `scripts/__tests__/admin-api-journeys.test.ts` (new)

**Interfaces:**
- Produces types: `ReportReason = "SPAM" | "ABUSE" | "HATE" | "SEXUAL" | "INAPPROPRIATE" | "OTHER"`; `export const REPORT_REASONS: readonly ReportReason[]` (in `reports-shared.ts`); `AdminReportPublishedJourneySummaryDto.visibility: "PUBLIC" | "HIDDEN"`; `AdminReportUserSummaryDto.status: "ACTIVE" | "INACTIVE" | "DELETED" | "BANNED"`; `AdminUserStatusResponseDataDto.status: "banned" | "active" | "inactive"`; `UpdatePublishedJourneyReviewRequestDto.acceptUntranslated?: boolean`; `PublishedJourneyDetailDto.localizationModel?: string`, `.publishedWithoutTranslation?: boolean`, `.updatedAt: string` (confirm present).
- Produces: `listPublishedJourneys(input: { accessToken: string; page: number; limit: number; reviewStatus?: JourneyReviewStatus; localizationPending?: boolean; enqueueFailed?: boolean }): Promise<AdminPublishedJourneysDataDto>` — booleans sent as `"true"`/`"false"` only when defined.
- Produces: `updateReviewStatus(input: { accessToken; publicId; status; publishOperationId?: string; acceptUntranslated?: boolean })` — body includes `acceptUntranslated: true` only when true.
- Produces: `parseReportReason(value: string | null): ReportReason | undefined` and labels `SPAM "Spam"`, `ABUSE "Abuse"`, `HATE "Hate speech"`, `SEXUAL "Sexual content"`, `INAPPROPRIATE "Inappropriate"`, `OTHER "Other"`.

- [ ] **Step 1: Failing tests.** In `admin-api-journeys.test.ts` (mock `fetch` via `vi.stubGlobal`, `ENV.API_BASE_URL` via `vi.mock("@/src/configs/env.server", () => ({ ENV: { API_BASE_URL: "https://api.test" } }))`):
  - `listPublishedJourneys sends filter flags`: called with `{ accessToken: "t", page: 1, limit: 1, localizationPending: true }` → fetched URL `https://api.test/core/admin/journeys/publish?page=1&limit=1&localizationPending=true`.
  - `updateReviewStatus sends acceptUntranslated only when true`: body `{"status":"APPROVED","publishOperationId":"op-1","acceptUntranslated":true}`; with `acceptUntranslated: false` the key is absent.
  In `admin-reports.test.ts`, rewrite "returns human-readable labels for report statuses and reasons" (spec §6.12) to assert `getReportReasonLabel("ABUSE") === "Abuse"`, `getReportReasonLabel("SEXUAL") === "Sexual content"`, and add `parseReportReason drops unknown values`: `parseReportReason("HARASSMENT") === undefined`, `parseReportReason("HATE") === "HATE"`, `parseReportReason(null) === undefined`.
- [ ] **Step 2:** `yarn test` → the new/rewritten cases FAIL.
- [ ] **Step 3:** Implement the type and service changes above.
- [ ] **Step 4:** `yarn verify` → green (fix any view that relied on the old enum or `visibility: string`).
- [ ] **Step 5:** Commit `fix(api-types): sync report reasons, statuses and review options with core.json`.

### Task 5: Server-side loaders — attention counts, queue, overview, detail

**Files:**
- Create: `lib/admin/attention.ts`, `lib/admin/review-queue.ts`, `lib/admin/overview.ts`
- Modify: `lib/admin/reviews.ts` (export the item normalizer; add the detail loader — the old full-scan loader stays until Task 6 removes it), `lib/admin/reports.ts` (history loader)
- Test: `scripts/__tests__/admin-attention.test.ts`, `scripts/__tests__/admin-review-queue.test.ts`, `scripts/__tests__/admin-overview.test.ts` (new)

**Interfaces:**
- Produces (`attention.ts`):
  ```ts
  export type AttentionCounts = {
    pendingReviews: number; translationPending: number; translationEnqueueFailed: number;
    openReports: number | null; pendingReports: number | null; reviewedReports: number | null;
    asOf: string; // ISO timestamp of the load
  };
  export async function loadAttentionCounts(accessToken: string): Promise<AttentionCounts>;
  ```
  4 parallel calls: `listPublishedJourneys({page:1,limit:1,reviewStatus:"PENDING"})`, `({page:1,limit:1,localizationPending:true})`, `({page:1,limit:1,enqueueFailed:true})`, `getAdminReportStats`. Journey call errors propagate. Report-stats errors: 401/403 propagate; anything else → the three report fields `null`.
- Produces (`review-queue.ts`):
  ```ts
  export type ReviewQueueTab = "pending" | "translation" | "approved" | "rejected" | "all";
  export const REVIEW_QUEUE_TABS: readonly ReviewQueueTab[];
  export const REVIEW_QUEUE_PAGE_SIZE = 20;
  export function parseReviewQueueTab(value: string | null): ReviewQueueTab; // unknown → "pending"
  export function parseReviewQueuePage(value: string | null): number;      // integer clamp 1..100000, invalid → 1
  export function reviewQueueTabFilter(tab: ReviewQueueTab): { reviewStatus?: JourneyReviewStatus; localizationPending?: boolean };
  export type ReviewQueuePage = { tab: ReviewQueueTab; items: AdminReviewQueueItem[]; total: number; page: number; pages: number; tabTotals: Record<ReviewQueueTab, number> };
  export async function loadReviewQueue(input: { accessToken: string; tab: ReviewQueueTab; page: number; counts: AttentionCounts }): Promise<ReviewQueuePage>;
  export async function findNextPendingPublicId(input: { accessToken: string; excludePublicId: string }): Promise<string | null>;
  ```
  Mapping: pending→`{reviewStatus:"PENDING"}`, translation→`{localizationPending:true}`, approved→`{reviewStatus:"APPROVED"}`, rejected→`{reviewStatus:"REJECTED"}`, all→`{}`. `tabTotals.pending/translation` come from `counts`; approved/rejected/all from `limit=1` calls in parallel with the list call. `findNextPendingPublicId` = `listPublishedJourneys({page:1,limit:2,reviewStatus:"PENDING"})`, first `publicId !== excludePublicId`, else `null`.
- Produces (`overview.ts`):
  ```ts
  export type AdminOverview = { approvedCount: number; rejectedCount: number; approvalRate: number | null;
    recentIntake: { weeks: Array<{ key: string; label: string; count: number }>; totalCount: number; maxCount: number; truncated: boolean } };
  export async function loadAdminOverview(input: { accessToken: string; now?: number }): Promise<AdminOverview>;
  ```
  Totals via `limit=1` APPROVED/REJECTED calls; `approvalRate = round(approved / (approved+rejected) * 100)`, `null` when both 0. Intake: 6 UTC-Monday weeks (reuse `startOfUtcWeek`, label formatter and bucketing from today's `buildRecentIntake`, moved here), newest-first pages `limit=50`, page cap `INTAKE_PAGE_CAP = 4`, timestamp `publishedAt ?? createdAt`; stop at the first item older than the first bucket or when `hasMore` is false; dedupe by `publicId`; `truncated = true` only when the cap stopped the scan.
- Produces (`reviews.ts`): `export function normalizeAdminReviewItem(item: AdminPublishedJourneyItemDto): AdminReviewQueueItem` (existing body); `export async function loadAdminReviewDetail(input: { accessToken: string; publicId: string; lang?: Language | null }): Promise<AdminReviewDetail | null>` (404 → `null`; journeyId/title/description/photoCount/publishOperationId from the detail only); `AdminReviewJourney` gains `updatedAt: string`, `localizationModel: string | null`, `publishedWithoutTranslation: boolean`. (Removal of the full-scan code is Task 6.)
- Produces (`reports.ts`): `export async function loadReportHistory(input: { accessToken: string; targetType?: ReportTargetType; targetId?: string; reporterId?: string; limit?: number }): Promise<{ items: AdminReportItemDto[]; total: number }>` (default limit 5).

- [ ] **Step 1: Failing tests** (mock `@/lib/api/journeys`, `@/lib/api/reports`, `server-only`):
  - attention: `sends the three journey filters with limit 1` (assert the three call args exactly); `maps totals and report stats` (`openReports: 3, pendingReports: 2, reviewedReports: 1`); `report stats failure degrades to null` (stats rejects `new BackendApiError("x", 500)` → report fields `null`, journeys counts intact); `report stats 401 propagates`.
  - queue: `maps every tab to its API filter` (table over `REVIEW_QUEUE_TABS`); `parseReviewQueueTab defaults to pending` (`null`, `"garbage"` → `"pending"`; `"all"` → `"all"`); `parseReviewQueuePage clamps` (`"0"`→1, `"-3"`→1, `"2.5"`→1, `"999999"`→100000, `"7"`→7); `loadReviewQueue uses API totals and counts` (pending/translation totals from `counts`, approved from its `limit=1` call, `items` normalized, `pages` from the list response); `findNextPendingPublicId skips the excluded id` (`[current, other]` → `"other"`; `[current]` → `null`; `[]` → `null`).
  - overview: `stops at the first item older than the window`; `caps the scan at 4 pages and flags truncated`; `approval rate is null with no decisions`.
- [ ] **Step 2:** `yarn test` → new cases FAIL, others pass.
- [ ] **Step 3:** Implement the modules above.
- [ ] **Step 4:** `yarn verify` → green (nothing calls the new loaders yet; existing tests untouched).
- [ ] **Step 5:** Commit `feat(reviews): server-side loaders for counts, queue, overview and detail`.

### Task 6: Workspace shell, page loader, overview and queue pages

**Files:**
- Create: `components/layout/workspace-shell.tsx`, `app/_workspace/AttentionOverview.tsx`, `app/reviews/ReviewQueuePageView.tsx`
- Modify: `app/_workspace/workspace-data.ts`, `app/page.tsx`, `app/reviews/page.tsx`, `app/reports/page.tsx`, `app/reports/[reportId]/page.tsx`, `app/articles/page.tsx`, `app/articles/new/page.tsx`, `app/articles/[articleId]/page.tsx`, the article/report views that rendered their own shell (`AdminArticleListPageView.tsx`, `EditorialArticleEditorPageView.tsx`, report views), `lib/admin/paths.ts`
- Delete: `app/_workspace/AdminWorkspace.tsx`, `app/_workspace/AdminOverviewPanel.tsx`, `app/reports/AdminReportsShell.tsx`, `app/articles/AdminArticleShell.tsx`; in `lib/admin/reviews.ts` remove `readAllAdminReviewItems`, `buildSummary`, `buildAdminOverviewData`, `buildRecentIntake` (moved to `overview.ts` in Task 5), `buildQueue`, `matchesQueueStatus`, `loadAdminReviewWorkspaceData` and the types `AdminReviewQueueStatus`, `AdminReviewSummary`, `AdminReviewQueueData`, `AdminOverviewData`, `AdminOverviewWeeklyIntake`
- Test: `scripts/__tests__/admin-paths.test.ts` (extend), `scripts/__tests__/admin-workspace-page.test.ts` (new), `scripts/__tests__/admin-reviews.test.ts` (spec §6.12 rewrites)

**Interfaces:**
- Consumes: `AttentionCounts`, `loadAttentionCounts`, `loadReviewQueue`, `parseReviewQueueTab`, `parseReviewQueuePage`, `loadAdminOverview`, `AdminSidebar`, `AdminShell`, `AdminNavKey`.
- Produces (`workspace-data.ts`): `export async function loadWorkspacePage<T>(input: { returnTo: string; load: (accessToken: string) => Promise<T> }): Promise<{ data: T; counts: AttentionCounts; session: AdminSession }>` — `load` and `loadAttentionCounts` run in parallel inside the existing 401/403 → `buildAdminSessionInvalidateHref` mapping (replaces `withAdminWorkspaceSession`, `loadAdminWorkspaceShell`, `loadAdminReviewDetailShell`).
- Produces: `WorkspaceShell({ active, counts, session, children }: { active: AdminNavKey; counts: AttentionCounts; session: AdminSession; children: ReactNode }): Promise<JSX.Element>` (async server component; `defaultOpen = (await cookies()).get("sidebar_state")?.value !== "false"`; badges `reviews: counts.pendingReviews`, `reports: counts.openReports`).
- Produces (`paths.ts`): `buildAdminReviewQueueHref(options?: { status?: ReviewQueueTab | null; page?: number | string | null; entries?: Record<string, string | null | undefined> }): string` (omits `status=pending` and `page<=1`); `buildAdminReportsHref` gains `targetId`, `reporterId`; `AdminWorkspaceTab`/`parseAdminWorkspaceTab`/`buildAdminWorkspaceHref` remain only for the legacy redirect.

- [ ] **Step 1: Failing tests.**
  - paths: `buildAdminReviewQueueHref omits defaults` (`{}` → `/reviews`; `{status:"approved",page:2}` → `/reviews?status=approved&page=2`; `{status:"pending",page:1}` → `/reviews`); `buildAdminReportsHref keeps targetId and reporterId`.
  - reviews (spec §6.12 rewrites, the only assertion changes allowed here): replace "builds summary counts from the full dataset…" with `queue items come from the server-filtered list` (asserts `loadReviewQueue` passes `reviewStatus: "PENDING"`, returns the API `total`, and fetches no second list page); split "normalizes legacy metadata aliases…" into `normalizes legacy metadata aliases` (alias assertions unchanged, via `normalizeAdminReviewItem`) and `detail lookup is independent from the active filter` (detail assertions unchanged, via `loadAdminReviewDetail`); the 4 evidence/detail cases call `loadAdminReviewDetail` with assertions unchanged.
  - workspace page (mock `next/navigation`, `next/headers`, session, loaders): `legacy tab redirect` — `AdminIndexPage({ searchParams: Promise.resolve({ tab: "reviews", status: "all", page: "2" }) })` throws `REDIRECT:/reviews?status=all&page=2`; `{ tab: "live" }` → `REDIRECT:/reviews`; `{ tab: "reports", status: "PENDING" }` → `REDIRECT:/reports?status=PENDING`. `loadWorkspacePage maps 401 to session invalidate` (load rejects `BackendApiError(…,401)` → `REDIRECT:/session/invalidate?next=…&error=session_expired`).
- [ ] **Step 2:** `yarn test` → new cases FAIL.
- [ ] **Step 3:** Implement `loadWorkspacePage`, `WorkspaceShell`, path builders. Every workspace page: `loadWorkspacePage` → `<WorkspaceShell active=… counts=… session=…>{view}</WorkspaceShell>`; views stop receiving `session`/badge counts. Report and article pages drop their `loadAdminReviewWorkspaceData` badge calls.
- [ ] **Step 4:** `app/page.tsx` = Attention overview (legacy `tab` redirects first): `AttentionOverview({ counts, overview })` renders spec §6.3 — three "Needs action" tiles with exact links (`/reviews`, `/reviews?status=translation`, `/reports?status=PENDING`, `/reports?status=REVIEWED`; the Open total links to `/reports`), the line "Slack alerts on translations pending for more than 6 hours.", "As of <asOf>" via `components/LocalizedTime.tsx`, an "All clear" state when pending, translation and open reports are all 0, then the health row (approved/rejected/approval rate, report status breakdown from counts) and the intake chart (`truncated` → total shown as "200+").
- [ ] **Step 5:** `app/reviews/page.tsx` = queue: `parseReviewQueueTab(status)`, `parseReviewQueuePage(page)`, `loadReviewQueue`; `ReviewQueuePageView` renders tab links with `tabTotals` (tab change drops `page`), the table columns of spec §6.4 (translation badge: "Pending" when `localizationPending`, "Enqueue failed" when `enqueueFailed`), link pagination from `page`/`pages`, rows linking to `buildAdminReviewDetailHref(publicId, { status: tab === "pending" ? null : tab, page: page > 1 ? String(page) : null })`, the translation tab's one-line Slack note, and two empty states: pending tab with 0 total → "All clear — nothing waiting for review."; other tab or page beyond `pages` → "No journeys match this view." with a link to page 1. Mutation/error banners use today's `resolveBanner` from `workspace-data.ts` (Task 7 replaces it with `resolveReviewBanner`).
- [ ] **Step 6:** `yarn verify` → green; `grep -rn "loadAdminReviewWorkspaceData\|readAllAdminReviewItems" app lib` → no output.
- [ ] **Step 7:** Commit `feat(workspace): attention overview, review queue page and one shell`.

### Task 7: Review detail — decisions, auto-advance, translation box, context

**Files:**
- Create: `app/reviews/actions.ts` (moved from `app/_workspace/actions.ts`), `app/reviews/review-banner.ts`, `app/_workspace/user-status-banner.ts`, `components/confirm-action-form.tsx`
- Modify: `app/_workspace/actions.ts` (keeps `logoutAdminAction` only), `app/_workspace/workspace-data.ts` (drop `resolveBanner`, `parseStatus`, `parseReviewStatus`), `app/reviews/[publicId]/page.tsx`, `app/reviews/[publicId]/AdminReviewDetailPageView.tsx`, `app/reports/report-banner.ts`, `components/layout/admin-sidebar.tsx` (logout import path unchanged)
- Test: `scripts/__tests__/admin-actions.test.ts` (import path → `@/app/reviews/actions`; spec §6.12 rewrite of the redirect case where needed), `scripts/__tests__/admin-review-banner.test.ts` (new)

**Interfaces:**
- Consumes: `updateReviewStatus` (with `acceptUntranslated`), `requeueJourneyReview`, `findNextPendingPublicId`, `parseReviewQueueTab`, `buildAdminReviewQueueHref`, `buildAdminReviewDetailHref`, `loadAdminReviewDetail`, `loadReportHistory`, `updateAdminUserStatusAction` (Task 8 changes its success redirect; the form contract `userId`, `status`, `reason`, `returnTo` is unchanged).
- Produces: `updatePublishedJourneyReviewAction(formData)` form fields: `returnTo`, `targetPublicId`, `reviewStatus` (`APPROVED|REJECTED|PENDING`, the clicked button's value), `publishOperationId?`, `acceptUntranslated?` (`"true"`), `queueStatus?` (a `ReviewQueueTab`), `stay?` (`"1"`).
- Produces: `resolveReviewBanner(options: { error: string | null; mutation: string | null; reviewStatus: AdminReviewStatus | null; targetPublicId: string | null }): (AdminDashboardBanner & { undoPublicId?: string }) | null` — success copy `"<id> approved."`, `"<id> rejected."`, `"<id> moved back to pending."`; `undoPublicId` set for approved/rejected; adds `review_requeue_unavailable` → "Translation queue unavailable. Nothing changed — try again."; other keys as today's `resolveBanner`.
- Produces: `resolveUserStatusBanner(options: { mutation: string | null; userStatus: string | null; error: string | null; message: string | null }): AdminDashboardBanner | null` — `banned` → "User banned. All their sessions were revoked."; `active` → "Ban lifted."; `inactive` → "Ban lifted. The account stays inactive until it accepts the required consents."; `user_update_failed` → `message` or "Could not update the user. Try again.". `resolveReportBanner` delegates to it.
- Produces (client): `ConfirmActionForm(props: { action: (formData: FormData) => Promise<never>; fields: Record<string, string>; triggerLabel: string; triggerVariant?: "default" | "destructive" | "outline"; disabled?: boolean; title: string; description: string; confirmLabel: string; children?: ReactNode /* extra inputs inside the dialog form */ })` — shadcn `AlertDialog`; the `<form action={action}>` with hidden `fields` lives inside the dialog content; the confirm button is a submit button disabled while `useFormStatus().pending`.

- [ ] **Step 1: Failing tests** (action; mocks as in Task 1 plus `@/lib/admin/review-queue` for `findNextPendingPublicId`):
  - `stays on returnTo without a queue context` — the existing success case; expected redirect unchanged: `/reviews/public-123?targetPublicId=public-123&mutation=review_updated&reviewStatus=APPROVED`.
  - `advances to the next pending journey` — `queueStatus=pending`, APPROVED, next `"public-456"` → `REDIRECT:/reviews/public-456?targetPublicId=public-123&mutation=review_updated&reviewStatus=APPROVED`.
  - `advances to the queue when nothing else is pending` — next `null` → `REDIRECT:/reviews?targetPublicId=public-123&mutation=review_updated&reviewStatus=REJECTED`.
  - `stay checkbox keeps the journey` — `stay=1` → returnTo redirect; `findNextPendingPublicId` not called.
  - `move to pending and approve-without-translation never advance` — `reviewStatus=PENDING` and `acceptUntranslated=true` (asserts `updateReviewStatus` received `acceptUntranslated: true`) → returnTo redirects.
  - `next lookup failure still reports the committed decision` — lookup rejects → queue redirect with the mutation entries.
  - `conflict stays on the journey` — `updateReviewStatus` rejects `BackendApiError(…, 400, "REVIEW_STATE_CONFLICT")` with `queueStatus=pending` → `REDIRECT:/reviews/public-123?targetPublicId=public-123&error=review_state_conflict`; lookup not called.
  - `session expiry during decision goes to login` — 401 → `clearAdminSession` called, `REDIRECT:/login?next=%2Freviews%2Fpublic-123&error=session_expired`.
  - `requeue 502 maps to review_requeue_unavailable`.
  - banner tests: the three success copies, `undoPublicId` only for approved/rejected, each `resolveUserStatusBanner` status.
- [ ] **Step 2:** `yarn test` → new cases FAIL.
- [ ] **Step 3:** Implement the action rules (spec §6.5): `advance = (APPROVED|REJECTED) && !acceptUntranslated && queueStatus === "pending" && !stay`; on advance redirect to `buildAdminReviewDetailHref(next, entries)` or `buildAdminReviewQueueHref({ entries })`; any lookup error → queue redirect; existing error mapping kept; requeue `502` → `review_requeue_unavailable`.
- [ ] **Step 4:** Detail page: `loadWorkspacePage` with `load` = `loadAdminReviewDetail` then, in parallel once `userId` is known, `loadReportHistory({targetType:"PUBLISHED_JOURNEY", targetId: publicId})` and `loadReportHistory({targetType:"USER", targetId: userId})`. View (spec §6.5): evidence column unchanged; sticky (`lg:sticky lg:top-4`) decision panel with three submit buttons named Approve / Reject / Move to pending (the current status's button disabled), hidden `publishOperationId` + `queueStatus` (the page's parsed tab, default `pending`) + `returnTo`, and a native `stay` checkbox "Stay on this journey"; banner with an Undo form (`reviewStatus=PENDING`, `targetPublicId=undoPublicId`, `returnTo` = current page URL without mutation keys, no `queueStatus`); translation box (only when `localizationPending || enqueueFailed`): "Pending since <updatedAt>", Retry translation form, and — unless status is `REJECTED` — `ConfirmActionForm` "Approve without translation" (fields `reviewStatus=APPROVED`, `acceptUntranslated=true`, `publishOperationId`, `targetPublicId`, `returnTo`; description: "Publishes the original text to every language now and posts an audit message to Slack."); a collapsed `<details>` "Translations" listing `localizedContent.entries` (locale, title, description) plus `localizationModel` / `publishedWithoutTranslation`; context panel: author name + `userId`, the two report lists (≤ 5 rows → report detail, "View all <total>" → `buildAdminReportsHref({targetType, targetId})`), and `ConfirmActionForm` "Ban author" (fields `userId`, `status=banned`, `returnTo`; optional `reason` input with hint "Sent to the API; not stored yet."; description names the user and says all sessions are revoked). Banner precedence: review banner, then `resolveUserStatusBanner`.
- [ ] **Step 5:** `yarn verify` → green.
- [ ] **Step 6:** Commit `feat(reviews): one-click decisions with auto-advance, translation and author context`.

### Task 8: Reports — filters, history, confirmed sanctions; article delete confirmation

**Files:**
- Modify: `app/reports/page.tsx`, `app/reports/AdminReportsListPageView.tsx`, `app/reports/[reportId]/page.tsx`, `app/reports/[reportId]/AdminReportDetailPageView.tsx`, `app/reports/actions.ts`, `app/articles/EditorialArticleEditorForm.tsx`
- Test: `scripts/__tests__/admin-report-actions.test.ts` (new), `scripts/__tests__/admin-reports.test.ts` (extend)

**Interfaces:**
- Consumes: `parseReportReason`, `REPORT_REASONS`, `loadReportHistory`, `buildAdminReportsHref` (`targetId`, `reporterId`), `ConfirmActionForm`, `resolveUserStatusBanner`.
- Produces: `updateAdminUserStatusAction` success redirect `mutation=user_status_updated&userStatus=<API result status>` (`banned|active|inactive`).

- [ ] **Step 1: Failing tests.**
  - actions: `user status success uses the API result status` (`updateAdminUserStatus` resolves `{userId:"u1",status:"inactive"}` for `status=active` → redirect contains `userStatus=inactive`); `admin target 403 is a banner, not a logout` (403 → `error=user_update_failed`, `clearAdminSession` not called); `deleted account 409 is a banner`.
  - paths/reports: `reports href carries reason, targetId, reporterId`.
- [ ] **Step 2:** `yarn test` → new cases FAIL.
- [ ] **Step 3:** Implement: list page parses `reason` (`parseReportReason`), `targetId`, `reporterId` (trimmed, passed through) and forwards them to `loadAdminReportsWorkspaceData`; view adds reason filter links (`REPORT_REASONS`) and an active-filter chip for `targetId`/`reporterId` with a clear link; detail page adds "Other reports on this target" (`loadReportHistory({targetType: report.targetType, targetId: report.targetId})`) and "Other reports by this reporter" (`loadReportHistory({reporterId: report.reporterId})`), excluding the current report from the rows, each with "View all <total>"; sanction control becomes `ConfirmActionForm` — target `BANNED` → "Unban" (`status=active`), `DELETED` → disabled button "Deleted account", otherwise "Ban" (`status=banned`, destructive), keeping the optional reason input with the "not stored yet" hint; success redirect uses the API result status. Article editor: the delete form becomes `ConfirmActionForm` (title "Delete this article?", description "Permanently deletes <title> in <language>. Other languages of its translation group are kept.", confirm "Delete article", destructive).
- [ ] **Step 4:** `yarn verify` → green.
- [ ] **Step 5:** Commit `feat(reports): reason/target filters, report history and confirmed sanctions`.

### Task 9: Remove dead public-web code

**Files:** Delete `lib/sitemap/` (5 files), `lib/i18n/dictionaries/` (10), `lib/i18n/metadata.ts`, `lib/editorial/public.ts`, `lib/editorial/seo.ts`, `lib/published-journey.ts`, `lib/published-image-variants.ts`, `lib/hashtags.ts`, `lib/cache-policy.ts`, `lib/api/public.ts`, `lib/api/index.ts`, `src/configs/env.client.ts`, `components/AppIcons.tsx`.

- [ ] **Step 1:** Re-run the reachability check (import graph from every `app/**/{page,layout,route}.tsx?` plus `next.config.ts`; a 30-line script in the scratchpad, not committed) and confirm each file above is still unreachable; any newly unreachable file from Tasks 5–8 is added to this list.
- [ ] **Step 2:** Delete them. `yarn verify && yarn build` → exit 0.
- [ ] **Step 3:** Commit `chore: remove public-web leftovers unreachable from the admin app`.

### Task 10: Documentation and ADRs

**Files:**
- Modify: `AGENTS.md`, `README.md`, `docs/DESIGN.md`, `docs/adr/README.md`, `docs/adr/0001-admin-app-ownership-and-runtime.md`, `docs/adr/0002-admin-auth-session-boundary.md`, `docs/adr/0005-moderation-workspace-and-review-evidence.md`
- Create: `docs/adr/0010-server-side-review-counts-and-workspace-shell.md` (via the `adr` skill)

- [ ] **Step 1:** AGENTS.md: real stack (table of spec §5 targets), root routes, scripts (`dev`, `build`, `lint`, `test`, `typecheck`, `verify`), shadcn CLI pin, ADR count 10. README: owned routes at root; Verification = `yarn verify && yarn build`.
- [ ] **Step 2:** DESIGN.md: replace the Astryx sections with "shadcn/ui (`new-york-v4`) on Tailwind v4": components live in `components/ui` and are added only with `npx shadcn@4.22.1 add <name>`, tokens in `app/globals.css`; update Product Surfaces to the root routes and the new screens; Moderation Workflow gains the attention model (spec §6.2–6.3), auto-advance/stay/undo, and the confirmation policy; drop the read-only-email login bullet (ADR 0008 removed it).
- [ ] **Step 3:** ADR 0001/0002/0005: correct paths (`app/login/actions.ts`, `app/session/*`, `app/_workspace/workspace-data.ts`, root routes, cookie path `/`, `globals.css`); 0005 marked "Amended by 0010" where it describes the full scan. ADR README: add 0010, remove the nonexistent `docs/CODEX.md` from Source Order, fix the route list.
- [ ] **Step 4:** ADR 0010 (context: §4.2–4.3 evidence; decision: server-side filters + `limit=1` totals, per-page shell for fresh counts, translation superset with explanation; alternatives rejected: full scan, layout badges (partial rendering), TanStack Table/Refine/React-admin, oldest-first tail fetch; consequences: API follow-ups of spec §9).
- [ ] **Step 5:** Commit `docs: align AGENTS, DESIGN and ADRs with the restructured admin`.

### Task 11: Final verification and review

- [ ] **Step 1:** `yarn verify && yarn build` → exit 0; record the test count.
- [ ] **Step 2: Visual QA (read-only — no decisions or sanctions on dev data)** with the `playwright-cli` / `visual-qa` skills against `yarn dev` pointed at the dev API: mint a `probe-admin` access token with `docker exec momentbook-dev-auth node -r tsconfig-paths/register dist/apps/auth/src/dev-session/dev-session-cli.js token --account probe-admin` into a scratchpad file (never print it), create the browser session by POSTing `{ user: { userId: "00000000-0000-7000-8000-00000000de0f" }, accessToken, refreshToken: accessToken }` to `/session` from a script that reads that file, then check at 1440×900: sidebar expanded width 16rem and collapsed icon rail 3rem with icons and tooltips, no clipped labels; at 390×844 the sidebar opens as a sheet; `/` tiles show the dev numbers (dev DB had 4 PENDING, 1 `localizationPending`); `/reviews?status=translation` lists `prKOwcXAkPkc`; a review detail shows the decision panel, translation box and context panel; no console errors.
- [ ] **Step 3:** Dispatch the `code-reviewer` agent with base SHA (the `develop` commit the branch started from), the change summary, and the spec path as requirements. Fix every 치명; record a disposition for each 주의/정보; re-review until no 치명.
- [ ] **Step 4:** Report to the user: what changed, evidence (commands + outputs), review dispositions, follow-ups from spec §9. No push or merge.
