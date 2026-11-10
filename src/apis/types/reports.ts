// ──────────────────────────────────────────────
// Report admin API types: aliases of the generated v3 DTOs (ADR 0012).
// ──────────────────────────────────────────────

import type {
  AdminReportDto,
  AdminReportJourneyReviewDto as GeneratedAdminReportJourneyReviewDto,
  AdminReportPageDto,
  AdminReportPublishedJourneySummaryDto as GeneratedAdminReportPublishedJourneySummaryDto,
  AdminReportStatsDto,
  AdminReportTargetCountsDto as GeneratedAdminReportTargetCountsDto,
  AdminReportTargetTypeStatsDto as GeneratedAdminReportTargetTypeStatsDto,
  UpdateAdminReportDto,
} from "../generated/core";
import type { PageCounts } from "./shared";
import type { AdminUserSummaryDto } from "./users";

// ─── Enums ────────────────────────────────────

export type ReportTargetType = AdminReportDto["targetType"];
export type ReportReason = AdminReportDto["reason"];
export type ReportStatus = AdminReportDto["status"];

// ─── Report ───────────────────────────────────

/** The reporter or the reported account inside a report. */
export type AdminReportUserSummaryDto = AdminUserSummaryDto;
export type AdminReportJourneyReviewDto = GeneratedAdminReportJourneyReviewDto;
export type AdminReportPublishedJourneySummaryDto = GeneratedAdminReportPublishedJourneySummaryDto;
export type AdminReportTargetCountsDto = GeneratedAdminReportTargetCountsDto;
export type AdminReportDetailDataDto = AdminReportDto;
export type AdminReportItemDto = AdminReportDto;

// ─── Report List & Stats ──────────────────────

export type { AdminReportPageDto };
export type AdminReportsDataDto = AdminReportPageDto & PageCounts;
export type AdminReportTargetTypeStatsDto = GeneratedAdminReportTargetTypeStatsDto;
export type AdminReportStatsDataDto = AdminReportStatsDto;

// ─── Request Payloads ─────────────────────────

/** Query of `GET /core/admin/reports`. */
export interface AdminReportsQueryDto {
  page?: number;
  limit?: number;
  status?: ReportStatus;
  targetType?: ReportTargetType;
  reason?: ReportReason;
  targetId?: string;
  reporterId?: string;
}

export type UpdateAdminReportRequestDto = UpdateAdminReportDto;
