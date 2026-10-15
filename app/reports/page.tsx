import type { Metadata } from "next";
import { buildNoIndexRobots } from "@/lib/seo/public-metadata";
import { isBackendApiError } from "@/lib/api/client";
import {
  ADMIN_REPORTS_PAGE_SIZE,
  loadAdminReportsWorkspaceData,
} from "@/lib/admin/reports";
import {
  ADMIN_REVIEW_PAGE_SIZE,
  loadAdminReviewWorkspaceData,
} from "@/lib/admin/reviews";
import {
  parsePage,
  readQueryParam,
  withAdminWorkspaceSession,
} from "@/app/_workspace/workspace-data";
import { AdminWorkspaceErrorPage } from "@/app/_workspace/AdminWorkspaceErrorPage";
import { buildAdminReportsHref } from "@/lib/admin/paths";
import type { ReportStatus, ReportTargetType } from "@/src/apis/types";
import { resolveReportBanner } from "./report-banner";
import { AdminReportsShell } from "./AdminReportsShell";
import { AdminReportsListPageView } from "./AdminReportsListPageView";

export const metadata: Metadata = {
  title: "Reports Moderation",
  robots: buildNoIndexRobots(),
};

function parseReportStatusParam(value: string | null): ReportStatus | undefined {
  if (
    value === "PENDING" ||
    value === "REVIEWED" ||
    value === "RESOLVED" ||
    value === "REJECTED"
  ) {
    return value;
  }
  return undefined;
}

function parseReportTargetTypeParam(
  value: string | null,
): ReportTargetType | undefined {
  if (value === "USER" || value === "PUBLISHED_JOURNEY") {
    return value;
  }
  return undefined;
}

export default async function AdminReportsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = await searchParams;
  const page = parsePage(readQueryParam(resolvedSearchParams.page));
  const status = parseReportStatusParam(
    readQueryParam(resolvedSearchParams.status),
  );
  const targetType = parseReportTargetTypeParam(
    readQueryParam(resolvedSearchParams.targetType),
  );
  const mutation = readQueryParam(resolvedSearchParams.mutation);
  const error = readQueryParam(resolvedSearchParams.error);
  const message = readQueryParam(resolvedSearchParams.message);

  const returnTo = buildAdminReportsHref({
    page,
    status,
    targetType,
  });

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
        const [workspaceData, reviewData] = await Promise.all([
          loadAdminReportsWorkspaceData({
            accessToken,
            query: {
              page,
              limit: ADMIN_REPORTS_PAGE_SIZE,
              status,
              targetType,
            },
          }),
          loadAdminReviewWorkspaceData({
            accessToken,
            page: 1,
            status: "pending",
            limit: ADMIN_REVIEW_PAGE_SIZE,
          }).catch(() => null),
        ]);

        return {
          workspaceData,
          pendingReviews: reviewData?.queue.summary.pendingCount ?? 0,
        };
      },
    });

    data = result.data;
    session = result.session;
  } catch (err) {
    if (isBackendApiError(err)) {
      return (
        <AdminWorkspaceErrorPage
          heading="The reports workspace is temporarily unavailable."
          message={err.message}
          statusCode={err.statusCode}
        />
      );
    }

    throw err;
  }

  return (
    <AdminReportsShell
      openReports={data.workspaceData.stats.openReports}
      pendingReviews={data.pendingReviews}
      session={session}
    >
      <AdminReportsListPageView
        activeStatus={status}
        activeTargetType={targetType}
        banner={banner}
        reportsData={data.workspaceData.reports}
        stats={data.workspaceData.stats}
      />
    </AdminReportsShell>
  );
}
