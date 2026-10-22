import type {
  AdminAuditAction,
  AdminAuditLogItemDto,
  AdminAuditTargetType,
} from "@/src/apis/types";
import {
  buildAdminArticleDetailHref,
  buildAdminCommentsHref,
  buildAdminReportDetailHref,
  buildAdminReviewDetailHref,
  buildAdminUserHref,
} from "@/lib/admin/paths";

export const ADMIN_AUDIT_PAGE_SIZE = 20;

/** The single label source for audit actions (filter select, badges, the user
 * detail's moderation history). */
export const ADMIN_AUDIT_ACTION_LABELS: Record<AdminAuditAction, string> = {
  USER_BANNED: "User banned",
  USER_UNBANNED: "User unbanned",
  USER_SESSIONS_REVOKED: "User sessions revoked",
  JOURNEY_REVIEW_DECIDED: "Journey review decided",
  JOURNEY_PUBLISHED_UNTRANSLATED: "Journey published untranslated",
  JOURNEY_TRANSLATION_REQUEUED: "Journey translation requeued",
  REPORT_UPDATED: "Report updated",
  COMMENT_DELETED: "Comment deleted",
  ARTICLE_CREATED: "Article created",
  ARTICLE_UPDATED: "Article updated",
  ARTICLE_DELETED: "Article deleted",
};

export const ADMIN_AUDIT_TARGET_TYPE_LABELS: Record<AdminAuditTargetType, string> = {
  USER: "User",
  PUBLISHED_JOURNEY: "Journey",
  REPORT: "Report",
  COMMENT: "Comment",
  ARTICLE: "Article",
};

export const AUDIT_ACTIONS = Object.keys(ADMIN_AUDIT_ACTION_LABELS) as AdminAuditAction[];
const AUDIT_TARGET_TYPES = Object.keys(ADMIN_AUDIT_TARGET_TYPE_LABELS) as AdminAuditTargetType[];

export function parseAuditActionFilter(raw?: string | null): AdminAuditAction | undefined {
  return AUDIT_ACTIONS.find((action) => action === raw);
}

export function parseAuditTargetTypeFilter(raw?: string | null): AdminAuditTargetType | undefined {
  return AUDIT_TARGET_TYPES.find((type) => type === raw);
}

/** Where an audit row's target lives, or `null` when it has no page: a deleted
 * article is gone, and a comment is only reachable through its journey. */
export function resolveAuditTargetHref(item: AdminAuditLogItemDto): string | null {
  switch (item.targetType) {
    case "USER":
      return buildAdminUserHref(item.targetId);
    case "PUBLISHED_JOURNEY":
      return buildAdminReviewDetailHref(item.targetId);
    case "REPORT":
      return buildAdminReportDetailHref(item.targetId);
    case "COMMENT": {
      const publicId = item.details?.publicId;
      return typeof publicId === "string" && publicId
        ? buildAdminCommentsHref({ publicId, status: "all" })
        : null;
    }
    case "ARTICLE":
      return item.action === "ARTICLE_DELETED" ? null : buildAdminArticleDetailHref(item.targetId);
    default:
      return null;
  }
}

/** `key: value` pairs for the details column. `details` holds ids and state
 * values; the result is rendered as plain text, never HTML. */
export function summarizeAuditDetails(
  details: Record<string, unknown> | null,
): string | null {
  if (!details) return null;

  const pairs = Object.entries(details)
    .filter(([, value]) => value !== null && value !== undefined)
    .map(([key, value]) => `${key}: ${typeof value === "object" ? JSON.stringify(value) : String(value)}`);

  return pairs.length > 0 ? pairs.join(", ") : null;
}
