import "server-only";

import { requestEnvelope } from "./client";

// ─── Types ──────────────────────────────────

export type TokenRefreshResponseData = {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
};


// ─── Logout (requires session) ───────────────

export async function logoutAdmin(refreshToken: string): Promise<void> {
  await requestEnvelope<void>({
    pathname: "/auth/logout",
    method: "POST",
    body: { refreshToken },
  });
}

// ─── Token Refresh ──────────────────────────

export async function refreshAdminTokens(
  refreshToken: string,
): Promise<TokenRefreshResponseData> {
  const response = await requestEnvelope<TokenRefreshResponseData>({
    pathname: "/auth/refresh",
    method: "POST",
    body: { refreshToken },
  });

  return response.data;
}
