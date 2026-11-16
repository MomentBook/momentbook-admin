import type { ReactNode } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { CircleCheck } from "lucide-react";
import { FlashBanner } from "@/components/flash-banner";
import { StatTile } from "@/components/stat-tile";
import { Time } from "@/components/time";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCount } from "@/lib/format/number";
import type { Flash } from "@/lib/navigation/flash";
import { buildAdminReviewQueueHref } from "@/lib/navigation/review-routes";
import { buildAdminReportsHref } from "@/lib/navigation/report-routes";
import { SLACK_TRANSLATION_NOTE, type AttentionCounts } from "@/lib/workspace/attention";
import type { AdminOverview } from "@/features/overview/loader";

// recharts loads in its own chunk, only when the chart renders (it still
// renders on the server).
const IntakeChart = dynamic(() => import("./intake-chart").then((mod) => mod.IntakeChart));

/** A count that may be unavailable (report counts when reports/stats fails). */
function countOrDash(value: number | null): string {
  return value === null ? "—" : formatCount(value);
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
            {countOrDash(value)}
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

function RecentIntakeCard({ intake }: { intake: AdminOverview["recentIntake"] }) {
  const total = `${formatCount(intake.totalCount)}${intake.truncated ? "+" : ""}`;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Published per week</CardTitle>
        <CardDescription>{total} in the last 6 weeks (UTC weeks)</CardDescription>
      </CardHeader>
      <CardContent>
        <IntakeChart weeks={intake.weeks} />
      </CardContent>
    </Card>
  );
}

export function AttentionOverview({
  banner,
  counts,
  overview,
}: {
  banner: Flash | null;
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
          As of <Time value={counts.asOf} withTime />
        </p>
      </div>

      <FlashBanner flash={banner} />

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
                {formatCount(counts.translationEnqueueFailed)} failed — retry from the journey.
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
                  Pending {countOrDash(counts.pendingReports)}
                </Link>
                <Link
                  href={buildAdminReportsHref({ status: "REVIEWED" })}
                  className="text-primary hover:underline"
                >
                  Reviewed {countOrDash(counts.reviewedReports)}
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
          <StatTile label="Approved" value={overview.approvedCount} />
          <StatTile label="Rejected" value={overview.rejectedCount} />
          <StatTile
            label="Approval rate"
            value={overview.approvalRate === null ? "—" : `${overview.approvalRate}%`}
          />
          <StatTile label="Reports pending" value={counts.pendingReports ?? "—"} />
          <StatTile label="Reports reviewed" value={counts.reviewedReports ?? "—"} />
        </div>
        <RecentIntakeCard intake={overview.recentIntake} />
      </section>
    </div>
  );
}
