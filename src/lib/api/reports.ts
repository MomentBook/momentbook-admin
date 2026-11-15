import "server-only";

import type {
  AdminReportDetailDataDto,
  AdminReportsDataDto,
  AdminReportsQueryDto,
  AdminReportStatsDataDto,
  UpdateAdminReportRequestDto,
} from "@/lib/api/types";
import { bearer, coreClient, dataOf, withPageCounts } from "./client";

// ─── List Reports ───────────────────────────

export async function listAdminReports(input: {
  accessToken: string;
  query?: AdminReportsQueryDto;
}): Promise<AdminReportsDataDto> {
  const page = await dataOf(
    coreClient.GET("/core/admin/reports", {
      params: {
        query: {
          page: input.query?.page,
          limit: input.query?.limit,
          status: input.query?.status,
          targetType: input.query?.targetType,
          reason: input.query?.reason,
          targetId: input.query?.targetId,
          reporterId: input.query?.reporterId,
        },
      },
      headers: bearer(input.accessToken),
    }),
  );

  return withPageCounts(page);
}

// ─── Get Report Statistics ──────────────────

export async function getAdminReportStats(input: {
  accessToken: string;
}): Promise<AdminReportStatsDataDto> {
  return dataOf(
    coreClient.GET("/core/admin/reports/stats", { headers: bearer(input.accessToken) }),
  );
}

// ─── Get Report Detail ──────────────────────

export async function getAdminReport(input: {
  accessToken: string;
  reportId: string;
}): Promise<AdminReportDetailDataDto> {
  return dataOf(
    coreClient.GET("/core/admin/reports/{reportId}", {
      params: { path: { reportId: input.reportId } },
      headers: bearer(input.accessToken),
    }),
  );
}

// ─── Update Report ──────────────────────────

export async function updateAdminReport(input: {
  accessToken: string;
  reportId: string;
  report: UpdateAdminReportRequestDto;
}): Promise<AdminReportDetailDataDto> {
  return dataOf(
    coreClient.PATCH("/core/admin/reports/{reportId}", {
      params: { path: { reportId: input.reportId } },
      headers: bearer(input.accessToken),
      body: input.report,
    }),
  );
}
