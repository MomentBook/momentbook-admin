# 0005: Moderation Workspace and Review Evidence

## Status

Active.

## Decision

> **Amended by [0010](0010-server-side-review-counts-and-workspace-shell.md):**
> review data is loaded with server-side filters and `limit=1` totals instead of
> a full scan, and every workspace page renders through a per-page
> `WorkspaceShell`. Routes live at the root (`/`, `/reviews`, …), not under
> `/admin`.

The moderation workspace is an operational admin surface optimized for queue
health, evidence inspection, and review status mutation. The default review
filter is pending.

## Implementation Shape

- `/` renders the attention overview; legacy `/?tab=reviews|reports|articles`
  links redirect to `/reviews`, `/reports`, and `/articles`.
- `/reviews` renders the review queue with `?status=` tabs (`pending` default,
  `translation`, `approved`, `rejected`, `all`) and `?page=`.
- `app/_workspace/workspace-data.ts` centralizes query parsing, session
  loading, attention counts, and 401/403 redirects for workspace pages
  (`loadWorkspacePage`); banners are resolved next to each route
  (`app/reviews/review-banner.ts`, `app/reports/report-banner.ts`).
- ~~`lib/admin/reviews.ts` loads all admin published journey pages with backend
  pagination limit 50, deduplicates by `publicId`, builds summary counts from
  the full dataset, filters/paginates the visible queue locally.~~ Replaced by
  [0010](0010-server-side-review-counts-and-workspace-shell.md):
  `lib/admin/review-queue.ts` (queue), `lib/admin/attention.ts` (counts),
  `lib/admin/overview.ts` (overview); `lib/admin/reviews.ts` keeps
  normalization and the detail loader.

## Review Detail and Evidence

- `/reviews/[publicId]` decodes the public ID, resolves optional `lang`
  through supported languages, passes locale tags such as `ko-KR` to the admin
  detail endpoint, and redirects missing details back to the review queue.
- Detail moderation fields prefer the admin detail payload over list-item
  projections.
- Evidence normalization merges photos from `images`, `timeline`, and
  `recapDraft.timeline`.
- Photo variants preserve `fullUrl`, `displayUrl`, and `thumbnailUrl`; missing
  variants fall back to the best available URL.
- Timeline and recap sections with the same cluster ID merge into a single
  evidence section. Unattached photo assets are shown in a remaining-photos
  section.
- Fullscreen photo inspection uses `LightboxPhotoTile`
  (`app/reviews/[publicId]/LightboxPhotoTile.tsx`) with zoom, pan,
  pinch/double-tap behavior, and close controls.

## Review Mutation

- `updatePublishedJourneyReviewAction` (`app/reviews/actions.ts`) validates
  `targetPublicId` and `reviewStatus`, requires an admin action session, calls
  the backend review mutation, then redirects with mutation, review status, and
  target ID. The public web's no-cache policy exposes the updated content.
- Approve and Reject sent from the pending queue (`queueStatus=pending`) open
  the next pending journey unless `stay=1`; Move to pending and
  `acceptUntranslated=true` never advance. `requeueJourneyReviewAction` re-queues
  the translation.

## Consequences

- Keep review query normalization in path/workspace helpers rather than inline
  URL construction.
- Preserve evidence-first detail UX, explicit empty states, long ID wrapping,
  and fullscreen image fit/focus behavior.
- Review workspace changes should run `yarn verify`.
