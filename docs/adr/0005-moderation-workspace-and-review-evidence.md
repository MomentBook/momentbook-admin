# 0005: Moderation Workspace and Review Evidence

## Status

Active.

## Decision

> **Amended by [0010](0010-server-side-review-counts-and-workspace-shell.md):**
> review data is loaded with server-side filters and `limit=1` totals instead of
> a full scan, and every workspace page renders through a per-page
> `WorkspaceShell`. Routes live at the root (`/`, `/reviews`, …), not under
> `/admin`.

> **Amended by [0014](0014-source-layout-and-layer-boundaries.md) and [0015](0015-library-adoption.md):** 2026-11-16, the code moved under
> `src/` (paths below updated) and fullscreen photos use
> `yet-another-react-lightbox`.

The moderation workspace is an operational admin surface optimized for queue
health, evidence inspection, and review status mutation. The default review
filter is pending.

## Implementation Shape

- `/` renders the attention overview; legacy `/?tab=reviews|reports|articles`
  links redirect to `/reviews`, `/reports`, and `/articles`.
- `/reviews` renders the review queue with `?status=` tabs (`pending` default,
  `translation`, `approved`, `rejected`, `all`) and `?page=`.
- `renderWorkspacePage` (`src/components/layout/workspace-page.tsx`, over
  `loadWorkspacePage` in `src/lib/workspace/load-workspace-page.ts`) loads the
  session and attention counts and handles 401/403 for workspace pages. Each
  route reads its query with its loader in `src/lib/navigation/<screen>-routes.ts`,
  and banners are resolved per screen through `resolveFlash`
  (`src/features/reviews/flash.ts`, `src/features/reports/flash.ts`).
- ~~`lib/admin/reviews.ts` loads all admin published journey pages with backend
  pagination limit 50, deduplicates by `publicId`, builds summary counts from
  the full dataset, filters/paginates the visible queue locally.~~ Replaced by
  [0010](0010-server-side-review-counts-and-workspace-shell.md):
  `src/features/reviews/queue-loader.ts` (queue),
  `src/lib/workspace/attention.ts` (counts), `src/features/overview/loader.ts`
  (overview); the detail loader is `src/features/reviews/loader.ts`, with its
  view model in `detail-model.ts`.

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
- Fullscreen photo inspection uses `ReviewPhotoGallery`
  (`src/features/reviews/components/review-photo-gallery.tsx`;
  `yet-another-react-lightbox` with Zoom, Counter and Captions, ADR 0015): one
  gallery per evidence section with previous/next, zoom, pan, pinch and
  double-tap, the photo count, the location caption, and close controls.

## Review Mutation

- `updatePublishedJourneyReviewAction` (`src/features/reviews/actions.ts`,
  through `runAdminAction`) validates
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
