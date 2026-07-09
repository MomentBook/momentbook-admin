"use client";

import Link from "next/link";
import { Card } from "@astryxdesign/core/Card";
import { VStack } from "@astryxdesign/core/VStack";
import { HStack } from "@astryxdesign/core/HStack";
import { Heading } from "@astryxdesign/core/Heading";
import { Text } from "@astryxdesign/core/Text";
import { Badge } from "@astryxdesign/core/Badge";
import { Button } from "@astryxdesign/core/Button";
import { EmptyState } from "@astryxdesign/core/EmptyState";
import { MetadataList, MetadataListItem } from "@astryxdesign/core/MetadataList";
import { LocalizedDate } from "@/components/LocalizedTime";
import { ADMIN_ALLOWED_EMAIL } from "@/lib/admin/config";
import {
  buildAdminArticleWorkspaceHref,
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

// ---------------------------------------------------------------------------
// Metric card (KPI)
// ---------------------------------------------------------------------------
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
  return (
    <Card variant={tone === "warning" ? "muted" : "default"} padding={3}>
      <VStack gap={1}>
        <Text type="label" size="2xs" color="secondary">
          {label}
        </Text>
        <Heading level={3} color="primary">
          {value}
        </Heading>
        <Text type="supporting" size="xsm">
          {hint}
        </Text>
      </VStack>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Queue distribution card
// ---------------------------------------------------------------------------
function StatusDistributionCard({ overview }: { overview: AdminOverviewData }) {
  const items = [
    { key: "pending", label: "Pending", count: overview.pendingCount, tone: "warning" as const },
    { key: "approved", label: "Approved", count: overview.approvedCount, tone: "success" as const },
    { key: "rejected", label: "Rejected", count: overview.rejectedCount, tone: "error" as const },
  ] as const;

  return (
    <Card padding={3}>
      <HStack gap={2} vAlign="center" hAlign="between">
        <VStack gap={0.5}>
          <Text type="label" size="2xs" color="secondary">Snapshot</Text>
          <Heading level={3}>Queue distribution</Heading>
        </VStack>
        <Text type="supporting" size="xsm">
          {formatCount(overview.totalCount)} total records
        </Text>
      </HStack>

      {overview.totalCount > 0 ? (
        <>
          {/* Distribution bar */}
          <div
            role="img"
            aria-label={items
              .map((i) => `${i.label} ${formatCount(i.count)}`)
              .join(", ")}
            style={{
              display: "flex",
              height: 8,
              borderRadius: 4,
              overflow: "hidden",
              marginTop: 12,
              marginBottom: 12,
            }}
          >
            {items.map((item) => (
              <span
                key={item.key}
                style={{
                  width: `${(item.count / overview.totalCount) * 100}%`,
                  background:
                    item.tone === "warning"
                      ? "var(--color-warning)"
                      : item.tone === "success"
                        ? "var(--color-success)"
                        : "var(--color-error)",
                }}
                aria-hidden="true"
              />
            ))}
          </div>

          {/* Distribution stats */}
          <HStack gap={4} hAlign="between">
            {items.map((item) => (
              <VStack key={item.key} gap={0.5}>
                <HStack gap={1} vAlign="center">
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background:
                        item.tone === "warning"
                          ? "var(--color-warning)"
                          : item.tone === "success"
                            ? "var(--color-success)"
                            : "var(--color-error)",
                    }}
                    aria-hidden="true"
                  />
                  <Text type="label" size="2xs">{item.label}</Text>
                </HStack>
                <Heading level={4}>{formatCount(item.count)}</Heading>
                <Text type="supporting" size="xsm">
                  {buildPercent(item.count, overview.totalCount)}%
                </Text>
              </VStack>
            ))}
          </HStack>
        </>
      ) : (
        <EmptyState
          title="No moderation records yet"
          description="This area will start showing queue distribution once published journey reviews exist."
          isCompact
        />
      )}

      <HStack gap={2} vAlign="center" hAlign="between" style={{ marginTop: 12 }}>
        <Text type="supporting" size="xsm" color="secondary">
          Overview charts summarize all moderation records.
        </Text>
        <Link href={buildAdminWorkspaceHref("reviews")}>
          <Button variant="primary" size="sm" label="Open pending queue" />
        </Link>
      </HStack>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Recent submissions card
// ---------------------------------------------------------------------------
function RecentIntakeCard({ overview }: { overview: AdminOverviewData }) {
  const maxCount = Math.max(overview.recentIntake.maxCount, 1);

  return (
    <Card padding={3}>
      <HStack gap={2} vAlign="center" hAlign="between">
        <VStack gap={0.5}>
          <Text type="label" size="2xs" color="secondary">Trend</Text>
          <Heading level={3}>Recent submissions</Heading>
        </VStack>
        <Text type="supporting" size="xsm">Last 6 weeks</Text>
      </HStack>

      <HStack
        gap={3}
        hAlign="center"
        style={{ marginTop: 16, minHeight: 120 }}
      >
        {overview.recentIntake.weeks.map((week) => (
          <VStack
            key={week.key}
            gap={0.5}
            vAlign="end"
            hAlign="center"
            style={{ flex: 1 }}
            role="img"
            aria-label={`${week.label}: ${formatCount(week.count)} submissions`}
          >
            <Text type="body" size="xsm" weight="semibold">
              {formatCount(week.count)}
            </Text>
            <div
              style={{
                width: "100%",
                maxWidth: 32,
                height: Math.max((week.count / maxCount) * 100, 12),
                minHeight: week.count > 0 ? 4 : 0,
                background: "var(--color-accent)",
                borderRadius: 4,
              }}
              aria-hidden="true"
            />
            <Text type="label" size="2xs" color="secondary">
              {week.label}
            </Text>
          </VStack>
        ))}
      </HStack>

      <Text type="supporting" size="xsm" color="secondary" style={{ marginTop: 8 }}>
        Counts use journey submission time (createdAt).
      </Text>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Admin context card
// ---------------------------------------------------------------------------
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
    <Card padding={3}>
      <VStack gap={0.5}>
        <Text type="label" size="2xs" color="secondary">Operations</Text>
        <Heading level={3}>Admin context</Heading>
      </VStack>

      <MetadataList columns="single" label={{ position: "start", width: 140 }}>
        <MetadataListItem label="Signed in">
          {session.email || session.name || "Admin"}
        </MetadataListItem>
        <MetadataListItem label="Allowed account">
          {ADMIN_ALLOWED_EMAIL}
        </MetadataListItem>
        <MetadataListItem label="Oldest pending">
          {oldestPendingAt ? (
            <LocalizedDate lang={ADMIN_DISPLAY_LANGUAGE} timestamp={oldestPendingAt} />
          ) : (
            "None"
          )}
        </MetadataListItem>
        <MetadataListItem label="Latest submission">
          {latestSubmissionAt ? (
            <LocalizedDate lang={ADMIN_DISPLAY_LANGUAGE} timestamp={latestSubmissionAt} />
          ) : (
            "None"
          )}
        </MetadataListItem>
      </MetadataList>

      <Text type="supporting" size="xsm" color="secondary" style={{ marginTop: 8 }}>
        Based on {formatCount(overview.totalCount)} moderation records.
      </Text>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Quick actions card
// ---------------------------------------------------------------------------
function QuickActionsCard() {
  return (
    <Card padding={3}>
      <VStack gap={0.5}>
        <Text type="label" size="2xs" color="secondary">Actions</Text>
        <Heading level={3}>Quick actions</Heading>
      </VStack>

      <VStack gap={2} style={{ marginTop: 12 }}>
        <Link href={buildAdminWorkspaceHref("reviews")}>
          <Button variant="primary" size="sm" label="Go to pending queue" />
        </Link>
        <Link href={buildAdminWorkspaceHref("reviews", { status: "all" })}>
          <Button variant="secondary" size="sm" label="View all review statuses" />
        </Link>
        <Link href={buildAdminArticleWorkspaceHref()}>
          <Button variant="secondary" size="sm" label="Manage articles" />
        </Link>
      </VStack>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Panel
// ---------------------------------------------------------------------------
export function AdminOverviewPanel({
  overview,
  session,
}: AdminOverviewPanelProps) {
  return (
    <VStack gap={3}>
      {/* KPI row */}
      <HStack gap={3}>
        <div style={{ flex: 1 }}>
          <OverviewMetricCard
            label="Pending now"
            value={formatCount(overview.pendingCount)}
            hint="Items waiting for a review decision"
            tone="warning"
          />
        </div>
        <div style={{ flex: 1 }}>
          <OverviewMetricCard
            label="Approval rate"
            value={formatRate(overview.approvalRate)}
            hint={`Approved out of ${formatCount(overview.reviewedCount)} completed reviews`}
            tone="success"
          />
        </div>
        <div style={{ flex: 1 }}>
          <OverviewMetricCard
            label="Total reviewed"
            value={formatCount(overview.reviewedCount)}
            hint="Approved and rejected decisions combined"
          />
        </div>
      </HStack>

      {/* Primary grid: distribution + side stack */}
      <HStack gap={3} vAlign="start">
        <div style={{ flex: 2 }}>
          <StatusDistributionCard overview={overview} />
        </div>

        <VStack gap={3} style={{ flex: 1, minWidth: 260 }}>
          <OperationsCard overview={overview} session={session} />
          <QuickActionsCard />
        </VStack>
      </HStack>

      {/* Recent submissions chart */}
      <RecentIntakeCard overview={overview} />
    </VStack>
  );
}
