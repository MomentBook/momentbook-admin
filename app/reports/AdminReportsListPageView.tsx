import Link from "next/link";
import { X } from "lucide-react";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LocalizedDate } from "@/components/LocalizedTime";
import {
  buildAdminReportDetailHref,
  buildAdminReportsHref,
} from "@/lib/admin/paths";
import {
  REPORT_REASONS,
  getReportReasonLabel,
  getReportStatusLabel,
  getReportTargetTypeLabel,
} from "@/lib/admin/reports-shared";
import type {
  AdminReportsDataDto,
  AdminReportStatsDataDto,
  ReportReason,
  ReportStatus,
  ReportTargetType,
} from "@/src/apis/types";
import type { AdminDashboardBanner } from "@/app/_workspace/workspace-data";
import { defaultLanguage } from "@/lib/i18n/config";

const ADMIN_DISPLAY_LANGUAGE = defaultLanguage;
const COUNT_FORMATTER = new Intl.NumberFormat("en-US");

function formatCount(value: number): string {
  return COUNT_FORMATTER.format(value);
}

function badgeVariantForStatus(
  status: ReportStatus,
): "default" | "destructive" | "secondary" | "outline" {
  switch (status) {
    case "PENDING":
      return "secondary";
    case "REVIEWED":
      return "outline";
    case "RESOLVED":
      return "default";
    case "REJECTED":
      return "destructive";
    default:
      return "outline";
  }
}

type AdminReportsListPageViewProps = {
  banner: AdminDashboardBanner | null;
  reportsData: AdminReportsDataDto;
  stats: AdminReportStatsDataDto;
  activeStatus?: ReportStatus | null;
  activeTargetType?: ReportTargetType | null;
  activeReason?: ReportReason | null;
  activeTargetId?: string | null;
  activeReporterId?: string | null;
};

