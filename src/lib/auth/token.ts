import "server-only";

import { decodeJwt } from "jose";
import { z } from "zod";

/** The claims the admin reads from a token. A field of the wrong type reads
 * as absent; a token without a numeric `exp` has no claims at all. */
const tokenClaimsSchema = z.looseObject({
  exp: z.number(),
  role: z.string().optional().catch(undefined),
  email: z.string().optional().catch(undefined),
  name: z.string().optional().catch(undefined),
});

export type AdminTokenClaims = z.infer<typeof tokenClaimsSchema>;

/**
 * Decodes (does NOT verify) a token's claims, or `null` when it is not a JWT
 * or carries no expiry. Tokens MUST come from the API's own responses.
 */
export function readTokenClaims(token: string): AdminTokenClaims | null {
  try {
    return tokenClaimsSchema.parse(decodeJwt(token));
  } catch {
    return null;
  }
}

/** The role claim, read without regard to case (`ADMIN` on the wire). */
export function hasAdminRole(claims: AdminTokenClaims): boolean {
  return claims.role?.toLowerCase() === "admin";
}
