import "server-only";

import type { TokenPairDto } from "@/src/apis/types";
import { requestApi } from "./client";

// ─── Logout (requires session) ───────────────

/** v3 answers 204 with no body. */
export async function logoutAdmin(refreshToken: string): Promise<void> {
  await requestApi<void>({
    pathname: "/auth/logout",
    method: "POST",
    body: { refreshToken },
  });
}

// ─── Token Refresh ──────────────────────────

export async function refreshAdminTokens(refreshToken: string): Promise<TokenPairDto> {
  return requestApi<TokenPairDto>({
    pathname: "/auth/refresh",
    method: "POST",
    body: { refreshToken },
  });
}
