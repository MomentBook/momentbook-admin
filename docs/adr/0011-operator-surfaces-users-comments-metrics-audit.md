# 0011: Operator Surfaces — Users, Comments, Metrics, Audit Log

## Status

Active. Date: 2026-10-23. Amends [0001](0001-admin-app-ownership-and-runtime.md)
(route list), [0009](0009-reports-moderation-and-user-sanction.md) (sanctions)
and [0010](0010-server-side-review-counts-and-workspace-shell.md) (call budget).

## Context

- Operators could review journeys and reports but not look at the account behind
  them, remove an abusive comment, see what other admins did, or read basic
  health numbers. They used the database for all four.
- The API added `JWT+Admin` routes for exactly these: user directory and detail,
  auth events, session revoke, comment list and delete, audit log, and metrics.
  Sanctions now store the reason and the linked report in the API's admin
  action log, so ADR 0009's "reason is not stored" no longer holds.
- Privacy is a product decision, not a technical limit: what an admin may see
  must be stated, or each new screen re-argues it.

## Decision

1. **Four new root routes**: `/users` and `/users/[userId]`, `/comments`,
   `/audit-log`, `/metrics`. Nav order: Attention, Reviews, Reports, Comments,
   Users, Articles, Metrics, Audit log. All follow ADR 0010: a page loader in
   `lib/admin/*`, a service in `lib/api/*`, and `WorkspaceShell`.
2. **Visibility boundary.** Admins see profile, both emails, sign-in methods,
   sessions and devices, auth events including IP, public journeys, and
   comments. Admins never see chat bodies or private journey contents; private
   journeys appear as a count only.
3. **User detail** loads the profile (required) plus six sections: moderation
   history, published journeys, comments, reports received, reports filed, and
   sign-in events. A 404 on the profile redirects to
   `/users?error=user_not_found`. A failing section shows "Could not load …"
   and the rest of the page renders; 401/403 still propagate.
4. **Actions.** Ban, Unban, and Sign out (revoke all sessions) on a user, and
   Delete on a comment. Ban, Unban and Sign out are disabled for yourself,
   for ADMIN accounts, and for DELETED accounts. Sign out and Comment delete use
   `ConfirmActionForm` with a reason. Comment delete copy: "Hidden from the
   journey for everyone. The author is not notified."
5. **403 handling.** Users endpoints (status, sign-out) show a 403 as an error
   banner and keep the session, whether the target is the admin or another
   admin. Comment delete treats a 403 like every other non-users endpoint: the
   session is cleared and login shows `admin_access_denied`.
6. **Sanctions are recorded.** The reason, and the report id when the ban starts
   from a report detail, go to the API's admin action log; an unknown report id
   is a 400 `INVALID_REPORT_REFERENCE`.
7. **Cross-links.** The review queue "Submitted" column is
   `reviewRequestedAt ?? publishedAt`. Review detail links the author to
   `/users/[userId]` and has "Comments on this journey". `/reviews?userId=`
   filters the queue by author.
8. **Audit log target links**: USER → `/users/<id>`; PUBLISHED_JOURNEY →
   `/reviews/<publicId>`; REPORT → `/reports/<id>`; COMMENT →
   `/comments?publicId=…&status=all` (plain text when `details.publicId` is
   missing); ARTICLE → `/articles/<id>` (plain text for `ARTICLE_DELETED`).
   `/articles/[articleId]` now redirects a 404 to the list with an
   `article_not_found` banner. `ADMIN_AUDIT_ACTION_LABELS` is the one label
   source.
9. **Metrics** use UTC days and count rows that still exist, so unpublished
   journeys and erased accounts drop out. Active accounts are an approximation
   from sign-ins and token refreshes over the last 30 days, shown as a daily
   average (summing daily distinct accounts would double count). `?days=` is
   7, 30, or 90. Charts are server-rendered div bars; there is no chart
   library. The Operations card is for engineers and has no admin action.

### Backend call budget per page render

Each row is in addition to the 4 attention calls.

| Page | Calls |
| --- | --- |
| `/users` | 1 |
| `/users/[userId]` | 1 detail + 6 sections |
| `/comments` | 1 |
| `/metrics` | 1 |
| `/audit-log` | 1 |
| `/reviews?userId=` | 5 list calls (see below), replacing the 1 list + ≤ 3 totals |

With an author filter the attention counts cover every author, so the active
tab's list and all four other tabs' `limit=1` totals carry the filter: 5 list
calls. The next-pending auto-advance after a decision ignores the author filter.

## Alternatives Considered

- **Reveal chat bodies or private journeys for abuse cases** — rejected by the
  product owner; counts and public content are enough to act on a report.
- **Sum daily distinct accounts for "active"** — rejected: it counts one person
  once per day.
- **A chart library** — rejected: three bar charts do not justify a dependency.
- **Fail the user page when any section fails** — rejected: a broken auth-event
  query should not hide the ban button.

## Consequences

- Positive: moderation, account context, and the audit trail are one click
  apart; page cost stays constant.
- Negative: user detail costs 11 calls per render (7 + 4); active accounts are
  an approximation.
- Deploy order: API first (migration, then core), then admin. An admin deployed
  first shows 404 banners on the new pages.
- Changes here should run `yarn verify && yarn build`.
