import "server-only";

import type {
  AdminCommentStatus,
  AdminCommentStatusDataDto,
  AdminCommentsDataDto,
  UpdateAdminCommentStatusDto,
} from "@/src/apis/types";
import { requestEnvelope } from "./client";

// ─── List Comments ──────────────────────────

export async function listAdminComments(input: {
  accessToken: string;
  userId?: string;
  publicId?: string;
  status?: AdminCommentStatus;
  page: number;
  limit: number;
}): Promise<AdminCommentsDataDto> {
  const query: Record<string, string | number> = {};

  if (input.userId) query.userId = input.userId;
  if (input.publicId) query.publicId = input.publicId;
  if (input.status) query.status = input.status;
  query.page = input.page;
  query.limit = input.limit;

  const response = await requestEnvelope<AdminCommentsDataDto>({
    pathname: "/core/admin/comments",
    accessToken: input.accessToken,
    query,
  });

  return response.data;
}

// ─── Delete Comment (status update) ─────────

export async function updateAdminCommentStatus(input: {
  accessToken: string;
  commentId: string;
  data: UpdateAdminCommentStatusDto;
}): Promise<AdminCommentStatusDataDto> {
  const response = await requestEnvelope<AdminCommentStatusDataDto>({
    pathname: `/core/admin/comments/${encodeURIComponent(input.commentId)}/status`,
    method: "PATCH",
    accessToken: input.accessToken,
    body: input.data,
  });

  return response.data;
}
