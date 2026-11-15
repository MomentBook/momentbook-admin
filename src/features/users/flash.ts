import { resolveFlash, type Flash, type FlashMessages } from "@/lib/navigation/flash";
import { USER_STATUS_FLASH, type UserStatusFlashQuery } from "@/entities/user/status-flash";

type UserFlashQuery = UserStatusFlashQuery & { revokedSessions?: string | null };

const ALLOWANCE_ERROR_MESSAGES: Record<string, string> = {
  allowance_empty: "Enter the allowance in GB.",
  allowance_not_a_number: "The allowance must be a number in GB, for example 10 or 2.5.",
  allowance_out_of_range: "The allowance must be from 0 to 1024 GB.",
  allowance_reason_required: "Give a reason for the change.",
  allowance_reason_too_long: "The reason can be at most 500 characters.",
  allowance_choice_missing: "Choose Set allowance or Use the plan's allowance.",
};

const SUBSCRIPTIONS_CHECK_FAILED = "The store could not be asked.";

/** The user detail page's banners: sign-out, allowance and subscription-check
 * results, then the shared ban/unban ones. */
const USER_FLASH: FlashMessages<UserFlashQuery> = {
  mutations: {
    // An account has at most one active session, so the API answers 0 or 1.
    sessions_revoked: ({ revokedSessions }) =>
      revokedSessions === "0"
        ? { tone: "default", message: "No active session to end." }
        : "Signed out. The account must sign in again.",
    storage_allowance_updated: "Allowance updated.",
    subscriptions_checked:
      "Asked the store about the subscriptions that can still change. What is stored now is below.",
    ...USER_STATUS_FLASH.mutations,
  },
  errors: {
    sessions_revoke_failed: ({ message }) =>
      message || "Could not sign out the account. Try again.",
    ...ALLOWANCE_ERROR_MESSAGES,
    allowance_update_failed: ({ message }) => {
      const base = "The allowance could not be changed.";
      return message ? `${base} ${message}` : base;
    },
    subscriptions_check_failed: ({ message }) => {
      // The server's words for an outage are this same sentence: say it once.
      const reason = message?.trim().replace(/\.$/, "");
      const repeats = reason === SUBSCRIPTIONS_CHECK_FAILED.replace(/\.$/, "");
      return reason && !repeats
        ? `${SUBSCRIPTIONS_CHECK_FAILED} ${reason}`
        : SUBSCRIPTIONS_CHECK_FAILED;
    },
    user_not_found: "That user no longer exists.",
    ...USER_STATUS_FLASH.errors,
  },
};

export function resolveUserBanner(query: UserFlashQuery): Flash | null {
  return resolveFlash(query, USER_FLASH);
}
