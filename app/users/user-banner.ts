import type { AdminDashboardBanner } from "@/app/_workspace/workspace-data";
import { resolveUserStatusBanner } from "@/app/_workspace/user-status-banner";

const ALLOWANCE_ERROR_MESSAGES: Record<string, string> = {
  allowance_empty: "Enter the allowance in GB.",
  allowance_not_a_number: "The allowance must be a number in GB, for example 10 or 2.5.",
  allowance_out_of_range: "The allowance must be from 0 to 1024 GB.",
  allowance_reason_required: "Give a reason for the change.",
  allowance_reason_too_long: "The reason can be at most 500 characters.",
  allowance_choice_missing: "Choose Set allowance or Use the plan's allowance.",
};

/** Banner for the user detail page: sign-out and allowance results first, then
 * the shared ban/unban banner. */
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

  if (options.mutation === "storage_allowance_updated") {
    return { tone: "success", message: "Allowance updated." };
  }

  if (options.error && Object.hasOwn(ALLOWANCE_ERROR_MESSAGES, options.error)) {
    return { tone: "error", message: ALLOWANCE_ERROR_MESSAGES[options.error] };
  }

  if (options.error === "allowance_update_failed") {
    const base = "The allowance could not be changed.";
    return { tone: "error", message: options.message ? `${base} ${options.message}` : base };
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
