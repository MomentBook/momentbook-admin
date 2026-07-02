import Link from "next/link";
import { LocalizedDate } from "@/components/LocalizedTime";
import { ADMIN_ALLOWED_EMAIL } from "@/lib/admin/config";
import {
  buildAdminArticleWorkspaceHref,
  buildAdminWorkspaceHref,
} from "@/lib/admin/paths";
import type { AdminOverviewData } from "@/lib/admin/reviews";
import type { AdminSession } from "@/lib/admin/session";
import { defaultLanguage } from "@/lib/i18n/config";
import styles from "./workspace.module.scss";

const ADMIN_DISPLAY_LANGUAGE = defaultLanguage;
const COUNT_FORMATTER = new Intl.NumberFormat("en-US");

type AdminOverviewPanelProps = {
  overview: AdminOverviewData;
  session: AdminSession;
};

type OverviewMetricTone = "default" | "success" | "warning";

function formatCount(value: number): string {
  return COUNT_FORMATTER.format(value);
}

function formatRate(value: number | null): string {
  return value === null ? "—" : `${value}%`;
}

function readTimestamp(value: string | null): number | null {
  if (!value) {
    return null;
  }

  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function buildPercent(count: number, total: number): number {
  if (total <= 0) {
    return 0;
  }

  return Math.round((count / total) * 100);
}

function OverviewMetricCard({
  label,
  value,
  hint,
  tone = "default",
}: {
  label: string;
  value: string;
  hint: string;
  tone?: OverviewMetricTone;
}) {
  return (
    <article
      className={
        tone === "success"
          ? `${styles.metricCard} ${styles.metricSuccess}`
          : tone === "warning"
            ? `${styles.metricCard} ${styles.metricWarning}`
            : styles.metricCard
      }
    >
      <span className={styles.metricLabel}>{label}</span>
      <strong className={styles.metricValue}>{value}</strong>
      <p className={styles.metricHint}>{hint}</p>
    </article>
  );
}

function StatusDistributionCard({ overview }: { overview: AdminOverviewData }) {
  const items = [
    {
      key: "pending",
      label: "Pending",
      count: overview.pendingCount,
      className: styles.distributionPending,
      dotClassName: styles.distributionDotPending,
    },
    {
      key: "approved",
      label: "Approved",
      count: overview.approvedCount,
      className: styles.distributionApproved,
      dotClassName: styles.distributionDotApproved,
    },
    {
      key: "rejected",
      label: "Rejected",
      count: overview.rejectedCount,
      className: styles.distributionRejected,
      dotClassName: styles.distributionDotRejected,
    },
  ] as const;

  return (
    <section className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={styles.cardHeading}>
          <span className={styles.sectionLabel}>Snapshot</span>
          <h3 className={styles.cardTitle}>Queue distribution</h3>
        </div>
        <span className={styles.sectionMeta}>
          {formatCount(overview.totalCount)} total records
        </span>
      </div>

      {overview.totalCount > 0 ? (
        <>
          <div
            className={styles.distributionTrack}
            role="img"
            aria-label={items
              .map((item) => `${item.label} ${formatCount(item.count)}`)
              .join(", ")}
          >
            {items.map((item) => (
              <span
                key={item.key}
                className={`${styles.distributionSegment} ${item.className}`}
                style={{
                  width: `${(item.count / overview.totalCount) * 100}%`,
                }}
                aria-hidden="true"
              />
            ))}
          </div>

          <div className={styles.distributionStats}>
            {items.map((item) => (
              <article key={item.key} className={styles.distributionStat}>
                <div className={styles.distributionStatHeader}>
                  <span
                    className={`${styles.distributionDot} ${item.dotClassName}`}
                    aria-hidden="true"
                  />
                  <span className={styles.distributionLabel}>{item.label}</span>
                </div>
                <strong className={styles.distributionValue}>
                  {formatCount(item.count)}
                </strong>
                <span className={styles.distributionMeta}>
                  {buildPercent(item.count, overview.totalCount)}%
                </span>
              </article>
            ))}
          </div>
        </>
      ) : (
        <div className={styles.overviewEmptyState}>
          <h4 className={styles.emptyTitle}>No moderation records yet</h4>
          <p className={styles.emptyBody}>
            This area will start showing queue distribution once published journey
            reviews exist.
          </p>
        </div>
      )}

      <div className={styles.inlineActions}>
        <p className={styles.chartFootnote}>
          Overview charts summarize all moderation records, while detailed evidence
          stays in the review queue.
        </p>
        <Link href={buildAdminWorkspaceHref("reviews")} className={styles.primaryButton}>
          Open pending queue
        </Link>
      </div>
    </section>
  );
}

function RecentIntakeCard({ overview }: { overview: AdminOverviewData }) {
  const maxCount = Math.max(overview.recentIntake.maxCount, 1);

  return (
    <section className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={styles.cardHeading}>
          <span className={styles.sectionLabel}>Trend</span>
          <h3 className={styles.cardTitle}>Recent submissions</h3>
        </div>
        <span className={styles.sectionMeta}>Last 6 weeks</span>
      </div>

      <div className={styles.intakeChart}>
        {overview.recentIntake.weeks.map((week) => (
          <div
            key={week.key}
            className={styles.intakeBarItem}
            role="img"
            aria-label={`${week.label}: ${formatCount(week.count)} submissions`}
          >
            <strong className={styles.intakeValue}>{formatCount(week.count)}</strong>
            <div className={styles.intakeBarTrack} aria-hidden="true">
              <span
                className={styles.intakeBar}
                style={{
                  height:
                    week.count > 0 ? `${Math.max((week.count / maxCount) * 100, 12)}%` : "0%",
                }}
              />
            </div>
            <span className={styles.intakeLabel}>{week.label}</span>
          </div>
        ))}
      </div>

      <p className={styles.chartFootnote}>
        Counts use journey submission time (`createdAt`) because the current admin
        contract does not expose a review-decision timestamp.
      </p>
    </section>
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
    <section className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={styles.cardHeading}>
          <span className={styles.sectionLabel}>Operations</span>
          <h3 className={styles.cardTitle}>Admin context</h3>
        </div>
      </div>

      <dl className={styles.overviewMetaList}>
        <div className={styles.overviewMetaItem}>
          <dt>Signed in</dt>
          <dd>{session.email || session.name || "Admin"}</dd>
        </div>
        <div className={styles.overviewMetaItem}>
          <dt>Allowed account</dt>
          <dd>{ADMIN_ALLOWED_EMAIL}</dd>
        </div>
        <div className={styles.overviewMetaItem}>
          <dt>Oldest pending</dt>
          <dd>
            {oldestPendingAt ? (
              <LocalizedDate
                lang={ADMIN_DISPLAY_LANGUAGE}
                timestamp={oldestPendingAt}
              />
            ) : (
              "None"
            )}
          </dd>
        </div>
        <div className={styles.overviewMetaItem}>
          <dt>Latest submission</dt>
          <dd>
            {latestSubmissionAt ? (
              <LocalizedDate
                lang={ADMIN_DISPLAY_LANGUAGE}
                timestamp={latestSubmissionAt}
              />
            ) : (
              "None"
            )}
          </dd>
        </div>
      </dl>

      <p className={styles.chartFootnote}>
        Based on {formatCount(overview.totalCount)} moderation records currently
        visible to this admin surface.
      </p>
    </section>
  );
}

function QuickActionsCard() {
  return (
    <section className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={styles.cardHeading}>
          <span className={styles.sectionLabel}>Actions</span>
          <h3 className={styles.cardTitle}>Quick actions</h3>
        </div>
      </div>

      <div className={styles.quickActionList}>
        <Link href={buildAdminWorkspaceHref("reviews")} className={styles.primaryButton}>
          Go to pending queue
        </Link>
        <Link
          href={buildAdminWorkspaceHref("reviews", { status: "all" })}
          className={styles.secondaryButton}
        >
          View all review statuses
        </Link>
        <Link href={buildAdminArticleWorkspaceHref()} className={styles.secondaryButton}>
          Manage articles
        </Link>
      </div>
    </section>
  );
}

export function AdminOverviewPanel({
  overview,
  session,
}: AdminOverviewPanelProps) {
  return (
    <div className={styles.sectionStack}>
      <section className={styles.kpiGrid}>
        <OverviewMetricCard
          label="Pending now"
          value={formatCount(overview.pendingCount)}
          hint="Items waiting for a review decision"
          tone="warning"
        />
        <OverviewMetricCard
          label="Approval rate"
          value={formatRate(overview.approvalRate)}
          hint={`Approved out of ${formatCount(overview.reviewedCount)} completed reviews`}
          tone="success"
        />
        <OverviewMetricCard
          label="Total reviewed"
          value={formatCount(overview.reviewedCount)}
          hint="Approved and rejected decisions combined"
        />
      </section>

      <section className={styles.overviewPrimaryGrid}>
        <StatusDistributionCard overview={overview} />

        <div className={styles.overviewSideStack}>
          <OperationsCard overview={overview} session={session} />
          <QuickActionsCard />
        </div>
      </section>

      <RecentIntakeCard overview={overview} />
    </div>
  );
}
