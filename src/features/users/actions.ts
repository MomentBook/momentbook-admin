"use server";

import { z } from "zod";
import { resyncAdminUserSubscriptions } from "@/lib/api/subscriptions";
import { revokeAdminUserSessions, updateAdminUserStorageAllowance } from "@/lib/api/users";
import {
  formText,
  optionalText,
  requiredText,
  runAdminAction,
  type ActionOutcome,
  type ApiRefusal,
} from "@/lib/actions/admin-action";
import { ADMIN_USERS_PATH, buildAdminUsersHref } from "@/lib/navigation/paths";
import { parseAllowanceGigabytes } from "@/entities/storage/model";

// Every users endpoint refuses its target with 403 (an admin account, the
// admin's own) or 409 (a deleted account): those are banners, and the admin
// stays signed in (ADR 0011).

/** An unknown account goes back to the directory. */
function userGone(error: ApiRefusal): ActionOutcome | undefined {
  return error.statusCode === 404
    ? { path: buildAdminUsersHref(), query: { error: "user_not_found" } }
    : undefined;
}

/** "Sign out": ends the account's current session. */
export async function revokeAdminUserSessionsAction(formData: FormData): Promise<never> {
  return runAdminAction({
    formData,
    fallbackPath: ADMIN_USERS_PATH,
    fields: z.object({ userId: requiredText("missing_user_id"), reason: optionalText }),
    failure: "sessions_revoke_failed",
    onAccessDenied: "banner",
    onApiError: userGone,
    run: async (input, session) => {
      const result = await revokeAdminUserSessions({
        accessToken: session.accessToken,
        userId: input.userId,
        reason: input.reason,
      });

      return {
        query: { mutation: "sessions_revoked", revokedSessions: String(result.revokedSessions) },
      };
    },
  });
}

const ALLOWANCE_REASON_MAX_LENGTH = 500;

/** The allowance form: `intent` names the button (`set` an amount in GB, or
 * go back to the `plan`'s allowance), and every change needs a reason. */
const allowanceFields = z
  .object({
    userId: requiredText("missing_user_id"),
    intent: formText,
    amount: formText,
    reason: formText,
  })
  .transform((input, context) => {
    const refuse = (code: string) => {
      context.addIssue({ code: "custom", message: code });
      return z.NEVER;
    };
    let quotaOverrideBytes: number | null;

    if (input.intent === "set") {
      const amount = parseAllowanceGigabytes(input.amount);

      if (!amount.ok) return refuse(`allowance_${amount.error}`);
      quotaOverrideBytes = amount.bytes;
    } else if (input.intent === "plan") {
      quotaOverrideBytes = null;
    } else {
      return refuse("allowance_choice_missing");
    }

    if (!input.reason) return refuse("allowance_reason_required");
    if (input.reason.length > ALLOWANCE_REASON_MAX_LENGTH) {
      return refuse("allowance_reason_too_long");
    }

    return { userId: input.userId, quotaOverrideBytes, reason: input.reason };
  });

/**
 * "Set allowance" and "Use the plan's allowance": gives the account its own
 * backup allowance or clears it. Every check runs before the request.
 */
export async function updateAdminUserStorageAllowanceAction(formData: FormData): Promise<never> {
  return runAdminAction({
    formData,
    fallbackPath: ADMIN_USERS_PATH,
    fields: allowanceFields,
    failure: "allowance_update_failed",
    onAccessDenied: "banner",
    onApiError: userGone,
    run: async (input, session) => {
      await updateAdminUserStorageAllowance({ accessToken: session.accessToken, ...input });

      return { query: { mutation: "storage_allowance_updated" } };
    },
  });
}

// The API's ids are UUIDs. Anything else is refused here: a value such as
// ".." would fold the request path onto another route.
const USER_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * "Check with the store": has the server read the account's subscriptions
 * back from their stores and store what they say. It sets nothing a store did
 * not say, so it needs no reason and writes no audit entry. A 503 (the store
 * has no keys here or could not be asked) is a banner with the server's
 * reason.
 */
export async function resyncAdminUserSubscriptionsAction(formData: FormData): Promise<never> {
  return runAdminAction({
    formData,
    fallbackPath: ADMIN_USERS_PATH,
    fields: z.object({ userId: formText.pipe(z.string().regex(USER_ID, "missing_user_id")) }),
    failure: "subscriptions_check_failed",
    onAccessDenied: "banner",
    onApiError: userGone,
    run: async (input, session) => {
      await resyncAdminUserSubscriptions({ accessToken: session.accessToken, userId: input.userId });

      return { query: { mutation: "subscriptions_checked" } };
    },
  });
}
