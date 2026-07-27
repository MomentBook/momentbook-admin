import "server-only";

/**
 * Decoded (not verified) JWT claim shape from admin access tokens.
 * Tokens MUST originate from trusted backend API responses.
 */
export type AccessTokenClaims = {
  role?: string;
  email?: string | null;
  name?: string | null;
  picture?: string | null;
  exp?: number;
  [key: string]: unknown;
};

/**
 * Decodes (does NOT verify) JWT payload claims from a raw access token.
 * Tokens MUST originate from trusted backend API responses.
 */
export function readAccessTokenClaims(token: string): AccessTokenClaims {
  const segments = token.split(".");
  if (segments.length < 2) {
    throw new Error("Invalid token format");
  }

  const payloadSegment = segments[1];
  const normalized = payloadSegment
    .replace(/-/g, "+")
    .replace(/_/g, "/")
    .padEnd(Math.ceil(payloadSegment.length / 4) * 4, "=");
  const payload = JSON.parse(
    Buffer.from(normalized, "base64").toString("utf8"),
  ) as AccessTokenClaims;

  if (typeof payload.exp !== "number") {
    throw new Error("Missing access token expiration");
  }

  return payload;
}

/** Reads the expiry timestamp (ms) from an access token. */
export function readTokenExpiryMs(token: string): number {
  return readAccessTokenClaims(token).exp! * 1000;
}
