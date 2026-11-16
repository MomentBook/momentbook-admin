import "server-only";

import type {
  AdminAuditAction,
  AdminAuditLogDataDto,
  AdminAuditTargetType,
} from "@/lib/api/types";
import { bearer, coreClient, dataOf, withPageCounts } from "./client";

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
  const page = await dataOf(
    coreClient.GET("/core/admin/audit-logs", {
      params: {
        query: {
          action: input.action,
          actorId: input.actorId,
          subjectUserId: input.subjectUserId,
          targetType: input.targetType,
          targetId: input.targetId,
          page: input.page,
          limit: input.limit,
        },
      },
      headers: bearer(input.accessToken),
    }),
  );

  return withPageCounts(page);
}
