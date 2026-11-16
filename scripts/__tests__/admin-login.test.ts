import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/env", () => ({
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

function form(fields: Record<string, string>): FormData {
  const formData = new FormData();

  for (const [name, value] of Object.entries(fields)) {
    formData.set(name, value);
  }

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

describe("loginFields", () => {
  it("asks for the email first, then the password", async () => {
    const { loginFields } = await import("@/features/auth/schema");

    expect(loginFields.safeParse({ email: " ", password: "" }).error?.issues[0]?.message).toBe(
      "Enter email.",
    );
    expect(
      loginFields.safeParse({ email: "admin@example.com", password: "  " }).error?.issues[0]
        ?.message,
    ).toBe("Enter password.");
  });

  it("trims both fields, as the action always has", async () => {
    const { loginFields } = await import("@/features/auth/schema");

    expect(loginFields.parse({ email: " admin@example.com ", password: " pw " })).toEqual({
      email: "admin@example.com",
      password: "pw",
    });
  });
});

describe("resolveLoginNotice", () => {
  it("says signed out after ?loggedOut=1, ahead of any error", async () => {
    const { resolveLoginNotice } = await import("@/features/auth/flash");

    expect(resolveLoginNotice({ loggedOut: "1", error: "session_expired" })).toEqual({
      tone: "success",
      message: "Signed out.",
    });
  });

  it("names why a session ended", async () => {
    const { resolveLoginNotice } = await import("@/features/auth/flash");

    expect(resolveLoginNotice({ loggedOut: null, error: "session_expired" })).toEqual({
      tone: "error",
      message: "Session expired. Sign in again.",
    });
    expect(resolveLoginNotice({ loggedOut: null, error: "admin_access_denied" })).toEqual({
      tone: "error",
      message: "This account no longer has admin access.",
    });
  });

  it("shows nothing for an unknown code", async () => {
    const { resolveLoginNotice } = await import("@/features/auth/flash");

    expect(resolveLoginNotice({ loggedOut: "0", error: "nope" })).toBeNull();
  });
});

describe("loginAdminAction refusals", () => {
  it("asks for a missing field without calling the API", async () => {
    const { loginAdminAction } = await import("@/features/auth/actions");

    await expect(
      loginAdminAction({ error: null }, form({ email: "", password: "pw" })),
    ).resolves.toEqual({ error: "Enter email." });
    await expect(
      loginAdminAction({ error: null }, form({ email: "admin@example.com", password: " " })),
    ).resolves.toEqual({ error: "Enter password." });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it.each([
    [401, "Invalid password."],
    [403, "This account cannot access admin."],
    [429, "Service unavailable."],
  ])("answers a %i with its sentence", async (status, error) => {
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ message: "refused" }), {
        status,
        headers: { "Content-Type": "application/json" },
      }),
    );
    const { loginAdminAction } = await import("@/features/auth/actions");

    await expect(
      loginAdminAction({ error: null }, form({ email: "admin@example.com", password: "pw" })),
    ).resolves.toEqual({ error });
  });

  it("says the API is unreachable when the request fails", async () => {
    fetchMock.mockRejectedValueOnce(new TypeError("fetch failed"));
    const { loginAdminAction } = await import("@/features/auth/actions");

    await expect(
      loginAdminAction({ error: null }, form({ email: "admin@example.com", password: "pw" })),
    ).resolves.toEqual({ error: "Could not reach the API server." });
  });
});
