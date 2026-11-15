import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminReviewDetailPageView } from "@/features/reviews/components/review-detail-view";
import {
  buildReviewDetailQueueLinks,
  loadReviewDetailParams,
} from "@/lib/navigation/review-routes";
import { isBackendApiError } from "@/lib/api/client";
import { loadReportHistoryOrNull } from "@/features/reports/loader";
import { loadAdminReviewDetail } from "@/features/reviews/loader";
import { WorkspaceShell } from "@/components/layout/workspace-shell";
import { resolveSupportedLanguage, toLocaleTag } from "@/lib/i18n";
import { loadWorkspacePage } from "@/lib/workspace/load-workspace-page";
import { WorkspaceError } from "@/components/layout/workspace-error";
import { resolveUserStatusBanner } from "@/entities/user/status-flash";
import { resolveReviewBanner } from "@/features/reviews/flash";

export const metadata: Metadata = {
  title: "Review Detail",
};

export default async function AdminReviewDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ publicId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedParams = await params;
  const query = loadReviewDetailParams(await searchParams);
  const publicId = decodeURIComponent(resolvedParams.publicId);
  const page = query.page;
  // Null when opened from outside the queue (e.g. report detail): no auto-advance.
  const queueContext = query.status;
  // The author filter of the queue this was opened from, kept for the way back.
  const userId = query.userId ?? undefined;
  const detailLanguage = resolveSupportedLanguage(query.lang);
  const detailLocale = detailLanguage ? toLocaleTag(detailLanguage) : null;
  const { returnTo, backHref, notFoundHref } = buildReviewDetailQueueLinks({
    publicId,
    status: queueContext,
    page,
    userId,
    lang: detailLocale,
  });
  const banner = resolveReviewBanner(query) ?? resolveUserStatusBanner(query);

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
        <WorkspaceError
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
