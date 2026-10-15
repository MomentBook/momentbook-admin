import "server-only";

import type {
  AdminReportDetailDataDto,
  AdminReportsDataDto,
  AdminReportsQueryDto,
  AdminReportStatsDataDto,
  UpdateAdminReportRequestDto,
} from "@/src/apis/types";
import { requestEnvelope } from "./client";

// ─── List Reports ───────────────────────────

export async function listAdminReports(input: {
  accessToken: string;
  query?: AdminReportsQueryDto;
}): Promise<AdminReportsDataDto> {
  const queryRecord: Record<string, string | number> = {};

  if (input.query?.page) {
    queryRecord.page = input.query.page;
  }
  if (input.query?.limit) {
    queryRecord.limit = input.query.limit;
  }
  if (input.query?.status) {
    queryRecord.status = input.query.status;
  }
  if (input.query?.targetType) {
    queryRecord.targetType = input.query.targetType;
  }
  if (input.query?.reason) {
    queryRecord.reason = input.query.reason;
  }
  if (input.query?.targetId) {
    queryRecord.targetId = input.query.targetId;
  }
  if (input.query?.reporterId) {
    queryRecord.reporterId = input.query.reporterId;
  }

  const response = await requestEnvelope<AdminReportsDataDto>({
    pathname: "/core/admin/reports",
    accessToken: input.accessToken,
    query: Object.keys(queryRecord).length > 0 ? queryRecord : undefined,
  });

  return response.data;
}

// ─── Get Report Statistics ──────────────────

export async function getAdminReportStats(input: {
  accessToken: string;
}): Promise<AdminReportStatsDataDto> {
  const response = await requestEnvelope<AdminReportStatsDataDto>({
    pathname: "/core/admin/reports/stats",
    accessToken: input.accessToken,
  });

  return response.data;
}

// ─── Get Report Detail ──────────────────────

export async function getAdminReport(input: {
  accessToken: string;
  reportId: string;
}): Promise<AdminReportDetailDataDto> {
  const response = await requestEnvelope<AdminReportDetailDataDto>({
    pathname: `/core/admin/reports/${encodeURIComponent(input.reportId)}`,
    accessToken: input.accessToken,
  });

  return response.data;
}

// ─── Update Report ──────────────────────────

export async function updateAdminReport(input: {
  accessToken: string;
  reportId: string;
  report: UpdateAdminReportRequestDto;
}): Promise<AdminReportDetailDataDto> {
  const response = await requestEnvelope<AdminReportDetailDataDto>({
    pathname: `/core/admin/reports/${encodeURIComponent(input.reportId)}`,
    method: "PATCH",
    accessToken: input.accessToken,
    body: input.report,
  });

  return response.data;
}
