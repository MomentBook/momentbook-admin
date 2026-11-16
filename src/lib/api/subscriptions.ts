import "server-only";

import type {
  AdminSubscriptionSummaryDataDto,
  AdminUserSubscriptionsDataDto,
} from "@/lib/api/types";
import { bearer, coreClient, dataOf } from "./client";

// ─── Get An Account's Subscriptions ─────────

export async function getAdminUserSubscriptions(input: {
  accessToken: string;
  userId: string;
}): Promise<AdminUserSubscriptionsDataDto> {
  return dataOf(
    coreClient.GET("/core/admin/users/{userId}/subscriptions", {
      params: { path: { userId: input.userId } },
      headers: bearer(input.accessToken),
    }),
  );
}

// ─── Check An Account's Subscriptions With Their Stores ───

/** Reads each of the account's subscriptions back from its store and stores
 * what the store says. Answers the account's subscriptions afterwards. */
export async function resyncAdminUserSubscriptions(input: {
  accessToken: string;
  userId: string;
}): Promise<AdminUserSubscriptionsDataDto> {
  return dataOf(
    coreClient.POST("/core/admin/users/{userId}/subscriptions/resync", {
      params: { path: { userId: input.userId } },
      headers: bearer(input.accessToken),
    }),
  );
}

// ─── Get Subscription Counts ────────────────

export async function getAdminSubscriptionSummary(input: {
  accessToken: string;
}): Promise<AdminSubscriptionSummaryDataDto> {
  return dataOf(
    coreClient.GET("/core/admin/metrics/subscriptions", { headers: bearer(input.accessToken) }),
  );
}
