import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { buildNoIndexRobots } from "@/lib/seo/public-metadata";
import { isBackendApiError } from "@/lib/api/client";
import { loadAdminReportDetail } from "@/lib/admin/reports";
import {
  ADMIN_REVIEW_PAGE_SIZE,
  loadAdminReviewWorkspaceData,
} from "@/lib/admin/reviews";
import {
  readQueryParam,
  withAdminWorkspaceSession,
} from "@/app/_workspace/workspace-data";
import { AdminWorkspaceErrorPage } from "@/app/_workspace/AdminWorkspaceErrorPage";
import {
  buildAdminReportDetailHref,
  buildAdminReportsHref,
} from "@/lib/admin/paths";
import { resolveReportBanner } from "../report-banner";
import { AdminReportsShell } from "../AdminReportsShell";
import { AdminReportDetailPageView } from "./AdminReportDetailPageView";

export const metadata: Metadata = {
  title: "Report Detail",
  robots: buildNoIndexRobots(),
};

export default async function AdminReportDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ reportId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const reportId = decodeURIComponent(resolvedParams.reportId);
  const mutation = readQueryParam(resolvedSearchParams.mutation);
  const error = readQueryParam(resolvedSearchParams.error);
  const message = readQueryParam(resolvedSearchParams.message);

  const returnTo = buildAdminReportDetailHref(reportId);

  const banner = resolveReportBanner({
    error,
    message,
    mutation,
    status: readQueryParam(resolvedSearchParams.status),
    userStatus: readQueryParam(resolvedSearchParams.userStatus),
  });

  let data, session;

  try {
    const result = await withAdminWorkspaceSession({
      returnTo,
      load: async (accessToken) => {
        const [report, reviewData] = await Promise.all([
          loadAdminReportDetail({
            accessToken,
            reportId,
          }),
          loadAdminReviewWorkspaceData({
            accessToken,
            page: 1,
            status: "pending",
            limit: ADMIN_REVIEW_PAGE_SIZE,
          }).catch(() => null),
        ]);

        return {
          report,
          pendingReviews: reviewData?.queue.summary.pendingCount ?? 0,
        };
      },
    });

    data = result.data;
    session = result.session;
  } catch (err) {
    if (isBackendApiError(err)) {
      if (err.statusCode === 404) {
        redirect(
          buildAdminReportsHref({
            error: "report_not_found",
          }),
        );
      }

      return (
        <AdminWorkspaceErrorPage
          heading="The report details are temporarily unavailable."
          message={err.message}
          statusCode={err.statusCode}
        />
      );
    }

    throw err;
  }

  if (!data?.report) {
    redirect(
      buildAdminReportsHref({
        error: "report_not_found",
      }),
    );
  }

  return (
    <AdminReportsShell
      pendingReviews={data.pendingReviews}
      session={session}
    >
      <AdminReportDetailPageView
        banner={banner}
        report={data.report}
        returnTo={returnTo}
      />
    </AdminReportsShell>
  );
}
