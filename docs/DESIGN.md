# Design Intent

MomentBook Admin is an operational backoffice surface for moderation and editorial work. It should be dense, scannable, restrained, and task-first. Do not turn it into a marketing site, public community surface, or public journey consumption UI.

## Product Surfaces

- `/admin/login`: locked admin sign-in with the allowed email displayed as read-only and password entry for the admin account.
- `/admin`: admin overview with queue health, pending review count, recent submissions, status distribution, and admin context.
- `/admin/reviews`: moderation queue with status filters, pagination, journey identifiers, visibility, photo counts, and direct links to evidence review.
- `/admin/reviews/[publicId]`: evidence-first journey moderation detail with photo sections, fullscreen image inspection, status controls, and mutation banners.
- `/admin/articles`: editorial article management for published-only markdown guide records, with language/category filters, derived summary/cover/reading-time display, create/edit/delete workflows.
- Admin session routes handle refresh and invalidation; they are not user-facing product pages.

## UX Principles

- Optimize for admin speed and correctness over persuasion.
- Keep copy concise and operational. Avoid onboarding prose that explains obvious controls.
- Preserve current English admin UI copy unless a task explicitly changes localization or copy strategy.
- Use clear status chips, summary metrics, filters, pagination, and banners.
- Keep cards purposeful: repeated records, metrics, panels, modals, or framed tools. Avoid decorative nested cards.
- Preserve responsive behavior, horizontal table scrolling, text wrapping, and stable CTA placement.
- Maintain light/dark theme compatibility through existing theme tokens and `data-theme` behavior.
- Preserve noindex metadata and admin-only chrome.

## Moderation Workflow

- The overview should guide admins toward pending review work first.
- Review list filters default to pending and must preserve safe admin query normalization.
- Review detail should prioritize evidence inspection: title, IDs, review status, cluster/photo evidence, and fullscreen photo viewing.
- Empty, loading, failed, and post-mutation states should be explicit and low-noise.
- When a review update succeeds but public web revalidation fails, show an admin warning while keeping the mutation success intact.

## Editorial Workflow

- Articles are admin-managed editorial guide records, not public marketing pages in this repository.
- The article list should make current filters, pagination, language/category, derived fields, route, cover availability, and reading time visible.
- Article editor changes must preserve server-derived summary, cover image, and reading-time assumptions unless the backend contract changes.
- Public guide consumption and public SEO rendering remain owned by the public web app.

## Auth, Permissions, and Session UX

- Login must keep the allowed admin email visible and read-only.
- Session expiry and access denial should redirect through admin login/session routes with clear notices.
- Sign-out should clear the local admin session even if backend logout fails.
- Never hide backend/RBAC failures behind silent fallbacks.

## Interaction Risks to Check After UI Changes

- Theme: light/dark contrast, token use, and no hardcoded one-off colors that break either theme.
- Auth: login, expired session, denied session, refresh redirect, and sign-out.
- Permissions: backend 401/403 mapping to session invalidation or access-denied notices.
- i18n/overflow: long IDs, emails, article titles, category labels, and table content.
- Overlays/modals: fullscreen image dialog open/close focus, labels, and viewport fit.
- Footer/CTA behavior: submit buttons, destructive actions, pagination, filter chips, and return links.

## Out of Scope Patterns

- Public marketing pages, public journey feeds, public recap/archive/community UX, public navigation, public analytics, and localized public chrome.
- Coupling public MomentBook usability to admin sign-in.
- Replacing backend role/RBAC checks with client-only or cookie-only checks.
- Decorative redesigns that reduce operational density or evidence readability.
