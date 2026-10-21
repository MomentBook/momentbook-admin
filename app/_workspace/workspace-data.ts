import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { isBackendApiError } from "@/lib/api/client";
import { loadAttentionCounts, type AttentionCounts } from "@/lib/admin/attention";
import {
  getAdminReviewStatusLabel,
  type AdminReviewStatus,
  parseAdminReviewStatus,
} from "@/lib/admin/reviews";
import { buildAdminSessionInvalidateHref } from "@/lib/admin/paths";
import {
  type AdminSession,
  requireAdminApiSession,
} from "@/lib/admin/session";

export type AdminDashboardBanner = {
  tone: "default" | "error" | "success";
  message: string;
};

export function readQueryParam(
  value: string | string[] | undefined,
): string | null {
  if (typeof value === "string") {
    return value;
  }

  if (Array.isArray(value) && value.length > 0) {
    return value[0] ?? null;
  }

  return null;
}

export function parsePage(value: string | null): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 1 ? Math.floor(parsed) : 1;
}

export function parseReviewStatus(value: string | null): AdminReviewStatus | null {
  return parseAdminReviewStatus(value);
}

export function resolveBanner(options: {
  error: string | null;
  mutation: string | null;
  reviewStatus: AdminReviewStatus | null;
  targetPublicId: string | null;
}): AdminDashboardBanner | null {
  if (
    options.mutation === "review_updated" &&
    options.targetPublicId &&
    options.reviewStatus
  ) {

    return {
      tone: "success",
      message: `${options.targetPublicId} updated to ${getAdminReviewStatusLabel(options.reviewStatus)}.`,
    };
  }

  if (options.mutation === "review_requeued" && options.targetPublicId) {
    return {
      tone: "default",
      message: `${options.targetPublicId} translation re-queued.`,
    };
  }

  switch (options.error) {
    case "missing_public_id":
      return {
        tone: "error",
        message: "Enter a public ID.",
      };
    case "invalid_review_status":
      return {
        tone: "error",
        message: "Choose a review status.",
      };
    case "admin_access_denied":
      return {
        tone: "error",
        message: "This session cannot update review status.",
      };
    case "review_target_not_found":
      return {
        tone: "error",
        message: "No published journey matched that public ID.",
      };
    case "review_state_conflict":
      return {
        tone: "error",
        message:
          "The owner republished this journey after you opened it. Review the current version and decide again.",
      };
    case "review_update_failed":
      return {
        tone: "error",
        message: "Could not update review status. Try again.",
      };
    case "review_requeue_failed":
      return {
        tone: "error",
        message: "Could not re-queue the translation. Try again.",
      };
    default:
      return null;
  }
}

/**
 * Loads a workspace page: the page's own data and the attention counts for
 * the sidebar run in parallel under one admin session. `load` receives the
 * in-flight counts for pages that also show them. Backend 401/403 from
 * either invalidate the session and return the admin to `returnTo` after
 * signing in again.
 */
export async function loadWorkspacePage<T>(options: {
  returnTo: string;
  load: (accessToken: string, counts: Promise<AttentionCounts>) => Promise<T>;
}): Promise<{
  data: T;
  counts: AttentionCounts;
  session: AdminSession;
}> {
  const cookieStore = await cookies();
  const session = await requireAdminApiSession(cookieStore, options.returnTo);

  try {
    const countsPromise = loadAttentionCounts(session.accessToken);
    const [data, counts] = await Promise.all([
      options.load(session.accessToken, countsPromise),
      countsPromise,
    ]);

    return { data, counts, session };
  } catch (error) {
    if (isBackendApiError(error) && error.statusCode === 401) {
      redirect(
        buildAdminSessionInvalidateHref({
          next: options.returnTo,
          error: "session_expired",
        }),
      );
    }

    if (isBackendApiError(error) && error.statusCode === 403) {
      redirect(
        buildAdminSessionInvalidateHref({
          next: options.returnTo,
          error: "admin_access_denied",
        }),
      );
    }

    throw error;
  }
}
