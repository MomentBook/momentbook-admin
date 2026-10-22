import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const redirect = vi.fn((href: string) => {
  throw new Error(`REDIRECT:${href}`);
});
const cookies = vi.fn();

const requireAdminActionSession = vi.fn();
const clearAdminSession = vi.fn();
const revokeAdminUserSessions = vi.fn();

vi.mock("next/navigation", () => ({
  redirect,
}));

vi.mock("next/headers", () => ({
  cookies,
}));

vi.mock("@/lib/admin/session", () => ({
  clearAdminSession,
  requireAdminActionSession,
}));

vi.mock("@/lib/api/client", () => ({
  isBackendApiError: (error: unknown) =>
    typeof error === "object" &&
    error !== null &&
    typeof (error as { statusCode?: unknown }).statusCode === "number" &&
    typeof (error as { message?: unknown }).message === "string",
}));

vi.mock("@/lib/api/users", () => ({
  revokeAdminUserSessions,
}));

class ApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
  ) {
    super(message);
  }
}

function revokeForm(fields: Record<string, string> = {}) {
  const formData = new FormData();
  formData.set("returnTo", "/users/u-1");
  formData.set("userId", "u-1");

  for (const [key, value] of Object.entries(fields)) {
    formData.set(key, value);
  }

  return formData;
}

async function runRevokeAction(formData: FormData): Promise<string> {
  const { revokeAdminUserSessionsAction } = await import("@/app/users/actions");

  try {
    await revokeAdminUserSessionsAction(formData);
  } catch (error) {
    return (error as Error).message;
  }

  throw new Error("expected a redirect");
}

describe("revokeAdminUserSessionsAction", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  function signedIn() {
    cookies.mockResolvedValue({});
    requireAdminActionSession.mockResolvedValue({ accessToken: "token" });
  }

  it("success reports how many sessions ended", async () => {
    signedIn();
    revokeAdminUserSessions.mockResolvedValue({ userId: "u-1", revokedSessions: 1 });

    const result = await runRevokeAction(revokeForm({ reason: " stolen phone " }));

    expect(revokeAdminUserSessions).toHaveBeenCalledWith({
      accessToken: "token",
      userId: "u-1",
      reason: "stolen phone",
    });
    expect(result).toBe("REDIRECT:/users/u-1?mutation=sessions_revoked&revokedSessions=1");
  });

  it("success with no active session still reports 0", async () => {
    signedIn();
    revokeAdminUserSessions.mockResolvedValue({ userId: "u-1", revokedSessions: 0 });

    const result = await runRevokeAction(revokeForm());

    expect(revokeAdminUserSessions).toHaveBeenCalledWith({
      accessToken: "token",
      userId: "u-1",
      reason: undefined,
    });
    expect(result).toBe("REDIRECT:/users/u-1?mutation=sessions_revoked&revokedSessions=0");
  });

  it("self or admin target 403 is a banner, not a logout", async () => {
    signedIn();
    revokeAdminUserSessions.mockRejectedValue(
      new ApiError("Cannot sign out an admin account.", 403),
    );

    const result = await runRevokeAction(revokeForm());

    expect(clearAdminSession).not.toHaveBeenCalled();
    expect(result).toBe(
      "REDIRECT:/users/u-1?error=sessions_revoke_failed&message=Cannot+sign+out+an+admin+account.",
    );
  });

  it("401 clears the session and goes to login", async () => {
    signedIn();
    revokeAdminUserSessions.mockRejectedValue(new ApiError("Unauthorized", 401));

    const result = await runRevokeAction(revokeForm());

    expect(clearAdminSession).toHaveBeenCalled();
    expect(result).toBe("REDIRECT:/login?next=%2Fusers%2Fu-1&error=session_expired");
  });

  it("404 goes to the directory with user_not_found", async () => {
    signedIn();
    revokeAdminUserSessions.mockRejectedValue(new ApiError("User not found", 404));

    const result = await runRevokeAction(revokeForm());

    expect(result).toBe("REDIRECT:/users?error=user_not_found");
  });

  it("deleted account 409 is a banner", async () => {
    signedIn();
    revokeAdminUserSessions.mockRejectedValue(new ApiError("Account is deleted.", 409));

    const result = await runRevokeAction(revokeForm());

    expect(clearAdminSession).not.toHaveBeenCalled();
    expect(result).toBe(
      "REDIRECT:/users/u-1?error=sessions_revoke_failed&message=Account+is+deleted.",
    );
  });

  it("a missing userId never reaches the API", async () => {
    signedIn();
    const formData = revokeForm();
    formData.set("userId", " ");

    const result = await runRevokeAction(formData);

    expect(revokeAdminUserSessions).not.toHaveBeenCalled();
    expect(result).toBe("REDIRECT:/users/u-1?error=missing_user_id");
  });
});
