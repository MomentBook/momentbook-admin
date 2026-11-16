"use server";

import { z } from "zod";
import { updateAdminUserStatus } from "@/lib/api/users";
import {
  formText,
  optionalText,
  requiredText,
  runAdminAction,
} from "@/lib/actions/admin-action";
import { ADMIN_REPORTS_PATH } from "@/lib/navigation/paths";

/** Bans or unbans an account, from a report, a review or the user's page. A
 * 403 is the API refusing this target (an admin account), shown as a banner
 * (ADR 0011). */
export async function updateAdminUserStatusAction(formData: FormData): Promise<never> {
  return runAdminAction({
    formData,
    fallbackPath: ADMIN_REPORTS_PATH,
    fields: z.object({
      userId: requiredText("missing_user_id"),
      status: formText,
      reason: optionalText,
      // The report this decision answers (report detail only); the API
      // records it with the sanction and rejects one not about this user.
      reportId: optionalText,
    }),
    inputMessages: { missing_user_id: "User ID is required." },
    failure: "user_update_failed",
    onAccessDenied: "banner",
    onApiError: (error) =>
      error.statusCode === 403
        ? {
            query: {
              error: "user_update_failed",
              message: error.message || "Cannot change the status of an admin account.",
            },
          }
        : undefined,
    run: async (input, session) => {
      const result = await updateAdminUserStatus({
        accessToken: session.accessToken,
        userId: input.userId,
        data: {
          status: input.status === "banned" ? "BANNED" : "ACTIVE",
          reason: input.reason,
          ...(input.reportId ? { reportId: input.reportId } : {}),
        },
      });

      // Lifting a ban can leave the account inactive (pending consents);
      // report what the API did, not what was asked. The URL keeps its
      // lowercase spelling (`banned`, `active`, `inactive`).
      return {
        query: { mutation: "user_status_updated", userStatus: result.status.toLowerCase() },
      };
    },
  });
}
