import "server-only";

import type {
  AdminSubscriptionSummaryDataDto,
  AdminUserSubscriptionsDataDto,
} from "@/src/apis/types";
import { requestApi } from "./client";

// ─── Get An Account's Subscriptions ─────────

export async function getAdminUserSubscriptions(input: {
  accessToken: string;
  userId: string;
}): Promise<AdminUserSubscriptionsDataDto> {
  return requestApi<AdminUserSubscriptionsDataDto>({
    pathname: `/core/admin/users/${encodeURIComponent(input.userId)}/subscriptions`,
    accessToken: input.accessToken,
  });
}

// ─── Check An Account's Subscriptions With Their Stores ───

/** Reads each of the account's subscriptions back from its store and stores
 * what the store says. Answers the account's subscriptions afterwards. */
export async function resyncAdminUserSubscriptions(input: {
  accessToken: string;
  userId: string;
}): Promise<AdminUserSubscriptionsDataDto> {
  return requestApi<AdminUserSubscriptionsDataDto>({
    pathname: `/core/admin/users/${encodeURIComponent(input.userId)}/subscriptions/resync`,
    method: "POST",
    accessToken: input.accessToken,
    body: {},
  });
}

// ─── Get Subscription Counts ────────────────

export async function getAdminSubscriptionSummary(input: {
  accessToken: string;
}): Promise<AdminSubscriptionSummaryDataDto> {
  return requestApi<AdminSubscriptionSummaryDataDto>({
    pathname: "/core/admin/metrics/subscriptions",
    accessToken: input.accessToken,
  });
}
