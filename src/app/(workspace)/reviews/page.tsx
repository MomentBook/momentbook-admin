import type { Metadata } from "next";
import { renderWorkspacePage } from "@/components/layout/workspace-page";
import {
  buildAdminReviewQueueHref,
  loadReviewQueueParams,
} from "@/lib/navigation/review-routes";
import { ReviewQueueView } from "@/features/reviews/components/review-queue-view";
import { resolveReviewBanner } from "@/features/reviews/flash";
import { loadReviewQueue } from "@/features/reviews/queue-loader";

export const metadata: Metadata = {
  title: "Review Queue",
};

export default async function ReviewQueuePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = loadReviewQueueParams(await searchParams);
  const { status: tab, page } = query;
  const userId = query.userId ?? undefined;
  const returnTo = buildAdminReviewQueueHref({ status: tab, page, userId });

  return renderWorkspacePage({
    active: "reviews",
    errorHeading: "The review queue is temporarily unavailable.",
    returnTo,
    load: (accessToken, counts) => loadReviewQueue({ accessToken, tab, page, counts, userId }),
    render: (queue) => (
      <ReviewQueueView banner={resolveReviewBanner(query)} queue={queue} returnTo={returnTo} />
    ),
  });
}
