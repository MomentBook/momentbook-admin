import "server-only";

import { listAdminAuditLog } from "@/lib/api/audit";
import type {
  AdminAuditAction,
  AdminAuditLogItemDto,
  AdminAuditTargetType,
} from "@/lib/api/types";
import { ADMIN_PAGE_SIZE } from "@/lib/workspace/list-page";

export type AdminAuditLogFilters = {
  action?: AdminAuditAction;
  actorId?: string;
  subjectUserId?: string;
  targetType?: AdminAuditTargetType;
  targetId?: string;
  page: number;
};

export type AdminAuditLogWorkspaceData = {
  actions: AdminAuditLogItemDto[];
  total: number;
  page: number;
  pages: number;
};

export async function loadAdminAuditLogData(
  accessToken: string,
  filters: AdminAuditLogFilters,
): Promise<AdminAuditLogWorkspaceData> {
  const list = await listAdminAuditLog({
    accessToken,
    action: filters.action,
    actorId: filters.actorId,
    subjectUserId: filters.subjectUserId,
    targetType: filters.targetType,
    targetId: filters.targetId,
    page: filters.page,
    limit: ADMIN_PAGE_SIZE,
  });

  return {
    actions: list.items,
    total: list.total,
    page: filters.page,
    pages: Math.max(1, list.pages),
  };
}
