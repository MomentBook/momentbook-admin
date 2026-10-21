import "server-only";

import {
  getAdminReport,
  getAdminReportStats,
  listAdminReports,
} from "@/lib/api/reports";
import type {
  AdminReportDetailDataDto,
  AdminReportItemDto,
  AdminReportsDataDto,
  AdminReportsQueryDto,
  AdminReportStatsDataDto,
  ReportTargetType,
} from "@/src/apis/types";

export * from "./reports-shared";

export type AdminReportsWorkspaceData = {
  reports: AdminReportsDataDto;
  stats: AdminReportStatsDataDto;
};

export async function loadAdminReportsWorkspaceData(input: {
  accessToken: string;
  query?: AdminReportsQueryDto;
}): Promise<AdminReportsWorkspaceData> {
  const [reports, stats] = await Promise.all([
    listAdminReports({
      accessToken: input.accessToken,
      query: input.query,
    }),
    getAdminReportStats({
      accessToken: input.accessToken,
    }),
  ]);

  return {
    reports,
    stats,
  };
}

export async function loadAdminReportDetail(input: {
  accessToken: string;
  reportId: string;
}): Promise<AdminReportDetailDataDto> {
  return getAdminReport(input);
}

const REPORT_HISTORY_LIMIT = 5;

/** The newest reports on one target or by one reporter, with the total, for
 * the context panels on the review and report detail screens. */
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

  return { items: reports.reports, total: reports.total };
}
