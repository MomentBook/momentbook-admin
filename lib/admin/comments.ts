import "server-only";

import { listAdminComments } from "@/lib/api/comments";
import {
  ADMIN_COMMENTS_PAGE_SIZE,
  commentTabToApiStatus,
  type CommentStatusTab,
} from "@/lib/admin/comments-shared";
import type { AdminCommentItemDto } from "@/src/apis/types";

export type AdminCommentsFilters = {
  tab: CommentStatusTab;
  userId?: string;
  publicId?: string;
  page: number;
};

export type AdminCommentsWorkspaceData = {
  comments: AdminCommentItemDto[];
  total: number;
  page: number;
  pages: number;
};

export async function loadAdminCommentsWorkspaceData(
  accessToken: string,
  filters: AdminCommentsFilters,
): Promise<AdminCommentsWorkspaceData> {
  const list = await listAdminComments({
    accessToken,
    status: commentTabToApiStatus(filters.tab),
    userId: filters.userId,
    publicId: filters.publicId,
    page: filters.page,
    limit: ADMIN_COMMENTS_PAGE_SIZE,
  });

  return {
    comments: list.comments,
    total: list.total,
    page: filters.page,
    pages: Math.max(1, list.pages),
  };
}
