import "server-only";

import type { AdminMetricsDataDto, AdminNotificationMetricsDataDto } from "@/src/apis/types";
import { requestApi } from "./client";

// ─── Get Operations Metrics ─────────────────

export async function getAdminMetrics(input: {
  accessToken: string;
  days: 7 | 30 | 90;
}): Promise<AdminMetricsDataDto> {
  return requestApi<AdminMetricsDataDto>({
    pathname: "/core/admin/metrics",
    accessToken: input.accessToken,
    query: { days: input.days },
  });
}

// ─── Get Notification Metrics ───────────────

export async function getAdminNotificationMetrics(input: {
  accessToken: string;
  days: 7 | 30 | 90;
}): Promise<AdminNotificationMetricsDataDto> {
  return requestApi<AdminNotificationMetricsDataDto>({
    pathname: "/core/admin/metrics/notifications",
    accessToken: input.accessToken,
    query: { days: input.days },
  });
}
