# 0013: Storage Overview

## Status

Active. Date: 2026-11-13; amended the same day for the allowance change and
account deletion (decisions 5, 7, 8, 9). Amends [0001](0001-admin-app-ownership-and-runtime.md)
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
5. **An account's allowance is changed on its user page, not here.** The
   user detail page has a "Backup storage" section (used with the same tone
   badge as this page, photos, the allowance and whether it is set for the
   account or comes from its plan). This page links each top account there.
   - "Set allowance" takes an amount in **binary GB** (1 GB = 1024³ bytes,
     decimals allowed, 0 to 1024; `parseAllowanceGigabytes` in
     `lib/admin/storage-shared.ts`). **0 is allowed** and means "no new
     backups"; a clear hint says so. "Use the plan's allowance" (shown only when
     an override exists) sends `null`.
   - A **reason is required** (1 to 500 characters after trimming) for both. The
     API stores it in the audit log; the admin app logs nothing itself.
   - Both buttons sit behind `ConfirmActionForm`, like ban and sign-out. The
     server action validates the choice, the amount and the reason before any
     request, and only a form that names `set` or `plan` sends one.
   - A smaller allowance than the account's usage deletes nothing; its next
     backups are refused. The dialog says so.
   - The badge next to the used figure shows the percentage, or "No allowance"
     (same destructive tone) when the allowance is 0.
6. **No new visual pattern.** The page reuses Metrics' section headings and
   tiles, the Users table, `Badge` variants and `Card`. The bucket share is a
   percentage, with no bar and no chart library.
7. **The deletion section is read-only.** An account scheduled for deletion
   (`PENDING_DELETION`, 14-day grace period) shows a "Deletion scheduled"
   section on its user page: when it was requested, when it is deleted, and the
   reason the person gave. An operator neither deletes nor restores an account
   on its owner's behalf; banning cancels the deletion.
8. **Deletions in Metrics.** "Account deletions" shows requested, restored by
   owner and deleted over the selected period, "Scheduled now" (not limited to
   the period), and the reasons given with their share of the requests. It
   reads the same metrics call: no new call. "Users by status" gains a
   "Deletion scheduled" row, derived as the total minus the four other rows so
   the card always adds up (not from the deletion figures, a different query).
9. **One stat tile** (`components/stat-tile.tsx`) serves Storage and Metrics.

## Alternatives Considered

- **Put the figures on `/metrics`** — rejected: it is a different window model
  (UTC days) and a different failure story; storage is a snapshot.
- **Decimal units (MB = 1,000,000 B)** — rejected: the allowance and buckets
  are binary, so the labels would not match the numbers an engineer sets.
- **Edit allowances from the top-accounts table** — rejected: a mutation needs
  the confirmation and audit flow the user detail page owns (ADR 0011).
- **Decimal GB in the form** — rejected for the same reason as decimal units
  above: the allowance and the plans are binary.
- **An optional reason** — rejected: an allowance change affects what someone
  can back up, so the audit log must say why.

## Consequences

- Positive: enforcement can be switched on with the numbers in front of the
  operator.
- Negative: the top list is the 20 largest backups only; an account near its
  allowance but small (a lowered override) may not appear in it, though it is
  counted in the near and at figures.
- Deploy order: API first, then admin. An admin deployed first shows the error
  page on `/storage`, and a user page without its `storage` block cannot render
  the new section.
- Changes here should run `yarn verify && yarn build`.
