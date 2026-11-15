import "server-only";

import { isBackendApiError } from "@/lib/api/client";
import { getAdminReport, getAdminReportStats, listAdminReports } from "@/lib/api/reports";
import type {
  AdminReportDetailDataDto,
  AdminReportItemDto,
  AdminReportsQueryDto,
  AdminReportStatsDataDto,
} from "@/lib/api/types";
import { ADMIN_PAGE_SIZE, toListPage, type ListPage } from "@/lib/workspace/list-page";

export type ReportsList = {
  reports: ListPage<AdminReportItemDto>;
  stats: AdminReportStatsDataDto;
};

/** One page of reports under the filters, and the counts for every status. */
export async function loadReportsList(input: {
  accessToken: string;
  page: number;
  filters: Omit<AdminReportsQueryDto, "page" | "limit">;
}): Promise<ReportsList> {
  const [reports, stats] = await Promise.all([
    listAdminReports({
      accessToken: input.accessToken,
      query: { page: input.page, limit: ADMIN_PAGE_SIZE, ...input.filters },
    }),
    getAdminReportStats({ accessToken: input.accessToken }),
  ]);

  return { reports: toListPage(reports, reports.page), stats };
}

/** One report; `null` when it no longer exists (404). */
export async function loadAdminReportDetail(input: {
  accessToken: string;
  reportId: string;
}): Promise<AdminReportDetailDataDto | null> {
  try {
    return await getAdminReport(input);
  } catch (error) {
    if (isBackendApiError(error) && error.statusCode === 404) {
      return null;
    }

    throw error;
  }
}
