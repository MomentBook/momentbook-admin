import type { ReactNode } from "react";
import Link from "next/link";
import { CircleCheck } from "lucide-react";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LocalizedDateTime } from "@/components/LocalizedTime";
import { buildAdminReportsHref, buildAdminReviewQueueHref } from "@/lib/admin/paths";
import { SLACK_TRANSLATION_NOTE, type AttentionCounts } from "@/lib/admin/attention";
import type { AdminOverview } from "@/lib/admin/overview";
import { defaultLanguage } from "@/lib/i18n/config";
import type { AdminDashboardBanner } from "./workspace-data";

const ADMIN_DISPLAY_LANGUAGE = defaultLanguage;
const COUNT_FORMATTER = new Intl.NumberFormat("en-US");

function formatCount(value: number | null): string {
  return value === null ? "—" : COUNT_FORMATTER.format(value);
}

function AttentionTile({
  label,
  value,
  href,
  hint,
  children,
}: {
  label: string;
  value: number | null;
  href: string;
  hint?: string;
  children?: ReactNode;
}) {
  const needsAction = typeof value === "number" && value > 0;

  return (
    <Card className={needsAction ? "border-l-4 border-l-amber-500" : undefined}>
      <CardHeader className="pb-2">
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-3xl">
          <Link href={href} className="hover:underline">
            {formatCount(value)}
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-1 text-xs text-muted-foreground">
        {hint ? <p>{hint}</p> : null}
        {children}
      </CardContent>
    </Card>
  );
}

function HealthItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 rounded-md border p-3">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-lg font-semibold">{value}</span>
    </div>
  );
}

function RecentIntakeCard({ intake }: { intake: AdminOverview["recentIntake"] }) {
  const total = intake.truncated
    ? `${COUNT_FORMATTER.format(intake.totalCount)}+`
    : COUNT_FORMATTER.format(intake.totalCount);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Published per week</CardTitle>
        <CardDescription>{total} in the last 6 weeks (UTC weeks)</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex h-32 gap-2">
          {intake.weeks.map((week) => {
            const height =
              intake.maxCount > 0 ? Math.max(4, Math.round((week.count / intake.maxCount) * 100)) : 4;

            return (
              <div key={week.key} className="flex flex-1 flex-col items-center gap-1">
                <span className="text-xs tabular-nums">{week.count}</span>
                {/* The bar's percentage height needs a definite-height parent. */}
                <div className="flex w-full flex-1 items-end">
                  <div
                    className="w-full rounded-sm bg-primary/70"
                    style={{ height: `${height}%` }}
                    aria-hidden
                  />
                </div>
                <span className="text-[11px] text-muted-foreground">{week.label}</span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

export function AttentionOverview({
  banner,
  counts,
  overview,
}: {
  banner: AdminDashboardBanner | null;
  counts: AttentionCounts;
  overview: AdminOverview;
}) {
  const allClear =
    counts.pendingReviews === 0 && counts.translationPending === 0 && counts.openReports === 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">Attention</h1>
          <p className="text-sm text-muted-foreground">
            What needs a decision now, from the same filters Slack uses.
          </p>
        </div>
        <p className="text-xs text-muted-foreground">
          As of{" "}
          <LocalizedDateTime lang={ADMIN_DISPLAY_LANGUAGE} timestamp={Date.parse(counts.asOf)} />
        </p>
      </div>

      {banner ? (
        <Alert variant={banner.tone === "error" ? "destructive" : "default"}>
          <AlertTitle className="line-clamp-none">{banner.message}</AlertTitle>
        </Alert>
      ) : null}

      <section className="flex flex-col gap-3" aria-labelledby="needs-action">
        <h2 id="needs-action" className="text-sm font-medium text-muted-foreground">
          Needs action
        </h2>

        {allClear ? (
          <Card className="border-dashed">
            <CardContent className="flex items-center gap-3 py-6">
              <CircleCheck className="size-6 text-emerald-600" aria-hidden />
              <div>
                <p className="font-medium">All clear</p>
                <p className="text-sm text-muted-foreground">
                  No pending reviews, translations or open reports.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : null}

        <div className="grid gap-3 md:grid-cols-3">
          <AttentionTile
            label="Pending reviews"
            value={counts.pendingReviews}
            href={buildAdminReviewQueueHref()}
            hint="Published journeys waiting for your decision."
          />
          <AttentionTile
            label="Translation pending"
            value={counts.translationPending}
            href={buildAdminReviewQueueHref({ status: "translation" })}
            hint={SLACK_TRANSLATION_NOTE}
          >
            {counts.translationEnqueueFailed > 0 ? (
              <p className="text-destructive">
                {formatCount(counts.translationEnqueueFailed)} failed to enqueue — retry from
                the journey.
              </p>
            ) : null}
          </AttentionTile>
          <AttentionTile
            label="Open reports"
            value={counts.openReports}
            href={buildAdminReportsHref()}
            hint={counts.openReports === null ? "Report counts are unavailable right now." : undefined}
          >
            {counts.openReports !== null ? (
              <p className="flex gap-3">
                <Link
                  href={buildAdminReportsHref({ status: "PENDING" })}
                  className="text-primary hover:underline"
                >
                  Pending {formatCount(counts.pendingReports)}
                </Link>
                <Link
                  href={buildAdminReportsHref({ status: "REVIEWED" })}
                  className="text-primary hover:underline"
                >
                  Reviewed {formatCount(counts.reviewedReports)}
                </Link>
              </p>
            ) : null}
          </AttentionTile>
        </div>
      </section>

      <section className="flex flex-col gap-3" aria-labelledby="health">
        <h2 id="health" className="text-sm font-medium text-muted-foreground">
          Health
        </h2>
        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <HealthItem label="Approved" value={formatCount(overview.approvedCount)} />
          <HealthItem label="Rejected" value={formatCount(overview.rejectedCount)} />
          <HealthItem
            label="Approval rate"
            value={overview.approvalRate === null ? "—" : `${overview.approvalRate}%`}
          />
          <HealthItem label="Reports pending" value={formatCount(counts.pendingReports)} />
          <HealthItem label="Reports reviewed" value={formatCount(counts.reviewedReports)} />
        </div>
        <RecentIntakeCard intake={overview.recentIntake} />
      </section>
    </div>
  );
}
