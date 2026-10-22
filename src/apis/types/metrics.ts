// ──────────────────────────────────────────────
// Metrics Admin API types — hand-written from docs/openapi/core.json
// ──────────────────────────────────────────────

export interface AdminMetricsDailyDto {
  date: string;
  signups: number;
  activeAccounts: number | null;
  newPublishedJourneys: number;
  reviewDecisions: number;
  reportsOpened: number;
  reportsClosed: number;
  commentsCreated: number;
}

export interface AdminMetricsUsersDto {
  total: number;
  active: number;
  inactive: number;
  banned: number;
  deleted: number;
}

export interface AdminMetricsReviewsDto {
  pending: number;
  oldestPendingSince: string | null;
  localizationPending: number;
  enqueueFailed: number;
  medianDecisionSeconds: number | null;
}

export interface AdminMetricsReportsDto {
  open: number;
  pending: number;
  reviewed: number;
  medianCloseSeconds: number | null;
}

export interface AdminMetricsOperationsDto {
  notificationJobsDead: number;
  unpublishCleanupFailed: number;
  erasureOverdue: number;
}

export interface AdminMetricsDataDto {
  asOf: string;
  from: string;
  to: string;
  days: number;
  daily: AdminMetricsDailyDto[];
  users: AdminMetricsUsersDto;
  reviews: AdminMetricsReviewsDto;
  reports: AdminMetricsReportsDto;
  operations: AdminMetricsOperationsDto;
}
