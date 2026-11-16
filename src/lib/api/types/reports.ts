// ──────────────────────────────────────────────
// Report admin API types: aliases of the generated v3 DTOs (ADR 0012).
// ──────────────────────────────────────────────

import type {
  AdminReportDto,
  AdminReportPageDto,
  AdminReportStatsDto,
  paths,
  UpdateAdminReportDto,
} from "@/lib/api/generated/core";
import type { PageCounts } from "./shared";
import type { AdminUserSummaryDto } from "./users";

// ─── Enums ────────────────────────────────────

export type ReportTargetType = AdminReportDto["targetType"];
export type ReportReason = AdminReportDto["reason"];
export type ReportStatus = AdminReportDto["status"];

// Each enum's values, in the order the admin lists them; the build fails if
// one stops being an API value.
export const REPORT_STATUSES = [
  "PENDING",
  "REVIEWED",
  "RESOLVED",
  "REJECTED",
] as const satisfies readonly ReportStatus[];

export const REPORT_TARGET_TYPES = [
  "USER",
  "PUBLISHED_JOURNEY",
] as const satisfies readonly ReportTargetType[];

export const REPORT_REASONS = [
  "SPAM",
  "ABUSE",
  "HATE",
  "SEXUAL",
  "INAPPROPRIATE",
  "OTHER",
] as const satisfies readonly ReportReason[];

// ─── Report ───────────────────────────────────

/** The reporter or the reported account inside a report. */
export type AdminReportUserSummaryDto = AdminUserSummaryDto;
export type AdminReportDetailDataDto = AdminReportDto;
export type AdminReportItemDto = AdminReportDto;

// ─── Report List & Stats ──────────────────────

export type { AdminReportPageDto };
export type AdminReportsDataDto = AdminReportPageDto & PageCounts;
export type AdminReportStatsDataDto = AdminReportStatsDto;

// ─── Request Payloads ─────────────────────────

/** Query of `GET /core/admin/reports`, as the API documents it. */
export type AdminReportsQueryDto = NonNullable<
  paths["/core/admin/reports"]["get"]["parameters"]["query"]
>;

export type UpdateAdminReportRequestDto = UpdateAdminReportDto;
