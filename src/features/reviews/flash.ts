import {
  resolveFlash,
  type Flash,
  type FlashMessages,
  type FlashQuery,
} from "@/lib/navigation/flash";
import type { AdminReviewStatus } from "@/entities/journey/model";

export type AdminReviewBanner = Flash & {
  /** The journey an Undo button moves back to pending. */
  undoPublicId?: string;
};

type ReviewFlashQuery = FlashQuery & {
  reviewStatus?: AdminReviewStatus | null;
  targetPublicId?: string | null;
};

const DECISION_COPY: Record<AdminReviewStatus, string> = {
  APPROVED: "approved.",
  REJECTED: "rejected.",
  PENDING: "moved back to pending.",
};

const REVIEW_FLASH: FlashMessages<ReviewFlashQuery> = {
  mutations: {
    review_updated: ({ targetPublicId, reviewStatus }) =>
      targetPublicId && reviewStatus ? `${targetPublicId} ${DECISION_COPY[reviewStatus]}` : null,
    review_requeued: ({ targetPublicId }) =>
      targetPublicId
        ? { tone: "default", message: `${targetPublicId} translation retry scheduled.` }
        : null,
  },
  errors: {
    missing_public_id: "Enter a public ID.",
    invalid_review_status: "Choose a review status.",
    admin_access_denied: "This session cannot update review status.",
    review_target_not_found: "No published journey matched that public ID.",
    review_state_conflict:
      "The owner republished this journey after you opened it. Review the current version and decide again.",
    review_update_failed: "Could not update review status. Try again.",
    review_requeue_failed: "Could not retry the translation. Try again.",
  },
};

export function resolveReviewBanner(query: ReviewFlashQuery): AdminReviewBanner | null {
  const flash = resolveFlash(query, REVIEW_FLASH);
  // After Approve or Reject, Undo restores the review state only;
  // notifications already sent for the decision are not recalled.
  const undoPublicId =
    flash?.tone === "success" &&
    query.mutation === "review_updated" &&
    query.reviewStatus !== "PENDING"
      ? query.targetPublicId
      : null;

  return flash && undoPublicId ? { ...flash, undoPublicId } : flash;
}
