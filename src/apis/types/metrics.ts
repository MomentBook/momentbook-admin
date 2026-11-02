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

// ─── Notification metrics (GET /core/admin/metrics/notifications, ADR-0096) ───

export type AdminNotificationGroup = "messages" | "reactions" | "publishing" | "follow" | "memories";
export type AdminNotificationLegalClass = "SERVICE" | "ENGAGEMENT" | "AD";
export type AdminPushPlatform = "IOS" | "ANDROID" | "UNKNOWN";
export type AdminPushPermission = "GRANTED" | "PROVISIONAL" | "DENIED" | "UNDETERMINED";
export type AdminRetentionCohort = "target" | "holdout";

export interface AdminNotificationSkipDto {
  /** The delivery policy's reason (`holdout`, `weekly_cap`, `no_device`, …). */
  reason: string;
  jobs: number;
}

export interface AdminNotificationCategoryMetricsDto {
  category: string;
  /** Null for a category with no toggle. */
  group: AdminNotificationGroup | null;
  legalClass: AdminNotificationLegalClass;
  defaultEnabled: boolean;
  /** Pushes created in the window, one per device; push rows are kept 30 days. */
  sent: number;
  delivered: number;
  opened: number;
  failed: number;
  /** Most frequent first. */
  skipped: AdminNotificationSkipDto[];
  /** Explicit choices of active accounts; an account without one follows `defaultEnabled`. */
  optedIn: number;
  optedOut: number;
  optedOutInWindow: number;
}

export interface AdminNotificationPermissionDto {
  platform: AdminPushPlatform;
  permission: AdminPushPermission;
  devices: number;
}

export interface AdminNotificationRetentionDto {
  category: string;
  cohort: AdminRetentionCohort;
  accounts: number;
  d7Eligible: number;
  d7Returned: number;
  d30Eligible: number;
  d30Returned: number;
}

export interface AdminNotificationMetricsDataDto {
  asOf: string;
  from: string;
  to: string;
  days: number;
  /** Every catalog category, in catalog order. */
  categories: AdminNotificationCategoryMetricsDto[];
  permissions: AdminNotificationPermissionDto[];
  /** A cohort with no account has no entry. */
  retention: AdminNotificationRetentionDto[];
}
