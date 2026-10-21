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

// validator.js `isUUID(str, "all")`, which the API's @IsUUID() applies.
const UUID_PATTERN =
  /^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$/i;

/** A reporter filter the API accepts, or `undefined` (it answers 400 for a
 * non-UUID `reporterId`). */
export function parseReporterId(value: string | null): string | undefined {
  const trimmed = value?.trim();
  return trimmed && UUID_PATTERN.test(trimmed) ? trimmed : undefined;
}

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
