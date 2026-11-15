import "server-only";

import { listAdminComments } from "@/lib/api/comments";
import type { AdminCommentItemDto } from "@/lib/api/types";
import { ADMIN_PAGE_SIZE, toListPage, type ListPage } from "@/lib/workspace/list-page";
import { commentTabToApiStatus, type CommentStatusTab } from "@/entities/comment/model";

export type AdminCommentsFilters = {
  tab: CommentStatusTab;
  userId?: string;
  publicId?: string;
  page: number;
};

export type AdminCommentsWorkspaceData = ListPage<AdminCommentItemDto>;

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
    limit: ADMIN_PAGE_SIZE,
  });

  return toListPage(list, filters.page);
}
