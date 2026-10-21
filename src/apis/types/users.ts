// ──────────────────────────────────────────────
// User Admin API types — hand-written from NestJS contract (apps/core/src/users)
// ──────────────────────────────────────────────

export type AdminUserStatusAction = "banned" | "active";

export interface UpdateAdminUserStatusDto {
  status: AdminUserStatusAction;
  reason?: string;
}

/** `inactive`: the ban was lifted but the account still owes required
 * consents, so it stays inactive until it accepts them. */
export type AdminUserStatusResult = "banned" | "active" | "inactive";

export interface AdminUserStatusResponseDataDto {
  userId: string;
  status: AdminUserStatusResult;
}
