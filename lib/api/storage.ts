import "server-only";

import type { AdminStorageDataDto } from "@/src/apis/types";
import { requestApi } from "./client";

// ─── Get Storage Overview ───────────────────

export async function getAdminStorageMetrics(input: {
  accessToken: string;
}): Promise<AdminStorageDataDto> {
  return requestApi<AdminStorageDataDto>({
    pathname: "/core/admin/metrics/storage",
    accessToken: input.accessToken,
  });
}
