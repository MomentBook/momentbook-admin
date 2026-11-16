import "server-only";

import type { AdminStorageDataDto } from "@/lib/api/types";
import { bearer, coreClient, dataOf } from "./client";

// ─── Get Storage Overview ───────────────────

export async function getAdminStorageMetrics(input: {
  accessToken: string;
}): Promise<AdminStorageDataDto> {
  return dataOf(
    coreClient.GET("/core/admin/metrics/storage", { headers: bearer(input.accessToken) }),
  );
}
