import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { renderWorkspacePage } from "@/components/layout/workspace-page";
import {
  buildAdminReportDetailHref,
  buildAdminReportsHref,
  loadReportDetailParams,
} from "@/lib/navigation/report-routes";
import { loadReportHistoryOrNull } from "@/entities/report/history";
import { ReportDetailView } from "@/features/reports/components/report-detail-view";
import { resolveReportBanner } from "@/features/reports/flash";
import { loadAdminReportDetail } from "@/features/reports/loader";

export const metadata: Metadata = {
  title: "Report Detail",
};

export default async function ReportDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ reportId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const reportId = decodeURIComponent((await params).reportId);
  const query = loadReportDetailParams(await searchParams);
  const returnTo = buildAdminReportDetailHref(reportId);

  return renderWorkspacePage({
    active: "reports",
    errorHeading: "The report details are temporarily unavailable.",
    returnTo,
    load: async (accessToken) => {
      const report = await loadAdminReportDetail({ accessToken, reportId });

      if (!report) {
        return null;
      }

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
    render: (data) =>
      data ? (
        <ReportDetailView {...data} banner={resolveReportBanner(query)} returnTo={returnTo} />
      ) : (
        redirect(buildAdminReportsHref({ error: "report_not_found" }))
      ),
  });
}
