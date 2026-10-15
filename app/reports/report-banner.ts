import type { AdminDashboardBanner } from "@/app/_workspace/workspace-data";

type ResolveReportBannerOptions = {
  error: string | null;
  message?: string | null;
  mutation?: string | null;
  status?: string | null;
  userStatus?: string | null;
};

export function resolveReportBanner(
  options: ResolveReportBannerOptions,
): AdminDashboardBanner | null {
  if (options.mutation === "report_updated") {
    return {
      tone: "success",
      message: options.status
        ? `Report status updated to ${options.status}.`
        : "Report updated successfully.",
    };
  }

  if (options.mutation === "user_status_updated") {
    return {
      tone: "success",
      message: options.userStatus === "banned"
        ? "User has been banned and all active sessions revoked."
        : "User ban lifted successfully.",
    };
  }

  switch (options.error) {
    case "missing_report_id":
      return {
        tone: "error",
        message: "Missing report ID.",
      };
    case "report_not_found":
      return {
        tone: "error",
        message: "Report not found.",
      };
    case "report_update_failed":
      return {
        tone: "error",
        message: options.message || "Could not update the report. Try again.",
      };
    case "user_update_failed":
      return {
        tone: "error",
        message: options.message || "Could not update user status. Try again.",
      };
    case "admin_access_denied":
      return {
        tone: "error",
        message: "This session does not have administrative permissions.",
      };
    default:
      return null;
  }
}
