# 0010: Server-Side Review Counts and Workspace Shell

## Status

> **Amended by [0011](0011-operator-surfaces-users-comments-metrics-audit.md):**
> 2026-10-23, the call budget table below gains the operator pages and the
> author-filtered review queue.

Active. Date: 2026-10-22. Amends [0005](0005-moderation-workspace-and-review-evidence.md)
(review data loading) and [0009](0009-reports-moderation-and-user-sanction.md)
(sidebar and overview placement).

## Context

- **Full scan on every page.** `readAllAdminReviewItems` paged through every
  published journey (50 per call) on every workspace page — overview, review
  detail, reports, articles — only to compute summary counts and the sidebar
  badge. Call count and wall time grew linearly with the data.
- **Slack showed 1, the admin showed 0.** The repeating Slack alert is the API's
  `JourneyLocalizationHealthCheckService`: every 15 minutes it counts
  `published = true AND reviewLocalizationPending = true AND updatedAt ≤ now − 6h`,
  regardless of review status. The admin counted only `review.status = PENDING`,
  so a stuck APPROVED or REJECTED journey was invisible.
- The admin list endpoint already filters server-side (`reviewStatus`,
  `localizationPending`, `enqueueFailed`) and returns `total`, but admin list
  items do not carry `updatedAt`, so the 6-hour age cannot be computed from the
  list. The detail endpoint does return `updatedAt`.
- Next.js layouts are not re-rendered on client navigation (partial rendering),
  so counts rendered in a layout go stale after a mutation redirect.
- Constraints: no `momentbook-api` changes, Vercel Hobby, and the SQS translation
  pipeline is being retired, so translation handling stays shallow.

## Decision

1. **Counts come from server-side filters with `limit=1` totals.**
   `loadAttentionCounts` (`lib/admin/attention.ts`) makes four calls per page
   render: `journeys/publish?reviewStatus=PENDING&limit=1`,
   `?localizationPending=true&limit=1`, `?enqueueFailed=true&limit=1`, and
   `reports/stats`. A failing `reports/stats` (other than 401/403) hides the
   report badge instead of failing the page.
2. **Each screen loads only what it shows.** The review queue
   (`lib/admin/review-queue.ts`) maps each tab (`pending`, `translation`,
   `approved`, `rejected`, `all`) 1:1 to API filters, 20 rows per page; the
   active tab's total comes from its own list, the other tabs from `limit=1`
   totals. The review detail calls only the detail endpoint plus two report
   history lists. The overview (`lib/admin/overview.ts`) adds approved and
   rejected totals and a newest-first intake scan bounded to
   `INTAKE_PAGE_CAP` pages over six UTC weeks. The decision action's next-item
   lookup is `reviewStatus=PENDING&limit=2`.
3. **A per-page `WorkspaceShell`, not a layout, renders the shell.**
   `components/layout/workspace-shell.tsx` (server component) renders the one
   `AdminSidebar` with badges from the counts the page itself loaded, through
   `loadWorkspacePage` (`app/_workspace/workspace-data.ts`), so every mutation
   redirect shows fresh counts. The sidebar receives only the account label —
   never the session — because it is a client component and its props are
   serialized into the page payload.
4. **Translation pending is the API's `localizationPending` total.** It is a
   superset of the Slack alert's count: the alert only counts translations
   untouched for more than six hours, and translations normally land in
   minutes. The overview tile and the queue tab state this in one line
   (`SLACK_TRANSLATION_NOTE`), and the review detail shows "Pending since
   <updatedAt>".

### Backend call budget per page render

| Page | Calls |
| --- | --- |
| Any workspace page (counts) | 4 |
| `/` overview | + 2 totals + ≤ `INTAKE_PAGE_CAP` intake pages |
| `/reviews` | + 1 list + ≤ 3 `limit=1` tab totals |
| `/reviews/[publicId]` | + 1 detail + 2 report lists |
| Review decision action | 1 PATCH + 1 next-item lookup (`limit=2`) |
| `/reports*`, `/articles*` | their own calls; no journey scan |

No call count depends on the number of journeys.

## Alternatives Considered

- **Keep the full scan** — rejected: cost grows with every published journey and
  every page paid it for a badge.
- **Counts in `app/layout.tsx`** — rejected: layouts are not re-rendered on
  navigation, so badges would be stale right after a decision or a ban.
- **TanStack Table, Refine, or React-admin** — rejected: the queue has no client
  sorting, selection, or bulk actions to justify a table engine, and an admin
  framework's data-provider layer would sit on top of a 14-operation API that
  `lib/api` already wraps (ADR 0007).
- **Oldest-first queue by fetching the list tail** — rejected: the API's sort
  key is the first publish time, so reversing it does not mean "waited longest"
  for republished journeys, and it costs extra calls.
- **Reproduce the 6-hour stale count** — rejected: list items lack `updatedAt`,
  so it would need a detail call per pending translation; exact parity needs an
  API change.

## Consequences

- Positive: page cost is constant (see the budget above); counts and the Slack
  alert are reconcilable, and any difference is explained on screen; the queue
  surfaces stuck APPROVED and REJECTED translations through the `translation`
  tab.
- Negative: the Translation count can exceed Slack's while a job is in flight;
  queue order is first-publish order, not submission order; the "Open reports"
  total has no single filtered URL (the API `status` filter takes one value),
  so the overview links its Pending and Reviewed parts instead.
- API follow-ups that would remove these compromises (not done here):
  `updatedAt` or a submitted-at field on admin list items, a submission-time
  sort for a true FIFO queue, and a multi-value report `status` filter.
- Review workspace changes should run `yarn verify`, plus `yarn build` for
  routing or shell changes.
