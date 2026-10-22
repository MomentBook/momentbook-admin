import type { AdminCommentDeletedByRole, AdminCommentStatus } from "@/src/apis/types";

export const ADMIN_COMMENTS_PAGE_SIZE = 20;

// The API caps `publicId` at 64 characters.
const MAX_PUBLIC_ID_LENGTH = 64;

export type CommentStatusTab = "active" | "deleted" | "all";

export const COMMENT_DELETED_BY_LABELS: Record<AdminCommentDeletedByRole, string> = {
  AUTHOR: "author",
  JOURNEY_OWNER: "journey owner",
  ADMIN: "admin",
};

/** Active is the default tab: the queue is what still shows to readers. */
export function parseCommentStatusTab(raw?: string | null): CommentStatusTab {
  return raw === "deleted" || raw === "all" ? raw : "active";
}

/** `all` sends no status, which the API reads as every comment. */
export function commentTabToApiStatus(tab: CommentStatusTab): AdminCommentStatus | undefined {
  if (tab === "active") return "ACTIVE";
  if (tab === "deleted") return "DELETED";
  return undefined;
}

/** A `publicId` the API accepts, or `undefined` (it answers 400 over 64). */
export function parsePublicIdFilter(raw?: string | null): string | undefined {
  const trimmed = raw?.trim();

  return trimmed && trimmed.length <= MAX_PUBLIC_ID_LENGTH ? trimmed : undefined;
}
