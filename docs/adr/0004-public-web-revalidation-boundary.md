# 0004: Public Web Freshness Boundary

## Status

Active.

## Decision

`momentbook-web` serves public journeys, guides, images, and sitemaps through
its no-cache rendering policy. After a successful Nest API mutation, the admin
app does not call a public-web webhook and does not import Next.js cache
invalidation APIs.

## Implementation Shape

- Admin review and editorial actions redirect with their backend mutation
  result only.
- The admin app has no `WEB_REVALIDATION_URL` or `WEB_REVALIDATION_SECRET`
  runtime configuration.
- The public web owns dynamic/no-store rendering and sitemap freshness. This
  admin repository remains responsible only for admin mutation UX.

## Consequences

- A completed backend mutation is immediately eligible for display on a new
  public-web request; the admin UI does not show a separate cache-warning
  state.
- Admin code must not import `revalidatePath`, `revalidateTag`, or `updateTag`.
- Public freshness changes require coordinated verification in `momentbook-web`;
  admin mutation changes should run their focused action tests.
