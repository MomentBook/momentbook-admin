import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/src/configs/env.server", () => ({
  ENV: { API_BASE_URL: "https://api.test", ADMIN_SESSION_SECRET: "test-session-secret" },
}));

const mocks = vi.hoisted(() => ({
  cookies: vi.fn(),
  redirect: vi.fn((href: string) => {
    throw new Error(`REDIRECT:${href}`);
  }),
}));

vi.mock("next/headers", () => ({ cookies: mocks.cookies }));
vi.mock("next/navigation", () => ({ redirect: mocks.redirect }));

const fetchMock = vi.fn();

/** An in-memory cookie store with the parts of Next's store the session uses. */
function createCookieStore() {
  const values = new Map<string, string>();

  return {
    values,
    get: (name: string) => (values.has(name) ? { name, value: values.get(name) } : undefined),
    set: (name: string, value: string) => {
      values.set(name, value);
    },
  };
}

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

/** A v3 `AuthSessionDto` (contract-v3 §2.4): the bare body of a sign-in. */
const authSession = {
  user: {
    id: "user-1",
    name: "Admin",
    email: "admin@example.com",
    picture: null,
    isGuest: false,
  },
  provider: "EMAIL",
  accessToken,
  refreshToken,
  expiresIn: 900,
  consents: {},
  created: false,
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function loginForm() {
  const formData = new FormData();
  formData.set("email", "admin@example.com");
  formData.set("password", "password");
  formData.set("next", "/reports");
  return formData;
}

beforeEach(() => {
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
  vi.resetModules();
});

describe("loginAdminAction", () => {
  it("reads the bare AuthSessionDto and stores the same session cookie fields", async () => {
    const cookieStore = createCookieStore();
    mocks.cookies.mockResolvedValue(cookieStore);
    fetchMock.mockResolvedValueOnce(json(authSession));
    const { loginAdminAction } = await import("@/app/login/actions");
    const { getStoredAdminSession } = await import("@/lib/admin/session");

    await expect(loginAdminAction({ error: null }, loginForm())).rejects.toThrow(
      "REDIRECT:/reports",
    );

    expect(fetchMock.mock.calls[0]?.[0]).toBe("https://api.test/auth/email/login");
    expect([...cookieStore.values.keys()]).toEqual(["momentbook_admin_session"]);
    // The encrypted cookie's payload: the session fields plus the JWT's own
    // `iat`/`exp`, as before v3, so an older cookie still reads.
    await expect(getStoredAdminSession(cookieStore as never)).resolves.toEqual({
      userId: "user-1",
      role: "admin",
      email: "admin@example.com",
      name: "Admin",
      accessToken,
      refreshToken,
      accessTokenExpiresAt: ACCESS_EXP * 1000,
      refreshTokenExpiresAt: REFRESH_EXP * 1000,
      iat: expect.any(Number),
      exp: REFRESH_EXP,
    });
  });

  it("rejects a body without user.id, as a v2 envelope has none", async () => {
    const cookieStore = createCookieStore();
    mocks.cookies.mockResolvedValue(cookieStore);
    fetchMock.mockResolvedValueOnce(
      json({ status: "success", data: { ...authSession, user: { _id: "user-1" } } }),
    );
    const { loginAdminAction } = await import("@/app/login/actions");

    await expect(loginAdminAction({ error: null }, loginForm())).resolves.toEqual({
      error: "Incomplete login response.",
    });
    expect(cookieStore.values.size).toBe(0);
  });

  it("refuses an account without the admin role", async () => {
    const cookieStore = createCookieStore();
    mocks.cookies.mockResolvedValue(cookieStore);
    fetchMock.mockResolvedValueOnce(
      json({ ...authSession, accessToken: jwt({ sub: "user-1", role: "USER", exp: ACCESS_EXP }) }),
    );
    const { loginAdminAction } = await import("@/app/login/actions");

    await expect(loginAdminAction({ error: null }, loginForm())).resolves.toEqual({
      error: "This account does not have admin access.",
    });
    expect(cookieStore.values.size).toBe(0);
  });
});

describe("session bootstrap route", () => {
  it("creates the session from a v3 sign-in body's user.id", async () => {
    const cookieStore = createCookieStore();
    mocks.cookies.mockResolvedValue(cookieStore);
    const { POST } = await import("@/app/session/route");
    const { getStoredAdminSession } = await import("@/lib/admin/session");

    const response = await POST(
      new Request("https://admin.test/session", {
        method: "POST",
        body: JSON.stringify({
          user: authSession.user,
          accessToken,
          refreshToken,
        }),
      }),
    );

    expect(response.status).toBe(200);
    await expect(getStoredAdminSession(cookieStore as never)).resolves.toMatchObject({
      userId: "user-1",
      email: "admin@example.com",
    });
  });
});

describe("auth services", () => {
  it("refreshAdminTokens returns the bare TokenPairDto", async () => {
    const pair = { accessToken: "a2", refreshToken: "r2", expiresIn: 900 };
    fetchMock.mockResolvedValueOnce(json(pair));
    const { refreshAdminTokens } = await import("@/lib/api/auth");

    await expect(refreshAdminTokens("r1")).resolves.toEqual(pair);
    expect(fetchMock.mock.calls[0]?.[0]).toBe("https://api.test/auth/refresh");
    expect(fetchMock.mock.calls[0]?.[1]?.body).toBe('{"refreshToken":"r1"}');
  });

  it("logoutAdmin accepts the 204", async () => {
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 204 }));
    const { logoutAdmin } = await import("@/lib/api/auth");

    await expect(logoutAdmin("r1")).resolves.toBeUndefined();
    expect(fetchMock.mock.calls[0]?.[0]).toBe("https://api.test/auth/logout");
    expect(fetchMock.mock.calls[0]?.[1]?.body).toBe('{"refreshToken":"r1"}');
  });
});
