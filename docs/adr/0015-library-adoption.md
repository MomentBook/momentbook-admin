# 0015: Library Adoption

## Status

Active. Date: 2026-11-16 (branch `refactor/admin-rebuild`, base `fc4b9da`).
Supersedes [0012](0012-generated-api-types-and-contract-v3.md) decision 1 (the
generator) and its rejection of a typed client; 0012's contract v3 rules
(decisions 2–6) stand and are now applied in one client middleware. Amends
[0005](0005-moderation-workspace-and-review-evidence.md) (photo viewer),
[0006](0006-editorial-articles-and-guide-support.md) (editor and preview),
[0010](0010-server-side-review-counts-and-workspace-shell.md) (tables),
[0011](0011-operator-surfaces-users-comments-metrics-audit.md) and
[0013](0013-storage-overview.md) (charts). The source layout is
[0014](0014-source-layout-and-layer-boundaries.md).

## Context

- The admin carried its own versions of infrastructure that maintained
  libraries provide: a fetch wrapper with four ways of building a query string
  and about 330 lines of alias types; three env parsers; hand JWT decoding;
  ten URL parsers and string builders; six table markups and six paginations;
  a 95-line div bar chart; a hand Markdown tokenizer for the article preview;
  a Dialog per photo for fullscreen review; `useState` forms with hand
  validation and the deprecated `useFormState`; a hand theme script.
- The user decided on 2026-11-15 to replace with libraries as much as
  possible, and to keep mutation results as Alert banners rather than toasts.
- Constraints: URLs, the session cookie, the four attention calls per page
  and the backend call budget (ADR 0010, 0011), no revalidation (ADR 0004),
  and the privacy boundary (ADR 0011) stay as they were.

## Decision

Versions are exact and `yarn.lock` is committed (Vercel installs with
`--immutable`). A version released less than seven days before install was
not taken; the one before it was.

