"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { isBackendApiError } from "@/lib/api/client";
import { revokeAdminUserSessions } from "@/lib/api/users";
import {
  ADMIN_USERS_PATH,
  buildAdminLoginHref,
  buildAdminUsersHref,
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

/** "Sign out": ends the account's current session. */
export async function revokeAdminUserSessionsAction(formData: FormData): Promise<never> {
  const cookieStore = await cookies();
  const nextPath =
    sanitizeAdminPath(readText(formData.get("returnTo"))) ?? ADMIN_USERS_PATH;
  const userId = readText(formData.get("userId"));
  const reason = readText(formData.get("reason")) || undefined;

  if (!userId) {
    redirect(withAdminQuery(nextPath, buildReturnEntries({ error: "missing_user_id" })));
  }

  const session = await requireAdminActionSession(cookieStore, nextPath);
  let revokedSessions: number;

  try {
    const result = await revokeAdminUserSessions({
      accessToken: session.accessToken,
      userId,
      reason,
    });
    revokedSessions = result.revokedSessions;
  } catch (error) {
    if (isBackendApiError(error)) {
      if (error.statusCode === 401) {
        await clearAdminSession(cookieStore);
        redirect(buildAdminLoginHref({ next: nextPath, error: "session_expired" }));
      }

      if (error.statusCode === 404) {
        redirect(buildAdminUsersHref({ error: "user_not_found" }));
      }

      // 403 (own account or another admin) and 409 (deleted account) are
      // refusals about the target, not about this admin session: show them
      // and keep the admin signed in.
      redirect(
        withAdminQuery(
          nextPath,
          buildReturnEntries({
            error: "sessions_revoke_failed",
            message: error.message,
          }),
        ),
      );
    }

    redirect(withAdminQuery(nextPath, buildReturnEntries({ error: "sessions_revoke_failed" })));
  }

  redirect(
    withAdminQuery(
      nextPath,
      buildReturnEntries({
        mutation: "sessions_revoked",
        revokedSessions: String(revokedSessions),
      }),
    ),
  );
}
