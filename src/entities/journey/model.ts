import type { StatusTone } from "@/components/status-badge";
import type { AdminPublishedJourneyItemDto, PublishedJourneyDetailDto, PublishedJourneyReviewDto } from "@/lib/api/types";
import { normalizeLocalDateTimeContext, type LocalDateTimeContext } from "@/lib/format/local-time-context";
import { parseApiTime, readText, resolveJourneyListCoverUrl } from "@/lib/format/view-helpers";

// A published journey as the review queue, the review page, a user's page
// and the overview show it.

export type AdminReviewStatus = PublishedJourneyReviewDto["status"];
export type AdminReviewContentStatus = PublishedJourneyDetailDto["contentStatus"];
export type AdminReviewVisibility = PublishedJourneyDetailDto["visibility"];

export type AdminReviewState = {
  status: AdminReviewStatus;
  approved: boolean;
  /** Translation has not landed yet — an APPROVED journey is not public
   * until it does. */
  localizationPending?: boolean;
  /** Automatic translation gave up after retrying; retry it from the detail
   * page. */
  enqueueFailed?: boolean;
  decidedBy?: "AI" | "ADMIN";
  decidedAt?: string;
};

export type AdminReviewQueueItem = {
  publicId: string;
  journeyId: string;
  userId: string;
  title: string | null;
  description: string | null;
  thumbnailUrl: string | null;
  photoCount: number;
  createdAt: string;
  publishedAt: string | null;
  published: boolean;
  visibility: AdminReviewVisibility;
  review: AdminReviewState;
  publishOperationId: string | null;
  startedAt: number | null;
  endedAt: number | null;
  startedAtLocal: LocalDateTimeContext | null;
  endedAtLocal: LocalDateTimeContext | null;
  recapStage: "NONE" | "FINALIZED";
};

const REVIEW_STATUS_LABELS: Record<AdminReviewStatus, string> = {
  PENDING: "Pending",
  APPROVED: "Approved",
  REJECTED: "Rejected",
};

/** How each review status reads at a glance. */
export const REVIEW_STATUS_TONES: Record<AdminReviewStatus, StatusTone> = {
  PENDING: "warning",
  APPROVED: "success",
  REJECTED: "danger",
};

export function parseAdminReviewStatus(value: string | null): AdminReviewStatus | null {
  return value === "PENDING" || value === "APPROVED" || value === "REJECTED" ? value : null;
}

export function getAdminReviewStatusLabel(status: AdminReviewStatus): string {
  return REVIEW_STATUS_LABELS[status];
}

export function normalizeReviewState(review: PublishedJourneyReviewDto): AdminReviewState {
  return {
    status: review.status,
    approved: review.approved,
    ...(review.localizationPending ? { localizationPending: true } : {}),
    ...(review.enqueueFailed ? { enqueueFailed: true } : {}),
    ...(review.decidedBy !== null ? { decidedBy: review.decidedBy } : {}),
    ...(review.decidedAt !== null ? { decidedAt: review.decidedAt } : {}),
  };
}

/** A queue row: the title, description and cover come from the metadata the
 * owner published. */
export function normalizeAdminReviewItem(item: AdminPublishedJourneyItemDto): AdminReviewQueueItem {
  const thumbnailUri = readText(item.metadata.thumbnailUri);

  return {
    publicId: item.publicId,
    journeyId: item.journeyId,
    userId: item.userId,
    title: readText(item.metadata.title),
    description: readText(item.metadata.description),
    thumbnailUrl:
      resolveJourneyListCoverUrl({ thumbnailUrl: item.thumbnailUrl, metadata: item.metadata }) ??
      thumbnailUri,
    photoCount: item.photoCount,
    createdAt: readText(item.createdAt) ?? "",
    publishedAt: readText(item.publishedAt),
    published: item.published,
    visibility: item.visibility,
    review: normalizeReviewState(item.review),
    publishOperationId: readText(item.publishOperationId),
    startedAt: parseApiTime(item.startedAt),
    endedAt: parseApiTime(item.endedAt),
    startedAtLocal: normalizeLocalDateTimeContext(item.startedAtLocal),
    endedAtLocal: normalizeLocalDateTimeContext(item.endedAtLocal),
    recapStage: item.recapStage,
  };
}
