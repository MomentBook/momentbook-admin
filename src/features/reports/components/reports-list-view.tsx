import Link from "next/link";
import { FilterChips } from "@/components/filter-chips";
import { FilterTabs } from "@/components/filter-tabs";
import { FlashBanner } from "@/components/flash-banner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { UrlPagination } from "@/components/url-pagination";
import { REPORT_REASONS, type ReportReason, type ReportStatus, type ReportTargetType } from "@/lib/api/types";
import { formatCount } from "@/lib/format/number";
import type { Flash } from "@/lib/navigation/flash";
import {
  buildAdminReportDetailHref,
  buildAdminReportsHref,
  type AdminReportsHrefOptions,
} from "@/lib/navigation/report-routes";
import { getReportReasonLabel } from "@/entities/report/model";
import type { ReportsList } from "@/features/reports/loader";
import { ReportStats } from "./report-stats";
import { ReportsTable, type ReportRow } from "./reports-table";

export type ReportFilters = {
  status?: ReportStatus;
  targetType?: ReportTargetType;
  reason?: ReportReason;
  targetId?: string;
  reporterId?: string;
};

const TARGET_TYPE_FILTERS: Array<{ value: ReportTargetType | undefined; label: string }> = [
  { value: undefined, label: "All targets" },
  { value: "PUBLISHED_JOURNEY", label: "Journeys" },
  { value: "USER", label: "Users" },
];

export function ReportsListView({
  banner,
  data,
  filters,
}: {
  banner: Flash | null;
  data: ReportsList;
  filters: ReportFilters;
}) {
  const { reports, stats } = data;
  // Every filter link keeps the other filters and resets to page 1.
  const hrefWith = (overrides: AdminReportsHrefOptions) =>
    buildAdminReportsHref({ ...filters, page: null, ...overrides });
  const idChips = [
    filters.targetId
      ? { label: "Target", value: filters.targetId, clearHref: hrefWith({ targetId: null }) }
      : null,
    filters.reporterId
      ? { label: "Reporter", value: filters.reporterId, clearHref: hrefWith({ reporterId: null }) }
      : null,
  ].filter((chip) => chip !== null);
  const statusTabs: Array<{ value: ReportStatus | undefined; label: string; count: number }> = [
    { value: undefined, label: "All", count: stats.totalReports },
    { value: "PENDING", label: "Pending", count: stats.pendingReports },
    { value: "REVIEWED", label: "Reviewed", count: stats.reviewedReports },
    { value: "RESOLVED", label: "Resolved", count: stats.resolvedReports },
    { value: "REJECTED", label: "Rejected", count: stats.rejectedReports },
  ];
  const rows: ReportRow[] = reports.items.map((report) => ({
    ...report,
    detailHref: buildAdminReportDetailHref(report.id),
  }));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Report moderation</h1>
            <p className="text-sm text-muted-foreground">
              Review and act on user reports regarding published journeys and accounts.
            </p>
          </div>
          <Badge
            variant={stats.openReports > 0 ? "secondary" : "outline"}
            className="px-3 py-1 text-sm"
          >
            {formatCount(stats.openReports)} open
          </Badge>
        </div>
        <FlashBanner flash={banner} />
      </div>

      <ReportStats stats={stats} />

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-lg">Reports queue</CardTitle>
              <CardDescription>
                {formatCount(reports.total)} matching reports (Page {reports.page} of{" "}
                {reports.pages})
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Target</span>
              <FilterTabs
                label="Target type"
                variant="pill"
                items={TARGET_TYPE_FILTERS.map((filter) => ({
                  label: filter.label,
                  // A target ID only makes sense for its own target type.
                  href: hrefWith({ targetType: filter.value ?? null, targetId: null }),
                  active: filters.targetType === filter.value,
                }))}
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex flex-col gap-4">
          <FilterTabs
            label="Report status"
            items={statusTabs.map((tab) => ({
              label: tab.label,
              href: hrefWith({ status: tab.value ?? null }),
              active: filters.status === tab.value,
              count: tab.count,
            }))}
          />

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-muted-foreground">Reason</span>
            <FilterTabs
              label="Report reason"
              variant="pill"
              items={[undefined, ...REPORT_REASONS].map((reason) => ({
                label: reason ? getReportReasonLabel(reason) : "All reasons",
                href: hrefWith({ reason: reason ?? null }),
                active: filters.reason === reason,
              }))}
            />
          </div>

          <FilterChips chips={idChips} />

          {rows.length > 0 ? (
            <>
              <div className="overflow-x-auto rounded-md border">
                <ReportsTable rows={rows} />
              </div>
              <UrlPagination
                page={reports.page}
                pages={reports.pages}
                hrefFor={(page) => hrefWith({ page })}
              />
            </>
          ) : (
            <Empty className="border">
              <EmptyHeader>
                <EmptyTitle>No reports found</EmptyTitle>
                <EmptyDescription>There are no reports matching the selected filters.</EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button asChild size="sm">
                  <Link href={buildAdminReportsHref()}>Reset filters</Link>
                </Button>
              </EmptyContent>
            </Empty>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
