import type { AdminDashboardBanner } from "@/app/_workspace/workspace-data";
import { resolveUserStatusBanner } from "@/app/_workspace/user-status-banner";

/** Banner for the user detail page: sign-out results first, then the
 * shared ban/unban banner. */
export function resolveUserBanner(options: {
  mutation: string | null;
  error: string | null;
  message: string | null;
  revokedSessions: string | null;
  userStatus: string | null;
}): AdminDashboardBanner | null {
  if (options.mutation === "sessions_revoked") {
    // An account has at most one active session, so the API answers 0 or 1.
    return options.revokedSessions === "0"
      ? { tone: "default", message: "No active session to end." }
      : { tone: "success", message: "Signed out. The account must sign in again." };
  }

  if (options.error === "sessions_revoke_failed") {
    return {
      tone: "error",
      message: options.message || "Could not sign out the account. Try again.",
    };
  }

  if (options.error === "user_not_found") {
    return { tone: "error", message: "That user no longer exists." };
  }

  return resolveUserStatusBanner({
    mutation: options.mutation,
    userStatus: options.userStatus,
    error: options.error,
    message: options.message,
  });
}
