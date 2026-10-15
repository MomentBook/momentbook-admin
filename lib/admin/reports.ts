import "server-only";

import {
  getAdminReport,
  getAdminReportStats,
  listAdminReports,
} from "@/lib/api/reports";
import type {
  AdminReportDetailDataDto,
  AdminReportsDataDto,
  AdminReportsQueryDto,
  AdminReportStatsDataDto,
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
