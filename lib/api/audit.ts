import "server-only";

import type {
  AdminAuditAction,
  AdminAuditLogDataDto,
  AdminAuditTargetType,
} from "@/src/apis/types";
import { requestEnvelope } from "./client";

// ─── List Audit Log ─────────────────────────

export async function listAdminAuditLog(input: {
  accessToken: string;
  action?: AdminAuditAction;
  actorId?: string;
  subjectUserId?: string;
  targetType?: AdminAuditTargetType;
  targetId?: string;
  page: number;
  limit: number;
}): Promise<AdminAuditLogDataDto> {
  const query: Record<string, string | number> = {};

  if (input.action) query.action = input.action;
  if (input.actorId) query.actorId = input.actorId;
  if (input.subjectUserId) query.subjectUserId = input.subjectUserId;
  if (input.targetType) query.targetType = input.targetType;
  if (input.targetId) query.targetId = input.targetId;
  query.page = input.page;
  query.limit = input.limit;

  const response = await requestEnvelope<AdminAuditLogDataDto>({
    pathname: "/core/admin/audit-logs",
    accessToken: input.accessToken,
    query,
  });

  return response.data;
}
