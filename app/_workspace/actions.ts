"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { isBackendApiError } from "@/lib/api/client";
import { logoutAdmin } from "@/lib/api/auth";
import { requeueJourneyReview, updateReviewStatus } from "@/lib/api/journeys";
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
import type { UpdatePublishedJourneyReviewRequestDto } from "@/src/apis/types";

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
      await logoutAdmin(session.refreshToken);
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
  let result: Awaited<ReturnType<typeof updateReviewStatus>>;

  try {
    result = await updateReviewStatus({
      accessToken: session.accessToken,
      publicId: targetPublicId,
      status: reviewStatus,
    });
  } catch (error) {
    if (isBackendApiError(error)) {
      if (error.statusCode === 401) {
        await clearAdminSession(cookieStore);
        redirect(
          buildAdminLoginHref({
            next: nextPath,
            error: "session_expired",
          }),
        );
      }

      if (error.statusCode === 403) {
        await clearAdminSession(cookieStore);
        redirect(
          buildAdminLoginHref({
            next: nextPath,
            error: "admin_access_denied",
          }),
        );
      }

      if (error.statusCode === 404) {
        return buildReviewActionRedirect(
          nextPath,
          buildReturnEntries({
            error: "review_target_not_found",
          }),
        );
      }
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

export async function requeueJourneyReviewAction(
  formData: FormData,
): Promise<never> {
  const cookieStore = await cookies();
  const nextPath =
    sanitizeAdminPath(readText(formData.get("returnTo"))) ?? ADMIN_ROOT_PATH;
  const targetPublicId = readText(formData.get("targetPublicId"));

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

  const session = await requireAdminActionSession(cookieStore, nextPath);

  try {
    await requeueJourneyReview({
      accessToken: session.accessToken,
      publicId: targetPublicId,
    });
  } catch (error) {
    if (isBackendApiError(error)) {
      if (error.statusCode === 401) {
        await clearAdminSession(cookieStore);
        redirect(
          buildAdminLoginHref({
            next: nextPath,
            error: "session_expired",
          }),
        );
      }

      if (error.statusCode === 403) {
        await clearAdminSession(cookieStore);
        redirect(
          buildAdminLoginHref({
            next: nextPath,
            error: "admin_access_denied",
          }),
        );
      }

      if (error.statusCode === 404) {
        return buildReviewActionRedirect(
          nextPath,
          buildReturnEntries({
            error: "review_target_not_found",
          }),
        );
      }
    }

    return buildReviewActionRedirect(
      nextPath,
      buildReturnEntries({
        error: "review_requeue_failed",
      }),
    );
  }

  return buildReviewActionRedirect(
    nextPath,
    buildReturnEntries({
      targetPublicId,
      mutation: "review_requeued",
    }),
  );
}
