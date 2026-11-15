import "server-only";

import { getAdminStorageMetrics } from "@/lib/api/storage";
import { getAdminSubscriptionSummary } from "@/lib/api/subscriptions";
import type { AdminStorageDataDto, AdminSubscriptionSummaryDataDto } from "@/lib/api/types";
import { orNull } from "@/lib/workspace/section-load";

export type StoragePage = {
  storage: AdminStorageDataDto;
  /** `null` when the subscription counts could not be loaded: that section
   * says so and the rest of the page stands. */
  subscriptions: AdminSubscriptionSummaryDataDto | null;
};

/** The Storage page: the backup figures and the subscription counts, in one
 * round trip. */
export async function loadStoragePage(accessToken: string): Promise<StoragePage> {
  const [storage, subscriptions] = await Promise.all([
    getAdminStorageMetrics({ accessToken }),
    orNull(getAdminSubscriptionSummary({ accessToken })),
  ]);

  return { storage, subscriptions };
}
