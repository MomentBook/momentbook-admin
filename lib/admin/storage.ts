import "server-only";

import { getAdminStorageMetrics } from "@/lib/api/storage";
import type { AdminStorageDataDto } from "@/src/apis/types";

export async function loadAdminStorageData(accessToken: string): Promise<AdminStorageDataDto> {
  return getAdminStorageMetrics({ accessToken });
}
