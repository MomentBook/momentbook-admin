import { describe, expect, it } from "vitest";

import { adminSessionSchema, buildAdminSession } from "@/lib/auth/session-schema";
import { hasAdminRole, readTokenClaims } from "@/lib/auth/token";

function base64url(value: unknown): string {
  return Buffer.from(JSON.stringify(value)).toString("base64url");
}

/** An unsigned JWT; the admin decodes claims without verifying them. */
function jwt(claims: Record<string, unknown>): string {
  return `${base64url({ alg: "none", typ: "JWT" })}.${base64url(claims)}.sig`;
}

const ACCESS_EXP = Math.floor(Date.parse("2099-01-01T00:00:00.000Z") / 1000);
const REFRESH_EXP = Math.floor(Date.parse("2099-02-01T00:00:00.000Z") / 1000);
const accessToken = jwt({ sub: "user-1", role: "ADMIN", email: "admin@example.com", exp: ACCESS_EXP });
const refreshToken = jwt({ sub: "user-1", exp: REFRESH_EXP });

const STORED_SESSION = {
  userId: "user-1",
  role: "admin",
  email: "admin@example.com",
  name: "Admin",
  accessToken,
  refreshToken,
  accessTokenExpiresAt: ACCESS_EXP * 1000,
  refreshTokenExpiresAt: REFRESH_EXP * 1000,
};

describe("buildAdminSession", () => {
  it("builds the same session object login and refresh used to build", () => {
    const session = buildAdminSession(
      { accessToken, refreshToken },
      { userId: "user-1", email: "body@example.com", name: "Admin" },
    );

    expect(session).toEqual({
      userId: "user-1",
      role: "admin",
      email: "admin@example.com",
      name: "Admin",
      accessToken,
      refreshToken,
      accessTokenExpiresAt: ACCESS_EXP * 1000,
      refreshTokenExpiresAt: REFRESH_EXP * 1000,
    });
  });

  it("keeps the owner's email when the token has none", () => {
    const session = buildAdminSession(
      { accessToken: jwt({ role: "ADMIN", exp: ACCESS_EXP }), refreshToken },
      { userId: "user-1", email: "body@example.com", name: null },
    );

    expect(session).toMatchObject({ email: "body@example.com", name: null });
  });

  it("throws when the refresh token has no expiry", () => {
    expect(() =>
      buildAdminSession(
        { accessToken, refreshToken: jwt({ sub: "user-1" }) },
        { userId: "user-1", email: null, name: null },
      ),
    ).toThrow();
  });
});

describe("admin token claims", () => {
  it.each(["admin", "Admin", "ADMIN"])("accepts role %s", (role) => {
    const claims = readTokenClaims(jwt({ role, exp: ACCESS_EXP }));

    expect(claims && hasAdminRole(claims)).toBe(true);
  });

  it("rejects role user", () => {
    const claims = readTokenClaims(jwt({ role: "USER", exp: ACCESS_EXP }));

    expect(claims && hasAdminRole(claims)).toBe(false);
  });

  it("reads no claims from a token without an expiry", () => {
    expect(readTokenClaims(jwt({ role: "ADMIN" }))).toBeNull();
  });

  it("reads no claims from a value that is not a JWT", () => {
    expect(readTokenClaims("not-a-token")).toBeNull();
  });
});

describe("adminSessionSchema", () => {
  it("rejects a stored session without refreshToken", () => {
    const withoutRefreshToken: Record<string, unknown> = { ...STORED_SESSION };
    delete withoutRefreshToken.refreshToken;

    expect(adminSessionSchema.safeParse(withoutRefreshToken).success).toBe(false);
  });

  it("rejects a stored session whose role is not admin", () => {
    expect(adminSessionSchema.safeParse({ ...STORED_SESSION, role: "user" }).success).toBe(false);
  });

  it("keeps the cookie's own iat and exp", () => {
    const parsed = adminSessionSchema.parse({ ...STORED_SESSION, iat: 1, exp: REFRESH_EXP });

    expect(parsed).toEqual({ ...STORED_SESSION, iat: 1, exp: REFRESH_EXP });
  });
});
