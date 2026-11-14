"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { isBackendApiError } from "@/lib/api/client";
import { resyncAdminUserSubscriptions } from "@/lib/api/subscriptions";
import {
  ADMIN_USERS_PATH,
  buildAdminLoginHref,
  buildAdminUsersHref,
  sanitizeAdminPath,
  withAdminQuery,
} from "@/lib/admin/paths";
import { clearAdminSession, requireAdminActionSession } from "@/lib/admin/session";

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

/**
 * "Check with the store": has the server read the account's subscriptions
 * back from their stores and store what they say. It sets nothing a store did
 * not say, so it needs no reason and writes no audit entry.
 */
export async function resyncAdminUserSubscriptionsAction(formData: FormData): Promise<never> {
  const cookieStore = await cookies();
  const nextPath =
    sanitizeAdminPath(readText(formData.get("returnTo"))) ?? ADMIN_USERS_PATH;
  const userId = readText(formData.get("userId"));

  if (!userId) {
    redirect(withAdminQuery(nextPath, buildReturnEntries({ error: "missing_user_id" })));
  }

  const session = await requireAdminActionSession(cookieStore, nextPath);

  try {
    await resyncAdminUserSubscriptions({ accessToken: session.accessToken, userId });
  } catch (error) {
    if (isBackendApiError(error)) {
      if (error.statusCode === 401) {
        await clearAdminSession(cookieStore);
        redirect(buildAdminLoginHref({ next: nextPath, error: "session_expired" }));
      }

      if (error.statusCode === 404) {
        redirect(buildAdminUsersHref({ error: "user_not_found" }));
      }

      // 503: the store has no keys here or could not be asked. About the
      // store, not about this admin session: show it, stay signed in.
      redirect(
        withAdminQuery(
          nextPath,
          buildReturnEntries({
            error: "subscriptions_check_failed",
            message: error.message,
          }),
        ),
      );
    }

    redirect(
      withAdminQuery(nextPath, buildReturnEntries({ error: "subscriptions_check_failed" })),
    );
  }

  redirect(withAdminQuery(nextPath, buildReturnEntries({ mutation: "subscriptions_checked" })));
}
