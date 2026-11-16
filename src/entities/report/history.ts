import "server-only";

import { listAdminReports } from "@/lib/api/reports";
import type { AdminReportItemDto, ReportTargetType } from "@/lib/api/types";
import { orNull } from "@/lib/workspace/section-load";
import type { ReportHistory } from "./model";

const REPORT_HISTORY_LIMIT = 5;

/** The newest reports on one target or by one reporter, with the total, for
 * the context panels on the review, report and user detail screens. */
export async function loadReportHistory(input: {
  accessToken: string;
  targetType?: ReportTargetType;
  targetId?: string;
  reporterId?: string;
  limit?: number;
}): Promise<{ items: AdminReportItemDto[]; total: number }> {
  const reports = await listAdminReports({
    accessToken: input.accessToken,
    query: {
      page: 1,
      limit: input.limit ?? REPORT_HISTORY_LIMIT,
      ...(input.targetType ? { targetType: input.targetType } : {}),
      ...(input.targetId ? { targetId: input.targetId } : {}),
      ...(input.reporterId ? { reporterId: input.reporterId } : {}),
    },
  });

  return { items: reports.items, total: reports.total };
}

/** Report history for a secondary panel (see `orNull`). */
export async function loadReportHistoryOrNull(
  input: Parameters<typeof loadReportHistory>[0],
): Promise<ReportHistory> {
  return orNull(loadReportHistory(input));
}
