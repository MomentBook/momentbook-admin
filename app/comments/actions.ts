"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { isBackendApiError } from "@/lib/api/client";
import { updateAdminCommentStatus } from "@/lib/api/comments";
import {
  ADMIN_COMMENTS_PATH,
  buildAdminLoginHref,
  sanitizeAdminPath,
  withAdminQuery,
} from "@/lib/admin/paths";
import {
  clearAdminSession,
  requireAdminActionSession,
} from "@/lib/admin/session";

function readText(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value.trim() : "";
}

function buildReturnEntries(extra: Record<string, string | null | undefined>) {
  return {
    mutation: null,
    error: null,
    message: null,
    ...extra,
  };
}

/** "Delete": hides a comment from the journey for everyone. */
export async function deleteAdminCommentAction(formData: FormData): Promise<never> {
  const cookieStore = await cookies();
  const nextPath =
    sanitizeAdminPath(readText(formData.get("returnTo"))) ?? ADMIN_COMMENTS_PATH;
  const commentId = readText(formData.get("commentId"));
  const reason = readText(formData.get("reason")) || undefined;

  if (!commentId) {
    redirect(withAdminQuery(nextPath, buildReturnEntries({ error: "comment_update_failed" })));
  }

  const session = await requireAdminActionSession(cookieStore, nextPath);

  try {
    await updateAdminCommentStatus({
      accessToken: session.accessToken,
      commentId,
      data: { status: "deleted", reason },
    });
  } catch (error) {
    if (isBackendApiError(error)) {
      if (error.statusCode === 401) {
        await clearAdminSession(cookieStore);
        redirect(buildAdminLoginHref({ next: nextPath, error: "session_expired" }));
      }

      // No 403 here depends on the target, so it means this admin lost access.
      if (error.statusCode === 403) {
        await clearAdminSession(cookieStore);
        redirect(buildAdminLoginHref({ next: nextPath, error: "admin_access_denied" }));
      }

      if (error.statusCode === 404) {
        redirect(withAdminQuery(nextPath, buildReturnEntries({ error: "comment_not_found" })));
      }

      redirect(
        withAdminQuery(
          nextPath,
          buildReturnEntries({ error: "comment_update_failed", message: error.message }),
        ),
      );
    }

    redirect(withAdminQuery(nextPath, buildReturnEntries({ error: "comment_update_failed" })));
  }

  redirect(withAdminQuery(nextPath, buildReturnEntries({ mutation: "comment_deleted" })));
}
