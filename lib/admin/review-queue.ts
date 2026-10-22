import "server-only";

import { listPublishedJourneys } from "@/lib/api/journeys";
import type { AttentionCounts } from "@/lib/admin/attention";
import { normalizeAdminReviewItem, type AdminReviewQueueItem } from "@/lib/admin/reviews";
import type { AdminPublishedJourneyItemDto, JourneyReviewStatus } from "@/src/apis/types";

export type ReviewQueueTab = "pending" | "translation" | "approved" | "rejected" | "all";

export const REVIEW_QUEUE_TABS: readonly ReviewQueueTab[] = [
  "pending",
  "translation",
  "approved",
  "rejected",
  "all",
];

export const REVIEW_QUEUE_PAGE_SIZE = 20;

// The API rejects page > 100000.
const MAX_QUEUE_PAGE = 100000;

export function parseReviewQueueTab(value: string | null): ReviewQueueTab {
  return REVIEW_QUEUE_TABS.find((tab) => tab === value) ?? "pending";
}

/** The queue tab a detail page was opened from, or `null` when the link came
 * from outside the queue (or names no tab) — only an explicit `pending`
 * context auto-advances after a decision. */
export function parseReviewQueueContext(value: string | null): ReviewQueueTab | null {
  return REVIEW_QUEUE_TABS.find((tab) => tab === value) ?? null;
}

export function parseReviewQueuePage(value: string | null): number {
  if (!value || !/^-?\d+$/.test(value.trim())) {
    return 1;
  }

  const page = Number(value);

  return Math.min(MAX_QUEUE_PAGE, Math.max(1, page));
}

export function reviewQueueTabFilter(tab: ReviewQueueTab): {
  reviewStatus?: JourneyReviewStatus;
  localizationPending?: boolean;
} {
  switch (tab) {
    case "pending":
      return { reviewStatus: "PENDING" };
    case "translation":
      return { localizationPending: true };
    case "approved":
      return { reviewStatus: "APPROVED" };
    case "rejected":
      return { reviewStatus: "REJECTED" };
    case "all":
      return {};
  }
}

export type ReviewQueueItem = AdminReviewQueueItem & {
  /** When the journey last entered review: the latest publish or republish,
   * or the first publish for rows from before the API recorded it. */
  submittedAt: string | null;
};

export type ReviewQueuePage = {
  tab: ReviewQueueTab;
  /** The author filter, or `null` for every author. */
  userId: string | null;
  items: ReviewQueueItem[];
  total: number;
  page: number;
  pages: number;
  tabTotals: Record<ReviewQueueTab, number>;
};

function authorFilter(userId: string | undefined): { userId?: string } {
  return userId ? { userId } : {};
}

async function readTabTotal(
  accessToken: string,
  tab: ReviewQueueTab,
  userId: string | undefined,
): Promise<number> {
  const response = await listPublishedJourneys({
    accessToken,
    page: 1,
    limit: 1,
    ...reviewQueueTabFilter(tab),
    ...authorFilter(userId),
  });

  return response.total;
}

function toReviewQueueItem(journey: AdminPublishedJourneyItemDto): ReviewQueueItem {
  const item = normalizeAdminReviewItem(journey);

  return { ...item, submittedAt: journey.reviewRequestedAt ?? item.publishedAt };
}

/**
 * One server-filtered page of the queue plus a total for every tab. Pending
 * and translation totals come from the attention counts the page already
 * loads, except under an author filter: those counts cover every author, so
 * then each tab is counted with the filter. The active tab's total is the
 * list's own, so the tab label always matches the rows.
 */
export async function loadReviewQueue(input: {
  accessToken: string;
  tab: ReviewQueueTab;
  page: number;
  counts: AttentionCounts | Promise<AttentionCounts>;
  userId?: string;
}): Promise<ReviewQueuePage> {
  const countedTabs: readonly ReviewQueueTab[] = input.userId
    ? REVIEW_QUEUE_TABS
    : ["approved", "rejected", "all"];
  const otherTabs = countedTabs.filter((tab) => tab !== input.tab);

  const [list, counts, ...otherTotals] = await Promise.all([
    listPublishedJourneys({
      accessToken: input.accessToken,
      page: input.page,
      limit: REVIEW_QUEUE_PAGE_SIZE,
      ...reviewQueueTabFilter(input.tab),
      ...authorFilter(input.userId),
    }),
    input.counts,
    ...otherTabs.map((tab) => readTabTotal(input.accessToken, tab, input.userId)),
  ]);

  const tabTotals: Record<ReviewQueueTab, number> = {
    pending: counts.pendingReviews,
    translation: counts.translationPending,
    approved: 0,
    rejected: 0,
    all: 0,
  };
  otherTabs.forEach((tab, index) => {
    tabTotals[tab] = otherTotals[index] ?? 0;
  });
  tabTotals[input.tab] = list.total;

  return {
    tab: input.tab,
    userId: input.userId ?? null,
    items: list.journeys.map(toReviewQueueItem),
    total: list.total,
    page: input.page,
    pages: Math.max(1, list.pages),
    tabTotals,
  };
}

/**
 * The next journey to review after a decision, in queue order. Asks for two
 * because the one just decided can still be listed first.
 */
export async function findNextPendingPublicId(input: {
  accessToken: string;
  excludePublicId: string;
}): Promise<string | null> {
  const response = await listPublishedJourneys({
    accessToken: input.accessToken,
    page: 1,
    limit: 2,
    reviewStatus: "PENDING",
  });

  return (
    response.journeys.find((journey) => journey.publicId !== input.excludePublicId)
      ?.publicId ?? null
  );
}
