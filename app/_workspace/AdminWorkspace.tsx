import Link from "next/link";
import { Layout, LayoutContent } from "@astryxdesign/core/Layout";
import { VStack } from "@astryxdesign/core/VStack";
import { Heading } from "@astryxdesign/core/Heading";
import { Text } from "@astryxdesign/core/Text";
import { Badge } from "@astryxdesign/core/Badge";
import { Banner } from "@astryxdesign/core/Banner";
import { Table, TableCell, TableHeaderCell, TableRow } from "@astryxdesign/core/Table";
import { Button } from "@astryxdesign/core/Button";
import { Card } from "@astryxdesign/core/Card";
import { EmptyState } from "@astryxdesign/core/EmptyState";
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

const ADMIN_DISPLAY_LANGUAGE = defaultLanguage;

type AdminWorkspaceProps = {
  activeTab: AdminWorkspaceTab;
  banner: AdminDashboardBanner | null;
  overview: AdminOverviewData;
  queue: AdminReviewQueueData;
  session: AdminSession;
};

function resolveBadgeVariant(status: AdminReviewStatus): "warning" | "success" | "error" {
  if (status === "APPROVED") return "success";
  if (status === "REJECTED") return "error";
  return "warning";
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
    <VStack gap={2}>
      <VStack gap={1}>
        <Heading level={2}>{title}</Heading>
        <Text type="body" color="secondary">{description}</Text>
      </VStack>

      <Badge
        label={`${pendingCount} pending`}
        variant={pendingCount > 0 ? "warning" : "neutral"}
      />

      {banner ? (
        <Banner
          status={banner.tone === "error" ? "error" : banner.tone === "success" ? "success" : "info"}
          title={banner.message}
        />
      ) : null}
    </VStack>
  );
}

function ReviewTablePanel({
  queue,
}: {
  queue: AdminReviewQueueData;
}) {
  return (
    <Card padding={3}>
      <VStack gap={0.5}>
        <Text type="label" size="2xs" color="secondary">Queue</Text>
        <Heading level={3}>Reviews</Heading>
      </VStack>

      <Text type="supporting" size="xsm" color="secondary" style={{ marginTop: 4 }}>
        {queue.total} items
      </Text>

      {/* Filter chips */}
      <div style={{ display: "flex", gap: 8, marginTop: 12, marginBottom: 12 }}>
        {(
          [
            ["pending", "Pending"],
            ["approved", "Approved"],
            ["rejected", "Rejected"],
            ["all", "All"],
          ] as const
        ).map(([value, label]) => (
          <Link key={value} href={buildReviewFilterHref(value)}>
            <Badge
              label={label}
              variant={queue.status === value ? "info" : "neutral"}
            />
          </Link>
        ))}
      </div>

      {queue.items.length > 0 ? (
        <>
          <Table>
            <TableHeaderCell>Status</TableHeaderCell>
            <TableHeaderCell>Journey</TableHeaderCell>
            <TableHeaderCell>User ID</TableHeaderCell>
            <TableHeaderCell>Public ID</TableHeaderCell>
            <TableHeaderCell>Visibility</TableHeaderCell>
            <TableHeaderCell>Photos</TableHeaderCell>
            <TableHeaderCell>Created</TableHeaderCell>
            <TableHeaderCell>Published</TableHeaderCell>
            {queue.items.map((item) => (
              <TableRow key={item.publicId}>
                <TableCell>
                  <Badge
                    label={getAdminReviewStatusLabel(item.review.status)}
                    variant={resolveBadgeVariant(item.review.status)}
                  />
                </TableCell>
                <TableCell>
                  <Link
                    href={buildReviewDetailTableHref(item.publicId, {
                      page: queue.page,
                      status: queue.status,
                    })}
                  >
                    {item.title || "Untitled journey"}
                  </Link>
                </TableCell>
                <TableCell>{item.userId}</TableCell>
                <TableCell>{item.publicId}</TableCell>
                <TableCell>{item.visibility}</TableCell>
                <TableCell>{item.photoCount}</TableCell>
                <TableCell>
                  <LocalizedDate
                    lang={ADMIN_DISPLAY_LANGUAGE}
                    timestamp={Date.parse(item.createdAt)}
                  />
                </TableCell>
                <TableCell>
                  {item.publishedAt ? (
                    <LocalizedDate
                      lang={ADMIN_DISPLAY_LANGUAGE}
                      timestamp={Date.parse(item.publishedAt)}
                    />
                  ) : (
                    "—"
                  )}
                </TableCell>
              </TableRow>
            ))}
          </Table>

          {queue.pages > 1 ? (
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12, justifyContent: "space-between" }}>
              <Link
                href={buildAdminWorkspaceHref("reviews", {
                  page:
                    queue.page > 1 ? String(Math.max(1, queue.page - 1)) : null,
                  status: queue.status === "pending" ? null : queue.status,
                })}
              >
                <Button
                  variant="secondary"
                  size="sm"
                  label="Previous"
                  isDisabled={queue.page <= 1}
                />
              </Link>
              <Text type="supporting" size="xsm">
                Page {queue.page} of {queue.pages}
              </Text>
              <Link
                href={buildAdminWorkspaceHref("reviews", {
                  page:
                    queue.page < queue.pages
                      ? String(Math.min(queue.pages, queue.page + 1))
                      : String(queue.pages),
                  status: queue.status === "pending" ? null : queue.status,
                })}
              >
                <Button
                  variant="secondary"
                  size="sm"
                  label="Next"
                  isDisabled={queue.page >= queue.pages}
                />
              </Link>
            </div>
          ) : null}
        </>
      ) : (
        <EmptyState
          title="No records in this filter"
          description="Switch the filter or return to pending."
          isCompact
          actions={
            queue.status !== "pending" ? (
              <Link href={buildAdminWorkspaceHref("reviews")}>
                <Button variant="primary" size="sm" label="Show pending" />
              </Link>
            ) : undefined
          }
        />
      )}
    </Card>
  );
}

function ReviewsPanel({
  queue,
}: {
  queue: AdminReviewQueueData;
}) {
  return (
    <VStack gap={4}>
      <ReviewTablePanel queue={queue} />
    </VStack>
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
    <Layout
      height="fill"
      start={
        <AdminSidebar
          activeTab={activeTab}
          navigationItems={navigationItems}
          session={session}
        />
      }
      content={
        <LayoutContent isScrollable>
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
        </LayoutContent>
      }
    />
  );
}
