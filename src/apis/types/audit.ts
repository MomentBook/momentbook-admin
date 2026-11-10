// ──────────────────────────────────────────────
// Audit log admin API types: aliases of the generated v3 DTOs (ADR 0012).
// ──────────────────────────────────────────────

import type {
  AdminAuditLogItemDto as GeneratedAdminAuditLogItemDto,
  AdminAuditLogPageDto,
} from "../generated/core";
import type { PageCounts } from "./shared";
import type { AdminUserSummaryDto } from "./users";

export type AdminAuditAction = GeneratedAdminAuditLogItemDto["action"];
export type AdminAuditTargetType = GeneratedAdminAuditLogItemDto["targetType"];
/** The actor or subject of an audit row; `email` is the representative email
 * only, the provider email is `providerEmail`. */
export type AdminAuditUserDto = AdminUserSummaryDto;
export type AdminAuditLogItemDto = GeneratedAdminAuditLogItemDto;
export type { AdminAuditLogPageDto };
export type AdminAuditLogDataDto = AdminAuditLogPageDto & PageCounts;