| Library | Replaces | Where, and what it keeps |
| --- | --- | --- |
| `openapi-typescript` 7.13.0 (dev), `openapi-fetch` 0.17.0 | swagger-typescript-api `--no-client`, `requestApi`, `buildApiUrl`, `readErrorBody`, hand query strings | `yarn generate:api` (`scripts/generate-api.mjs`) writes path types to `src/lib/api/generated/{auth,core}.ts` from `API_SPEC_DIR` or `API_SPEC_URL` with `--root-types --root-types-no-schema-prefix --default-non-nullable false`; committed, never edited by hand. `coreClient` and `authClient` (`src/lib/api/client.ts`) send `cache: "no-store"` and `Accept: application/json`, serialize queries with `URLSearchParams` and drop `undefined`, `null` and `""`. The `contractV3` middleware runs `parseApiResponse` on a clone, so 401 → `AdminSessionExpiredError`, 403 → `AdminAccessDeniedError`, anything else → `BackendApiError` with the top-level `errorCode`, as before. Services keep their names and signatures; `withPageCounts` still adds `pages` and `hasMore`. |
| `@t3-oss/env-nextjs` 0.13.11, `zod` 4.6.7 | three env parsers, two HTTPS checks | `src/lib/env.ts`, imported by `next.config.ts`, so `yarn build` fails on a missing secret. A production, non-local build also requires HTTPS for the admin site and the API (`assertProductionUrls`). Variable names did not change. Tests set `SKIP_ENV_VALIDATION=true`. |
| `zod` | `isSessionShape`, form field readers, the UUID regex | Action fields (`runAdminAction`'s `fields`), the stored session (`src/lib/auth/session-schema.ts`, loose so the cookie's `iat`/`exp` stay), and the login and article schemas the client form and the action share. |
| `jose` `decodeJwt` | hand JWT decoding | `src/lib/auth/token.ts`. The cookie's encryption (`dir`, `A256GCM`, SHA-256 key) is unchanged, so existing sessions stay valid. |
| `nuqs` 2.10.2 (`nuqs/server` only, no adapter) | `readQueryParam`, per-screen parsers, `hrefWith`/`hrefFor` | One `createLoader` per route in `src/lib/navigation/<f>-routes.ts`; shared parsers in `params.ts`. `createAdminSerializer` writes links through `URLSearchParams`, so their spelling is unchanged, and leaves out page 1. `?page=` is a whole number clamped to 1–100000 on every list: `?page=2.7` now reads as page 1, and a page above 100000 no longer reaches the API as a 400. |
| `@tanstack/react-table` 9.3.1 | six table markups, four status-badge functions | `DataTable` (`src/components/data-table/`) renders the six paged lists; columns live in each `<f>-table.tsx` client module and receive serializable rows. Paging, filters and order stay on the server as links (`UrlPagination`); there is no client sorting, selection or state. Fixed summaries (Storage) stay plain `Table`. |
| shadcn `pagination` `tabs` `toggle-group` `radio-group` `checkbox` `select` `collapsible` `breadcrumb` `empty` `field` | six paginations, five chip/tab sets, native radio/checkbox/select, `<details>`, back links, empty states | `UrlPagination`, `FilterTabs`, `BackLink`, the report status `RadioGroup`, the "Stay on this journey" `Checkbox` (still `stay=1`), the audit action `Select`, `Collapsible` sections, `Empty`, `Field` in forms. Added with `npx shadcn@4.22.1 add`; `radix-ui` stays `~1.6.7`. |
| shadcn `chart`, `recharts` 3.8.0 (+ `react-is` 19.2.9) | the div bar chart on `/metrics` and the overview's intake bars | `DailyBarChart` and `IntakeChart`: `ChartContainer` with `BarChart accessibilityLayer`, loaded through `next/dynamic` so recharts is its own chunk. Figures stay as text beside the charts. A day with zero or no data draws no bar; the tooltip and caption tell them apart. recharts is the version the shadcn registry's `chart` is written for. |
| `react-markdown` 10.1.0 (no `remark-gfm`) | the hand preview renderer | `MarkdownPreview` (`src/features/articles/components/markdown-preview.tsx`) with the elements the public site renders: `allowedElements` h1–h6, p, ul, li, img, a, strong, code; `unwrapDisallowed`; `skipHtml`; `urlTransform` keeps http(s) only. # and ## render as h2, ### as h3, deeper as h4; an image alone in a paragraph is a figure. Still different from the site: `*em*` and `1.` lists show as plain text in the preview. The image rule is checked by `findMarkdownImageProblem` (`schema.ts`) on the client and in the action. |
| `yet-another-react-lightbox` 3.33.0 with Zoom, Counter, Captions | `LightboxPhotoTile` (one Dialog per photo) | `ReviewPhotoGallery`: one gallery per evidence section with previous/next, pinch, wheel and double-tap zoom, pan, "n of total", and the location caption. |
| `react-hook-form` 7.84.0, `@hookform/resolvers` 7.0.3 | `useState` forms and hand validation, `useFormState` | The article editor and login validate with the action's zod schema and submit `new FormData(form)` in a transition. Login uses `useActionState` and keeps `action=` so it posts before hydration. A server-side validation failure still redirects with its banner. |
| `next-themes` alone | the hand theme script | `ThemeProvider attribute="class" defaultTheme="system" enableSystem`. A theme stored by the old script is not read; the OS setting decides. |
| `server-only` 0.0.1 | an undeclared import mocked in 21 tests | Declared; vitest aliases it to an empty module. |
| `eslint-plugin-boundaries` 7.4.2 (dev) | nothing | The layer rule of ADR 0014. |

Results stay in the URL as `mutation`/`error`/`message` and render through one
`FlashBanner` (shadcn `Alert`) from one `resolveFlash`, so a result survives the
redirect that shows it and a reload shows it again.

## Alternatives Considered

- **sonner (toasts)** — rejected by the user (2026-11-15): a toast does not
  survive the redirect after a server action, and the banner already carries
  the result in the URL.
- **pretty-bytes** — rejected: it labels binary units KiB/GiB, and the admin
  shows binary sizes as "GB" to match how allowances are set (ADR 0013).
- **iron-session** — rejected: a new cookie format would sign every operator
  out, and `jose` (which the Next.js docs use for sessions) already encrypts
  the cookie.
- **date-fns** — rejected: `Intl.DateTimeFormat` covers every format shown.
- **remark-gfm** — rejected: tables, task lists and strikethrough would render
  in the preview and not on the public site.
- **openapi-fetch's default query serializer** — rejected: it writes a space
  as `%20` and sends empty filters; the services always wrote `+` and skipped
  them.
- **Refine or React-admin** — still rejected for ADR 0010's reason: a
  data-provider layer over an API `src/lib/api` already wraps.

## Consequences

- Positive: a contract change is a regeneration and a typecheck that now
  covers paths, query parameters and bodies, not only response types. URL,
  table, form, chart, lightbox and env code is library code with its own
  tests.
- Negative: more dependencies to keep current, and recharts is pinned to the
  shadcn chart's version, so a bump needs a look at the charts. Links are
  serialized twice (nuqs, then `URLSearchParams`). The two chart pages load
  one more chunk. `admin-workspace-page.test.ts` spends about 3.8 s importing
  the overview page against vitest's 5 s default.
- Changes run `yarn verify && yarn build`; a dependency bump also gets a look
  at the pages that use it.
