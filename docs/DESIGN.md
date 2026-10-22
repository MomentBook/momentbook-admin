# Design Intent

MomentBook Admin is an operational backoffice surface for moderation and
editorial work. It should be dense, scannable, restrained, and task-first. Do
not turn it into a marketing site, public community surface, or public journey
consumption UI.

## Design System

shadcn/ui (`new-york` style, v4 registry) on Tailwind CSS v4 powers every admin
surface.

- **Components** live in `components/ui` and are owned code. Add one only with
  `npx shadcn@4.22.1 add <name>` (pinned CLI, so output matches the existing
  files). The CLI emits `import { cn } from "cn"` and adds the `cn` package:
  rewrite the import to `@/lib/utils` and remove the package. Keep
  `radix-ui` at `~1.6.7` if the CLI bumps it.
- **Tokens** are CSS variables in `app/globals.css` (`:root` and `.dark`),
  mapped to Tailwind with `@theme inline`; `tw-animate-css` provides the
  animation utilities. Tailwind v4 syntax for CSS-variable values is
  `w-(--x)`, not v3's `w-[--x]` (the v3 form builds invalid CSS — that was the
  clipped sidebar).
- **Light/dark**: `next-themes` toggles the `.dark` class on `<html>`; the
  bootstrap script in `AdminRootDocument` applies the stored theme before first
  paint.
- **Icons**: `lucide-react`.
- **Shell**: one `AdminSidebar` (`components/layout/admin-sidebar.tsx`, single
  nav definition in `admin-nav.ts`) rendered by the per-page `WorkspaceShell`.
  Every item has an icon, so the collapsed rail shows icons with tooltips;
  counts use `SidebarMenuBadge`; ⌘B and the `sidebar_state` cookie are kept;
  desktop starts expanded; mobile uses the sheet.

Component use:

| Need | Component |
|---|---|
| Status chips, filter chips | `Badge` (filter chips are links) |
| Notices and mutation results | `Alert` with `AlertTitle className="line-clamp-none"` |
| Metrics, panels | `Card` |
| Queues | `Table` with link pagination (server-rendered; no client table engine) |
| Irreversible or outward-facing actions | `ConfirmActionForm` (`components/confirm-action-form.tsx`, `AlertDialog`) |
| Fullscreen photo inspection | `LightboxPhotoTile` (`Dialog`) |
| Forms | native `<form action={serverAction}>` with `Input`, `Textarea`, `Select`, `Label` |

## Product Surfaces

- `/login`: admin sign-in (email and password; backend RBAC decides access).
- `/`: **Attention** overview — "Needs action" tiles (pending reviews,
  translation pending with the Slack note, open reports with Pending/Reviewed
  sub-links), an "as of" time, an "All clear" state when nothing is waiting,
  then health (approved/rejected totals, approval rate, report breakdown) and
  six weeks of intake. Legacy `/?tab=…` links redirect to the pages below.
- `/reviews`: review queue with `?status=` tabs (`pending` default,
  `translation`, `approved`, `rejected`, `all`), each showing the API total,
  20 rows per page.
- `/reviews/[publicId]`: evidence-first review detail with a sticky decision
  panel, translation box, translations list, and author context (reports on the
  journey and on the author, "Ban author").
- `/reports` and `/reports/[reportId]`: report queue with status, target-type,
  reason, target and reporter filters; report detail with resolution status,
  account sanction, and report history for the target and the reporter.
- `/users` and `/users/[userId]`: account directory (search, status and role
  filters) and account detail: profile, both emails, sign-in methods,
  sessions and devices, moderation history, public journeys, comments, reports
  received and filed, sign-in events with IP, and a private-journey count.
  Admins never see chat bodies or private journey contents (ADR 0011).
- `/comments`: comment moderation with `active` (default), `deleted` and `all`
  tabs, user and journey filters, and a confirmed delete.
- `/metrics`: UTC-day charts over 7, 30 or 90 days, queue health, users by
  status, and an Operations card for engineers.
- `/audit-log`: admin actions with filters; targets link to their screen.
- `/articles`: editorial article management for published-only markdown
  guide records, with language/category filters, pagination, derived
  summary/cover/reading-time display, and route visibility.
- `/articles/new` and `/articles/[articleId]`: markdown article editor with
  create-time identity rules, live preview, derived metadata summary, alternate
  language siblings, and a confirmed delete.
- `/session*` routes handle bootstrap, refresh, and invalidation; they are not
  user-facing product pages.

## UX Principles

- Optimize for admin speed and correctness over persuasion.
- Keep copy concise and operational, in English. Avoid onboarding prose that
  explains obvious controls.
- Name buttons by their outcome ("Approve", "Ban author"), not "Save".
- Keep cards purposeful: repeated records, metrics, panels, or framed tools.
  Avoid decorative nested cards.
- Preserve responsive behavior, horizontal table scrolling, text wrapping of
  long IDs, and stable CTA placement.
- Preserve noindex metadata and admin-only chrome.

## Moderation Workflow

