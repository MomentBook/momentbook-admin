import "server-only";

import type {
  AdminUserAuthEventsDataDto,
  AdminUserDetailDataDto,
  AdminUserRole,
  AdminUserSessionsRevokeDataDto,
  AdminUserStatus,
  AdminUserStatusResponseDataDto,
  AdminUserStorageDto,
  AdminUsersDataDto,
  UpdateAdminUserStatusDto,
} from "@/lib/api/types";
import { bearer, coreClient, dataOf, withPageCounts } from "./client";

// ─── Update User Status (Ban / Unban) ───────

export async function updateAdminUserStatus(input: {
  accessToken: string;
  userId: string;
  data: UpdateAdminUserStatusDto;
}): Promise<AdminUserStatusResponseDataDto> {
  return dataOf(
    coreClient.PATCH("/core/admin/users/{userId}/status", {
      params: { path: { userId: input.userId } },
      headers: bearer(input.accessToken),
      body: input.data,
    }),
  );
}

// ─── List Users ─────────────────────────────

export async function listAdminUsers(input: {
  accessToken: string;
  q?: string;
  status?: AdminUserStatus;
  role?: AdminUserRole;
  page: number;
  limit: number;
}): Promise<AdminUsersDataDto> {
  const page = await dataOf(
    coreClient.GET("/core/admin/users", {
      params: {
        query: {
          q: input.q,
          status: input.status,
          role: input.role,
          page: input.page,
          limit: input.limit,
        },
      },
      headers: bearer(input.accessToken),
    }),
  );

  return withPageCounts(page);
}

// ─── Get User Detail ────────────────────────

export async function getAdminUser(input: {
  accessToken: string;
  userId: string;
}): Promise<AdminUserDetailDataDto> {
  return dataOf(
    coreClient.GET("/core/admin/users/{userId}", {
      params: { path: { userId: input.userId } },
      headers: bearer(input.accessToken),
    }),
  );
}

// ─── List User Auth Events ──────────────────

export async function listAdminUserAuthEvents(input: {
  accessToken: string;
  userId: string;
  page: number;
  limit: number;
}): Promise<AdminUserAuthEventsDataDto> {
  const page = await dataOf(
    coreClient.GET("/core/admin/users/{userId}/auth-events", {
      params: {
        path: { userId: input.userId },
        query: { page: input.page, limit: input.limit },
      },
      headers: bearer(input.accessToken),
    }),
  );

  return withPageCounts(page);
}

// ─── Revoke User Sessions ───────────────────

export async function revokeAdminUserSessions(input: {
  accessToken: string;
  userId: string;
  reason?: string;
}): Promise<AdminUserSessionsRevokeDataDto> {
  return dataOf(
    coreClient.POST("/core/admin/users/{userId}/sessions/revoke", {
      params: { path: { userId: input.userId } },
      headers: bearer(input.accessToken),
      body: input.reason ? { reason: input.reason } : {},
    }),
  );
}

// ─── Update Storage Allowance ───────────────

export async function updateAdminUserStorageAllowance(input: {
  accessToken: string;
  userId: string;
  /** Bytes, or `null` to clear the override so the plan decides again. */
  quotaOverrideBytes: number | null;
  reason: string;
}): Promise<AdminUserStorageDto> {
  return dataOf(
    coreClient.PATCH("/core/admin/users/{userId}/storage-allowance", {
      params: { path: { userId: input.userId } },
      headers: bearer(input.accessToken),
      body: { quotaOverrideBytes: input.quotaOverrideBytes, reason: input.reason },
    }),
  );
}
