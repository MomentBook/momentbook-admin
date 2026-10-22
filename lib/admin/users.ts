import "server-only";

import { listAdminUsers } from "@/lib/api/users";
import { ADMIN_USERS_PAGE_SIZE } from "@/lib/admin/users-shared";
import type { AdminUserListItemDto, AdminUserRole, AdminUserStatus } from "@/src/apis/types";

export type AdminUsersFilters = {
  q?: string;
  status?: AdminUserStatus;
  role?: AdminUserRole;
  page: number;
};

export type AdminUsersWorkspaceData = {
  users: AdminUserListItemDto[];
  total: number;
  page: number;
  pages: number;
};

export async function loadAdminUsersWorkspaceData(
  accessToken: string,
  filters: AdminUsersFilters,
): Promise<AdminUsersWorkspaceData> {
  const list = await listAdminUsers({
    accessToken,
    q: filters.q,
    status: filters.status,
    role: filters.role,
    page: filters.page,
    limit: ADMIN_USERS_PAGE_SIZE,
  });

  return {
    users: list.users,
    total: list.total,
    page: filters.page,
    pages: Math.max(1, list.pages),
  };
}
