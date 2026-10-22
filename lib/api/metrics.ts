import "server-only";

import type { AdminMetricsDataDto } from "@/src/apis/types";
import { requestEnvelope } from "./client";

// ─── Get Operations Metrics ─────────────────

export async function getAdminMetrics(input: {
  accessToken: string;
  days: 7 | 30 | 90;
}): Promise<AdminMetricsDataDto> {
  const response = await requestEnvelope<AdminMetricsDataDto>({
    pathname: "/core/admin/metrics",
    accessToken: input.accessToken,
    query: { days: input.days },
  });

  return response.data;
}
