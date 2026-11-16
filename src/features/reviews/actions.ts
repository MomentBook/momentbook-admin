"use server";

import { z } from "zod";
import { requeueJourneyReview, updateReviewStatus } from "@/lib/api/journeys";
import {
  formText,
  readFormText,
  requiredText,
  runAdminAction,
  type ActionOutcome,
  type ApiRefusal,
  type QueryEntries,
} from "@/lib/actions/admin-action";
import { ADMIN_REVIEWS_PATH } from "@/lib/navigation/paths";
import {
  buildAdminReviewDetailHref,
  buildAdminReviewQueueHref,
} from "@/lib/navigation/review-routes";
import { findNextPendingPublicId } from "./queue-loader";

/** The keys a review action owns on the page it returns to. The journey
 * stays named on a failure, so the banner can say which one. */
function reviewBaseQuery(formData: FormData): QueryEntries {
  return {
    targetPublicId: readFormText(formData, "targetPublicId") || null,
    mutation: null,
    reviewStatus: null,
    error: null,
  };
}

function targetNotFound(error: ApiRefusal): ActionOutcome | undefined {
  return error.statusCode === 404 ? { query: { error: "review_target_not_found" } } : undefined;
}

const decisionFields = z.object({
  targetPublicId: requiredText("missing_public_id"),
  reviewStatus: formText.pipe(
    z.enum(["PENDING", "APPROVED", "REJECTED"], { error: "invalid_review_status" }),
  ),
  // The snapshot the admin was looking at; the API rejects the decision
  // (400 REVIEW_STATE_CONFLICT) if the owner republished since.
  publishOperationId: formText,
  acceptUntranslated: formText,
  queueStatus: formText,
  stay: formText,
});

export async function updatePublishedJourneyReviewAction(formData: FormData): Promise<never> {
  return runAdminAction({
    formData,
    fallbackPath: ADMIN_REVIEWS_PATH,
    fields: decisionFields,
    baseQuery: reviewBaseQuery,
    failure: "review_update_failed",
    showApiMessage: false,
    onApiError: (error) =>
      targetNotFound(error) ??
      (error.statusCode === 400 && error.errorCode === "REVIEW_STATE_CONFLICT"
        ? { query: { error: "review_state_conflict" } }
        : undefined),
    run: async (input, session) => {
      const acceptUntranslated =
        input.reviewStatus === "APPROVED" && input.acceptUntranslated === "true";
      const result = await updateReviewStatus({
        accessToken: session.accessToken,
        publicId: input.targetPublicId,
        status: input.reviewStatus,
        ...(input.publishOperationId ? { publishOperationId: input.publishOperationId } : {}),
        ...(acceptUntranslated ? { acceptUntranslated: true } : {}),
      });
      const decided = {
        targetPublicId: result.publicId,
        mutation: "review_updated",
        reviewStatus: result.review.status,
      };
      // Approve/Reject made from the pending queue open the next pending
      // journey, unless the admin ticked "Stay on this journey".
      const advance =
        (input.reviewStatus === "APPROVED" || input.reviewStatus === "REJECTED") &&
        !acceptUntranslated &&
        input.queueStatus === "pending" &&
        input.stay !== "1";

      if (!advance) {
        return { query: decided };
      }

      let nextPublicId: string | null = null;

      try {
        nextPublicId = await findNextPendingPublicId({
          accessToken: session.accessToken,
          excludePublicId: input.targetPublicId,
        });
      } catch {
        // The decision is saved; without a next journey, the queue shows it.
      }

      return {
        // Keep the pending context so the next decision advances too.
        path: nextPublicId
          ? buildAdminReviewDetailHref(nextPublicId, { status: "pending" })
          : buildAdminReviewQueueHref(),
        query: decided,
      };
    },
  });
}

export async function requeueJourneyReviewAction(formData: FormData): Promise<never> {
  return runAdminAction({
    formData,
    fallbackPath: ADMIN_REVIEWS_PATH,
    fields: z.object({ targetPublicId: requiredText("missing_public_id") }),
    baseQuery: reviewBaseQuery,
    failure: "review_requeue_failed",
    showApiMessage: false,
    onApiError: targetNotFound,
    run: async (input, session) => {
      await requeueJourneyReview({
        accessToken: session.accessToken,
        publicId: input.targetPublicId,
      });

      return { query: { targetPublicId: input.targetPublicId, mutation: "review_requeued" } };
    },
  });
}
