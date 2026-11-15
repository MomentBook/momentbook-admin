import type { Metadata } from "next";
import { isBackendApiError } from "@/lib/api/client";
import {
  ADMIN_REPORTS_PAGE_SIZE,
  loadAdminReportsWorkspaceData,
} from "@/features/reports/loader";
import { loadWorkspacePage } from "@/lib/workspace/load-workspace-page";
import { WorkspaceShell } from "@/components/layout/workspace-shell";
import { WorkspaceError } from "@/components/layout/workspace-error";
import { buildAdminReportsHref, loadReportsParams } from "@/lib/navigation/report-routes";
import { resolveReportBanner } from "@/features/reports/flash";
import { AdminReportsListPageView } from "@/features/reports/components/reports-list-view";

export const metadata: Metadata = {
  title: "Reports Moderation",
};

export default async function AdminReportsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = loadReportsParams(await searchParams);
  const { page } = query;
  const status = query.status ?? undefined;
  const targetType = query.targetType ?? undefined;
  const reason = query.reason ?? undefined;
  const targetId = query.targetId ?? undefined;
  const reporterId = query.reporterId ?? undefined;

  const returnTo = buildAdminReportsHref({
    page,
    status,
    targetType,
    reason,
    targetId,
    reporterId,
  });

  const banner = resolveReportBanner(query);

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
        <WorkspaceError
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
