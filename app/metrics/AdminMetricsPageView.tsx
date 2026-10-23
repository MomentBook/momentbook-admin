import type { ReactNode } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LocalizedDateTime } from "@/components/LocalizedTime";
import { cn } from "@/lib/utils";
import {
  buildAdminMetricsHref,
  buildAdminReportsHref,
  buildAdminReviewQueueHref,
  buildAdminUsersHref,
} from "@/lib/admin/paths";
import {
  METRICS_DAY_OPTIONS,
  formatDurationSeconds,
  formatMetricsDay,
  summarizeDailySeries,
  toDailySeries,
  type DailyMetricKey,
  type MetricsDays,
} from "@/lib/admin/metrics-shared";
import { defaultLanguage } from "@/lib/i18n/config";
import type { AdminMetricsDataDto } from "@/src/apis/types";
import { DailyBarChart } from "./DailyBarChart";

const ADMIN_DISPLAY_LANGUAGE = defaultLanguage;
const COUNT_FORMATTER = new Intl.NumberFormat("en-US");

const formatCount = (value: number | null) => (value === null ? "—" : COUNT_FORMATTER.format(value));

const WINDOW_TOTALS: ReadonlyArray<{ key: DailyMetricKey; label: string }> = [
  { key: "signups", label: "Signups" },
  { key: "newPublishedJourneys", label: "Published" },
  { key: "reviewDecisions", label: "Review decisions" },
  { key: "reportsOpened", label: "Reports opened" },
  { key: "reportsClosed", label: "Reports closed" },
  { key: "commentsCreated", label: "Comments" },
];

const DAILY_COLUMNS: ReadonlyArray<{ key: DailyMetricKey; label: string }> = [
  { key: "signups", label: "Signups" },
  { key: "activeAccounts", label: "Active" },
  { key: "newPublishedJourneys", label: "Published" },
  { key: "reviewDecisions", label: "Decisions" },
  { key: "reportsOpened", label: "Reports opened" },
  { key: "reportsClosed", label: "Reports closed" },
  { key: "commentsCreated", label: "Comments" },
];

function chipClass(active: boolean): string {
  return cn(
    "rounded-full border px-3 py-1 text-sm",
    active
      ? "border-primary bg-primary text-primary-foreground"
      : "text-muted-foreground hover:text-foreground",
  );
}

function WindowChips({ days }: { days: MetricsDays }) {
  return (
    <nav aria-label="Window" className="flex flex-wrap gap-2">
      {METRICS_DAY_OPTIONS.map((option) => (
        <Link
          key={option}
          href={buildAdminMetricsHref({ days: option })}
          aria-current={option === days ? "page" : undefined}
          className={chipClass(option === days)}
        >
          {option} days
        </Link>
      ))}
    </nav>
  );
}

function TotalTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col gap-0.5 rounded-md border p-3">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-lg font-semibold">{COUNT_FORMATTER.format(value)}</span>
    </div>
  );
}

function ChartCard({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <Card className={className}>
      <CardContent className="flex flex-col gap-6">{children}</CardContent>
    </Card>
  );
}

function StatRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-1.5">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium tabular-nums">{children}</dd>
    </div>
  );
}

function CountLink({ href, value }: { href: string; value: number }) {
  return (
    <Link href={href} className="text-primary hover:underline">
      {COUNT_FORMATTER.format(value)}
    </Link>
  );
}

function QueueHealthCard({ data }: { data: AdminMetricsDataDto }) {
  const { reviews, reports } = data;
  const oldestWaitSeconds =
    reviews.oldestPendingSince === null
      ? null
      : (Date.parse(data.asOf) - Date.parse(reviews.oldestPendingSince)) / 1000;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Queue health</CardTitle>
        <CardDescription>Now; medians over this window</CardDescription>
      </CardHeader>
      <CardContent>
        <dl className="flex flex-col divide-y">
          <StatRow label="Pending reviews">
            <CountLink href={buildAdminReviewQueueHref()} value={reviews.pending} />
          </StatRow>
          <StatRow label="Oldest pending">{formatDurationSeconds(oldestWaitSeconds)}</StatRow>
          <StatRow label="Median time to decision">
            {formatDurationSeconds(reviews.medianDecisionSeconds)}
          </StatRow>
          <StatRow label="Translation pending">
            <CountLink
              href={buildAdminReviewQueueHref({ status: "translation" })}
              value={reviews.localizationPending}
            />
          </StatRow>
          <StatRow label="Translation failed">
            {COUNT_FORMATTER.format(reviews.enqueueFailed)}
          </StatRow>
          <StatRow label="Open reports">
            <CountLink href={buildAdminReportsHref()} value={reports.open} />
          </StatRow>
          <StatRow label="Pending · reviewed">
            {COUNT_FORMATTER.format(reports.pending)} · {COUNT_FORMATTER.format(reports.reviewed)}
          </StatRow>
          <StatRow label="Median time to close">
            {formatDurationSeconds(reports.medianCloseSeconds)}
          </StatRow>
        </dl>
      </CardContent>
    </Card>
  );
}

