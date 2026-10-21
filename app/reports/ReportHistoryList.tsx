import Link from "next/link";
import { buildAdminReportDetailHref } from "@/lib/admin/paths";
import { getReportReasonLabel, getReportStatusLabel } from "@/lib/admin/reports-shared";
import type { AdminReportItemDto } from "@/src/apis/types";

/** `null` means the reports endpoint failed; the panel says so instead of
 * taking the page down. */
export type ReportHistory = { items: AdminReportItemDto[]; total: number } | null;

export function ReportHistoryList({
  title,
  history,
  viewAllHref,
  excludeReportId,
}: {
  title: string;
  history: ReportHistory;
  viewAllHref: string;
  /** The report on screen, left out of its own history rows. */
  excludeReportId?: string;
}) {
  const items = history?.items.filter((report) => report._id !== excludeReportId) ?? [];

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-medium">{title}</h3>
        {history && history.total > 0 ? (
          <Link href={viewAllHref} className="text-xs text-primary hover:underline">
            View all {history.total}
          </Link>
        ) : null}
      </div>
      {history === null ? (
        <p className="text-xs text-muted-foreground">Could not load reports.</p>
      ) : items.length > 0 ? (
        <ul className="flex flex-col">
          {items.map((report) => (
            <li key={report._id}>
              <Link
                href={buildAdminReportDetailHref(report._id)}
                className="flex items-center justify-between gap-2 rounded-md px-2 py-1 text-sm hover:bg-muted"
              >
                <span>{getReportReasonLabel(report.reason)}</span>
                <span className="text-xs text-muted-foreground">
                  {getReportStatusLabel(report.status)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-muted-foreground">None.</p>
      )}
    </div>
  );
}