- **Attention model.** One loader (`lib/admin/attention.ts`) feeds the sidebar
  badges and the overview on every page: pending reviews, translation pending,
  translation enqueue failed, and open reports. Every number links to the
  filtered queue whose total it is. Translation pending is the API's
  `localizationPending` total — a superset of the Slack alert, which counts
  only translations pending for more than six hours — and the tile and tab say
  so in one line (ADR 0010).
- **Call budget.** Every page adds its own calls to the 4 attention calls:
  `/users` 1, `/users/[userId]` 1 + 6, `/comments` 1, `/metrics` 1,
  `/audit-log` 1 (ADR 0011; the older pages are in ADR 0010).
- **Queue.** Every tab uses the API order (first published, newest first).
  Rows carry the queue context (`status`, `page`) for the back link.
- **Decisions.** Approve, Reject, and Move to pending are direct submit
  buttons, with no confirmation — each is reversible from the same panel. The
  `publishOperationId` snapshot is always sent; a `REVIEW_STATE_CONFLICT` shows
  "the owner republished" and the new snapshot to decide again.
- **Auto-advance.** Approve or Reject made from the pending tab opens the next
  pending journey (or the queue when none is left). Move to pending, Approve
  without translation, Retry translation, decisions from other tabs, and the
  "Stay on this journey" checkbox stay on the journey.
- **Undo.** The next screen's success banner has an Undo button that moves the
  decided journey back to pending. Undo restores the review state only;
  notifications already sent are not recalled, and the copy does not promise
  more.
- **Translation box** (only while a translation is pending or failed to
  enqueue): "Pending since …", Retry translation, and — unless the journey is
  rejected — Approve without translation, which publishes the original text to
  every language and posts a Slack audit message.
- **Confirmation policy.** Ban, Unban, Sign out, Approve without translation, comment
  delete, and article delete go through `ConfirmActionForm`; the dialog names the account or
  article and states the consequence. Everything else submits directly.
- **Sanctions.** The sanction button follows the account's current status:
  Ban for active/inactive, Unban for banned, disabled for deleted. The banner
  shows the status the API returned (`banned`, `active`, or `inactive` = still
  owes consents). Backend 403/409 are error banners, not logouts. Ban, Unban and Sign
  out are disabled for yourself, ADMIN and DELETED accounts. A 403 from these
  is an error banner (the session stays). The optional reason, and the report a
  ban started from, are stored in the API's admin action log. Comment delete
  says "Hidden from the journey for everyone. The author is not notified."
  and a 403 there clears the session.
- Review detail prioritizes evidence inspection: title, IDs, review status,
  cluster/photo evidence, and fullscreen photo viewing. Evidence sections may
  come from timeline clusters, recap timeline clusters, and remaining
  unattached photos; preserve loaded/expected photo count states.
- Fullscreen image inspection must remain viewport-fit, closeable, and usable
  with mouse, touch, zoom, pan, pinch, and double-tap.
- Empty, failed, and post-mutation states are explicit and low-noise. A filter
  that matches nothing is distinct from "All clear".

## Editorial Workflow

- Articles are admin-managed editorial guide records, not public marketing pages
  in this repository.
- The article list should make current filters, pagination, language/category,
  derived fields, route, cover availability, and reading time visible.
- Markdown body is the canonical authored content source.
- Article editor changes must preserve server-derived summary, cover image, and
  reading-time assumptions unless the backend contract changes.
- Language, slug, and translation group are create-time identity fields; edit
  state keeps them fixed.
- Markdown image controls should preserve the required `![alt](https://...)`
  shape, non-empty alt text, and absolute HTTP(S) image URLs.
- Public guide consumption and public SEO rendering remain owned by the public
  web app.

## Auth, Permissions, and Session UX

- Session expiry and access denial redirect through the login/session routes
  with clear notices.
- Sign-out clears the local admin session even if backend logout fails.
- Never hide backend/RBAC failures behind silent fallbacks.
- Never pass the admin session (tokens) to a client component; pass the
  display values it needs.

## Interaction Risks to Check After UI Changes

- **Theme**: light/dark contrast of the `globals.css` tokens.
- **Shell**: sidebar expanded and collapsed at desktop width, the mobile sheet,
  and the sticky decision panel.
- **Auth**: login, expired session, denied session, refresh redirect, and
  sign-out.
- **Permissions**: backend 401/403 mapping to session invalidation or
  access-denied notices.
- **Overflow**: long IDs, emails, article titles, category labels, route
  previews, localized titles, banner copy, and table content.
- **Overlays**: lightbox and alert dialogs — focus trap, focus restoration,
  labels, viewport fit, and mobile safe areas.
- **Forms**: pending states, destructive actions behind confirmation,
  pagination, filter chips, return links, and mutation banners.

## Out of Scope Patterns

- Public marketing pages, public journey feeds, public recap/archive/community
  UX, public navigation, public analytics, localized public chrome, and public
  guide rendering.
- Coupling public MomentBook usability to admin sign-in.
- Replacing backend role/RBAC checks with client-only or cookie-only checks.
- Decorative redesigns that reduce operational density or evidence readability.
- Hand-written replacements for components the shadcn registry provides.
