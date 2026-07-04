# 0005: Moderation Workspace and Review Evidence

## Status

Active.

## Decision

The moderation workspace is an operational admin surface optimized for queue
health, evidence inspection, and review status mutation. The default review
filter is pending.

## Implementation Shape

- `/admin` parses the workspace tab and redirects article tabs to
  `/admin/articles`.
- `/admin/reviews` preserves relevant queue and mutation query parameters and
  redirects to the reviews tab.
- `app/admin/workspace-data.ts` centralizes query parsing, banner resolution,
  session loading, and 401/403 redirects for workspace pages.
- `lib/admin/reviews.ts` loads all admin published journey pages with backend
  pagination limit 50, deduplicates by `publicId`, builds summary counts from
  the full dataset, filters/paginates the visible queue locally, and optionally
  loads detail independently from the active filter.
- `AdminWorkspace` renders overview and review list panels using the shared
  sidebar and admin path helpers.

## Review Detail and Evidence

- `/admin/reviews/[publicId]` decodes the public ID, resolves optional `lang`
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
- Fullscreen photo inspection uses `FullscreenImageDialog` with zoom, pan,
  pinch/double-tap behavior, and close controls.

## Review Mutation

- `updatePublishedJourneyReviewAction` validates `targetPublicId` and
  `reviewStatus`, requires an admin action session, calls the backend review
  mutation, requests public web revalidation, then redirects with mutation,
  review status, target ID, and optional `revalidation=failed`.

## Consequences

- Keep review query normalization in path/workspace helpers rather than inline
  URL construction.
- Preserve evidence-first detail UX, explicit empty states, long ID wrapping,
  and fullscreen image fit/focus behavior.
- Review workspace changes should run:
  `yarn vitest run scripts/__tests__/admin-reviews.test.ts scripts/__tests__/admin-actions.test.ts scripts/__tests__/admin-paths.test.ts`
