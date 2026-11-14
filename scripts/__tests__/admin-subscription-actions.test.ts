import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const redirect = vi.fn((href: string) => {
  throw new Error(`REDIRECT:${href}`);
});
const cookies = vi.fn();

const requireAdminActionSession = vi.fn();
const clearAdminSession = vi.fn();
const resyncAdminUserSubscriptions = vi.fn();

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

vi.mock("@/lib/api/subscriptions", () => ({
  resyncAdminUserSubscriptions,
}));

class ApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
  ) {
    super(message);
  }
}

function form(fields: Record<string, string> = {}) {
  const formData = new FormData();
  formData.set("returnTo", "/users/u-1");
  formData.set("userId", "u-1");

  for (const [key, value] of Object.entries(fields)) {
    formData.set(key, value);
  }

  return formData;
}

async function run(formData: FormData): Promise<string> {
  const { resyncAdminUserSubscriptionsAction } = await import(
    "@/app/users/subscription-actions"
  );

  try {
    await resyncAdminUserSubscriptionsAction(formData);
  } catch (error) {
    return (error as Error).message;
  }

  throw new Error("expected a redirect");
}

describe("resyncAdminUserSubscriptionsAction", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  function signedIn() {
    cookies.mockResolvedValue({});
    requireAdminActionSession.mockResolvedValue({ accessToken: "token" });
  }

  it("asks the server to read the account's subscriptions back from their stores", async () => {
    signedIn();
    resyncAdminUserSubscriptions.mockResolvedValue({ subscriptions: [], notifications: [] });

    const result = await run(form());

    expect(resyncAdminUserSubscriptions).toHaveBeenCalledWith({
      accessToken: "token",
      userId: "u-1",
    });
    expect(result).toBe("REDIRECT:/users/u-1?mutation=subscriptions_checked");
  });

  it("sends nothing without a user id", async () => {
    signedIn();

    const result = await run(form({ userId: " " }));

    expect(resyncAdminUserSubscriptions).not.toHaveBeenCalled();
    expect(result).toBe("REDIRECT:/users/u-1?error=missing_user_id");
  });

  it("an expired admin session signs out and returns to the page after login", async () => {
    signedIn();
    resyncAdminUserSubscriptions.mockRejectedValue(new ApiError("Unauthorized", 401));

    const result = await run(form());

    expect(clearAdminSession).toHaveBeenCalledTimes(1);
    expect(result).toContain("REDIRECT:/login");
    expect(result).toContain("session_expired");
  });

  it("an unknown account goes back to the list", async () => {
    signedIn();
    resyncAdminUserSubscriptions.mockRejectedValue(new ApiError("User not found", 404));

    const result = await run(form());

    expect(result).toBe("REDIRECT:/users?error=user_not_found");
  });

  it("a store that could not be asked is a banner with the server's reason, not a logout", async () => {
    signedIn();
    resyncAdminUserSubscriptions.mockRejectedValue(
      new ApiError("The store could not be reached.", 503),
    );

    const result = await run(form());

    expect(clearAdminSession).not.toHaveBeenCalled();
    expect(result).toBe(
      "REDIRECT:/users/u-1?error=subscriptions_check_failed&message=The+store+could+not+be+reached.",
    );
  });

  it("any other failure is the same banner without a reason", async () => {
    signedIn();
    resyncAdminUserSubscriptions.mockRejectedValue(new Error("boom"));

    const result = await run(form());

    expect(result).toBe("REDIRECT:/users/u-1?error=subscriptions_check_failed");
  });
});
