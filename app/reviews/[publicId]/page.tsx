import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminReviewDetailPageView } from "./AdminReviewDetailPageView";
import {
  buildAdminReviewDetailHref,
  buildAdminReviewQueueHref,
} from "@/lib/admin/paths";
import { isBackendApiError } from "@/lib/api/client";
import { parseReviewQueuePage, parseReviewQueueTab } from "@/lib/admin/review-queue";
import { loadAdminReviewDetail } from "@/lib/admin/reviews";
import { WorkspaceShell } from "@/components/layout/workspace-shell";
import { resolveSupportedLanguage, toLocaleTag } from "@/lib/i18n/config";
import { buildNoIndexRobots } from "@/lib/seo/public-metadata";
import {
  loadWorkspacePage,
  parseReviewStatus,
  readQueryParam,
  resolveBanner,
} from "@/app/_workspace/workspace-data";
import { AdminWorkspaceErrorPage } from "@/app/_workspace/AdminWorkspaceErrorPage";

export const metadata: Metadata = {
  title: "Review Detail",
  robots: buildNoIndexRobots(),
};

export default async function AdminReviewDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ publicId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const publicId = decodeURIComponent(resolvedParams.publicId);
  const page = parseReviewQueuePage(readQueryParam(resolvedSearchParams.page));
  const status = parseReviewQueueTab(readQueryParam(resolvedSearchParams.status));
  const detailLanguage = resolveSupportedLanguage(
    readQueryParam(resolvedSearchParams.lang),
  );
  const detailLocale = detailLanguage ? toLocaleTag(detailLanguage) : null;
  const targetPublicId = readQueryParam(resolvedSearchParams.targetPublicId);
  const mutation = readQueryParam(resolvedSearchParams.mutation);
  const reviewStatus = parseReviewStatus(
    readQueryParam(resolvedSearchParams.reviewStatus),
  );
  const returnTo = buildAdminReviewDetailHref(publicId, {
    lang: detailLocale,
    page: page > 1 ? String(page) : null,
    status: status === "pending" ? null : status,
  });

  const banner = resolveBanner({
    error: readQueryParam(resolvedSearchParams.error),
    mutation,
    reviewStatus,
    targetPublicId,
  });

  const reviewMutation =
    mutation === "review_updated" && targetPublicId && reviewStatus
      ? {
          publicId: targetPublicId,
          reviewStatus,
        }
      : null;

  let result;

  try {
    result = await loadWorkspacePage({
      returnTo,
      load: (accessToken) =>
        loadAdminReviewDetail({ accessToken, publicId, lang: detailLanguage }),
    });
  } catch (error) {
    if (isBackendApiError(error)) {
      return (
        <AdminWorkspaceErrorPage
          heading="The review detail is temporarily unavailable."
          message={error.message}
          statusCode={error.statusCode}
        />
      );
    }

    throw error;
  }

  const backHref = buildAdminReviewQueueHref({ status, page });

  if (!result.data) {
    redirect(
      buildAdminReviewQueueHref({
        status,
        page,
        entries: { error: "review_target_not_found" },
      }),
    );
  }

  return (
    <WorkspaceShell active="reviews" counts={result.counts} session={result.session}>
      <AdminReviewDetailPageView
        backHref={backHref}
        banner={banner}
        detail={result.data}
        pendingCount={result.counts.pendingReviews}
        reviewMutation={reviewMutation}
        returnTo={returnTo}
        targetPublicId={targetPublicId}
      />
    </WorkspaceShell>
  );
}
