# MomentBook Admin — Workspace Restructure Design

Date: 2026-10-21 · Status: Approved 2026-10-21 (builder-checked) · Repo: `momentbook-admin`

## 1. Intent

One admin uses this site on a desktop, almost only to **review published
journeys** before they go public. Slack tells the admin when something needs
attention; when the admin opens the site, the same work must be visible with
the same numbers and be actionable in place. Today that trust is broken:
Slack keeps reporting "1 journey" while the admin shows "0 pending", and the
desktop sidebar renders clipped.

The restructure makes the admin site:

1. **Trustworthy** — every attention count is computed from the same backend
   filters the alerts use, and every alerted item is reachable in ≤ 2 clicks.
2. **Fast to review** — the review screen is evidence-first with a one-click
   decision that advances to the next pending journey.
3. **Stable and consistent** — one stack aligned with `momentbook-web`,
   current shadcn/ui components generated for Tailwind v4, docs that match the
   code, a green test suite.
4. **Free to host** — every page makes a bounded number of backend calls so the
   app stays well inside Vercel Hobby limits as data grows.
5. **Using the admin API fully** — every option of the 14 existing admin
   endpoints that serves an admin task is wired into the UI.

## 2. Goals, non-goals, anti-goals

**Goals**

- Fix the clipped sidebar/drawer on desktop (root cause in §4.1).
- An "Attention" overview whose numbers reconcile with Slack alerts.
- A review queue backed by server-side filters and totals (no full scans).
- A review detail screen with direct decision buttons, next-item flow, the
  translation escape hatch (`acceptUntranslated`), translation retry, and the
  journey's/author's report history.
- Correct the hand-written API types where they drifted from the OpenAPI spec.
- One app shell (sidebar + header) shared by every workspace page.
- Remove dead public-web code; fix the 9 failing tests; update AGENTS.md,
  DESIGN.md and ADRs to match reality.

**Non-goals**

- No changes to `momentbook-api` (existing admin endpoints only).
- No public UX (ADR 0001 boundary stays).
- No new translation/SQS tooling beyond wiring existing endpoints — SQS is
  being retired soon (user, 2026-10-21).
- No UI localization; admin copy stays English (user-confirmed playback).
- No user directory/search screen (the API has no user list endpoint).
- No Prettier introduction / mass reformat (would bury the real diff).

**Anti-goals** (would be a failure even if it "works")

- An attention count that can disagree with what Slack reports for the same
  population, with no visible explanation.
- Any page whose backend call count grows with the number of journeys.
- Hiding a backend 401/403/409 behind a silent fallback.
- Decorative redesign that lowers density or evidence readability.

## 3. Constraints

- **Hosting:** Vercel Hobby. Limits (Vercel docs, updated 2026-09-14): 1M
  function invocations, 4 Active-CPU-hours, 360 GB-hrs provisioned memory per
  month, 300 s max duration, 1 h runtime log retention; Vercel Authentication
  deployment protection is available on Hobby. `images.unoptimized: true`
  stays (5K transformations/month cap).
- **Hobby is "non-commercial personal use only"** (Vercel Fair Use
  Guidelines). Whether MomentBook's admin qualifies is the owner's call —
  flagged in §9, not something this work changes.
- **Backend contract is fixed**: 14 `@AdminOnly()` operations in
  `momentbook-api/docs/openapi/core.json` (listed in §6.10).
- **Repository rules:** ADR 0002/0008 auth boundary (backend RBAC only,
  encrypted session cookie), ADR 0004 (no `revalidatePath`/`revalidateTag`),
  ADR 0007 (hand-written types in `src/apis/types`, services in `lib/api`).
- **Next.js partial rendering:** shared layouts do not re-render on
  navigation (Next.js docs: authentication guide, `staleTimes`), so counts
  that must be fresh after a mutation cannot live in a layout.

## 4. Current state (evidence gathered 2026-10-20/21)

### 4.1 Clipped drawer — root cause

`components/ui/*` are shadcn components written for **Tailwind v3**, running
on **Tailwind v4.3.3**. v4 changed CSS-variable arbitrary values from
`w-[--x]` to `w-(--x)`. The built CSS contains invalid declarations, e.g.
`.w-\[--sidebar-width\]{width:--sidebar-width}` (from
`.next/static/chunks/*.css`), so the sidebar's expanded (16rem) and icon
(3rem) widths never apply. The same v3 syntax exists in `select`
(`max-h-[--radix-select-content-available-height]`), `tooltip`,
`dropdown-menu`, `skeleton`. `tailwindcss-animate` (v3 plugin) is deprecated
by shadcn in favour of `tw-animate-css` (shadcn Tailwind v4 docs). The
official v4 sidebar (`ui.shadcn.com/r/styles/new-york-v4/sidebar.json`) uses
`w-(--sidebar-width)` and the unified `radix-ui` package.

