import {
  resolveFlash,
  type Flash,
  type FlashMessages,
  type FlashQuery,
} from "@/lib/navigation/flash";

export type UserStatusFlashQuery = FlashQuery & { userStatus?: string | null };

/** The ban/unban action's banners, wherever it was used from; the reports
 * and user pages add them to their own. */
export const USER_STATUS_FLASH: FlashMessages<UserStatusFlashQuery> = {
  mutations: {
    user_status_updated: ({ userStatus }) => {
      switch (userStatus) {
        case "banned":
          return "User has been banned and all active sessions revoked.";
        case "inactive":
          return "Ban lifted. The account stays inactive until it accepts the required consents.";
        default:
          return "Ban lifted.";
      }
    },
  },
  errors: {
    user_update_failed: ({ message }) => message || "Could not update the user. Try again.",
    missing_user_id: ({ message }) => message || "Missing user ID.",
  },
};

export function resolveUserStatusBanner(query: UserStatusFlashQuery): Flash | null {
  return resolveFlash(query, USER_STATUS_FLASH);
}
