import "server-only";

import type {
  AdminCommentStatus,
  AdminCommentStatusDataDto,
  AdminCommentsDataDto,
  UpdateAdminCommentStatusDto,
} from "@/lib/api/types";
import { bearer, coreClient, dataOf, withPageCounts } from "./client";

// ─── List Comments ──────────────────────────

export async function listAdminComments(input: {
  accessToken: string;
  userId?: string;
  publicId?: string;
  status?: AdminCommentStatus;
  page: number;
  limit: number;
}): Promise<AdminCommentsDataDto> {
  const page = await dataOf(
    coreClient.GET("/core/admin/comments", {
      params: {
        query: {
          userId: input.userId,
          publicId: input.publicId,
          status: input.status,
          page: input.page,
          limit: input.limit,
        },
      },
      headers: bearer(input.accessToken),
    }),
  );

  return withPageCounts(page);
}

// ─── Delete Comment (status update) ─────────

export async function updateAdminCommentStatus(input: {
  accessToken: string;
  commentId: string;
  data: UpdateAdminCommentStatusDto;
}): Promise<AdminCommentStatusDataDto> {
  return dataOf(
    coreClient.PATCH("/core/admin/comments/{commentId}/status", {
      params: { path: { commentId: input.commentId } },
      headers: bearer(input.accessToken),
      body: input.data,
    }),
  );
}
