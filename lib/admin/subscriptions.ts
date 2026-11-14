import "server-only";

import { getAdminSubscriptionSummary, getAdminUserSubscriptions } from "@/lib/api/subscriptions";
import { orNull } from "@/lib/admin/section-load";
import type {
  AdminSubscriptionSummaryDataDto,
  AdminUserSubscriptionsDataDto,
} from "@/src/apis/types";

/** The user page's subscription section. `null` when it could not be loaded:
 * the section says so and the rest of the page stands. */
export async function loadAdminUserSubscriptionsOrNull(
  accessToken: string,
  userId: string,
): Promise<AdminUserSubscriptionsDataDto | null> {
  return orNull(getAdminUserSubscriptions({ accessToken, userId }));
}

/** The Storage page's subscription counts; `null` when they could not be loaded. */
export async function loadAdminSubscriptionSummaryOrNull(
  accessToken: string,
): Promise<AdminSubscriptionSummaryDataDto | null> {
  return orNull(getAdminSubscriptionSummary({ accessToken }));
}
