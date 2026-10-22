import "server-only";

import type {
  AdminUserAuthEventsDataDto,
  AdminUserDetailDataDto,
  AdminUserRole,
  AdminUserSessionsRevokeDataDto,
  AdminUserStatus,
  AdminUserStatusResponseDataDto,
  AdminUsersDataDto,
  UpdateAdminUserStatusDto,
} from "@/src/apis/types";
import { requestEnvelope } from "./client";

// ─── Update User Status (Ban / Unban) ───────

export async function updateAdminUserStatus(input: {
  accessToken: string;
  userId: string;
  data: UpdateAdminUserStatusDto;
}): Promise<AdminUserStatusResponseDataDto> {
  const response = await requestEnvelope<AdminUserStatusResponseDataDto>({
    pathname: `/core/admin/users/${encodeURIComponent(input.userId)}/status`,
    method: "PATCH",
    accessToken: input.accessToken,
    body: input.data,
  });

  return response.data;
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

  const response = await requestEnvelope<AdminUsersDataDto>({
    pathname: "/core/admin/users",
    accessToken: input.accessToken,
    query,
  });

  return response.data;
}

// ─── Get User Detail ────────────────────────

export async function getAdminUser(input: {
  accessToken: string;
  userId: string;
}): Promise<AdminUserDetailDataDto> {
  const response = await requestEnvelope<AdminUserDetailDataDto>({
    pathname: `/core/admin/users/${encodeURIComponent(input.userId)}`,
    accessToken: input.accessToken,
  });

  return response.data;
}

// ─── List User Auth Events ──────────────────

export async function listAdminUserAuthEvents(input: {
  accessToken: string;
  userId: string;
  page: number;
  limit: number;
}): Promise<AdminUserAuthEventsDataDto> {
  const response = await requestEnvelope<AdminUserAuthEventsDataDto>({
    pathname: `/core/admin/users/${encodeURIComponent(input.userId)}/auth-events`,
    accessToken: input.accessToken,
    query: { page: input.page, limit: input.limit },
  });

  return response.data;
}

// ─── Revoke User Sessions ───────────────────

export async function revokeAdminUserSessions(input: {
  accessToken: string;
  userId: string;
  reason?: string;
}): Promise<AdminUserSessionsRevokeDataDto> {
  const response = await requestEnvelope<AdminUserSessionsRevokeDataDto>({
    pathname: `/core/admin/users/${encodeURIComponent(input.userId)}/sessions/revoke`,
    method: "POST",
    accessToken: input.accessToken,
    body: input.reason ? { reason: input.reason } : {},
  });

  return response.data;
}
