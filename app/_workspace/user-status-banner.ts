import type { AdminDashboardBanner } from "@/app/_workspace/workspace-data";

/** Banner for the ban/unban action, wherever it was used from. */
export function resolveUserStatusBanner(options: {
  mutation: string | null;
  userStatus: string | null;
  error: string | null;
  message: string | null;
}): AdminDashboardBanner | null {
  if (options.mutation === "user_status_updated") {
    switch (options.userStatus) {
      case "banned":
        return {
          tone: "success",
          message: "User has been banned and all active sessions revoked.",
        };
      case "inactive":
        return {
          tone: "success",
          message:
            "Ban lifted. The account stays inactive until it accepts the required consents.",
        };
      default:
        return { tone: "success", message: "Ban lifted." };
    }
  }

  if (options.error === "user_update_failed") {
    return {
      tone: "error",
      message: options.message || "Could not update the user. Try again.",
    };
  }

  if (options.error === "missing_user_id") {
    return { tone: "error", message: options.message || "Missing user ID." };
  }

  return null;
}
