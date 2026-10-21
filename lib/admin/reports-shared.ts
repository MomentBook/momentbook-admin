import type {
  ReportReason,
  ReportStatus,
  ReportTargetType,
} from "@/src/apis/types";

export const ADMIN_REPORTS_PAGE_SIZE = 20;

export const REPORT_REASONS: readonly ReportReason[] = [
  "SPAM",
  "ABUSE",
  "HATE",
  "SEXUAL",
  "INAPPROPRIATE",
  "OTHER",
];

export function parseReportReason(value: string | null): ReportReason | undefined {
  return REPORT_REASONS.find((reason) => reason === value);
}

export function getReportStatusLabel(status: ReportStatus): string {
  switch (status) {
    case "PENDING":
      return "Pending";
    case "REVIEWED":
      return "Reviewed";
    case "RESOLVED":
      return "Resolved";
    case "REJECTED":
      return "Rejected";
    default:
      return status;
  }
}

export function getReportReasonLabel(reason: ReportReason): string {
  switch (reason) {
    case "SPAM":
      return "Spam";
    case "ABUSE":
      return "Abuse";
    case "HATE":
      return "Hate speech";
    case "SEXUAL":
      return "Sexual content";
    case "INAPPROPRIATE":
      return "Inappropriate";
    case "OTHER":
      return "Other";
    default:
      return reason;
  }
}

export function getReportTargetTypeLabel(targetType: ReportTargetType): string {
  switch (targetType) {
    case "USER":
      return "User Account";
    case "PUBLISHED_JOURNEY":
      return "Published Journey";
    default:
      return targetType;
  }
}
