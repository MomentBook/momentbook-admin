import type { AdminDashboardBanner } from "@/app/_workspace/workspace-data";
import type { AdminReviewStatus } from "@/lib/admin/reviews";

export type AdminReviewBanner = AdminDashboardBanner & {
  /** The journey an Undo button moves back to pending. */
  undoPublicId?: string;
};

const DECISION_COPY: Record<AdminReviewStatus, string> = {
  APPROVED: "approved.",
  REJECTED: "rejected.",
  PENDING: "moved back to pending.",
};

const ERROR_COPY: Record<string, string> = {
  missing_public_id: "Enter a public ID.",
  invalid_review_status: "Choose a review status.",
  admin_access_denied: "This session cannot update review status.",
  review_target_not_found: "No published journey matched that public ID.",
  review_state_conflict:
    "The owner republished this journey after you opened it. Review the current version and decide again.",
  review_update_failed: "Could not update review status. Try again.",
  review_requeue_failed: "Could not re-queue the translation. Try again.",
  review_requeue_unavailable: "Translation queue unavailable. Nothing changed — try again.",
};

export function resolveReviewBanner(options: {
  error: string | null;
  mutation: string | null;
  reviewStatus: AdminReviewStatus | null;
  targetPublicId: string | null;
}): AdminReviewBanner | null {
  if (options.mutation === "review_updated" && options.targetPublicId && options.reviewStatus) {
    return {
      tone: "success",
      message: `${options.targetPublicId} ${DECISION_COPY[options.reviewStatus]}`,
      // Undo restores the review state only; notifications already sent for
      // the decision are not recalled.
      ...(options.reviewStatus !== "PENDING" ? { undoPublicId: options.targetPublicId } : {}),
    };
  }

  if (options.mutation === "review_requeued" && options.targetPublicId) {
    return {
      tone: "default",
      message: `${options.targetPublicId} translation re-queued.`,
    };
  }

  const message = options.error ? ERROR_COPY[options.error] : undefined;

  return message ? { tone: "error", message } : null;
}
