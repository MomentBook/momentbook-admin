// ──────────────────────────────────────────────
// User admin API types: aliases of the generated v3 DTOs (ADR 0012).
// ──────────────────────────────────────────────

import type {
  AdminUserAuthEventPageDto,
  AdminUserCountsDto as GeneratedAdminUserCountsDto,
  AdminUserDetailDto,
  AdminUserListItemDto as GeneratedAdminUserListItemDto,
  AdminUserPageDto,
  AdminUserProfileDto as GeneratedAdminUserProfileDto,
  AdminUserSessionsRevokeResultDto,
  AdminUserStatusDto,
  AdminUserSummaryDto as GeneratedAdminUserSummaryDto,
  UpdateAdminUserStatusDto as GeneratedUpdateAdminUserStatusDto,
} from "../generated/core";
import type { PageCounts } from "./shared";

/** A person inside another admin resource (report, comment, audit row). */
export type AdminUserSummaryDto = GeneratedAdminUserSummaryDto;

export type UpdateAdminUserStatusDto = GeneratedUpdateAdminUserStatusDto;
/** `INACTIVE`: the ban was lifted but the account still owes required
 * consents, so it stays inactive until it accepts them. */
export type AdminUserStatusResponseDataDto = AdminUserStatusDto;

export type AdminUserStatus = GeneratedAdminUserListItemDto["status"];
export type AdminUserRole = GeneratedAdminUserListItemDto["role"];

export type AdminUserListItemDto = GeneratedAdminUserListItemDto;
export type { AdminUserAuthEventPageDto, AdminUserPageDto };
export type AdminUsersDataDto = AdminUserPageDto & PageCounts;
export type AdminUserAuthEventsDataDto = AdminUserAuthEventPageDto & PageCounts;

export type AdminUserProfileDto = GeneratedAdminUserProfileDto;
export type AdminUserCountsDto = GeneratedAdminUserCountsDto;
export type AdminUserDetailDataDto = AdminUserDetailDto;
export type AdminUserSessionsRevokeDataDto = AdminUserSessionsRevokeResultDto;
