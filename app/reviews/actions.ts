"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { isBackendApiError } from "@/lib/api/client";
import { requeueJourneyReview, updateReviewStatus } from "@/lib/api/journeys";
import {
  ADMIN_REVIEWS_PATH,
  buildAdminLoginHref,
  buildAdminReviewDetailHref,
  buildAdminReviewQueueHref,
  sanitizeAdminPath,
  withAdminQuery,
} from "@/lib/admin/paths";
import { findNextPendingPublicId } from "@/lib/admin/review-queue";
import {
  clearAdminSession,
  requireAdminActionSession,
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

export async function updatePublishedJourneyReviewAction(
  formData: FormData,
): Promise<never> {
  const cookieStore = await cookies();
  const nextPath =
    sanitizeAdminPath(readText(formData.get("returnTo"))) ?? ADMIN_REVIEWS_PATH;
  const targetPublicId = readText(formData.get("targetPublicId"));
  const reviewStatus = readReviewStatus(formData.get("reviewStatus"));
  // The snapshot the admin was looking at; the API rejects the decision
  // (400 REVIEW_STATE_CONFLICT) if the owner republished since.
  const publishOperationId = readText(formData.get("publishOperationId"));
  const acceptUntranslated =
    reviewStatus === "APPROVED" && readText(formData.get("acceptUntranslated")) === "true";
  // Approve/Reject made from the pending queue open the next pending journey,
  // unless the admin ticked "Stay on this journey".
  const advance =
    (reviewStatus === "APPROVED" || reviewStatus === "REJECTED") &&
    !acceptUntranslated &&
    readText(formData.get("queueStatus")) === "pending" &&
    readText(formData.get("stay")) !== "1";

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
      ...(publishOperationId ? { publishOperationId } : {}),
      ...(acceptUntranslated ? { acceptUntranslated: true } : {}),
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

      if (
        error.statusCode === 400 &&
        "errorCode" in error &&
        error.errorCode === "REVIEW_STATE_CONFLICT"
      ) {
        return buildReviewActionRedirect(
          nextPath,
          buildReturnEntries({
            error: "review_state_conflict",
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

  const successEntries = buildReturnEntries({
    targetPublicId: result.publicId,
    mutation: "review_updated",
    reviewStatus: result.review.status,
  });

  if (advance) {
    let nextPublicId: string | null = null;

    try {
      nextPublicId = await findNextPendingPublicId({
        accessToken: session.accessToken,
        excludePublicId: targetPublicId,
      });
    } catch {
      // The decision is saved; without a next journey, the queue shows it.
    }

    redirect(
      nextPublicId
        ? buildAdminReviewDetailHref(nextPublicId, successEntries)
        : buildAdminReviewQueueHref({ entries: successEntries }),
    );
  }

  return buildReviewActionRedirect(nextPath, successEntries);
}

export async function requeueJourneyReviewAction(
  formData: FormData,
): Promise<never> {
  const cookieStore = await cookies();
  const nextPath =
    sanitizeAdminPath(readText(formData.get("returnTo"))) ?? ADMIN_REVIEWS_PATH;
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

      // The API could not reach the translation queue; nothing was changed.
      if (error.statusCode === 502) {
        return buildReviewActionRedirect(
          nextPath,
          buildReturnEntries({
            error: "review_requeue_unavailable",
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
