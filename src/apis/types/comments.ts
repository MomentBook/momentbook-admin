// ──────────────────────────────────────────────
// Comment admin API types: aliases of the generated v3 DTOs (ADR 0012).
// ──────────────────────────────────────────────

import type {
  AdminCommentDto,
  AdminCommentPageDto,
  AdminCommentStatusDto,
  UpdateAdminCommentStatusDto as GeneratedUpdateAdminCommentStatusDto,
} from "../generated/core";
import type { PageCounts } from "./shared";

export type AdminCommentStatus = AdminCommentDto["status"];
export type AdminCommentDeletedByRole = AdminCommentStatusDto["deletedByRole"];
export type AdminCommentItemDto = AdminCommentDto;
export type { AdminCommentPageDto };
export type AdminCommentsDataDto = AdminCommentPageDto & PageCounts;
export type UpdateAdminCommentStatusDto = GeneratedUpdateAdminCommentStatusDto;
export type AdminCommentStatusDataDto = AdminCommentStatusDto;
