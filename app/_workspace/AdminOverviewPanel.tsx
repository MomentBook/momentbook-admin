import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LocalizedDate } from "@/components/LocalizedTime";
import {
  buildAdminWorkspaceHref,
} from "@/lib/admin/paths";
import type { AdminOverviewData } from "@/lib/admin/reviews";
import type { AdminSession } from "@/lib/admin/session";
import { defaultLanguage } from "@/lib/i18n/config";

const ADMIN_DISPLAY_LANGUAGE = defaultLanguage;
const COUNT_FORMATTER = new Intl.NumberFormat("en-US");

type AdminOverviewPanelProps = {
  overview: AdminOverviewData;
  session: AdminSession;
};

function formatCount(value: number): string {
  return COUNT_FORMATTER.format(value);
}

function formatRate(value: number | null): string {
  return value === null ? "—" : `${value}%`;
}

function readTimestamp(value: string | null): number | null {
  if (!value) return null;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function buildPercent(count: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((count / total) * 100);
}

function OverviewMetricCard({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: string;
  hint: string;
  tone?: "default" | "success" | "warning";
}) {
  const borderClass =
    tone === "warning"
      ? "border-l-amber-500"
      : tone === "success"
        ? "border-l-emerald-500"
        : "border-l-primary";

  return (
    <Card className={`border-l-4 ${borderClass}`}>
      <CardHeader className="pb-2">
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-2xl">{value}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-muted-foreground">{hint}</p>
      </CardContent>
    </Card>
  );
}

function StatusDistributionCard({ overview }: { overview: AdminOverviewData }) {
  const items = [
    { key: "flagged", label: "Flagged", count: overview.flaggedCount, color: "bg-amber-500" as const },
    { key: "approved", label: "Approved", count: overview.approvedCount, color: "bg-emerald-500" as const },
    { key: "rejected", label: "Rejected", count: overview.rejectedCount, color: "bg-red-500" as const },
    { key: "pending", label: "Pending", count: overview.pendingCount, color: "bg-gray-500" as const },
  ] as const;

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-0.5">
          <span className="text-xs text-muted-foreground">Snapshot</span>
          <CardTitle className="text-lg">Queue distribution</CardTitle>
        </div>
        <CardDescription>{formatCount(overview.totalCount)} total records</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {overview.totalCount > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {items.map((item) => (
              <div key={item.key} className="flex flex-col gap-0.5 rounded-md border p-3">
                <span className="text-xs text-muted-foreground">{item.label}</span>
                <span className="text-lg font-bold">{formatCount(item.count)}</span>
                <div className="flex items-center gap-2">
                  <div className={`h-1.5 rounded-full ${item.color}`} style={{ width: `${Math.max(2, buildPercent(item.count, overview.totalCount))}%` }} />
                  <span className="text-xs text-muted-foreground">{buildPercent(item.count, overview.totalCount)}%</span>
                </div>
              </div>
            ))}
          </div>
        ) : null}

        <Link href={buildAdminWorkspaceHref("reviews")} className="text-sm text-primary hover:underline">
          Open review queue
        </Link>
      </CardContent>
    </Card>
  );
}

function OperationsCard({
  overview,
  session,
}: {
  overview: AdminOverviewData;
  session: AdminSession;
}) {
  const latestSubmissionAt = readTimestamp(overview.latestSubmissionAt);
  const oldestPendingAt = readTimestamp(overview.oldestPendingAt);

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-0.5">
          <span className="text-xs text-muted-foreground">Operations</span>
          <CardTitle className="text-lg">Admin context</CardTitle>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <dl className="space-y-3">
          <div className="flex justify-between gap-4">
            <dt className="text-sm text-muted-foreground">Signed in</dt>
            <dd className="text-sm">{session.email || session.name || "Admin"}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-sm text-muted-foreground">Oldest pending</dt>
            <dd className="text-sm">
              {oldestPendingAt ? (
                <LocalizedDate lang={ADMIN_DISPLAY_LANGUAGE} timestamp={oldestPendingAt} />
              ) : (
                "None"
              )}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-sm text-muted-foreground">Latest submission</dt>
            <dd className="text-sm">
              {latestSubmissionAt ? (
                <LocalizedDate lang={ADMIN_DISPLAY_LANGUAGE} timestamp={latestSubmissionAt} />
              ) : (
                "None"
              )}
            </dd>
          </div>
        </dl>

        <p className="text-xs text-muted-foreground">
          Based on {formatCount(overview.totalCount)} moderation records.
        </p>
      </CardContent>
    </Card>
  );
}

export function AdminOverviewPanel({
  overview,
  session,
}: AdminOverviewPanelProps) {
  return (
    <div className="flex flex-col gap-3">
      {/* KPI row */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <OverviewMetricCard
          label="Flagged now"
          value={formatCount(overview.flaggedCount)}
          hint="Items flagged by AI review, waiting for human decision"
          tone="warning"
        />

        <OverviewMetricCard
          label="Approval rate"
          value={formatRate(overview.approvalRate)}
          hint={`Approved out of ${formatCount(overview.reviewedCount)} completed reviews`}
          tone="success"
        />

        <OverviewMetricCard
          label="Total pending"
          value={formatCount(overview.pendingCount)}
          hint="All pending items (flagged + awaiting AI review)"
        />
      </div>

      {/* Distribution + context */}
      <div className="grid gap-3 md:grid-cols-2">
        <StatusDistributionCard overview={overview} />
        <OperationsCard overview={overview} session={session} />
      </div>
    </div>
  );
}