### 4.2 Slack "1" vs admin "0"

- The repeating alert is `JourneyLocalizationHealthCheckService`
  (`momentbook-api`), every 15 min: count of `published = true AND
  reviewLocalizationPending = true AND updatedAt ≤ now − 6h`, **regardless of
  review status**. Dev logs show it firing for `publicId=prKOwcXAkPkc`
  (≈1449 h). Dev has no Slack webhook configured, so the user's Slack
  messages come from production (not inspected).
- Admin "pending" counts only `review.status = PENDING`; the default queue
  shows only PENDING; the overview "Translation pending" tile excludes
  REJECTED. A stuck APPROVED/REJECTED journey is invisible in the queue.
- The API offers the population without the age condition: `GET
  /core/admin/journeys/publish?localizationPending=true` (same
  `published = true` base, same column). Admin **list items do not carry
  `updatedAt`** (the admin select is `PUBLISHED_JOURNEY_LIST_SELECT_BASE +
  published + publishOperationId`; the OpenAPI field is "absent on surfaces
  that do not load it"), so the "older than 6 h" part cannot be computed from
  the list. The detail endpoint does return `updatedAt`.
- Republish keeps the first `publishedAt`/`createdAt`
  (`journey-publication.service.ts`), and PENDING items have no `decidedAt`,
  so the list has no "submitted at" timestamp: list order (`publishedAt
  desc`) is *first-publish* order, not submission order.

### 4.3 Data loading

`lib/admin/reviews.ts#readAllAdminReviewItems` pages through **every**
published journey (50 per call) and is called by **every** workspace page
(overview, review detail, reports list/detail, article list/detail/new) just
to compute summary counts and the sidebar badge. Call count and wall time grow
linearly with data.

### 4.4 API usage gaps

| Endpoint / option | Status today |
|---|---|
| `GET journeys/publish` `reviewStatus=APPROVED\|REJECTED` | unused (local filtering) |
| `GET journeys/publish` `localizationPending`, `enqueueFailed` | unused |
| `PATCH …/review` `acceptUntranslated` | unused, not in types |
| `PATCH …/review` `status=PENDING` | not offered in UI |
| `GET reports` `targetId`, `reporterId` | wrapper only, no UI |
| `PATCH users/:id/status` result `inactive` | not in types/UI |
| Report `reason` enum | **wrong**: admin `HARASSMENT, INAPPROPRIATE_CONTENT, COPYRIGHT`; API `ABUSE, HATE, SEXUAL, INAPPROPRIATE` → reason filter 400s, labels fall through |
| Report journey summary `visibility` | API `PUBLIC\|HIDDEN` (uppercase), admin types `string` |
| Detail `localizedContent`, `localizationModel`, `publishedWithoutTranslation` | fetched/normalized, never rendered |

### 4.5 Other defects

- Sidebar logo links to `/admin`, which does not exist (routes are at root).
- Four hand-copied sidebars (workspace, review detail, reports, articles) with
  different item sets (review detail has no "Reports").
- Tests: 9 of 22 fail — they mock `@/lib/admin/api`, removed by ADR 0007, so
  real `fetch` runs with an undefined base URL (`TypeError: Invalid URL`) or
  the action takes its error branch.
- Docs drift: AGENTS.md says Next 14 / React 18 / Astryx; DESIGN.md documents
  Astryx components; ADR 0001/0002/0005 use `/admin/*` and `app/admin/*`
  paths. Reality: Next 16.1.1, React 19.2.7, shadcn + Tailwind 4, root paths,
  cookie path `/`. Astryx was removed in `17ad75d` (2026-08-02).
- Dead code from the public web split — unreachable from any `app/` entry
  (page/layout/route) by an import-graph walk: `lib/sitemap/*` (5),
  `lib/i18n/dictionaries/*` (10), `lib/i18n/metadata.ts`,
  `lib/editorial/{public,seo}.ts`, `lib/published-journey.ts`,
  `lib/published-image-variants.ts`, `lib/hashtags.ts`, `lib/cache-policy.ts`,
  `lib/api/public.ts`, `lib/api/index.ts` (barrel nobody imports),
  `src/configs/env.client.ts`, `components/AppIcons.tsx`,
  `components/ui/{breadcrumb,dropdown-menu,form}.tsx`.

## 5. Stack baseline (decided)

Chosen for stability and parity with `momentbook-web` (installed versions in
that repo), not for "latest":

| Package | Now | Target | Why |
|---|---|---|---|
| next / eslint-config-next | 16.1.1 | **16.3.8** | = web; 16.3 line patched for 2 months (16.4.0 is 2 weeks old) |
| react / react-dom | 19.2.7 | **19.2.x latest patch** | = web line; Next 16.3 peer `^19` |
| typescript | 5.9.3 | 5.9.3 | = web; TS 6/7 not adopted |
| tailwindcss / @tailwindcss/postcss | 4.3.3 | 4.3.3 | = web |
| vitest | 4.1.10 | **4.1.x latest** | = web line (Vitest 5 not adopted) |
| shadcn components | v3-style "default" | **regenerated, `new-york-v4` registry** | fixes §4.1; current official output |
| tailwindcss-animate | 1.0.7 | **removed → tw-animate-css** | shadcn v4 guidance |
| @radix-ui/react-* (7 pkgs) | mixed | **radix-ui** (unified) | what shadcn v4 components import |
| lucide-react | 1.8.0 | 1.8.0 | = web |
| next-themes, jose, react-hook-form, sharp | keep | keep | no reason to move |

Scripts aligned with web: `test` (`vitest run`), `typecheck`
(`next typegen && tsc --noEmit`), `verify` (typecheck + lint + test).
No new runtime dependencies beyond `radix-ui` and `tw-animate-css`.

## 6. Design

### 6.1 Information architecture and routes

Routes stay at the root (current reality; ADRs corrected to match):

| Route | Screen |
|---|---|
| `/` | **Attention** overview (inbox + health) |
| `/reviews` | Review queue (becomes a real page; today it redirects to `/?tab=reviews`) |
| `/reviews/[publicId]` | Review detail + decision |
| `/reports`, `/reports/[reportId]` | Report queue / detail + sanction |
| `/articles`, `/articles/new`, `/articles/[articleId]` | Editorial CRUD (unchanged behaviour) |
| `/login`, `/session/*` | Auth (unchanged) |

Legacy `/?tab=reviews|reports|articles` links keep redirecting to the new
pages so bookmarks do not break.

Sidebar (one component): Attention · Reviews (badge: pending) · Reports
(badge: open) · Articles. Logo links to `/`.

### 6.2 Attention counts (one loader, every page)

A single `loadAttentionCounts(accessToken)` runs in parallel on every
workspace page render and feeds the sidebar badges and the overview:

| Count | Source call | Relation to Slack |
|---|---|---|
| Pending reviews | `journeys/publish?reviewStatus=PENDING&limit=1` → `total` | one "Review pending" message per publish |
| Translation pending | `journeys/publish?localizationPending=true&limit=1` → `total` | **superset** of the stale-translation alert's `count` (the alert only counts ones untouched > 6 h; translations normally land in minutes, so the two match except while a job is in flight) |
| Translation enqueue failed | `journeys/publish?enqueueFailed=true&limit=1` → `total` | recovery hint |
| Open reports | `reports/stats` → `openReports` (+ `pendingReports`, `reviewedReports`) | report alerts |

Because the list cannot tell how long a translation has been pending (§4.2)
and SQS is being retired, the admin does **not** try to reproduce the 6 h
"stuck" number. The Translation tile and tab say so in one line ("Slack alerts
on translations pending for more than 6 hours"), which satisfies the
anti-goal: any difference is visible and explained. The review detail page,
which has `updatedAt`, shows "translation pending since …". (Exact parity
needs an API change — follow-up in §9.)

Counts render in a per-page server component (`WorkspaceShell`), not in a
layout, so they are fresh after every mutation redirect (§3).

### 6.3 Attention overview (`/`)

- "Needs action" row: **Pending reviews**, **Translation pending** (with the
  one-line Slack note), **Open reports** (with "Pending N · Reviewed M"
  sub-links). Every number links to exactly the filtered queue URL whose
  `total` it is: Pending → `/reviews?status=pending`, Translation →
  `/reviews?status=translation`, report sub-links →
  `/reports?status=PENDING|REVIEWED`. The Open total itself has no single-URL
  equivalent (the API `status` filter takes one value), so it links to the
  report queue's default view and the sub-links carry the exact numbers. The
  row carries an "as of HH:MM" timestamp (R3). When all are zero: a short
  celebratory "All clear" state, distinct from a filter that matches nothing
  (R13, R14).
- No waiting-age indicator: the list has no submission timestamp (§4.2), so
  an age would be wrong for republished journeys.
- Health row (secondary): approved / rejected totals and approval rate (from
  `reviewStatus=…&limit=1` totals), report status breakdown (`reports/stats`).
- Recent intake (6 weeks, as today) is kept but loaded with a **bounded** newest-first
  scan that stops at the first item older than the window and is capped at a
  fixed number of pages. (My call — keeps an existing feature without a full
  scan.)

### 6.4 Review queue (`/reviews`)

- Tabs as URL state `?status=`: `pending` (default) · `translation` ·
  `approved` · `rejected` · `all`; each maps 1:1 to API filters and shows the
  API `total`. 20 rows per page; changing a tab resets `page` (R11).
- Every tab uses the API order (first published, newest first). An
  oldest-first queue (R1, R4) was considered and dropped: the API's sort key
  is the *first* publish time, so reversing it would not mean "waited
  longest" for republished journeys, and at the current volume order barely
  matters. True FIFO needs an API sort key (follow-up in §9).
- Columns: thumbnail, title, author id, photo count, first published at,
  review badge, translation badge (pending / enqueue failed) (R7).
- Rows link to detail carrying the queue context (`status`, `page`) for the
  back link.
- Plain server-rendered shadcn `Table` + link pagination; no TanStack Table
  (no client sorting/selection/bulk to justify it; R8).

### 6.5 Review detail (`/reviews/[publicId]`)

- Evidence-first main column (existing cluster/timeline/photo sections and
  lightbox are kept as is).
- Sticky decision panel (desktop): **Approve**, **Reject**, **Move to
  pending** as direct submit buttons named by their outcome (no radio + Save;
  R2). No confirmation dialog — each decision is reversible from this panel
  (R6). The `publishOperationId` snapshot is always sent;
  `REVIEW_STATE_CONFLICT` is a first-class state: an error banner saying the
  owner republished, and the page shows the new snapshot to decide again —
  never a silent overwrite or automatic retry (R5).
- **Auto-advance** (R1): after **Approve or Reject** made from the pending
  queue context (`status=pending`, the default), redirect to the next pending
  journey in queue order other than the one just decided
  (`reviewStatus=PENDING&limit=2`, first item whose `publicId` differs); if
  none, back to the queue with the "All clear" state. Every other case stays
  on the journey: Move to pending, Approve without translation, Retry
  translation, decisions made from another tab, and whenever the "Stay on
  this journey" checkbox (unchecked by default, not persisted) is ticked.
- The next screen shows a success banner for the decided journey with an
  **Undo** button (posts `status=PENDING` for that `publicId`, without a
  snapshot id). Note for the builder: undo restores the review state only —
  notifications the API already sent on approve/reject are not recalled; the
  banner copy must not promise more.
- Translation box (only when `localizationPending` or `enqueueFailed`):
  "pending since <detail `updatedAt`>", "Retry translation"
  (`POST …/review/requeue`; a 502 shows "queue unavailable, nothing changed —
  retry") and "Approve without translation" (`status: APPROVED,
  acceptUntranslated: true`, with the snapshot id) behind a confirmation
  dialog that states it publishes the original text to all locales and posts
  a Slack audit message. Offered only while the journey is not REJECTED
  (approving a rejected journey just to clear a translation flag would
  publish it).
- Translations section: the `localizedContent.entries` (title/description per
  locale) in a collapsed list, plus `localizationModel` /
  `publishedWithoutTranslation` diagnostics.
- Context panel (R2, R7 — keep the admin on one screen): author
  (`author.name`, `userId`), reports filed on this journey
  (`reports?targetType=PUBLISHED_JOURNEY&targetId=<publicId>`, `targetId` is
  the publicId) and on the author (`reports?targetType=USER&targetId=<userId>`),
  each a short list (≤ 5, with total) linking to report detail and to the full
  filtered report queue.
- **Ban author** in the context panel (`PATCH admin/users/:userId/status`)
  behind an AlertDialog that names the account and states that all its
  sessions are revoked (R6). Backend 403 (admin target / self) and 409
  (deleted / not banned) are shown as error banners. Only "Ban" is offered
  here because the journey detail does not carry the author's account
  status; unban stays on report detail, which has it.
- No full scan: detail + 2 report lists + attention counts.
- No review notes or reason presets: the review PATCH has no field to store
  them (API limitation, not a design choice).
- No keyboard shortcuts in this round (my call: review volume is low — the
  queue was empty when last used — so one-click buttons + auto-advance give
  most of the value; shortcuts can be added later following WCAG 2.1.4: an
  off switch, inactive inside inputs).

### 6.6 Reports

- Fix the `ReportReason` enum and labels; filters for status, target type,
  reason (all API query params).
- Report detail: "Other reports on this target" (`targetId`) and "Other reports
  by this reporter" (`reporterId`) lists.
- Resolution status and the account sanction stay on the same screen (R7).
  The sanction button reflects the target's current status — **Ban** for an
  active/inactive account, **Unban** for a banned one, disabled with a reason
  for deleted accounts (R9) — behind an AlertDialog that names the account
  (R6), and the banner shows the real resulting status (`banned`, `active`, or
  `inactive` = still owes consents).
- A resolved/rejected report can be moved back to pending/reviewed (the API
  clears `resolvedAt`/`resolvedBy`; R10) — already possible via the status
  control, kept.

### 6.7 Articles

Behaviour unchanged (ADR 0006). Only the shell, regenerated components, and
removal of the full-scan badge load.

### 6.8 Shell and components

- `components/ui/*` regenerated from the shadcn `new-york-v4` registry
  (`components.json` style updated); `tw-animate-css` imported in
  `globals.css`; MomentBook theme tokens re-applied on top. Components that
  the new screens need and the repo lacks (`alert-dialog`, `tabs`,
  `checkbox`, …) come from the same registry.
- One `AdminSidebar` with a single nav definition (sidebar-07 pattern, R8):
  every item has a lucide icon so the collapsed icon rail shows icons with
  tooltips instead of clipped text; counts use `SidebarMenuBadge`; the
  built-in ⌘B toggle and `sidebar_state` cookie are kept. Desktop starts
  **expanded** unless the cookie says otherwise (today it is forced
  collapsed). Mobile keeps the sheet.
- One `WorkspaceShell` server component used by every workspace page (renders
  sidebar + header + attention counts).

### 6.9 Backend call budget (per page render)

| Page | Calls |
|---|---|
| Any workspace page (counts) | 4 |
| `/` overview | +2 totals (approved, rejected) +≤ N bounded intake pages |
| `/reviews` | +1 list + ≤ 3 `limit=1` tab totals (approved, rejected, all) |
| `/reviews/[publicId]` | +1 detail +2 report lists |
| Decision action | 1 PATCH + 1 next-item lookup (`limit=2`) |
| Ban from review detail | 1 PATCH |
| `/reports*`, `/articles*` | unchanged own calls (no journey scan) |

No call count depends on the number of journeys.

### 6.10 API coverage after the change

| Operation | Used by |
|---|---|
| GET `admin/journeys/publish` (+ all 3 filters) | counts, overview, queue tabs, next-item |
| GET `admin/journeys/publish/:publicId` (+ `lang`) | review detail |
| PATCH `…/review` (+ `publishOperationId`, `acceptUntranslated`, all 3 statuses) | decision panel |
| POST `…/review/requeue` | translation box |
| GET/POST/GET/PATCH/DELETE `admin/articles*` | articles (unchanged) |
| GET `admin/reports` (+ all 5 filters) | report queue, detail history, review context |
| GET `admin/reports/stats` | counts, overview |
| GET/PATCH `admin/reports/:id` | report detail |
| PATCH `admin/users/:id/status` (`banned`/`active`) | report detail sanction, review detail "Ban author" |

All 14 operations and every query/body option are used.

### 6.11 Contract corrections (`src/apis/types`)

`ReportReason`, journey-summary `visibility` (`PUBLIC|HIDDEN`),
`acceptUntranslated`, `AdminUserStatusDataDto.status` (`banned|active|
inactive`), `localizationModel`, `publishedWithoutTranslation`; any other
field the builder finds differing from `core.json` while touching a type.

### 6.12 Tests and verification

- Step 1 (before any behaviour change): repair the 9 failing tests by
  mocking the modules that exist (`@/lib/api/*`), keeping their assertions,
  so the suite is green on the current behaviour.
- Tests whose assertions encode behaviour this design intentionally replaces
  are **rewritten**, not deleted, when that behaviour changes — approval of
  this document covers exactly these:
  - `admin-reviews.test.ts` "builds summary counts from the full dataset and
    paginates the filtered queue" → asserts the new server-side filters and
    totals instead of a full scan.
  - `admin-reviews.test.ts` "normalizes legacy metadata aliases and keeps
    detail lookup independent from the active filter" → its alias and
    detail assertions are kept (split between the queue loader and the detail
    loader); only its `toHaveBeenCalledTimes(2)` full-scan call count changes.
  - `admin-reviews.test.ts` evidence/detail cases (4) keep their assertions;
    only the data-loading entry point they call may change.
  - `admin-reports.test.ts` "returns human-readable labels for report
    statuses and reasons" → asserts the API's reason values (`ABUSE`, `HATE`,
    `SEXUAL`, `INAPPROPRIATE`, …) instead of `HARASSMENT`.
  - `admin-actions.test.ts` review-update redirect → asserts the new
    auto-advance/stay redirects.
  Any other test that starts failing is a stop-and-ask, not a rewrite.
- New tests (vitest, node env) for: attention-count loader (filters sent),
  queue tab → API filter mapping, decision action (status,
  `acceptUntranslated`, conflict banner, auto-advance vs stay rules), ban
  action error mapping, report reason parsing.
- Gate: `yarn typecheck`, `yarn lint`, `yarn test`, `yarn build`; visual check
  of sidebar expanded/collapsed at desktop width and the mobile sheet.

### 6.13 Docs

AGENTS.md (real stack, routes, scripts), DESIGN.md (shadcn/Tailwind v4 instead
of Astryx, attention model, review flow), ADR 0001/0002/0005 corrections, new
ADR 0010 (server-side queue counts + unified shell), ADR index.

## 7. Decisions and who made them

**User:** primary use is journey review on desktop; drawer clipping must be
fixed; Slack/admin mismatch must be resolved; SQS is going away, so keep the
translation side shallow; playback accepted (no API changes, no public UX,
English copy, keep stack family, Vercel Hobby).

**My calls (review these):**

1. Pin Next 16.3.8 / React 19.2.x / Vitest 4.1 to match web, not latest.
2. Root routes kept; ADRs corrected instead of moving routes back to `/admin`.
3. `/` becomes the Attention overview; `/reviews` becomes a real page.
4. Queue keeps the API order (oldest-first dropped, §6.4); Approve/Reject
   from the pending queue auto-advances to the next pending journey, with a
   "Stay on this journey" opt-out and an Undo banner.
4b. Translation tile/tab show the API's `localizationPending` total (a
   superset of Slack's > 6 h count) with a one-line explanation, instead of
   changing the API to get exact parity.
5. Approve / Reject / Move to pending without confirmation; Ban, Unban,
   Approve-without-translation and article delete behind an AlertDialog.
6. "Ban author" added to review detail (new placement of an existing API).
7. Journey/author report history on review detail.
8. Keep the 6-week intake chart via a bounded scan.
9. Desktop sidebar starts expanded, icons on every item.
10. Not doing: keyboard shortcuts, TanStack Table, nuqs, Refine/React-admin,
    Prettier.

## 8. Left to the builder

- Exact visual layout, spacing, copy wording (keep it short and operational,
  English), icons, badge colours, within shadcn defaults + existing theme
  tokens.
- How the bounded intake scan is capped (page cap value; dedupe by
  `publicId` when items shift between pages).
- File/module layout inside `lib/admin` and `app/`, provided ADR 0007 layering
  holds (types in `src/apis/types`, HTTP in `lib/api`, view-model shaping in
  `lib/admin`, server actions next to their routes).
- Order of work, as long as each step leaves `typecheck`, `lint` and `test`
  green.
- Whether `/?tab=…` legacy redirects live in `app/page.tsx` or
  `next.config.ts` `redirects()`.

## 9. Risks and follow-ups (outside this repo)

- **Vercel Hobby commercial-use clause** — owner to confirm eligibility or
  move to Pro; nothing in this design depends on Pro.
- **REJECTED + stuck translation keeps alerting**: the API health check
  ignores review status, so a rejected journey with
  `reviewLocalizationPending = true` alerts forever; the admin can only retry
  the translation. Fix belongs in `momentbook-api` (likely moot after the SQS
  retirement).
- Production's stuck journey was not inspected; after deploy the admin's
  "Translation pending" tile and tab should show it.
- **API follow-ups that would remove this design's compromises** (not done
  here — no API changes): `updatedAt` (or a submitted-at field) on admin list
  items, a submission-time sort for a true FIFO queue, a multi-value report
  `status` filter so "Open" has one exact URL.
- Production value of `JOURNEY_REVIEW_LOCALIZATION_STALE_THRESHOLD_MS` is
  unknown (확인 필요); it only affects the explanatory copy now, not a
  count.

## 10. References

Official/vendor sources first. "확인 필요" = could not be verified directly.

- R1 Zendesk, *Setting up Guided mode* (auto-advance to the next ticket,
  "stay on ticket") — https://support.zendesk.com/hc/en-us/articles/4408825479066 ;
  Moderation API, *Using queues* (action → next pending; Pending/Resolved/All
  tabs) — https://docs.moderationapi.com/review-queues/using-queues
- R2 Stripe Radar, *Reviews* (list → detail, next/previous, related payments,
  outcome-named actions) — https://docs.stripe.com/radar/reviews ; Linear,
  *Triage* — https://linear.app/docs/triage
- R3 Next.js, *Server Actions* / partial rendering (fresh UI in the action
  response; layouts not re-rendered on navigation) —
  https://nextjs.org/docs/app/guides/server-actions ,
  https://nextjs.org/docs/app/guides/authentication
- R4 Reddit Help, *Moderation queue* (oldest/newest/most-reported sort, user
  panel) — https://support.reddithelp.com/hc/en-us/articles/15484640563860
  (확인 필요: page returned 403, verified from search snippets)
- R5 *In the Queue* (arXiv 2025, survey of 110 moderators: context switching,
  multi-step actions, collisions) — https://arxiv.org/html/2509.07314v1
- R6 NN/g, *Confirmation dialogs* — https://www.nngroup.com/articles/confirmation-dialog/ ;
  Primer, *Delete pattern* — https://primer.style/product/scenario-patterns/delete ;
  shadcn *Alert Dialog* — https://ui.shadcn.com/docs/components/alert-dialog
- R7 Shopify, *Fraud analysis* (row warning badges, detail risk section) —
  https://help.shopify.com/en/manual/orders/fraud-analysis ; GitLab, *Abuse
  reports* — https://docs.gitlab.com/administration/review_abuse_reports/
- R8 shadcn *Blocks* / *Sidebar* / *Data Table* —
  https://ui.shadcn.com/blocks , https://ui.shadcn.com/docs/components/sidebar ,
  https://ui.shadcn.com/docs/components/data-table ; Refine and React-admin
  evaluated and rejected (client-side frameworks duplicating the server-action
  layer; React-admin's default undoable mode delays the request 5 s) —
  https://refine.dev/core/docs/routing/integrations/next-js/ ,
  https://marmelab.com/react-admin/Edit.html
- R9 GitLab abuse reports (button reflects account state, "Already blocked")
- R10 GitHub, *Managing reported content* (resolved → unresolved) —
  https://docs.github.com/en/communities/moderating-comments-and-conversations/managing-reported-content-in-your-organizations-repository
- R11 Next.js Learn, *Adding Search and Pagination* (URL state, reset page) —
  https://nextjs.org/learn/dashboard-app/adding-search-and-pagination ;
  `next/form` — https://nextjs.org/docs/app/api-reference/components/form
- R12 Stack Internal review-queue danger threshold —
  https://support.stackenterprise.co/support/solutions/articles/22000294374
- R13 Atlassian, *Empty state* —
  https://atlassian.design/foundations/content/designing-messages/empty-state
- R14 GitLab Pajamas, *Empty states* (no data vs. no results) —
  https://design.gitlab.com/regions/empty-states
- Stack: shadcn *Tailwind v4* — https://ui.shadcn.com/docs/tailwind-v4 ;
  Next.js *Upgrading to v16* (async request APIs, proxy) —
  https://nextjs.org/docs/app/guides/upgrading/version-16 ; Vercel *Hobby
  plan* — https://vercel.com/docs/plans/hobby ; Vercel *Fair use guidelines*
  (commercial usage) — https://vercel.com/docs/limits/fair-use-guidelines
