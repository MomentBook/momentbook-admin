# 0012: Generated API Types and Wire Contract v3

## Status

Active (decided; not implemented yet: Task 3.6 of the data-contract v3 plan
builds it on `refactor/data-contract-v3`, and until it lands the code follows
[0007](0007-hand-written-api-types-and-service-layer.md)). Date: 2026-11-08.
Supersedes 0007's hand-written types and envelope parsing; 0007's
domain-organized service layer in `lib/api/` stays. The server half is
momentbook-api ADR-0099 (wire contract v3) and its operation-by-operation
mapping `docs/contract-v3.md` (§8 admin, §3 auth).

## Context

- The API moves to contract v3 in one release (momentbook-api ADR-0099). For
  the admin's 23 admin routes and three auth routes (`POST /auth/email/login`,
  `POST /auth/refresh`, `POST /auth/logout`; contract-v3 §13) this means: a 2xx
  body is the resource with no `{status, data}` envelope; a response with no
  data is 204 (logout); every error is `{statusCode, errorCode, message,
  ...details}`; every admin list is `{items, total, page, limit}` with no
  `pages`/`hasMore` and its old key (`journeys`, `articles`, `users`,
  `events` …) renamed to `items`; times are RFC 3339 strings; enum values are
  `UPPER_SNAKE_CASE` (user status, visibility, content status, comment status,
  article category, notification group …); `_id` and nested people become
  `id` and `AdminUserSummaryDto`; every response field is required (absent =
  `null`); the `lang` query parameter is removed.
- Today the contract is copied by hand into `src/apis/types/` (1,006 lines,
  nine files) and every call goes through `requestEnvelope`/`parseEnvelope`
  (`lib/api/client.ts`), which throws "Invalid backend response shape" for a
  2xx without `data`. Login (`app/login/actions.ts`) reads the envelope with
  its own `fetch`: it requires `status === "success"` and `user._id` or
  `user.userId`. Every type and every parse changes with v3, so the copy would
  be rewritten in full.
- ADR 0007 dropped code generation because the generated client was 84%
  unused and its `Api`/`HttpClient` classes were never instantiated. The
  question for v3 was whether the generator can emit types only. Finding
  (2026-11-08): `swagger-typescript-api@13.1.3`, the version the app and web
  pin, has a `--no-client` flag. Its CLI declares a boolean `client` option
  that maps to `generateClient`; the citty argument parser it uses turns
  `--no-client` into `client: false`; with `generateClient` false the
  single-file template emits only the data contracts. Run against the API's
  current (v2) `docs/openapi/core.json`: `--no-client` wrote 6,464 lines with
  no `HttpClient` or `Api` class and 273 exported types; without it, 9,265
  lines, both classes, 280 types. Task 3.6 repeats the run on the v3
  documents.

## Decision

1. **Generated types, no generated client.** `swagger-typescript-api` becomes
   an exact devDependency, `13.1.3` (the app's and web's version). A
   `generate:api` script runs the installed binary with `--no-client` against
   the dev server's core and auth swagger documents and writes one types file
   per service under `src/apis/generated/` (never edited by hand; committed,
   so Vercel builds do not reach the dev server). `src/apis/types/<domain>.ts`
   stays the import surface: each name callers use becomes an alias of a
   generated DTO, so call sites change only where a field changed. A
   hand-written type remains only for something the documents do not describe,
   with a comment saying why.
2. **No envelope.** `requestEnvelope`/`parseEnvelope` become a request that
   returns the parsed body of a 2xx, and nothing for a 204. Errors keep their
   classes: 401 → `AdminSessionExpiredError`, 403 → `AdminAccessDeniedError`,
   anything else → `BackendApiError(message, statusCode, errorCode)` with
   `errorCode` read from the top level (`REVIEW_STATE_CONFLICT` and the other
   codes the admin branches on are unchanged). `logoutAdmin` accepts the 204;
   `refreshAdminTokens` returns the bare `TokenPairDto`.
3. **List shape.** Every admin list is `{items, total, page, limit}`. The
   service layer (`lib/api/*`) derives `pages = ceil(total / limit)` (0 when
   `total` is 0) and `hasMore = page < pages` once, so the page loaders in
   `lib/admin/*`, `lib/editorial/admin.ts` and the list views keep their
   pagination props.
4. **Password login and the session cookie keep working.** The login action
   reads the bare `AuthSessionDto`: `user.id`, `accessToken`, `refreshToken`
   (contract-v3 §2.4; `token` is gone and was not read). The admin-role check
   from the access token's claims, the 401/403 handling and
   `createAdminSession` stay as they are, and the encrypted
   `momentbook_admin_session` cookie keeps its fields and format, so a session
   created before the deploy is still read after it. The tokens are the API's
   JWTs, which v3 does not change.