export function AdminReportsListPageView({
  banner,
  reportsData,
  stats,
  activeStatus,
  activeTargetType,
  activeReason,
  activeTargetId,
  activeReporterId,
}: AdminReportsListPageViewProps) {
  // Every filter link keeps the other filters and resets to page 1.
  const hrefWith = (overrides: Parameters<typeof buildAdminReportsHref>[0]) =>
    buildAdminReportsHref({
      status: activeStatus,
      targetType: activeTargetType,
      reason: activeReason,
      targetId: activeTargetId,
      reporterId: activeReporterId,
      page: null,
      ...overrides,
    });
  const idFilters = [
    activeTargetId
      ? { label: "Target", value: activeTargetId, clearHref: hrefWith({ targetId: null }) }
      : null,
    activeReporterId
      ? { label: "Reporter", value: activeReporterId, clearHref: hrefWith({ reporterId: null }) }
      : null,
  ].filter((filter) => filter !== null);

  const statusFilters: Array<{ value: ReportStatus | undefined; label: string; count?: number }> = [
    { value: undefined, label: "All", count: stats.totalReports },
    { value: "PENDING", label: "Pending", count: stats.pendingReports },
    { value: "REVIEWED", label: "Reviewed", count: stats.reviewedReports },
    { value: "RESOLVED", label: "Resolved", count: stats.resolvedReports },
    { value: "REJECTED", label: "Rejected", count: stats.rejectedReports },
  ];

  const targetTypeFilters: Array<{ value: ReportTargetType | undefined; label: string }> = [
    { value: undefined, label: "All Targets" },
    { value: "PUBLISHED_JOURNEY", label: "Journeys" },
    { value: "USER", label: "Users" },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Report Moderation</h2>
            <p className="text-sm text-muted-foreground">
              Review and act on user reports regarding published journeys and accounts.
            </p>
          </div>
          <Badge variant={stats.openReports > 0 ? "secondary" : "outline"} className="text-sm px-3 py-1">
            {stats.openReports} open
          </Badge>
        </div>

        {banner ? (
          <Alert
            variant={
              banner.tone === "error"
                ? "destructive"
                : banner.tone === "success"
                  ? "default"
                  : "default"
            }
          >
            <AlertTitle className="line-clamp-none">{banner.message}</AlertTitle>
          </Alert>
        ) : null}
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-amber-500">
          <CardHeader className="pb-2">
            <CardDescription>Pending Reports</CardDescription>
            <CardTitle className="text-2xl">{formatCount(stats.pendingReports)}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Awaiting initial inspection</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-2">
            <CardDescription>Under Review</CardDescription>
            <CardTitle className="text-2xl">{formatCount(stats.reviewedReports)}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Investigation in progress</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-emerald-500">
          <CardHeader className="pb-2">
            <CardDescription>Resolved</CardDescription>
            <CardTitle className="text-2xl">{formatCount(stats.resolvedReports)}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Sanction applied or issue resolved</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-muted">
          <CardHeader className="pb-2">
            <CardDescription>Rejected / Dismissed</CardDescription>
            <CardTitle className="text-2xl">{formatCount(stats.rejectedReports)}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Dismissed without penalty</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Table Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-lg">Reports Queue</CardTitle>
              <CardDescription>
                {reportsData.total} matching reports (Page {reportsData.page} of {Math.max(1, reportsData.pages)})
              </CardDescription>
            </div>

            {/* Target Type Filter */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs text-muted-foreground mr-1">Target:</span>
              {targetTypeFilters.map((filter) => {
                const isActive = activeTargetType === filter.value;
                return (
                  <Link
                    key={filter.label}
                    // A target ID only makes sense for its own target type.
                    href={hrefWith({ targetType: filter.value, targetId: null })}
                  >
                    <Badge variant={isActive ? "default" : "outline"} className="cursor-pointer">
                      {filter.label}
                    </Badge>
                  </Link>
                );
              })}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Status Filter Chips */}
          <div className="flex flex-wrap gap-2 border-b pb-3">
            {statusFilters.map((filter) => {
              const isActive = activeStatus === filter.value;
              return (
                <Link
                  key={filter.label}
                  href={hrefWith({ status: filter.value })}
                >
                  <Badge variant={isActive ? "default" : "secondary"} className="cursor-pointer">
                    {filter.label}
                    {typeof filter.count === "number" ? ` (${filter.count})` : ""}
                  </Badge>
                </Link>
              );
            })}
          </div>

          {/* Reason Filter */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-muted-foreground mr-1">Reason:</span>
            {[undefined, ...REPORT_REASONS].map((reason) => (
              <Link key={reason ?? "all"} href={hrefWith({ reason })}>
                <Badge
                  variant={(activeReason ?? undefined) === reason ? "default" : "outline"}
                  className="cursor-pointer"
                >
                  {reason ? getReportReasonLabel(reason) : "All reasons"}
                </Badge>
              </Link>
            ))}
          </div>

          {idFilters.length > 0 ? (
            <div className="flex flex-wrap items-center gap-1.5">
              {idFilters.map((filter) => (
                <Badge key={filter.label} variant="secondary" className="gap-1 pr-1">
                  {filter.label}: <span className="font-mono">{filter.value}</span>
                  <Link
                    href={filter.clearHref}
                    aria-label={`Clear ${filter.label.toLowerCase()} filter`}
                    className="rounded-sm p-0.5 hover:bg-muted-foreground/20"
                  >
                    <X className="size-3" />
                  </Link>
                </Badge>
              ))}
            </div>
          ) : null}

          {reportsData.reports.length > 0 ? (
            <>
              <div className="overflow-x-auto rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Status</TableHead>
                      <TableHead>Target</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Reports on Target</TableHead>
                      <TableHead>Reporter</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reportsData.reports.map((report) => (
                      <TableRow key={report._id}>
                        <TableCell>
                          <Badge variant={badgeVariantForStatus(report.status)}>
                            {getReportStatusLabel(report.status)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <span className="font-semibold text-xs">
                              {getReportTargetTypeLabel(report.targetType)}
                            </span>
                            <span className="font-mono text-xs text-muted-foreground truncate max-w-[140px]">
                              {report.targetId}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {getReportReasonLabel(report.reason)}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-[220px]">
                          <p className="text-xs truncate text-muted-foreground">
                            {report.description || "—"}
                          </p>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="text-xs">
                            {report.targetReportCounts.effectiveReports} effective / {report.targetReportCounts.totalReports} total
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs font-mono truncate max-w-[120px] block">
                            {report.reporter?.name || report.reporter?.email || report.reporterId}
                          </span>
                        </TableCell>
                        <TableCell>
                          <LocalizedDate
                            lang={ADMIN_DISPLAY_LANGUAGE}
                            timestamp={Date.parse(report.createdAt)}
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <Link href={buildAdminReportDetailHref(report._id)}>
                            <Button variant="outline" size="sm">
                              Inspect
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {reportsData.pages > 1 ? (
                <div className="flex items-center justify-between gap-2 pt-2">
                  <Link
                    href={hrefWith({
                      page: reportsData.page > 1 ? String(reportsData.page - 1) : null,
                    })}
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={reportsData.page <= 1}
                    >
                      Previous
                    </Button>
                  </Link>
                  <span className="text-xs text-muted-foreground">
                    Page {reportsData.page} of {reportsData.pages}
                  </span>
                  <Link
                    href={hrefWith({
                      page:
                        reportsData.page < reportsData.pages
                          ? String(reportsData.page + 1)
                          : String(reportsData.pages),
                    })}
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={reportsData.page >= reportsData.pages}
                    >
                      Next
                    </Button>
                  </Link>
                </div>
              ) : null}
            </>
          ) : (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <h3 className="text-lg font-semibold">No reports found</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  There are no reports matching the selected filters.
                </p>
                <Link href={buildAdminReportsHref()} className="mt-4">
                  <Button variant="default" size="sm">
                    Reset filters
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
