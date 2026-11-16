import "server-only";

import type { AdminMetricsDataDto, AdminNotificationMetricsDataDto } from "@/lib/api/types";
import { bearer, coreClient, dataOf } from "./client";

// ─── Get Operations Metrics ─────────────────

export async function getAdminMetrics(input: {
  accessToken: string;
  days: 7 | 30 | 90;
}): Promise<AdminMetricsDataDto> {
  return dataOf(
    coreClient.GET("/core/admin/metrics", {
      params: { query: { days: input.days } },
      headers: bearer(input.accessToken),
    }),
  );
}

// ─── Get Notification Metrics ───────────────

export async function getAdminNotificationMetrics(input: {
  accessToken: string;
  days: 7 | 30 | 90;
}): Promise<AdminNotificationMetricsDataDto> {
  return dataOf(
    coreClient.GET("/core/admin/metrics/notifications", {
      params: { query: { days: input.days } },
      headers: bearer(input.accessToken),
    }),
  );
}
