import { resolveFlash, type Flash, type FlashMessages } from "@/lib/navigation/flash";
import { USER_STATUS_FLASH, type UserStatusFlashQuery } from "@/entities/user/status-flash";

/** A report update also names the new `status`. */
type ReportFlashQuery = UserStatusFlashQuery & { status?: string | null };

const REPORT_FLASH: FlashMessages<ReportFlashQuery> = {
  mutations: {
    report_updated: ({ status }) =>
      status ? `Report status updated to ${status}.` : "Report updated successfully.",
    ...USER_STATUS_FLASH.mutations,
  },
  errors: {
    ...USER_STATUS_FLASH.errors,
    missing_report_id: "Missing report ID.",
    report_not_found: "Report not found.",
    report_update_failed: ({ message }) => message || "Could not update the report. Try again.",
    admin_access_denied: "This session does not have administrative permissions.",
  },
};

export function resolveReportBanner(query: ReportFlashQuery): Flash | null {
  return resolveFlash(query, REPORT_FLASH);
}
