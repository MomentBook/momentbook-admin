"use server";

import { z } from "zod";
import { updateAdminCommentStatus } from "@/lib/api/comments";
import {
  optionalText,
  requiredText,
  runAdminAction,
} from "@/lib/actions/admin-action";
import { ADMIN_COMMENTS_PATH } from "@/lib/navigation/paths";

/** "Delete": hides a comment from the journey for everyone. No 403 here
 * depends on the comment, so one means this admin lost access (sign out). */
export async function deleteAdminCommentAction(formData: FormData): Promise<never> {
  return runAdminAction({
    formData,
    fallbackPath: ADMIN_COMMENTS_PATH,
    fields: z.object({
      commentId: requiredText("comment_update_failed"),
      reason: optionalText,
    }),
    failure: "comment_update_failed",
    onApiError: (error) =>
      error.statusCode === 404 ? { query: { error: "comment_not_found" } } : undefined,
    run: async (input, session) => {
      await updateAdminCommentStatus({
        accessToken: session.accessToken,
        commentId: input.commentId,
        data: { status: "DELETED", reason: input.reason },
      });

      return { query: { mutation: "comment_deleted" } };
    },
  });
}
