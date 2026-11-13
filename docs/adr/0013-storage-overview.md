# 0013: Storage Overview

## Status

Active. Date: 2026-11-13. Amends [0001](0001-admin-app-ownership-and-runtime.md)
(route list) and [0011](0011-operator-surfaces-users-comments-metrics-audit.md)
(call budget).

## Context

- The API gives every account a backup storage allowance (the free plan is
  5 GiB). It starts in "log" mode: usage is measured, nothing is refused.
- Before the allowance is enforced, an operator has to see how much is stored,
  how accounts are spread, and whether anyone is at or near the allowance.
  Without that, turning enforcement on is a guess.
- The API serves `GET /core/admin/metrics/storage` (admin only) with the totals,
  six size buckets, the near and at counts, the 20 largest accounts, and every
  plan with its account count.

## Decision

1. **One read-only page**, `/storage`, in the nav after Metrics. It reads that
   one endpoint (1 call on top of the 4 attention calls) and has no filters,
   pagination or actions. A failure shows the workspace error page, as on the
   other pages; there is no partial state.
2. **Binary units.** Sizes are shown in KB, MB, GB and TB of 1024 (`formatBytes`
   in `lib/admin/storage-shared.ts`), matching how the allowance and the
   buckets are defined (GiB). One decimal for GB and TB below 10, none
   otherwise.
3. **The allowance figures exist to decide when enforcement is safe.** "At the
   allowance" (100% or more) and "Near the allowance" (80% up to 100%) count the
   accounts that would be refused or warned once the API's storage mode is set
   to enforce. The page says so in one sentence and never claims they are
   refused today. A non-zero "At" figure uses the destructive text colour; the
   rest is neutral.
4. **Percentages are whole and rounded down**, tone boundaries are compared in
   integer products (`allowanceTone`), so 79% never reads as near and 99.9%
   never as at.
5. **Changing an account's allowance is not done here.** It belongs on the user
   detail page (a later task), where the operator sees the account and its
   history. This page links each top account to that page.
6. **No new visual pattern.** The page reuses Metrics' section headings and
   tiles, the Users table, `Badge` variants and `Card`. The bucket share is a
   percentage, with no bar and no chart library.

## Alternatives Considered

- **Put the figures on `/metrics`** — rejected: it is a different window model
  (UTC days) and a different failure story; storage is a snapshot.
- **Decimal units (MB = 1,000,000 B)** — rejected: the allowance and buckets
  are binary, so the labels would not match the numbers an engineer sets.
- **Edit allowances from the top-accounts table** — rejected: a mutation needs
  the confirmation and audit flow the user detail page owns (ADR 0011).

## Consequences

- Positive: enforcement can be switched on with the numbers in front of the
  operator.
- Negative: the top list is the 20 largest backups only; an account near its
  allowance but small (a lowered override) may not appear in it, though it is
  counted in the near and at figures.
- Deploy order: API first, then admin. An admin deployed first shows the error
  page on `/storage`.
- Changes here should run `yarn verify && yarn build`.
