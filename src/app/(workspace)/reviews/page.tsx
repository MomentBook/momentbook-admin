import type { Metadata } from "next";
import { buildAdminReviewQueueHref } from "@/lib/navigation/paths";
import { isBackendApiError } from "@/lib/api/client";
import {
  loadReviewQueue,
  parseReviewQueuePage,
  parseReviewQueueTab,
} from "@/features/reviews/queue-loader";
import { WorkspaceShell } from "@/components/layout/workspace-shell";
import { WorkspaceError } from "@/components/layout/workspace-error";
import { parseAdminReviewStatus } from "@/features/reviews/loader";
import { parseUuidFilter } from "@/entities/report/model";
import { loadWorkspacePage, readQueryParam } from "@/lib/workspace/load-workspace-page";
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
  const resolvedSearchParams = await searchParams;
  const tab = parseReviewQueueTab(readQueryParam(resolvedSearchParams.status));
  const pageNumber = parseReviewQueuePage(readQueryParam(resolvedSearchParams.page));
  // An invalid author id is dropped rather than sent (the API answers 400).
  const userId = parseUuidFilter(readQueryParam(resolvedSearchParams.userId));
  const returnTo = buildAdminReviewQueueHref({ status: tab, page: pageNumber, userId });
  const banner = resolveReviewBanner({
    error: readQueryParam(resolvedSearchParams.error),
    mutation: readQueryParam(resolvedSearchParams.mutation),
    reviewStatus: parseAdminReviewStatus(readQueryParam(resolvedSearchParams.reviewStatus)),
    targetPublicId: readQueryParam(resolvedSearchParams.targetPublicId),
  });

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
