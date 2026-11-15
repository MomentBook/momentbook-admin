import "server-only";

import { getAdminMetrics, getAdminNotificationMetrics } from "@/lib/api/metrics";
import type { MetricsDays } from "./model";
import { orNull } from "@/lib/workspace/section-load";
import type { AdminMetricsDataDto, AdminNotificationMetricsDataDto } from "@/lib/api/types";

export async function loadAdminMetricsData(
  accessToken: string,
  days: MetricsDays,
): Promise<AdminMetricsDataDto> {
  return getAdminMetrics({ accessToken, days });
}

/** The notifications section. Secondary: a failure leaves `null` for the section
 * to say so, and the operations metrics still render (ADR 0011). */
export async function loadAdminNotificationMetricsData(
  accessToken: string,
  days: MetricsDays,
): Promise<AdminNotificationMetricsDataDto | null> {
  return orNull(getAdminNotificationMetrics({ accessToken, days }));
}

/** The metrics page: the operations metrics (required) and the notifications
 * section (optional), in parallel. */
export async function loadMetricsPage(
  accessToken: string,
  days: MetricsDays,
): Promise<{
  metrics: AdminMetricsDataDto;
  notifications: AdminNotificationMetricsDataDto | null;
}> {
  const [metrics, notifications] = await Promise.all([
    loadAdminMetricsData(accessToken, days),
    loadAdminNotificationMetricsData(accessToken, days),
  ]);

  return { metrics, notifications };
}
