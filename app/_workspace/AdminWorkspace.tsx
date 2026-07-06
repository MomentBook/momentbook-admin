import Link from "next/link";
import { LocalizedDate } from "@/components/LocalizedTime";
import { AdminSidebar } from "@/app/_workspace/AdminSidebar";
import {
  buildAdminArticleWorkspaceHref,
  buildAdminReviewDetailHref,
  buildAdminWorkspaceHref,
  type AdminWorkspaceTab,
} from "@/lib/admin/paths";
import { getAdminReviewStatusLabel } from "@/lib/admin/reviews";
import type {
  AdminOverviewData,
  AdminReviewQueueData,
  AdminReviewQueueStatus,
  AdminReviewStatus,
} from "@/lib/admin/reviews";
import type { AdminSession } from "@/lib/admin/session";
import { defaultLanguage } from "@/lib/i18n/config";
import type { AdminDashboardBanner } from "./workspace-data";
import { AdminOverviewPanel } from "./AdminOverviewPanel";
import styles from "./workspace.module.scss";

const ADMIN_DISPLAY_LANGUAGE = defaultLanguage;

type AdminWorkspaceProps = {
  activeTab: AdminWorkspaceTab;
  banner: AdminDashboardBanner | null;
  overview: AdminOverviewData;
  queue: AdminReviewQueueData;
  session: AdminSession;
};

function buildStatusClassName(status: AdminReviewStatus): string {
  if (status === "APPROVED") {
    return `${styles.statusChip} ${styles.statusApproved}`;
  }

  if (status === "REJECTED") {
    return `${styles.statusChip} ${styles.statusRejected}`;
  }

  return `${styles.statusChip} ${styles.statusPending}`;
}

function buildReviewFilterHref(status: AdminReviewQueueStatus): string {
  return buildAdminWorkspaceHref("reviews", {
    status: status === "pending" ? null : status,
    page: null,
  });
}

function buildReviewDetailTableHref(
  publicId: string,
  options: {
    page: number;
    status: AdminReviewQueueStatus;
  },
): string {
  return buildAdminReviewDetailHref(publicId, {
    page: options.page > 1 ? String(options.page) : null,
    status: options.status === "pending" ? null : options.status,
  });
}

function getActiveTabTitle(tab: AdminWorkspaceTab): string {
  if (tab === "reviews") {
    return "Reviews";
  }

  return "Overview";
}

function getActiveTabDescription(tab: AdminWorkspaceTab): string {
  if (tab === "reviews") {
    return "Inspect the moderation queue, filter by status, and open a journey for evidence review.";
  }

  return "Start with pending reviews, then use the overview charts below to gauge moderation load and submission flow.";
}

function ContentHeader({
  banner,
  description,
  pendingCount,
  title,
}: {
  banner: AdminDashboardBanner | null;
  description: string;
  pendingCount: number;
  title: string;
}) {
  return (
    <header className={styles.contentHeader}>
      <div className={styles.headerCopy}>
        <div className={styles.headerTitleRow}>
          <h2 className={styles.contentTitle}>{title}</h2>
          <span className={styles.pendingBadge}>{pendingCount} pending</span>
        </div>
        <p className={styles.headerDescription}>{description}</p>
      </div>

      {banner ? (
        <p
          className={
            banner.tone === "error"
              ? styles.bannerError
              : banner.tone === "success"
                ? styles.bannerSuccess
                : styles.banner
          }
          role="status"
          aria-live="polite"
        >
          {banner.message}
        </p>
      ) : null}
    </header>
  );
}

