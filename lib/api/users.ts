import "server-only";

import type {
  AdminUserStatusResponseDataDto,
  UpdateAdminUserStatusDto,
} from "@/src/apis/types";
import { requestEnvelope } from "./client";

// ─── Update User Status (Ban / Unban) ───────

export async function updateAdminUserStatus(input: {
  accessToken: string;
  userId: string;
  data: UpdateAdminUserStatusDto;
}): Promise<AdminUserStatusResponseDataDto> {
  const response = await requestEnvelope<AdminUserStatusResponseDataDto>({
    pathname: `/core/admin/users/${encodeURIComponent(input.userId)}/status`,
    method: "PATCH",
    accessToken: input.accessToken,
    body: input.data,
  });

  return response.data;
}
