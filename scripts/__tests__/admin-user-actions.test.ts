import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const redirect = vi.fn((href: string) => {
  throw new Error(`REDIRECT:${href}`);
});
const cookies = vi.fn();

const requireAdminActionSession = vi.fn();
const clearAdminSession = vi.fn();
const revokeAdminUserSessions = vi.fn();
const updateAdminUserStorageAllowance = vi.fn();

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
  updateAdminUserStorageAllowance,
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

describe("updateAdminUserStorageAllowanceAction", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  function signedIn() {
    cookies.mockResolvedValue({});
    requireAdminActionSession.mockResolvedValue({ accessToken: "token" });
  }

  function allowanceForm(fields: Record<string, string> = {}) {
    return revokeForm({ intent: "set", amount: "5", reason: "Support ticket 12", ...fields });
  }

  async function run(formData: FormData): Promise<string> {
    const { updateAdminUserStorageAllowanceAction } = await import("@/app/users/actions");

    try {
      await updateAdminUserStorageAllowanceAction(formData);
    } catch (error) {
      return (error as Error).message;
    }

    throw new Error("expected a redirect");
  }

  async function rejected(fields: Record<string, string>, error: string) {
    signedIn();

    expect(await run(allowanceForm(fields))).toBe(`REDIRECT:/users/u-1?error=${error}`);
    expect(updateAdminUserStorageAllowance).not.toHaveBeenCalled();
  }

  it("sets the amount in bytes with the trimmed reason", async () => {
    signedIn();
    updateAdminUserStorageAllowance.mockResolvedValue({});

    const result = await run(allowanceForm({ amount: " 0.5 ", reason: "  Support ticket 12 " }));

    expect(updateAdminUserStorageAllowance).toHaveBeenCalledTimes(1);
    expect(updateAdminUserStorageAllowance).toHaveBeenCalledWith({
      accessToken: "token",
      userId: "u-1",
      quotaOverrideBytes: 536870912,
      reason: "Support ticket 12",
    });
    expect(result).toBe("REDIRECT:/users/u-1?mutation=storage_allowance_updated");
  });

  it("0 is sent as 0, not as a cleared override", async () => {
    signedIn();
    updateAdminUserStorageAllowance.mockResolvedValue({});

    await run(allowanceForm({ amount: "0" }));

    expect(updateAdminUserStorageAllowance).toHaveBeenCalledWith(
      expect.objectContaining({ quotaOverrideBytes: 0 }),
    );
  });

  it("the plan button sends null whatever the amount field holds", async () => {
    signedIn();
    updateAdminUserStorageAllowance.mockResolvedValue({});

    const result = await run(allowanceForm({ intent: "plan", amount: "" }));

    expect(updateAdminUserStorageAllowance).toHaveBeenCalledWith({
      accessToken: "token",
      userId: "u-1",
      quotaOverrideBytes: null,
      reason: "Support ticket 12",
    });
    expect(result).toBe("REDIRECT:/users/u-1?mutation=storage_allowance_updated");
  });

  it("a blank amount sends nothing", async () => {
    await rejected({ amount: "" }, "allowance_empty");
    await rejected({ amount: "   " }, "allowance_empty");
  });

  it("a missing amount field sends nothing", async () => {
    signedIn();
    const formData = allowanceForm();
    formData.delete("amount");

    expect(await run(formData)).toBe("REDIRECT:/users/u-1?error=allowance_empty");
    expect(updateAdminUserStorageAllowance).not.toHaveBeenCalled();
  });

  it("text, a negative, and a too large amount send nothing", async () => {
    await rejected({ amount: "abc" }, "allowance_not_a_number");
    await rejected({ amount: "-1" }, "allowance_out_of_range");
    await rejected({ amount: "1024.1" }, "allowance_out_of_range");
  });

  it("a blank reason sends nothing, for both buttons", async () => {
    await rejected({ reason: "  " }, "allowance_reason_required");
    await rejected({ intent: "plan", amount: "", reason: "" }, "allowance_reason_required");
  });

  it("a reason over 500 characters sends nothing", async () => {
    await rejected({ reason: "a".repeat(501) }, "allowance_reason_too_long");

    signedIn();
    updateAdminUserStorageAllowance.mockResolvedValue({});
    await run(allowanceForm({ reason: "a".repeat(500) }));
    expect(updateAdminUserStorageAllowance).toHaveBeenCalledTimes(1);
  });

  it("a submission that names neither button sends nothing", async () => {
    await rejected({ intent: "" }, "allowance_choice_missing");
    await rejected({ intent: "clear" }, "allowance_choice_missing");

    signedIn();
    const formData = allowanceForm();
    formData.delete("intent");
    expect(await run(formData)).toBe("REDIRECT:/users/u-1?error=allowance_choice_missing");
    expect(updateAdminUserStorageAllowance).not.toHaveBeenCalled();
  });

  it("a missing userId never reaches the API", async () => {
    signedIn();

    expect(await run(allowanceForm({ userId: " " }))).toBe(
      "REDIRECT:/users/u-1?error=missing_user_id",
    );
    expect(updateAdminUserStorageAllowance).not.toHaveBeenCalled();
  });

  it("401 clears the session and goes to login", async () => {
    signedIn();
    updateAdminUserStorageAllowance.mockRejectedValue(new ApiError("Unauthorized", 401));

    const result = await run(allowanceForm());

    expect(clearAdminSession).toHaveBeenCalled();
    expect(result).toBe("REDIRECT:/login?next=%2Fusers%2Fu-1&error=session_expired");
  });

  it("404 goes to the directory with user_not_found", async () => {
    signedIn();
    updateAdminUserStorageAllowance.mockRejectedValue(new ApiError("User not found", 404));

    expect(await run(allowanceForm())).toBe("REDIRECT:/users?error=user_not_found");
  });

  it("409 and 403 are banners with the API message, not a logout", async () => {
    signedIn();
    updateAdminUserStorageAllowance.mockRejectedValue(
      new ApiError("The target account is deleted.", 409),
    );

    expect(await run(allowanceForm())).toBe(
      "REDIRECT:/users/u-1?error=allowance_update_failed&message=The+target+account+is+deleted.",
    );
    expect(clearAdminSession).not.toHaveBeenCalled();
  });

  it("an unexpected failure is a banner without a message", async () => {
    signedIn();
    updateAdminUserStorageAllowance.mockRejectedValue(new Error("boom"));

    expect(await run(allowanceForm())).toBe(
      "REDIRECT:/users/u-1?error=allowance_update_failed",
    );
  });
});
