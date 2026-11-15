import "server-only";

import type { AuthSessionDto, EmailLoginDto, TokenPairDto } from "@/lib/api/types";
import { authClient, dataOf } from "./client";

// ─── Sign-in ─────────────────────────────────

/** v3 answers the bare `AuthSessionDto`. A refusal throws (401 wrong
 * password, 403 no access, others `BackendApiError`). */
export async function loginWithEmail(credentials: EmailLoginDto): Promise<AuthSessionDto> {
  return dataOf(authClient.POST("/auth/email/login", { body: credentials }));
}

// ─── Logout (requires session) ───────────────

/** v3 answers 204 with no body. */
export async function logoutAdmin(refreshToken: string): Promise<void> {
  await authClient.POST("/auth/logout", { body: { refreshToken } });
}

// ─── Token Refresh ──────────────────────────

export async function refreshAdminTokens(refreshToken: string): Promise<TokenPairDto> {
  return dataOf(authClient.POST("/auth/refresh", { body: { refreshToken } }));
}
