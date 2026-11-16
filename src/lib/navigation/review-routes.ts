import { createLoader, parseAsString, parseAsStringLiteral } from "nuqs/server";
import { ADMIN_REVIEWS_PATH, withAdminQuery } from "./paths";
import {
  createAdminSerializer,
  parseAsPage,
  parseAsText,
  parseAsUuid,
  toPage,
  toText,
} from "./params";

/** The review queue's tabs, as `?status=` names them. */
export const REVIEW_QUEUE_TABS = ["pending", "translation", "approved", "rejected", "all"] as const;
export type ReviewQueueTab = (typeof REVIEW_QUEUE_TABS)[number];

const REVIEW_DECISIONS = ["PENDING", "APPROVED", "REJECTED"] as const;

/** What a review or ban action leaves on the page it returns to. */
const reviewFlashParams = {
  targetPublicId: parseAsString,
  mutation: parseAsString,
  reviewStatus: parseAsStringLiteral(REVIEW_DECISIONS),
  error: parseAsString,
  message: parseAsString,
  userStatus: parseAsString,
};

/** `/reviews`: the tab (pending unless named), the author filter (a non-UUID
 * is dropped: the API answers 400), the page. */
export const loadReviewQueueParams = createLoader({
  status: parseAsStringLiteral(REVIEW_QUEUE_TABS).withDefault("pending"),
  userId: parseAsUuid,
  page: parseAsPage,
  ...reviewFlashParams,
});

/** `/reviews/<publicId>`: the language shown, then the queue it was opened
 * from. Without a tab (a link from outside the queue, e.g. a report) a
 * decision never advances to the next journey. */
export const loadReviewDetailParams = createLoader({
  lang: parseAsText,
  page: parseAsPage,
  status: parseAsStringLiteral(REVIEW_QUEUE_TABS),
  userId: parseAsUuid,
  ...reviewFlashParams,
});

// Links write what the caller names, in each page's key order; the page
// that opens them does the checking.
const serializeQueue = createAdminSerializer({
  status: parseAsString.withDefault("pending"),
  userId: parseAsString,
  page: parseAsPage,
});
const serializeDetail = createAdminSerializer({
  lang: parseAsString,
  page: parseAsPage,
  status: parseAsString,
  userId: parseAsString,
});

type QueryEntries = Record<string, string | null | undefined>;

function reviewDetailPath(publicId: string): string {
  return `${ADMIN_REVIEWS_PATH}/${encodeURIComponent(publicId)}`;
}

/** The review queue; `pending` and page 1 are the defaults and stay out of
 * the URL. `entries` (a banner) follow the filters. */
export function buildAdminReviewQueueHref(options?: {
  status?: string | null;
  page?: number | string | null;
  userId?: string | null;
  entries?: QueryEntries;
}): string {
  const href = serializeQueue(ADMIN_REVIEWS_PATH, {
    status: toText(options?.status),
    userId: toText(options?.userId),
    page: toPage(options?.page),
  });

  return options?.entries ? withAdminQuery(href, options.entries) : href;
}

export function buildAdminReviewDetailHref(publicId: string, entries?: QueryEntries): string {
  return withAdminQuery(reviewDetailPath(publicId), entries ?? {});
}

/** A review detail page's own URL (the action `returnTo`) and its links back
 * to the queue it was opened from. They carry the tab, page and author
 * filter, so going back lands on the same rows. `status` is the explicit
 * queue context, or `null` when opened from outside the queue. */
export function buildReviewDetailQueueLinks(options: {
  publicId: string;
  status: string | null;
  page: number;
  userId?: string | null;
  lang?: string | null;
}): { returnTo: string; backHref: string; notFoundHref: string } {
  const queue = { status: options.status, page: options.page, userId: options.userId };

  return {
    returnTo: serializeDetail(reviewDetailPath(options.publicId), {
      lang: toText(options.lang),
      page: toPage(options.page),
      status: toText(options.status),
      userId: toText(options.userId),
    }),
    backHref: buildAdminReviewQueueHref(queue),
    notFoundHref: buildAdminReviewQueueHref({
      ...queue,
      entries: { error: "review_target_not_found" },
    }),
  };
}
