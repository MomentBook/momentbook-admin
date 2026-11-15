import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { renderWorkspacePage } from "@/components/layout/workspace-page";
import { resolveSupportedLanguage, toLocaleTag } from "@/lib/i18n";
import {
  buildReviewDetailQueueLinks,
  loadReviewDetailParams,
} from "@/lib/navigation/review-routes";
import { resolveUserStatusBanner } from "@/entities/user/status-flash";
import { loadReportHistoryOrNull } from "@/features/reports/loader";
import { ReviewDetailView } from "@/features/reviews/components/review-detail-view";
import { resolveReviewBanner } from "@/features/reviews/flash";
import { loadAdminReviewDetail } from "@/features/reviews/loader";

export const metadata: Metadata = {
  title: "Review Detail",
};

export default async function ReviewDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ publicId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const publicId = decodeURIComponent((await params).publicId);
  const query = loadReviewDetailParams(await searchParams);
  // Null when opened from outside the queue (e.g. report detail): no auto-advance.
  const queueStatus = query.status;
  const lang = resolveSupportedLanguage(query.lang);
  const { returnTo, backHref, notFoundHref } = buildReviewDetailQueueLinks({
    publicId,
    status: queueStatus,
    page: query.page,
    // The author filter of the queue this was opened from, kept for the way back.
    userId: query.userId,
    lang: lang ? toLocaleTag(lang) : null,
  });

  return renderWorkspacePage({
    active: "reviews",
    errorHeading: "The review detail is temporarily unavailable.",
    returnTo,
    load: async (accessToken) => {
      const detail = await loadAdminReviewDetail({ accessToken, publicId, lang });

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
    render: (data) =>
      data ? (
        <ReviewDetailView
          {...data}
          backHref={backHref}
          banner={resolveReviewBanner(query) ?? resolveUserStatusBanner(query)}
          queueStatus={queueStatus}
          returnTo={returnTo}
        />
      ) : (
        redirect(notFoundHref)
      ),
  });
}
