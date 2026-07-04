# 0004: Public Web Revalidation Boundary

## Status

Active.

## Decision

Admin mutations that affect public visibility or public editorial content must
request cache revalidation from the public MomentBook web app through the signed
webhook in `lib/admin/revalidation.ts`.

Admin mutations must not import `revalidatePath`, `revalidateTag`, or
`updateTag` directly.

## Implementation Shape

- `requestWebRevalidation` normalizes and sorts paths/tags, signs
  `timestamp.body` with `WEB_REVALIDATION_SECRET`, and posts to
  `WEB_REVALIDATION_URL`.
- Missing webhook URL/secret, invalid webhook URL, network failure, or non-OK
  webhook responses return `false`.
- A failed revalidation request does not roll back a successful backend
  mutation. The admin UI receives the warning query `revalidation=failed`.

## Journey Review Revalidation

`updatePublishedJourneyReviewAction`:

- captures journey sitemap chunks before and after mutation
- loads previous and next journey detail photo IDs when available
- revalidates localized home paths, localized journey lists, localized journey
  detail paths, localized photo paths, `/sitemap.xml`, affected journey sitemap
  chunks, and the `published-journeys-sitemap` tag

## Editorial Article Revalidation

Article create/update/delete actions:

- capture guide sitemap chunks before and after mutation
- load previous and next article records when relevant
- revalidate localized guide listing paths, affected localized guide detail
  paths including published alternates, `/sitemap.xml`, affected guide sitemap
  chunks, and the `published-guides-sitemap` tag

## Consequences

- Public web revalidation is best effort after backend success.
- UI banners must distinguish mutation success from revalidation warning.
- Adding a new public-affecting admin mutation requires explicit path/tag
  collection and focused tests.
- Revalidation changes should run:
  `yarn vitest run scripts/__tests__/admin-actions.test.ts scripts/__tests__/admin-article-actions.test.ts`