5. **Language and other inputs.** The review detail's `lang`
   (`lib/admin/reviews.ts`) becomes that request's `Accept-Language` (the
   language to localize into; without a supported one the original text is
   returned, as before). The article list's `lang` filter
   (`lib/editorial/admin.ts`) becomes `language`, the field it filters on
   (ADR-0099 §8). Removed request inputs are 400s in v3 (the API validates with
   `forbidNonWhitelisted`), so none is sent. Filter values in admin URLs keep
   their spelling; the service layer maps them to the v3 enums.
6. **Values into views.** Views compare and show the v3 enum values from the
   generated types; times are parsed from RFC 3339 with one helper; renamed
   fields follow the mapping (`asOf` → `generatedAt`, `oldestPendingSince` →
   `oldestPendingAt`, report `_id` → `id`, people as `AdminUserSummaryDto`).
   A person's `name` is `string | null` (`AdminUserSummaryDto`, contract-v3
   §2.2) and so is `email`; views keep their fallback for a missing name
   (`|| "Unnamed user"` or the person's id, as the comments list does today).
   The admin detail of a published journey is `AdminPublishedJourneyDetailDto`
   (contract-v3 §8.4): the public detail (§6.6) plus the review fields the
   public detail drops.
   **Review evidence.** The review detail builds its evidence sections from
   the public detail's timeline. Today `lib/admin/reviews.ts` reads two lists,
   `detail.timeline` and `detail.recapDraft.timeline`
   (`normalizeTimelineBlocks`/`normalizeRecapTimelineBlocks`, :500-511, passed
   at :619-631 with the key prefixes `timeline` and `recap`), keys a section by
   a block's `clusterId`, and maps `localizedContent.clusterImpressions[]`
   (:315). In v3 the detail has one list, `moments`, and
   `localizedContent.momentImpressions[]`: sections come from `moments` only,
   keyed by `moment.id` (today's `clusterId` value, so a section of an existing
   post keeps its key), with the flattened `startAt`/`endAt` (parsed with the
   time helper above) and `startLocal`/`endLocal` as the section time, and
   impressions are matched by `momentId`. The section order
   and what a reviewer sees do not change.
7. **Deploy order.** The admin deploys after API v3 and the web (Task 3.8
   step 7: API at 5, web at 6). Neither admin version reads the other API
   version, so between steps 5 and 7 the admin cannot load data or sign in;
   the steps run back to back. Go check: login, a review decision. The admin
   sends no `App-Version`, so the API's version floor never applies to it.
   **Vercel promote timing is 확인 필요 (Task 3.6):** whether production
   deploys from a push to `main` (then the merge to `main` is step 7) or from
   a prepared deployment promoted at step 7, and, for the second, whether a
   promoted preview is rebuilt with production environment variables.

## Alternatives Considered

- **Keep hand-writing the types** — rejected: v3 changes every type and every
  parse, so the copy would be rewritten in full, and it would drift again with
  no check against the contract.
- **Generate the full client and use only its types** — rejected while
  `--no-client` works: it brings back the unused `Api`/`HttpClient` classes
  ADR 0007 removed. It stays the fallback if Task 3.6's run on the v3
  documents shows `--no-client` failing.
- **Call the generated `Api` class** (as the web does) — rejected for this
  change: the service layer already owns auth headers, `no-store` and the
  error classes, and replacing it widens a release that must deploy back to
  back with the API.
- **Import types from the app's or the web's generated files** — rejected:
  another repository's build artifact would become this repository's
  contract.
- **Generate at build time on Vercel** — rejected: the build would depend on
  the private dev server.

## Consequences

- Positive: a contract change is a regeneration and a typecheck; the 1,006
  hand-written lines go.
- Positive: existing admin sessions survive the deploy.
- Negative: the generated files are large and mostly unused by the admin;
  only the alias modules are read.
- Negative: between the API deploy and the admin deploy the admin is
  unusable, and a session that refreshes in that window spends its refresh
  token on a response the old admin cannot read, so that operator signs in
  again.
- The README's Repository Baseline and Default Change Policy ("hand-written
  types", "no code generation step") describe the code as it is; they change
  with Task 3.6's code, together with `AGENTS.md`.
- Changes here run `yarn verify && yarn build`, plus a manual check of login,
  review, reports and the audit log (Task 3.6).
