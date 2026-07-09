import Link from "next/link";
import { Card } from "@astryxdesign/core/Card";
import { VStack } from "@astryxdesign/core/VStack";
import { HStack } from "@astryxdesign/core/HStack";
import { Heading } from "@astryxdesign/core/Heading";
import { Text } from "@astryxdesign/core/Text";
import { MetadataList, MetadataListItem } from "@astryxdesign/core/MetadataList";
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

// ---------------------------------------------------------------------------
// KPI metric cards
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
// Queue distribution card (simplified: numbers only, no chart)
// ---------------------------------------------------------------------------
function StatusDistributionCard({ overview }: { overview: AdminOverviewData }) {
  const items = [
    { key: "pending", label: "Pending", count: overview.pendingCount, tone: "warning" as const },
    { key: "approved", label: "Approved", count: overview.approvedCount, tone: "success" as const },
    { key: "rejected", label: "Rejected", count: overview.rejectedCount, tone: "error" as const },
  ] as const;

  return (
    <Card padding={3}>
      <VStack gap={0.5}>
        <Text type="label" size="2xs" color="secondary">Snapshot</Text>
        <Heading level={3}>Queue distribution</Heading>
      </VStack>

      <Text type="supporting" size="xsm" style={{ marginTop: 4 }}>
        {formatCount(overview.totalCount)} total records
      </Text>

      {overview.totalCount > 0 ? (
        <HStack gap={3} style={{ marginTop: 12 }}>
          {items.map((item) => (
            <VStack key={item.key} gap={0.5} style={{ flex: 1 }}>
              <Text type="label" size="2xs">{item.label}</Text>
              <Heading level={4}>{formatCount(item.count)}</Heading>
              <Text type="supporting" size="xsm">
                {buildPercent(item.count, overview.totalCount)}%
              </Text>
            </VStack>
          ))}
        </HStack>
      ) : null}

      <div style={{ marginTop: 12 }}>
        <Link href={buildAdminWorkspaceHref("reviews")}>
          <Text type="body" size="sm" color="accent">Open pending queue</Text>
        </Link>
      </div>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Admin context card (without allowed-account display)
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

      {/* Distribution + context */}
      <HStack gap={3} vAlign="start">
        <div style={{ flex: 2 }}>
          <StatusDistributionCard overview={overview} />
        </div>

        <div style={{ flex: 1, minWidth: 260 }}>
          <OperationsCard overview={overview} session={session} />
        </div>
      </HStack>
    </VStack>
  );
}
