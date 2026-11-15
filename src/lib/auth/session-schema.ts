import "server-only";

import { z } from "zod";
import { readTokenClaims } from "./token";

const adminSessionShape = z.object({
  userId: z.string(),
  role: z.literal("admin"),
  email: z.string().nullable(),
  name: z.string().nullable(),
  accessToken: z.string(),
  refreshToken: z.string(),
  accessTokenExpiresAt: z.number(),
  refreshTokenExpiresAt: z.number(),
});

export type AdminSession = z.infer<typeof adminSessionShape>;

/** A stored session. The cookie's JWT also carries its own `iat` and `exp`,
 * which are kept as they are, so a cookie written before keeps reading. */
export const adminSessionSchema = adminSessionShape.loose();

/**
 * The session for a token pair from the API. The access token's email and
 * name win over the owner's (the sign-in body, or the session being
 * refreshed). The role is checked by the caller with `hasAdminRole`.
 * Throws when either token carries no expiry.
 */
export function buildAdminSession(
  tokens: { accessToken: string; refreshToken: string },
  owner: { userId: string; email: string | null; name: string | null },
): AdminSession {
  const access = readTokenClaims(tokens.accessToken);
  const refresh = readTokenClaims(tokens.refreshToken);

  if (!access || !refresh) {
    throw new Error("A token carries no readable expiry");
  }

  return {
    userId: owner.userId,
    role: "admin",
    email: access.email ?? owner.email,
    name: access.name ?? owner.name,
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    accessTokenExpiresAt: access.exp * 1000,
    refreshTokenExpiresAt: refresh.exp * 1000,
  };
}
