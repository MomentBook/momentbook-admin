import type { Metadata } from "next";
import { renderWorkspacePage } from "@/components/layout/workspace-page";
import { buildAdminReportsHref, loadReportsParams } from "@/lib/navigation/report-routes";
import { ReportsListView, type ReportFilters } from "@/features/reports/components/reports-list-view";
import { resolveReportBanner } from "@/features/reports/flash";
import { loadReportsList } from "@/features/reports/loader";

export const metadata: Metadata = {
  title: "Reports Moderation",
};

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = loadReportsParams(await searchParams);
  const filters: ReportFilters = {
    status: query.status ?? undefined,
    targetType: query.targetType ?? undefined,
    reason: query.reason ?? undefined,
    targetId: query.targetId ?? undefined,
    reporterId: query.reporterId ?? undefined,
  };
  const returnTo = buildAdminReportsHref({ page: query.page, ...filters });

  return renderWorkspacePage({
    active: "reports",
    errorHeading: "The reports workspace is temporarily unavailable.",
    returnTo,
    load: (accessToken) => loadReportsList({ accessToken, page: query.page, filters }),
    render: (data) => (
      <ReportsListView banner={resolveReportBanner(query)} data={data} filters={filters} />
    ),
  });
}
