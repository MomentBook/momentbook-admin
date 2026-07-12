"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  AdminAccessDeniedError,
  AdminSessionExpiredError,
  BackendApiError,
  logoutAdminFromBackend,
  updatePublishedJourneyReviewStatus,
} from "@/lib/admin/api";
import {
  ADMIN_ROOT_PATH,
  buildAdminLoginHref,
  sanitizeAdminPath,
  withAdminQuery,
} from "@/lib/admin/paths";
import {
  clearAdminSession,
  requireAdminActionSession,
  getStoredAdminSession,
} from "@/lib/admin/session";
import type { UpdatePublishedJourneyReviewRequestDto } from "@/src/apis/client";

function readText(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value.trim() : "";
}

function buildReviewActionRedirect(
  nextPath: string,
  entries: Record<string, string | null | undefined>,
): never {
  redirect(withAdminQuery(nextPath, entries));
}

function readReviewStatus(
  value: FormDataEntryValue | null,
): UpdatePublishedJourneyReviewRequestDto["status"] | null {
  if (typeof value !== "string") return null;
  return value === "PENDING" || value === "APPROVED" || value === "REJECTED"
    ? value
    : null;
}

export async function logoutAdminAction(): Promise<never> {
  const cookieStore = await cookies();
  const session = await getStoredAdminSession(cookieStore);

  if (session?.refreshToken) {
    try {
      await logoutAdminFromBackend(session.refreshToken);
    } catch {
      // Clear the local admin session even if backend logout fails.
    }
  }

  await clearAdminSession(cookieStore);
  redirect(
    buildAdminLoginHref({
      loggedOut: true,
    }),
  );
}

export async function updatePublishedJourneyReviewAction(
  formData: FormData,
): Promise<never> {
  const cookieStore = await cookies();
  const nextPath =
    sanitizeAdminPath(readText(formData.get("returnTo"))) ?? ADMIN_ROOT_PATH;
  const targetPublicId = readText(formData.get("targetPublicId"));
  const reviewStatus = readReviewStatus(formData.get("reviewStatus"));

  const buildReturnEntries = (
    extra: Record<string, string | null | undefined>,
  ) => ({
    targetPublicId: targetPublicId || null,
    mutation: null,
    reviewStatus: null,
    error: null,
    ...extra,
  });

  if (!targetPublicId) {
    return buildReviewActionRedirect(
      nextPath,
      buildReturnEntries({
        error: "missing_public_id",
      }),
    );
  }

  if (!reviewStatus) {
    return buildReviewActionRedirect(
      nextPath,
      buildReturnEntries({
        error: "invalid_review_status",
      }),
    );
  }

  const session = await requireAdminActionSession(cookieStore, nextPath);
  let result: Awaited<ReturnType<typeof updatePublishedJourneyReviewStatus>>;

  try {
    result = await updatePublishedJourneyReviewStatus({
      accessToken: session.accessToken,
      publicId: targetPublicId,
      status: reviewStatus,
    });
  } catch (error) {
    if (error instanceof AdminSessionExpiredError) {
      await clearAdminSession(cookieStore);
      redirect(
        buildAdminLoginHref({
          next: nextPath,
          error: "session_expired",
        }),
      );
    }

    if (error instanceof AdminAccessDeniedError) {
      await clearAdminSession(cookieStore);
      redirect(
        buildAdminLoginHref({
          next: nextPath,
          error: "admin_access_denied",
        }),
      );
    }

    if (error instanceof BackendApiError && error.statusCode === 404) {
      return buildReviewActionRedirect(
        nextPath,
        buildReturnEntries({
          error: "review_target_not_found",
        }),
      );
    }

    return buildReviewActionRedirect(
      nextPath,
      buildReturnEntries({
        error: "review_update_failed",
      }),
    );
  }

  return buildReviewActionRedirect(
    nextPath,
    buildReturnEntries({
      targetPublicId: result.publicId,
      mutation: "review_updated",
      reviewStatus: result.review.status,
    }),
  );
}
