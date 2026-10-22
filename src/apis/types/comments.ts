// ──────────────────────────────────────────────
// Comment Admin API types — hand-written from docs/openapi/core.json
// ──────────────────────────────────────────────

export type AdminCommentStatus = "ACTIVE" | "DELETED";
export type AdminCommentDeletedByRole = "AUTHOR" | "JOURNEY_OWNER" | "ADMIN";

export interface AdminCommentAuthorDto {
  userId: string;
  name: string | null;
  status: "ACTIVE" | "INACTIVE" | "BANNED" | "DELETED";
}

export interface AdminCommentJourneyDto {
  publicId: string;
  ownerUserId: string;
}

export interface AdminCommentItemDto {
  commentId: string;
  publicId: string;
  body: string;
  status: AdminCommentStatus;
  deletedByRole: AdminCommentDeletedByRole | null;
  deletedAt: string | null;
  createdAt: string;
  author: AdminCommentAuthorDto;
  journey: AdminCommentJourneyDto;
}

export interface AdminCommentsDataDto {
  comments: AdminCommentItemDto[];
  total: number;
  page: number;
  pages: number;
  limit: number;
  hasMore: boolean;
}

export interface UpdateAdminCommentStatusDto {
  status: "deleted";
  reason?: string;
}

export interface AdminCommentStatusDataDto {
  commentId: string;
  status: "deleted";
  deletedByRole: AdminCommentDeletedByRole;
}
