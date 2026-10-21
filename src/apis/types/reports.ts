// ──────────────────────────────────────────────
// Report API types — hand-written from NestJS contract (apps/core/src/reports)
// ──────────────────────────────────────────────

import type { JourneyReviewStatus } from "./journeys";

// ─── Enums / Literal Unions ───────────────────

export type ReportTargetType = "USER" | "PUBLISHED_JOURNEY";
export type ReportReason =
  | "SPAM"
  | "ABUSE"
  | "HATE"
  | "SEXUAL"
  | "INAPPROPRIATE"
  | "OTHER";
export type ReportStatus = "PENDING" | "REVIEWED" | "RESOLVED" | "REJECTED";

// ─── User Summary ─────────────────────────────

export interface AdminReportUserSummaryDto {
  userId: string;
  name?: string | null;
  email?: string | null;
  providerEmail?: string | null;
  picture?: string | null;
  status: "ACTIVE" | "INACTIVE" | "DELETED" | "BANNED";
}

// ─── Target Journey Summary ───────────────────

export interface AdminReportJourneyReviewDto {
  status: JourneyReviewStatus;
  approved: boolean;
}

export interface AdminReportPublishedJourneySummaryDto {
  publicId: string;
  journeyId: string;
  userId: string;
  published: boolean;
  visibility: "PUBLIC" | "HIDDEN";
  review: AdminReportJourneyReviewDto;
  publishedAt?: string | null;
  owner?: AdminReportUserSummaryDto | null;
}

// ─── Target Counts ────────────────────────────

export interface AdminReportTargetCountsDto {
  totalReports: number;
  effectiveReports: number;
}

// ─── Report Detail & Item ─────────────────────

export interface AdminReportDetailDataDto {
  _id: string;
  reporterId: string;
  targetType: ReportTargetType;
  targetId: string;
  reason: ReportReason;
  description?: string | null;
  status: ReportStatus;
  adminNote?: string | null;
  resolvedAt?: string | null;
  resolvedBy?: string | null;
  createdAt: string;
  updatedAt: string;
  reporter?: AdminReportUserSummaryDto | null;
  targetUser?: AdminReportUserSummaryDto | null;
  targetPublishedJourney?: AdminReportPublishedJourneySummaryDto | null;
  targetReportCounts: AdminReportTargetCountsDto;
}

export type AdminReportItemDto = AdminReportDetailDataDto;

// ─── Report List & Stats ──────────────────────

export interface AdminReportsDataDto {
  reports: AdminReportItemDto[];
  total: number;
  page: number;
  pages: number;
  limit: number;
  hasMore: boolean;
}

export interface AdminReportTargetTypeStatsDto {
  userReports: number;
  publishedJourneyReports: number;
}

export interface AdminReportStatsDataDto {
  totalReports: number;
  openReports: number;
  pendingReports: number;
  reviewedReports: number;
  resolvedReports: number;
  rejectedReports: number;
  byTargetType: AdminReportTargetTypeStatsDto;
}

// ─── Request Payloads ─────────────────────────

export interface AdminReportsQueryDto {
  page?: number;
  limit?: number;
  status?: ReportStatus;
  targetType?: ReportTargetType;
  reason?: ReportReason;
  targetId?: string;
  reporterId?: string;
}

export interface UpdateAdminReportRequestDto {
  status?: ReportStatus;
  adminNote?: string | null;
}
