"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { isBackendApiError } from "@/lib/api/client";
import { revokeAdminUserSessions, updateAdminUserStorageAllowance } from "@/lib/api/users";
import { parseAllowanceGigabytes } from "@/lib/admin/storage-shared";
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

const ALLOWANCE_REASON_MAX_LENGTH = 500;

/**
 * "Set allowance" and "Use the plan's allowance": gives the account its own
 * backup allowance or clears it. Which one is asked for comes from the
 * `intent` field of the confirmed form (`set` or `plan`); anything else sends
 * nothing. Every check runs before the request.
 */
export async function updateAdminUserStorageAllowanceAction(
  formData: FormData,
): Promise<never> {
  const cookieStore = await cookies();
  const nextPath =
    sanitizeAdminPath(readText(formData.get("returnTo"))) ?? ADMIN_USERS_PATH;
  const userId = readText(formData.get("userId"));
  const intent = readText(formData.get("intent"));
  const reason = readText(formData.get("reason"));

  if (!userId) {
    redirect(withAdminQuery(nextPath, buildReturnEntries({ error: "missing_user_id" })));
  }

  const session = await requireAdminActionSession(cookieStore, nextPath);
  const fail = (error: string): never =>
    redirect(withAdminQuery(nextPath, buildReturnEntries({ error })));

  let quotaOverrideBytes: number | null;

  if (intent === "set") {
    const amount = parseAllowanceGigabytes(readText(formData.get("amount")));

    if (!amount.ok) return fail(`allowance_${amount.error}`);
    quotaOverrideBytes = amount.bytes;
  } else if (intent === "plan") {
    quotaOverrideBytes = null;
  } else {
    return fail("allowance_choice_missing");
  }

  if (!reason) return fail("allowance_reason_required");
  if (reason.length > ALLOWANCE_REASON_MAX_LENGTH) return fail("allowance_reason_too_long");

  try {
    await updateAdminUserStorageAllowance({
      accessToken: session.accessToken,
      userId,
      quotaOverrideBytes,
      reason,
    });
  } catch (error) {
    if (isBackendApiError(error)) {
      if (error.statusCode === 401) {
        await clearAdminSession(cookieStore);
        redirect(buildAdminLoginHref({ next: nextPath, error: "session_expired" }));
      }

      if (error.statusCode === 404) {
        redirect(buildAdminUsersHref({ error: "user_not_found" }));
      }

      // 403 and 409 (deleted account) are refusals about the target or the
      // operation, not about this admin session: show them, stay signed in.
      redirect(
        withAdminQuery(
          nextPath,
          buildReturnEntries({
            error: "allowance_update_failed",
            message: error.message,
          }),
        ),
      );
    }

    redirect(withAdminQuery(nextPath, buildReturnEntries({ error: "allowance_update_failed" })));
  }

  redirect(withAdminQuery(nextPath, buildReturnEntries({ mutation: "storage_allowance_updated" })));
}
