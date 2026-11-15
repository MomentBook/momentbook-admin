import "server-only";

import type { TokenPairDto } from "@/lib/api/types";
import { authClient, dataOf } from "./client";

// ─── Logout (requires session) ───────────────

/** v3 answers 204 with no body. */
export async function logoutAdmin(refreshToken: string): Promise<void> {
  await authClient.POST("/auth/logout", { body: { refreshToken } });
}

// ─── Token Refresh ──────────────────────────

export async function refreshAdminTokens(refreshToken: string): Promise<TokenPairDto> {
  return dataOf(authClient.POST("/auth/refresh", { body: { refreshToken } }));
}
