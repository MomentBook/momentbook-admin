import Link from "next/link";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { LocalizedDate } from "@/components/LocalizedTime";
import {
  buildAdminReportsHref,
  buildAdminReviewDetailHref,
} from "@/lib/admin/paths";
import {
  getReportReasonLabel,
  getReportStatusLabel,
  getReportTargetTypeLabel,
} from "@/lib/admin/reports-shared";
import type {
  AdminReportDetailDataDto,
  ReportStatus,
} from "@/src/apis/types";
import type { AdminDashboardBanner } from "@/app/_workspace/workspace-data";
import { defaultLanguage } from "@/lib/i18n/config";
import {
  updateAdminReportAction,
  updateAdminUserStatusAction,
} from "../actions";

const ADMIN_DISPLAY_LANGUAGE = defaultLanguage;

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

type AdminReportDetailPageViewProps = {
  banner: AdminDashboardBanner | null;
  report: AdminReportDetailDataDto;
  returnTo: string;
};

export function AdminReportDetailPageView({
  banner,
  report,
  returnTo,
}: AdminReportDetailPageViewProps) {
  const isJourney = report.targetType === "PUBLISHED_JOURNEY";
  const isUser = report.targetType === "USER";
  const targetUser = report.targetUser;
  const isUserBanned = targetUser?.status === "BANNED";

  return (
    <div className="flex flex-col gap-6">
      {/* Top back & title bar */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Link
            href={buildAdminReportsHref()}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            &larr; Back to Reports Queue
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold tracking-tight">Report Details</h2>
            <Badge variant={badgeVariantForStatus(report.status)} className="text-xs">
              {getReportStatusLabel(report.status)}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {getReportReasonLabel(report.reason)}
            </Badge>
          </div>
          <span className="font-mono text-xs text-muted-foreground">
            ID: {report._id}
          </span>
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
            <AlertTitle>{banner.message}</AlertTitle>
          </Alert>
        ) : null}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column: Report Info & Target Info */}
        <div className="flex flex-col gap-6 lg:col-span-2">
          {/* Report Summary Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Report Content & Context</CardTitle>
              <CardDescription>
                Filed by reporter on{" "}
                <LocalizedDate
                  lang={ADMIN_DISPLAY_LANGUAGE}
                  timestamp={Date.parse(report.createdAt)}
                />
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Reporter&apos;s Explanation
                </span>
                <p className="mt-1.5 rounded-md bg-muted/50 p-3 text-sm text-foreground whitespace-pre-wrap">
                  {report.description || "No additional description provided by the reporter."}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t pt-4 text-xs">
                <div>
                  <span className="text-muted-foreground">Target Type:</span>
                  <p className="font-medium mt-0.5">{getReportTargetTypeLabel(report.targetType)}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Target ID:</span>
                  <p className="font-mono font-medium mt-0.5 truncate">{report.targetId}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Reports on this Target:</span>
                  <p className="font-medium mt-0.5">
                    {report.targetReportCounts.effectiveReports} effective / {report.targetReportCounts.totalReports} total
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Last Updated:</span>
                  <p className="font-medium mt-0.5">
                    <LocalizedDate
                      lang={ADMIN_DISPLAY_LANGUAGE}
                      timestamp={Date.parse(report.updatedAt)}
                    />
                  </p>
                </div>
              </div>

              {report.resolvedAt ? (
                <div className="rounded-md border p-3 bg-muted/30 text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Resolved At:</span>
                    <span>
                      <LocalizedDate
                        lang={ADMIN_DISPLAY_LANGUAGE}
                        timestamp={Date.parse(report.resolvedAt)}
                      />
                    </span>
                  </div>
                  {report.resolvedBy ? (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Resolved By:</span>
                      <span className="font-mono">{report.resolvedBy}</span>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </CardContent>
          </Card>

          {/* Target Entity Card */}
          {isUser && targetUser ? (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">Reported User Account</CardTitle>
                    <CardDescription>Target user account details and status</CardDescription>
                  </div>
                  <Badge variant={isUserBanned ? "destructive" : "default"}>
                    {targetUser.status || "ACTIVE"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-muted-foreground">Display Name:</span>
                    <p className="font-medium mt-0.5">{targetUser.name || "—"}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Account Email:</span>
                    <p className="font-medium mt-0.5">{targetUser.email || "—"}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Provider Email:</span>
                    <p className="font-medium mt-0.5">{targetUser.providerEmail || "—"}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">User ID:</span>
                    <p className="font-mono font-medium mt-0.5 truncate">{targetUser.userId}</p>
                  </div>
                </div>

                {/* User Sanction Action Form */}
                <div className="rounded-md border p-4 bg-muted/20 space-y-3">
                  <div>
                    <h4 className="text-sm font-semibold">User Account Sanction (Admin Users API)</h4>
                    <p className="text-xs text-muted-foreground">
                      Banning revokes all active access and refresh tokens immediately.
                    </p>
                  </div>

                  <form action={updateAdminUserStatusAction} className="space-y-3">
                    <input type="hidden" name="userId" value={targetUser.userId} />
                    <input type="hidden" name="reportId" value={report._id} />
                    <input type="hidden" name="returnTo" value={returnTo} />
                    <input
                      type="hidden"
                      name="status"
                      value={isUserBanned ? "active" : "banned"}
                    />

                    <div>
                      <input
                        type="text"
                        name="reason"
                        placeholder="Sanction reason (optional note)"
                        className="w-full text-xs rounded-md border border-input bg-background px-3 py-1.5"
                      />
                    </div>

                    <Button
                      type="submit"
                      size="sm"
                      variant={isUserBanned ? "default" : "destructive"}
                      className="w-full sm:w-auto"
                    >
                      {isUserBanned ? "Lift Ban (Restore User)" : "Ban User Account"}
                    </Button>
                  </form>
                </div>
              </CardContent>
            </Card>
          ) : null}

          {isJourney && report.targetPublishedJourney ? (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">Reported Journey</CardTitle>
                    <CardDescription>Target publication snapshot & review status</CardDescription>
                  </div>
                  <Badge
                    variant={
                      report.targetPublishedJourney.visibility === "hidden"
                        ? "destructive"
                        : "default"
                    }
                  >
                    {report.targetPublishedJourney.visibility}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-muted-foreground">Public ID:</span>
                    <p className="font-mono font-medium mt-0.5">{report.targetPublishedJourney.publicId}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Review Status:</span>
                    <p className="font-medium mt-0.5">{report.targetPublishedJourney.review.status}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Published:</span>
                    <p className="font-medium mt-0.5">{report.targetPublishedJourney.published ? "Yes" : "No"}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Author User ID:</span>
                    <p className="font-mono font-medium mt-0.5 truncate">{report.targetPublishedJourney.userId}</p>
                  </div>
                </div>

                {report.targetPublishedJourney.owner ? (
                  <div className="rounded-md border p-3 text-xs space-y-1">
                    <span className="text-muted-foreground">Author:</span>
                    <p className="font-medium">
                      {report.targetPublishedJourney.owner.name || report.targetPublishedJourney.owner.email || "Unknown Author"}
                    </p>
                  </div>
                ) : null}

                <div className="pt-2">
                  <Link
                    href={buildAdminReviewDetailHref(report.targetPublishedJourney.publicId)}
                    target="_blank"
                  >
                    <Button variant="outline" size="sm" className="w-full sm:w-auto">
                      Inspect Journey in Review Workspace &rarr;
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ) : null}
        </div>

        {/* Right Column: Moderation Decision Form & Reporter Summary */}
        <div className="flex flex-col gap-6">
          {/* Moderation Form Card */}
          <Card className="border-primary/40 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Moderation Decision</CardTitle>
              <CardDescription>
                Update the report status and record administrator findings.
              </CardDescription>
            </CardHeader>
            <form action={updateAdminReportAction}>
              <CardContent className="space-y-4">
                <input type="hidden" name="reportId" value={report._id} />
                <input type="hidden" name="returnTo" value={returnTo} />

                {/* Status Selection */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Resolution Status
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {(
                      [
                        ["PENDING", "Pending"],
                        ["REVIEWED", "Reviewed"],
                        ["RESOLVED", "Resolved"],
                        ["REJECTED", "Rejected"],
                      ] as const
                    ).map(([statusKey, statusLabel]) => (
                      <label
                        key={statusKey}
                        className={`flex items-center gap-2 rounded-md border p-2.5 text-xs font-medium cursor-pointer transition-colors ${
                          report.status === statusKey
                            ? "border-primary bg-primary/5 text-primary"
                            : "hover:bg-muted"
                        }`}
                      >
                        <input
                          type="radio"
                          name="status"
                          value={statusKey}
                          defaultChecked={report.status === statusKey}
                          className="size-3 text-primary"
                        />
                        <span>{statusLabel}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Admin Note */}
                <div className="space-y-2">
                  <label
                    htmlFor="adminNote"
                    className="text-xs font-semibold text-muted-foreground uppercase tracking-wide"
                  >
                    Admin Note / Memo
                  </label>
                  <Textarea
                    id="adminNote"
                    name="adminNote"
                    defaultValue={report.adminNote || ""}
                    placeholder="Enter moderation remarks or reason for decision..."
                    rows={4}
                    className="text-xs"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Max 1,000 characters. Blank or empty clears the current note.
                  </p>
                </div>
              </CardContent>

              <CardFooter className="border-t pt-4">
                <Button type="submit" className="w-full">
                  Save Decision
                </Button>
              </CardFooter>
            </form>
          </Card>

          {/* Reporter Information Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Reporter Info</CardTitle>
              <CardDescription>Account that submitted this report</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div>
                <span className="text-muted-foreground">Name:</span>
                <p className="font-medium mt-0.5">{report.reporter?.name || "—"}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Email:</span>
                <p className="font-medium mt-0.5">{report.reporter?.email || "—"}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Account Status:</span>
                <p className="font-medium mt-0.5">{report.reporter?.status || "ACTIVE"}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Reporter ID:</span>
                <p className="font-mono text-muted-foreground mt-0.5 truncate">
                  {report.reporterId}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
