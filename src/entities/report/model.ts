import type { StatusTone } from "@/components/status-badge";
import {
  REPORT_REASONS,
  type AdminReportItemDto,
  type ReportReason,
  type ReportStatus,
  type ReportTargetType,
} from "@/lib/api/types";
import { parseUuidFilter } from "@/lib/navigation/params";

/** The newest reports on a target or by a reporter, with their total;
 * `null` when the reports endpoint failed (the panel says so instead of
 * taking the page down). */
export type ReportHistory = { items: AdminReportItemDto[]; total: number } | null;

const REPORT_STATUS_LABELS: Record<ReportStatus, string> = {
  PENDING: "Pending",
  REVIEWED: "Reviewed",
  RESOLVED: "Resolved",
  REJECTED: "Rejected",
};

/** How each report status reads at a glance. */
export const REPORT_STATUS_TONES: Record<ReportStatus, StatusTone> = {
  PENDING: "warning",
  REVIEWED: "neutral",
  RESOLVED: "success",
  REJECTED: "danger",
};

const REPORT_REASON_LABELS: Record<ReportReason, string> = {
  SPAM: "Spam",
  ABUSE: "Abuse",
  HATE: "Hate speech",
  SEXUAL: "Sexual content",
  INAPPROPRIATE: "Inappropriate",
  OTHER: "Other",
};

const REPORT_TARGET_TYPE_LABELS: Record<ReportTargetType, string> = {
  USER: "User Account",
  PUBLISHED_JOURNEY: "Published Journey",
};

export function parseReporterId(value: string | null): string | undefined {
  return parseUuidFilter(value);
}

export function parseReportReason(value: string | null): ReportReason | undefined {
  return REPORT_REASONS.find((reason) => reason === value);
}

export function getReportStatusLabel(status: ReportStatus): string {
  return REPORT_STATUS_LABELS[status] ?? status;
}

export function getReportReasonLabel(reason: ReportReason): string {
  return REPORT_REASON_LABELS[reason] ?? reason;
}

export function getReportTargetTypeLabel(targetType: ReportTargetType): string {
  return REPORT_TARGET_TYPE_LABELS[targetType] ?? targetType;
}
