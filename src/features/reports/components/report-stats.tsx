import { StatTile } from "@/components/stat-tile";
import type { AdminReportStatsDataDto } from "@/lib/api/types";

/** How many reports sit in each status, across every filter. */
export function ReportStats({ stats }: { stats: AdminReportStatsDataDto }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <StatTile
        label="Pending"
        value={stats.pendingReports}
        hint="Awaiting initial inspection"
      />
      <StatTile
        label="Under review"
        value={stats.reviewedReports}
        hint="Investigation in progress"
      />
      <StatTile
        label="Resolved"
        value={stats.resolvedReports}
        hint="Sanction applied or issue resolved"
      />
      <StatTile
        label="Rejected or dismissed"
        value={stats.rejectedReports}
        hint="Dismissed without penalty"
      />
    </div>
  );
}
