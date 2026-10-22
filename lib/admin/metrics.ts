import "server-only";

import { getAdminMetrics } from "@/lib/api/metrics";
import type { MetricsDays } from "@/lib/admin/metrics-shared";
import type { AdminMetricsDataDto } from "@/src/apis/types";

export async function loadAdminMetricsData(
  accessToken: string,
  days: MetricsDays,
): Promise<AdminMetricsDataDto> {
  return getAdminMetrics({ accessToken, days });
}
