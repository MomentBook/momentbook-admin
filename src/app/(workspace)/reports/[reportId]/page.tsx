import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isBackendApiError } from "@/lib/api/client";
import { loadAdminReportDetail, loadReportHistoryOrNull } from "@/features/reports/loader";
import { loadWorkspacePage } from "@/lib/workspace/load-workspace-page";
import { WorkspaceShell } from "@/components/layout/workspace-shell";
import { WorkspaceError } from "@/components/layout/workspace-error";
import {
  buildAdminReportDetailHref,
  buildAdminReportsHref,
  loadReportDetailParams,
} from "@/lib/navigation/report-routes";
import { resolveReportBanner } from "@/features/reports/flash";
import { AdminReportDetailPageView } from "@/features/reports/components/report-detail-view";

export const metadata: Metadata = {
  title: "Report Detail",
};

export default async function AdminReportDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ reportId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedParams = await params;
  const query = loadReportDetailParams(await searchParams);
  const reportId = decodeURIComponent(resolvedParams.reportId);
  const returnTo = buildAdminReportDetailHref(reportId);
  const banner = resolveReportBanner(query);

  let result;

  try {
    result = await loadWorkspacePage({
      returnTo,
      load: async (accessToken) => {
        const report = await loadAdminReportDetail({ accessToken, reportId });
        const [targetHistory, reporterHistory] = await Promise.all([
          loadReportHistoryOrNull({
            accessToken,
            targetType: report.targetType,
            targetId: report.targetId,
          }),
          loadReportHistoryOrNull({ accessToken, reporterId: report.reporterId }),
        ]);

        return { report, targetHistory, reporterHistory };
      },
    });
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
        <WorkspaceError
          heading="The report details are temporarily unavailable."
          message={err.message}
          statusCode={err.statusCode}
        />
      );
    }

    throw err;
  }

  if (!result.data) {
    redirect(
      buildAdminReportsHref({
        error: "report_not_found",
      }),
    );
  }

  return (
    <WorkspaceShell active="reports" counts={result.counts} session={result.session}>
      <AdminReportDetailPageView
        banner={banner}
        report={result.data.report}
        reporterHistory={result.data.reporterHistory}
        returnTo={returnTo}
        targetHistory={result.data.targetHistory}
      />
    </WorkspaceShell>
  );
}
