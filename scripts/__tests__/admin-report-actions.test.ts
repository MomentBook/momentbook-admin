import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const redirect = vi.fn((href: string) => {
  throw new Error(`REDIRECT:${href}`);
});
const cookies = vi.fn();

const requireAdminActionSession = vi.fn();
const clearAdminSession = vi.fn();
const updateAdminReport = vi.fn();
const updateAdminUserStatus = vi.fn();

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

vi.mock("@/lib/api/reports", () => ({
  updateAdminReport,
}));

vi.mock("@/lib/api/users", () => ({
  updateAdminUserStatus,
}));

class ApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly errorCode?: string,
  ) {
    super(message);
  }
}

function userStatusForm(fields: Record<string, string>) {
  const formData = new FormData();
  formData.set("returnTo", "/reports/report-1");
  formData.set("userId", "u1");

  for (const [key, value] of Object.entries(fields)) {
    formData.set(key, value);
  }

  return formData;
}

async function runUserStatusAction(formData: FormData): Promise<string> {
  const { updateAdminUserStatusAction } = await import("@/app/reports/actions");

  try {
    await updateAdminUserStatusAction(formData);
  } catch (error) {
    return (error as Error).message;
  }

  throw new Error("expected a redirect");
}

describe("updateAdminUserStatusAction", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("user status success uses the API result status", async () => {
    cookies.mockResolvedValue({});
    requireAdminActionSession.mockResolvedValue({ accessToken: "token" });
    updateAdminUserStatus.mockResolvedValue({ userId: "u1", status: "inactive" });

    const result = await runUserStatusAction(userStatusForm({ status: "active" }));

    expect(updateAdminUserStatus).toHaveBeenCalledWith({
      accessToken: "token",
      userId: "u1",
      data: { status: "active", reason: undefined },
    });
    expect(result).toBe(
      "REDIRECT:/reports/report-1?mutation=user_status_updated&userStatus=inactive",
    );
  });

  it("admin target 403 is a banner, not a logout", async () => {
    cookies.mockResolvedValue({});
    requireAdminActionSession.mockResolvedValue({ accessToken: "token" });
    updateAdminUserStatus.mockRejectedValue(
      new ApiError("Cannot change the status of an admin account.", 403),
    );

    const result = await runUserStatusAction(userStatusForm({ status: "banned" }));

    expect(clearAdminSession).not.toHaveBeenCalled();
    expect(result).toBe(
      "REDIRECT:/reports/report-1?error=user_update_failed&message=Cannot+change+the+status+of+an+admin+account.",
    );
  });

  it("deleted account 409 is a banner", async () => {
    cookies.mockResolvedValue({});
    requireAdminActionSession.mockResolvedValue({ accessToken: "token" });
    updateAdminUserStatus.mockRejectedValue(
      new ApiError("Deleted accounts cannot change status.", 409),
    );

    const result = await runUserStatusAction(userStatusForm({ status: "banned" }));

    expect(clearAdminSession).not.toHaveBeenCalled();
    expect(result).toBe(
      "REDIRECT:/reports/report-1?error=user_update_failed&message=Deleted+accounts+cannot+change+status.",
    );
  });
});
