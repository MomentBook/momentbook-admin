// ──────────────────────────────────────────────
// User Admin API types — hand-written from NestJS contract (apps/core/src/users)
// ──────────────────────────────────────────────

export type AdminUserStatusAction = "banned" | "active";

export interface UpdateAdminUserStatusDto {
  status: AdminUserStatusAction;
  reason?: string;
}

export interface AdminUserStatusResponseDataDto {
  userId: string;
  status: string;
}
