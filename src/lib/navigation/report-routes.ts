import { createLoader, parseAsString, parseAsStringLiteral } from "nuqs/server";
import { REPORT_REASONS, REPORT_STATUSES, REPORT_TARGET_TYPES } from "@/lib/api/types/reports";
import { ADMIN_REPORTS_PATH, withAdminQuery } from "./paths";
import {
  createAdminSerializer,
  flashParams,
  parseAsPage,
  parseAsText,
  parseAsUuid,
  toPage,
  toText,
} from "./params";

/** `/reports`: the page first, then the filters, as the list has always
 * written them. A value the API would refuse is no filter. */
const reportsParams = {
  page: parseAsPage,
  status: parseAsStringLiteral(REPORT_STATUSES),
  targetType: parseAsStringLiteral(REPORT_TARGET_TYPES),
  reason: parseAsStringLiteral(REPORT_REASONS),
  targetId: parseAsText,
  reporterId: parseAsUuid,
};

/** What report and ban actions leave on the page they return to; a report
 * update also names the new `status`. */
const reportFlashParams = { ...flashParams, userStatus: parseAsString };

export const loadReportsParams = createLoader({ ...reportsParams, ...reportFlashParams });
export const loadReportDetailParams = createLoader({
  status: parseAsStringLiteral(REPORT_STATUSES),
  ...reportFlashParams,
});

// Links write what the caller names, in the list's key order; the page that
// opens them does the checking.
const serializeReports = createAdminSerializer({
  page: parseAsPage,
  status: parseAsString,
  targetType: parseAsString,
  reason: parseAsString,
  targetId: parseAsString,
  reporterId: parseAsString,
  ...flashParams,
});

type QueryEntries = Record<string, string | null | undefined>;

export type AdminReportsHrefOptions = {
  page?: number | string | null;
  status?: string | null;
  targetType?: string | null;
  reason?: string | null;
  targetId?: string | null;
  reporterId?: string | null;
  mutation?: string | null;
  error?: string | null;
  message?: string | null;
};

export function buildAdminReportsHref(options?: AdminReportsHrefOptions): string {
  return serializeReports(ADMIN_REPORTS_PATH, {
    page: toPage(options?.page),
    status: toText(options?.status),
    targetType: toText(options?.targetType),
    reason: toText(options?.reason),
    targetId: toText(options?.targetId),
    reporterId: toText(options?.reporterId),
    mutation: toText(options?.mutation),
    error: toText(options?.error),
    message: toText(options?.message),
  });
}

export function buildAdminReportDetailHref(reportId: string, entries?: QueryEntries): string {
  return withAdminQuery(`${ADMIN_REPORTS_PATH}/${encodeURIComponent(reportId)}`, entries ?? {});
}
