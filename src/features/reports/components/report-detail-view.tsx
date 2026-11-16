import Link from "next/link";
import { BackLink } from "@/components/back-link";
import { DateValue, Field } from "@/components/detail-parts";
import { FlashBanner } from "@/components/flash-banner";
import { StatusBadge } from "@/components/status-badge";
import { Time } from "@/components/time";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type {
  AdminReportDetailDataDto,
  AdminReportUserSummaryDto,
} from "@/lib/api/types";
import type { Flash } from "@/lib/navigation/flash";
import { buildAdminUserHref } from "@/lib/navigation/paths";
import { buildAdminReportsHref } from "@/lib/navigation/report-routes";
import { buildAdminReviewDetailHref } from "@/lib/navigation/review-routes";
import { ReportHistoryList } from "@/entities/report/components/report-history-list";
import {
  getReportReasonLabel,
  getReportStatusLabel,
  getReportTargetTypeLabel,
  REPORT_STATUS_TONES,
  type ReportHistory,
} from "@/entities/report/model";
import { UserStatusForm } from "@/entities/user/components/user-status-form";
import { ReportStatusForm } from "./report-status-form";

type Journey = NonNullable<AdminReportDetailDataDto["targetPublishedJourney"]>;

function ReportSummaryCard({ report }: { report: AdminReportDetailDataDto }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Report content and context</CardTitle>
        <CardDescription>
          Filed by reporter on <Time value={report.createdAt} />
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Reporter&apos;s explanation
          </span>
          <p className="mt-1.5 whitespace-pre-wrap rounded-md bg-muted/50 p-3 text-sm">
            {report.description || "No additional description provided by the reporter."}
          </p>
        </div>

        <dl className="grid grid-cols-2 gap-4 border-t pt-4">
          <Field label="Target type">{getReportTargetTypeLabel(report.targetType)}</Field>
          <Field label="Target ID">
            <span className="block truncate font-mono">{report.targetId}</span>
          </Field>
          <Field label="Reports on this target">
            {report.targetReportCounts.effectiveReports} effective /{" "}
            {report.targetReportCounts.totalReports} total
          </Field>
          <Field label="Last updated">
            <DateValue value={report.updatedAt} />
          </Field>
          {report.resolvedAt ? (
            <Field label="Resolved at">
              <DateValue value={report.resolvedAt} />
            </Field>
          ) : null}
          {report.resolvedAt && report.resolvedBy ? (
            <Field label="Resolved by">
              <span className="font-mono">{report.resolvedBy}</span>
            </Field>
          ) : null}
        </dl>
      </CardContent>
    </Card>
  );
}

function ReportedUserCard({
  reportId,
  returnTo,
  user,
}: {
  reportId: string;
  returnTo: string;
  user: AdminReportUserSummaryDto;
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">Reported user account</CardTitle>
            <CardDescription>Target user account details and status</CardDescription>
          </div>
          <StatusBadge tone={user.status === "BANNED" ? "danger" : "success"}>
            {user.status || "ACTIVE"}
          </StatusBadge>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <dl className="grid grid-cols-2 gap-4">
          <Field label="Display name">
            <Link href={buildAdminUserHref(user.id)} className="text-primary hover:underline">
              {user.name || "Unnamed user"}
            </Link>
          </Field>
          <Field label="Account email">{user.email || "—"}</Field>
          <Field label="Provider email">{user.providerEmail || "—"}</Field>
          <Field label="User ID">
            <span className="block truncate font-mono">{user.id}</span>
          </Field>
        </dl>

        <div className="flex flex-col gap-3 rounded-md border bg-muted/20 p-4">
          <div>
            <h2 className="text-sm font-semibold">Account sanction</h2>
            <p className="text-xs text-muted-foreground">
              Banning revokes all active access and refresh tokens immediately.
            </p>
          </div>
          <UserStatusForm
            user={{ id: user.id, label: user.name || user.email || user.id, status: user.status }}
            reportId={reportId}
            returnTo={returnTo}
          />
        </div>
      </CardContent>
    </Card>
  );
}

