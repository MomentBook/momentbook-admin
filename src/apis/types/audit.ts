// ──────────────────────────────────────────────
// Audit Log Admin API types — hand-written from docs/openapi/core.json
// ──────────────────────────────────────────────

export type AdminAuditAction =
  | "USER_BANNED"
  | "USER_UNBANNED"
  | "USER_SESSIONS_REVOKED"
  | "JOURNEY_REVIEW_DECIDED"
  | "JOURNEY_PUBLISHED_UNTRANSLATED"
  | "JOURNEY_TRANSLATION_REQUEUED"
  | "REPORT_UPDATED"
  | "COMMENT_DELETED"
  | "ARTICLE_CREATED"
  | "ARTICLE_UPDATED"
  | "ARTICLE_DELETED";

export type AdminAuditTargetType =
  | "USER"
  | "PUBLISHED_JOURNEY"
  | "REPORT"
  | "COMMENT"
  | "ARTICLE";

export interface AdminAuditUserDto {
  userId: string;
  name: string | null;
  email: string | null;
  status: "ACTIVE" | "INACTIVE" | "DELETED" | "BANNED";
}

export interface AdminAuditLogItemDto {
  id: string;
  action: AdminAuditAction;
  targetType: AdminAuditTargetType;
  targetId: string;
  subjectUserId: string | null;
  reason: string | null;
  details: Record<string, unknown> | null;
  createdAt: string;
  actor: AdminAuditUserDto;
  subject: AdminAuditUserDto;
}

export interface AdminAuditLogDataDto {
  actions: AdminAuditLogItemDto[];
  total: number;
  page: number;
  pages: number;
  limit: number;
  hasMore: boolean;
}
