import type { Metadata } from "next";
import {
  buildAdminReviewQueueHref,
  loadReviewQueueParams,
} from "@/lib/navigation/review-routes";
import { isBackendApiError } from "@/lib/api/client";
import { loadReviewQueue } from "@/features/reviews/queue-loader";
import { WorkspaceShell } from "@/components/layout/workspace-shell";
import { WorkspaceError } from "@/components/layout/workspace-error";
import { loadWorkspacePage } from "@/lib/workspace/load-workspace-page";
import { resolveReviewBanner } from "@/features/reviews/flash";
import { ReviewQueuePageView } from "@/features/reviews/components/review-queue-view";

export const metadata: Metadata = {
  title: "Review Queue",
};

export default async function AdminReviewsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = loadReviewQueueParams(await searchParams);
  const tab = query.status;
  const pageNumber = query.page;
  const userId = query.userId ?? undefined;
  const returnTo = buildAdminReviewQueueHref({ status: tab, page: pageNumber, userId });
  const banner = resolveReviewBanner(query);

  let page;

  try {
    page = await loadWorkspacePage({
      returnTo,
      load: (accessToken, counts) =>
        loadReviewQueue({ accessToken, tab, page: pageNumber, counts, userId }),
    });
  } catch (error) {
    if (isBackendApiError(error)) {
      return (
        <WorkspaceError
          heading="The review queue is temporarily unavailable."
          message={error.message}
          statusCode={error.statusCode}
        />
      );
    }

    throw error;
  }

  return (
    <WorkspaceShell active="reviews" counts={page.counts} session={page.session}>
      <ReviewQueuePageView banner={banner} queue={page.data} returnTo={returnTo} />
    </WorkspaceShell>
  );
}