function ReviewTablePanel({
  queue,
}: {
  queue: AdminReviewQueueData;
}) {
  return (
    <section className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={styles.cardHeading}>
          <h3 className={styles.cardTitle}>Reviews</h3>
        </div>
        <span className={styles.sectionMeta}>{queue.total} items</span>
      </div>

      <div className={styles.filterRow} aria-label="Queue status filters">
        {(
          [
            ["pending", "Pending"],
            ["approved", "Approved"],
            ["rejected", "Rejected"],
            ["all", "All"],
          ] as const
        ).map(([value, label]) => (
          <Link
            key={value}
            href={buildReviewFilterHref(value)}
            className={
              queue.status === value ? styles.filterChipActive : styles.filterChip
            }
          >
            {label}
          </Link>
        ))}
      </div>

      {queue.items.length > 0 ? (
        <>
          <div className={styles.tableScroll}>
            <table className={styles.queueTable}>
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Journey</th>
                  <th>User ID</th>
                  <th>Public ID</th>
                  <th>Visibility</th>
                  <th>Photos</th>
                  <th>Created</th>
                  <th>Published</th>
                </tr>
              </thead>
              <tbody>
                {queue.items.map((item) => (
                  <tr key={item.publicId} className={styles.queueTableRow}>
                    <td>
                      <span className={buildStatusClassName(item.review.status)}>
                        {getAdminReviewStatusLabel(item.review.status)}
                      </span>
                    </td>
                    <td>
                      <Link
                        href={buildReviewDetailTableHref(item.publicId, {
                          page: queue.page,
                          status: queue.status,
                        })}
                        className={styles.tablePrimaryLink}
                      >
                        {item.title || "Untitled journey"}
                      </Link>
                    </td>
                    <td className={styles.tableMono}>{item.userId}</td>
                    <td className={styles.tableMono}>{item.publicId}</td>
                    <td>{item.visibility}</td>
                    <td>{item.photoCount}</td>
                    <td>
                      <LocalizedDate
                        lang={ADMIN_DISPLAY_LANGUAGE}
                        timestamp={Date.parse(item.createdAt)}
                      />
                    </td>
                    <td>
                      {item.publishedAt ? (
                        <LocalizedDate
                          lang={ADMIN_DISPLAY_LANGUAGE}
                          timestamp={Date.parse(item.publishedAt)}
                        />
                      ) : (
                        "—"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {queue.pages > 1 ? (
            <div className={styles.pagination}>
              <Link
                href={buildAdminWorkspaceHref("reviews", {
                  page:
                    queue.page > 1 ? String(Math.max(1, queue.page - 1)) : null,
                  status: queue.status === "pending" ? null : queue.status,
                })}
                aria-disabled={queue.page <= 1}
                className={
                  queue.page <= 1 ? styles.paginationDisabled : styles.paginationLink
                }
              >
                Previous
              </Link>
              <span className={styles.sectionMeta}>
                Page {queue.page} of {queue.pages}
              </span>
              <Link
                href={buildAdminWorkspaceHref("reviews", {
                  page:
                    queue.page < queue.pages
                      ? String(Math.min(queue.pages, queue.page + 1))
                      : String(queue.pages),
                  status: queue.status === "pending" ? null : queue.status,
                })}
                aria-disabled={queue.page >= queue.pages}
                className={
                  queue.page >= queue.pages
                    ? styles.paginationDisabled
                    : styles.paginationLink
                }
              >
                Next
              </Link>
            </div>
          ) : null}
        </>
      ) : (
        <div className={styles.emptyState}>
          <h4 className={styles.emptyTitle}>No records in this filter</h4>
          <p className={styles.emptyBody}>
            Switch the filter or return to pending.
          </p>
          {queue.status !== "pending" ? (
            <Link
              href={buildAdminWorkspaceHref("reviews")}
              className={styles.secondaryButton}
            >
              Show pending
            </Link>
          ) : null}
        </div>
      )}
    </section>
  );
}

function ReviewsPanel({
  queue,
}: {
  queue: AdminReviewQueueData;
}) {
  return (
    <div className={styles.sectionStack}>
      <ReviewTablePanel queue={queue} />
    </div>
  );
}

export function AdminWorkspace({
  activeTab,
  banner,
  overview,
  queue,
  session,
}: AdminWorkspaceProps) {
  const navigationItems = [
    {
      tab: "overview" as const,
      href: buildAdminWorkspaceHref("overview"),
      label: "Overview",
    },
    {
      tab: "reviews" as const,
      href: buildAdminWorkspaceHref("reviews"),
      label: "Reviews",
      badge: String(queue.summary.pendingCount),
    },
    {
      tab: "articles" as const,
      href: buildAdminArticleWorkspaceHref(),
      label: "Articles",
    },
  ];

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <AdminSidebar
          activeTab={activeTab}
          navigationItems={navigationItems}
          session={session}
        />

        <section className={styles.content}>
          <ContentHeader
            banner={banner}
            description={getActiveTabDescription(activeTab)}
            pendingCount={queue.summary.pendingCount}
            title={getActiveTabTitle(activeTab)}
          />

          {activeTab === "reviews" ? (
            <ReviewsPanel queue={queue} />
          ) : (
            <AdminOverviewPanel overview={overview} session={session} />
          )}
        </section>
      </div>
    </main>
  );
}
