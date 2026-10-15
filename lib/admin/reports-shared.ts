import type {
  ReportReason,
  ReportStatus,
  ReportTargetType,
} from "@/src/apis/types";

export const ADMIN_REPORTS_PAGE_SIZE = 20;

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
      return "Spam / Ads";
    case "HARASSMENT":
      return "Harassment";
    case "INAPPROPRIATE_CONTENT":
      return "Inappropriate Content";
    case "COPYRIGHT":
      return "Copyright Violation";
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
