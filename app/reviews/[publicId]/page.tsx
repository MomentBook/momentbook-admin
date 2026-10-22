import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminReviewDetailPageView } from "./AdminReviewDetailPageView";
import { buildReviewDetailQueueLinks } from "@/lib/admin/paths";
import { isBackendApiError } from "@/lib/api/client";
import { parseReviewQueueContext, parseReviewQueuePage } from "@/lib/admin/review-queue";
import { loadReportHistoryOrNull } from "@/lib/admin/reports";
import { parseUuidFilter } from "@/lib/admin/reports-shared";
import { loadAdminReviewDetail, parseAdminReviewStatus } from "@/lib/admin/reviews";
import { WorkspaceShell } from "@/components/layout/workspace-shell";
import { resolveSupportedLanguage, toLocaleTag } from "@/lib/i18n/config";
import { buildNoIndexRobots } from "@/lib/seo/public-metadata";
import { loadWorkspacePage, readQueryParam } from "@/app/_workspace/workspace-data";
import { AdminWorkspaceErrorPage } from "@/app/_workspace/AdminWorkspaceErrorPage";
import { resolveUserStatusBanner } from "@/app/_workspace/user-status-banner";
import { resolveReviewBanner } from "../review-banner";

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
  // Null when opened from outside the queue (e.g. report detail): no auto-advance.
  const queueContext = parseReviewQueueContext(readQueryParam(resolvedSearchParams.status));
  // The author filter of the queue this was opened from, kept for the way back.
  const userId = parseUuidFilter(readQueryParam(resolvedSearchParams.userId));
  const detailLanguage = resolveSupportedLanguage(
    readQueryParam(resolvedSearchParams.lang),
  );
  const detailLocale = detailLanguage ? toLocaleTag(detailLanguage) : null;
  const { returnTo, backHref, notFoundHref } = buildReviewDetailQueueLinks({
    publicId,
    status: queueContext,
    page,
    userId,
    lang: detailLocale,
  });
  const read = (key: string) => readQueryParam(resolvedSearchParams[key]);
  const banner =
    resolveReviewBanner({
      error: read("error"),
      mutation: read("mutation"),
      reviewStatus: parseAdminReviewStatus(read("reviewStatus")),
      targetPublicId: read("targetPublicId"),
    }) ??
    resolveUserStatusBanner({
      error: read("error"),
      message: read("message"),
      mutation: read("mutation"),
      userStatus: read("userStatus"),
    });

  let result;

  try {
    result = await loadWorkspacePage({
      returnTo,
      load: async (accessToken) => {
        const detail = await loadAdminReviewDetail({
          accessToken,
          publicId,
          lang: detailLanguage,
        });

        if (!detail) {
          return null;
        }

        const [journeyReports, authorReports] = await Promise.all([
          loadReportHistoryOrNull({
            accessToken,
            targetType: "PUBLISHED_JOURNEY",
            targetId: detail.journey.publicId,
          }),
          loadReportHistoryOrNull({
            accessToken,
            targetType: "USER",
            targetId: detail.journey.userId,
          }),
        ]);

        return { detail, journeyReports, authorReports };
      },
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

  if (!result.data) {
    redirect(notFoundHref);
  }

  return (
    <WorkspaceShell active="reviews" counts={result.counts} session={result.session}>
      <AdminReviewDetailPageView
        authorReports={result.data.authorReports}
        backHref={backHref}
        banner={banner}
        detail={result.data.detail}
        journeyReports={result.data.journeyReports}
        queueStatus={queueContext}
        returnTo={returnTo}
      />
    </WorkspaceShell>
  );
}
