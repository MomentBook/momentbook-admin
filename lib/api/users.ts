import "server-only";

import type {
  AdminUserAuthEventPageDto,
  AdminUserAuthEventsDataDto,
  AdminUserDetailDataDto,
  AdminUserPageDto,
  AdminUserRole,
  AdminUserSessionsRevokeDataDto,
  AdminUserStatus,
  AdminUserStatusResponseDataDto,
  AdminUsersDataDto,
  UpdateAdminUserStatusDto,
} from "@/src/apis/types";
import { requestApi, withPageCounts } from "./client";

// ─── Update User Status (Ban / Unban) ───────

export async function updateAdminUserStatus(input: {
  accessToken: string;
  userId: string;
  data: UpdateAdminUserStatusDto;
}): Promise<AdminUserStatusResponseDataDto> {
  return requestApi<AdminUserStatusResponseDataDto>({
    pathname: `/core/admin/users/${encodeURIComponent(input.userId)}/status`,
    method: "PATCH",
    accessToken: input.accessToken,
    body: input.data,
  });
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
  const query: Record<string, string | number> = {};

  if (input.q) query.q = input.q;
  if (input.status) query.status = input.status;
  if (input.role) query.role = input.role;
  query.page = input.page;
  query.limit = input.limit;

  const page = await requestApi<AdminUserPageDto>({
    pathname: "/core/admin/users",
    accessToken: input.accessToken,
    query,
  });

  return withPageCounts(page);
}

// ─── Get User Detail ────────────────────────

export async function getAdminUser(input: {
  accessToken: string;
  userId: string;
}): Promise<AdminUserDetailDataDto> {
  return requestApi<AdminUserDetailDataDto>({
    pathname: `/core/admin/users/${encodeURIComponent(input.userId)}`,
    accessToken: input.accessToken,
  });
}

// ─── List User Auth Events ──────────────────

export async function listAdminUserAuthEvents(input: {
  accessToken: string;
  userId: string;
  page: number;
  limit: number;
}): Promise<AdminUserAuthEventsDataDto> {
  const page = await requestApi<AdminUserAuthEventPageDto>({
    pathname: `/core/admin/users/${encodeURIComponent(input.userId)}/auth-events`,
    accessToken: input.accessToken,
    query: { page: input.page, limit: input.limit },
  });

  return withPageCounts(page);
}

// ─── Revoke User Sessions ───────────────────

export async function revokeAdminUserSessions(input: {
  accessToken: string;
  userId: string;
  reason?: string;
}): Promise<AdminUserSessionsRevokeDataDto> {
  return requestApi<AdminUserSessionsRevokeDataDto>({
    pathname: `/core/admin/users/${encodeURIComponent(input.userId)}/sessions/revoke`,
    method: "POST",
    accessToken: input.accessToken,
    body: input.reason ? { reason: input.reason } : {},
  });
}