function ReportedJourneyCard({ journey }: { journey: Journey }) {
  const hidden = journey.visibility === "HIDDEN";

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">Reported journey</CardTitle>
            <CardDescription>Target publication snapshot and review status</CardDescription>
          </div>
          <StatusBadge tone={hidden ? "danger" : "success"}>{hidden ? "Hidden" : "Public"}</StatusBadge>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <dl className="grid grid-cols-2 gap-4">
          <Field label="Public ID">
            <span className="font-mono">{journey.publicId}</span>
          </Field>
          <Field label="Review status">{journey.review.status}</Field>
          <Field label="Published">{journey.published ? "Yes" : "No"}</Field>
          <Field label="Author user ID">
            <span className="block truncate font-mono">{journey.userId}</span>
          </Field>
          {journey.owner ? (
            <Field label="Author">
              <Link href={buildAdminUserHref(journey.userId)} className="text-primary hover:underline">
                {journey.owner.name || journey.owner.email || "Unknown author"}
              </Link>
            </Field>
          ) : null}
        </dl>
        <Button asChild variant="outline" size="sm" className="w-full sm:w-auto sm:self-start">
          <Link href={buildAdminReviewDetailHref(journey.publicId)} target="_blank">
            Inspect journey in review workspace &rarr;
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function ReporterCard({ report }: { report: AdminReportDetailDataDto }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Reporter</CardTitle>
        <CardDescription>Account that submitted this report</CardDescription>
      </CardHeader>
      <CardContent>
        <dl className="flex flex-col gap-3">
          <Field label="Name">
            <Link href={buildAdminUserHref(report.reporterId)} className="text-primary hover:underline">
              {report.reporter?.name || "Unnamed user"}
            </Link>
          </Field>
          <Field label="Email">{report.reporter?.email || "—"}</Field>
          <Field label="Account status">{report.reporter?.status || "ACTIVE"}</Field>
          <Field label="Reporter ID">
            <span className="block truncate font-mono text-muted-foreground">{report.reporterId}</span>
          </Field>
        </dl>
      </CardContent>
    </Card>
  );
}

/** One report: what was reported and by whom on the left, the decision and
 * the related reports on the right. */
export function ReportDetailView({
  banner,
  report,
  returnTo,
  targetHistory,
  reporterHistory,
}: {
  banner: Flash | null;
  report: AdminReportDetailDataDto;
  returnTo: string;
  targetHistory: ReportHistory;
  reporterHistory: ReportHistory;
}) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <BackLink href={buildAdminReportsHref()} label="Back to reports queue" />
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">Report details</h1>
            <StatusBadge tone={REPORT_STATUS_TONES[report.status]}>
              {getReportStatusLabel(report.status)}
            </StatusBadge>
            <Badge variant="outline">{getReportReasonLabel(report.reason)}</Badge>
          </div>
          <span className="font-mono text-xs text-muted-foreground">ID: {report.id}</span>
        </div>
        <FlashBanner flash={banner} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <ReportSummaryCard report={report} />
          {report.targetType === "USER" && report.targetUser ? (
            <ReportedUserCard reportId={report.id} returnTo={returnTo} user={report.targetUser} />
          ) : null}
          {report.targetType === "PUBLISHED_JOURNEY" && report.targetPublishedJourney ? (
            <ReportedJourneyCard journey={report.targetPublishedJourney} />
          ) : null}
        </div>

        <div className="flex flex-col gap-6">
          <ReportStatusForm report={report} returnTo={returnTo} />
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Report history</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <ReportHistoryList
                title="Other reports on this target"
                history={targetHistory}
                excludeReportId={report.id}
                viewAllHref={buildAdminReportsHref({
                  targetType: report.targetType,
                  targetId: report.targetId,
                })}
              />
              <ReportHistoryList
                title="Other reports by this reporter"
                history={reporterHistory}
                excludeReportId={report.id}
                viewAllHref={buildAdminReportsHref({ reporterId: report.reporterId })}
              />
            </CardContent>
          </Card>
          <ReporterCard report={report} />
        </div>
      </div>
    </div>
  );
}
