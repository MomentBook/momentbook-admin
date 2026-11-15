import { resolveFlash, type Flash, type FlashMessages } from "@/lib/navigation/flash";

type LoginNoticeQuery = { loggedOut: string | null; error: string | null };

const LOGIN_FLASH: FlashMessages<{ mutation: string | null; error: string | null }> = {
  mutations: {
    signed_out: "Signed out.",
  },
  errors: {
    missing_fields: "Enter email and password.",
    invalid_credentials: "Invalid password.",
    admin_only: "This account is not authorized for admin access.",
    admin_access_denied: "This account no longer has admin access.",
    session_expired: "Session expired. Sign in again.",
    service_unavailable: "Service unavailable.",
  },
};

/** The notice the sign-in page opens with: "Signed out." after
 * `?loggedOut=1`, else why the last session ended (`?error=`). */
export function resolveLoginNotice(query: LoginNoticeQuery): Flash | null {
  return resolveFlash(
    { mutation: query.loggedOut === "1" ? "signed_out" : null, error: query.error },
    LOGIN_FLASH,
  );
}
