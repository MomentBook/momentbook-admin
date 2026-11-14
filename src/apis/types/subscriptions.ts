// ──────────────────────────────────────────────
// Storage subscription admin API types: aliases of the generated DTOs
// (ADR 0012).
// ──────────────────────────────────────────────

import type {
  AdminStoreNotificationDto as GeneratedAdminStoreNotificationDto,
  AdminSubscriptionDto as GeneratedAdminSubscriptionDto,
  AdminSubscriptionGroupDto as GeneratedAdminSubscriptionGroupDto,
  AdminSubscriptionSummaryDto as GeneratedAdminSubscriptionSummaryDto,
  AdminUserSubscriptionsDto,
} from "../generated/core";

// ─── An account's subscriptions (GET /core/admin/users/:userId/subscriptions) ───

export type AdminUserSubscriptionsDataDto = AdminUserSubscriptionsDto;
export type AdminSubscriptionDto = GeneratedAdminSubscriptionDto;
export type AdminStoreNotificationDto = GeneratedAdminStoreNotificationDto;

// ─── Subscription counts (GET /core/admin/metrics/subscriptions) ───

export type AdminSubscriptionSummaryDataDto = GeneratedAdminSubscriptionSummaryDto;
export type AdminSubscriptionGroupDto = GeneratedAdminSubscriptionGroupDto;
