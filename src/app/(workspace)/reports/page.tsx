import type { Metadata } from "next";
import { isBackendApiError } from "@/lib/api/client";
import {
  ADMIN_REPORTS_PAGE_SIZE,
  loadAdminReportsWorkspaceData,
} from "@/features/reports/loader";
import {
  loadWorkspacePage,
  parsePage,
  readQueryParam,
} from "@/lib/workspace/load-workspace-page";
import { WorkspaceShell } from "@/components/layout/workspace-shell";
import { AdminWorkspaceErrorPage } from "@/components/layout/workspace-error";
import { buildAdminReportsHref } from "@/lib/navigation/paths";
import { parseReportReason, parseReporterId } from "@/entities/report/model";
import type { ReportStatus, ReportTargetType } from "@/lib/api/types";
import { resolveReportBanner } from "@/features/reports/flash";
import { AdminReportsListPageView } from "@/features/reports/components/reports-list-view";

export const metadata: Metadata = {
  title: "Reports Moderation",
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
  const reason = parseReportReason(readQueryParam(resolvedSearchParams.reason));
  const targetId = readQueryParam(resolvedSearchParams.targetId)?.trim() || undefined;
  const reporterId = parseReporterId(readQueryParam(resolvedSearchParams.reporterId));
  const mutation = readQueryParam(resolvedSearchParams.mutation);
  const error = readQueryParam(resolvedSearchParams.error);
  const message = readQueryParam(resolvedSearchParams.message);

  const returnTo = buildAdminReportsHref({
    page,
    status,
    targetType,
    reason,
    targetId,
    reporterId,
  });

  const banner = resolveReportBanner({
    error,
    message,
    mutation,
    status: readQueryParam(resolvedSearchParams.status),
    userStatus: readQueryParam(resolvedSearchParams.userStatus),
  });

  let result;

  try {
    result = await loadWorkspacePage({
      returnTo,
      load: (accessToken) =>
        loadAdminReportsWorkspaceData({
          accessToken,
          query: {
            page,
            limit: ADMIN_REPORTS_PAGE_SIZE,
            status,
            targetType,
            reason,
            targetId,
            reporterId,
          },
        }),
    });
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
    <WorkspaceShell active="reports" counts={result.counts} session={result.session}>
      <AdminReportsListPageView
        activeStatus={status}
        activeTargetType={targetType}
        activeReason={reason}
        activeTargetId={targetId}
        activeReporterId={reporterId}
        banner={banner}
        reportsData={result.data.reports}
        stats={result.data.stats}
      />
    </WorkspaceShell>
  );
}