function UsersByStatusCard({ users }: { users: AdminMetricsDataDto["users"] }) {
  const rows = [
    { label: "Active", status: "active", value: users.active },
    { label: "Inactive", status: "inactive", value: users.inactive },
    { label: "Banned", status: "banned", value: users.banned },
    { label: "Deleted", status: "deleted", value: users.deleted },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Users by status</CardTitle>
        <CardDescription>All accounts, all time</CardDescription>
      </CardHeader>
      <CardContent>
        <dl className="flex flex-col divide-y">
          <StatRow label="Total">
            <CountLink href={buildAdminUsersHref()} value={users.total} />
          </StatRow>
          {rows.map((row) => (
            <StatRow key={row.status} label={row.label}>
              <CountLink href={buildAdminUsersHref({ status: row.status })} value={row.value} />
            </StatRow>
          ))}
        </dl>
      </CardContent>
    </Card>
  );
}

function OperationsCard({ operations }: { operations: AdminMetricsDataDto["operations"] }) {
  const needsEngineer =
    operations.notificationJobsDead + operations.unpublishCleanupFailed + operations.erasureOverdue > 0;

  return (
    <Card className={needsEngineer ? "border-l-4 border-l-amber-500" : undefined}>
      <CardHeader>
        <CardTitle className="text-base">Operations</CardTitle>
        <CardDescription>These need an engineer; there is no admin action here.</CardDescription>
      </CardHeader>
      <CardContent>
        <dl className="flex flex-col divide-y">
          <StatRow label="Dead notification jobs">
            {COUNT_FORMATTER.format(operations.notificationJobsDead)}
          </StatRow>
          <StatRow label="Failed unpublish cleanups">
            {COUNT_FORMATTER.format(operations.unpublishCleanupFailed)}
          </StatRow>
          <StatRow label="Overdue account erasures">
            {COUNT_FORMATTER.format(operations.erasureOverdue)}
          </StatRow>
        </dl>
      </CardContent>
    </Card>
  );
}

function DailyTable({ daily }: { daily: AdminMetricsDataDto["daily"] }) {
  return (
    <Card>
      <CardContent>
        <details>
          <summary className="cursor-pointer text-sm font-medium">Daily table</summary>
          <div className="mt-3">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Day (UTC)</TableHead>
                  {DAILY_COLUMNS.map((column) => (
                    <TableHead key={column.key} className="text-right">
                      {column.label}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* Newest first: the latest days are the ones checked most. */}
                {[...daily].reverse().map((entry) => (
                  <TableRow key={entry.date}>
                    <TableCell className="tabular-nums">{entry.date}</TableCell>
                    {DAILY_COLUMNS.map((column) => (
                      <TableCell key={column.key} className="text-right tabular-nums">
                        {formatCount(entry[column.key])}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </details>
      </CardContent>
    </Card>
  );
}

export function AdminMetricsPageView({
  data,
  days,
}: {
  data: AdminMetricsDataDto;
  days: MetricsDays;
}) {
  const series = (key: DailyMetricKey) => toDailySeries(data.daily, key);
  const reportsOpened = series("reportsOpened");
  const reportsClosed = series("reportsClosed");
  // Opened and closed share one scale so their bar heights compare.
  const reportsScale = Math.max(
    summarizeDailySeries(reportsOpened).max,
    summarizeDailySeries(reportsClosed).max,
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">Metrics</h1>
          <p className="text-sm text-muted-foreground">
            {formatMetricsDay(data.from)} – {formatMetricsDay(data.to)}, {data.days} UTC days
          </p>
        </div>
        <p className="text-xs text-muted-foreground">
          As of{" "}
          <LocalizedDateTime lang={ADMIN_DISPLAY_LANGUAGE} timestamp={Date.parse(data.asOf)} />
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <WindowChips days={days} />
        <ul className="flex flex-col gap-0.5 text-xs text-muted-foreground">
          <li>Days are UTC calendar days; today is still in progress.</li>
          <li>Counts rows that still exist — unpublished journeys and erased accounts drop out.</li>
          <li>Active accounts: sign-ins and token refreshes, last 30 days.</li>
        </ul>
      </div>

      <section className="flex flex-col gap-3" aria-labelledby="window-totals">
        <h2 id="window-totals" className="text-sm font-medium text-muted-foreground">
          Last {data.days} days
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
          {WINDOW_TOTALS.map((tile) => (
            <TotalTile
              key={tile.key}
              label={tile.label}
              value={summarizeDailySeries(series(tile.key)).total}
            />
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-3" aria-labelledby="daily">
        <h2 id="daily" className="text-sm font-medium text-muted-foreground">
          Per day
        </h2>
        <div className="grid gap-3 lg:grid-cols-2">
          <ChartCard>
            <DailyBarChart label="Signups" series={series("signups")} />
          </ChartCard>
          <ChartCard>
            <DailyBarChart
              label="Active accounts (approx.)"
              series={series("activeAccounts")}
              aggregate="average"
            />
          </ChartCard>
          <ChartCard>
            <DailyBarChart label="Published journeys" series={series("newPublishedJourneys")} />
          </ChartCard>
          <ChartCard>
            <DailyBarChart label="Review decisions" series={series("reviewDecisions")} />
          </ChartCard>
          <ChartCard className="lg:col-span-2">
            <DailyBarChart label="Reports opened" series={reportsOpened} scaleMax={reportsScale} />
            <DailyBarChart label="Reports closed" series={reportsClosed} scaleMax={reportsScale} />
          </ChartCard>
        </div>
        <DailyTable daily={data.daily} />
      </section>

      <section className="flex flex-col gap-3" aria-labelledby="snapshot">
        <h2 id="snapshot" className="text-sm font-medium text-muted-foreground">
          Now
        </h2>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          <QueueHealthCard data={data} />
          <UsersByStatusCard users={data.users} />
          <OperationsCard operations={data.operations} />
        </div>
      </section>
    </div>
  );
}
