// ──────────────────────────────────────────────
// Metrics admin API types: aliases of the generated v3 DTOs (ADR 0012).
// ──────────────────────────────────────────────

import type {
  AdminMetricsDailyDto as GeneratedAdminMetricsDailyDto,
  AdminMetricsDeletionReasonDto as GeneratedAdminMetricsDeletionReasonDto,
  AdminMetricsDeletionsDto as GeneratedAdminMetricsDeletionsDto,
  AdminMetricsDto,
  AdminNotificationCategoryMetricsDto as GeneratedAdminNotificationCategoryMetricsDto,
  AdminNotificationMetricsDto,
  AdminNotificationPermissionDto as GeneratedAdminNotificationPermissionDto,
  AdminNotificationRetentionDto as GeneratedAdminNotificationRetentionDto,
  AdminNotificationSkipDto as GeneratedAdminNotificationSkipDto,
} from "../generated/core";

export type AdminMetricsDataDto = AdminMetricsDto;
export type AdminMetricsDailyDto = GeneratedAdminMetricsDailyDto;

/** Account deletion figures: `requested`, `restored`, `executed` and `reasons`
 * count over the selected window; `pending` is the accounts scheduled for
 * deletion now, whatever the window. */
export type AdminMetricsDeletionsDto = GeneratedAdminMetricsDeletionsDto;
export type AdminMetricsDeletionReasonDto = GeneratedAdminMetricsDeletionReasonDto;

// ─── Notification metrics (GET /core/admin/metrics/notifications, ADR-0096) ───

export type AdminNotificationMetricsDataDto = AdminNotificationMetricsDto;
export type AdminNotificationCategoryMetricsDto = GeneratedAdminNotificationCategoryMetricsDto;
export type AdminNotificationSkipDto = GeneratedAdminNotificationSkipDto;
export type AdminNotificationPermissionDto = GeneratedAdminNotificationPermissionDto;
export type AdminNotificationRetentionDto = GeneratedAdminNotificationRetentionDto;
export type AdminPushPlatform = AdminNotificationPermissionDto["platform"];
export type AdminPushPermission = AdminNotificationPermissionDto["permission"];
