import "server-only";

import { getAdminMetrics, getAdminNotificationMetrics } from "@/lib/api/metrics";
import type { MetricsDays } from "@/lib/admin/metrics-shared";
import { orNull } from "@/lib/admin/section-load";
import type { AdminMetricsDataDto, AdminNotificationMetricsDataDto } from "@/src/apis/types";

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
