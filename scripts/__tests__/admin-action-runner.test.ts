import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { z } from "zod";

// Expected URLs are the ones the existing action tests pin
// (admin-actions, admin-user-actions, admin-comments): every action that
// moves onto the runner must keep producing them.

const redirect = vi.fn((href: string) => {
  throw new Error(`REDIRECT:${href}`);
});
const cookieStore = { name: "cookie-store" };
const cookies = vi.fn(async () => cookieStore);
const requireAdminActionSession = vi.fn();
const clearAdminSession = vi.fn();

vi.mock("next/navigation", () => ({ redirect }));
vi.mock("next/headers", () => ({ cookies }));
vi.mock("@/lib/auth/session", () => ({ clearAdminSession, requireAdminActionSession }));
// The action tests mock the client with this one export, so it is the only
// one the runner may read.
vi.mock("@/lib/api/client", () => ({
  isBackendApiError: (error: unknown) =>
    typeof error === "object" &&
    error !== null &&
    typeof (error as { statusCode?: unknown }).statusCode === "number" &&
    typeof (error as { message?: unknown }).message === "string",
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

type Runner = typeof import("@/lib/actions/admin-action");
let runner: Runner;

beforeAll(async () => {
  runner = await import("@/lib/actions/admin-action");
});

afterEach(() => {
  vi.clearAllMocks();
});

function form(fields: Record<string, string>): FormData {
  const formData = new FormData();

  for (const [key, value] of Object.entries(fields)) {
    formData.set(key, value);
  }

  return formData;
}

function signedIn() {
  requireAdminActionSession.mockResolvedValue({ accessToken: "token" });
}

async function outcome(action: Promise<never>): Promise<string> {
  try {
    await action;
  } catch (error) {
    return (error as Error).message;
  }

  throw new Error("expected a redirect");
}

function userFields() {
  return z.object({ userId: runner.requiredText("missing_user_id") });
}

/** The review actions' query: the journey id leads, and there is no message. */
function reviewQuery(formData: FormData) {
  return {
    targetPublicId: runner.readFormText(formData, "targetPublicId") || null,
    mutation: null,
    reviewStatus: null,
    error: null,
  };
}

describe("runAdminAction", () => {
  it("redirects to returnTo with mutation on success", async () => {
    signedIn();
    const run = vi.fn(async () => ({
      query: { mutation: "sessions_revoked", revokedSessions: "1" },
    }));

    const result = await outcome(
      runner.runAdminAction({
        formData: form({ returnTo: "/users/u-1", userId: " u-1 " }),
        fallbackPath: "/users",
        fields: userFields(),
        failure: "sessions_revoke_failed",
        run,
      }),
    );

    expect(result).toBe("REDIRECT:/users/u-1?mutation=sessions_revoked&revokedSessions=1");
    expect(requireAdminActionSession).toHaveBeenCalledWith(cookieStore, "/users/u-1");
    expect(run).toHaveBeenCalledWith({ userId: "u-1" }, { accessToken: "token" });
  });

  it("clears the flash keys the return path already carries", async () => {
    signedIn();

    const result = await outcome(
      runner.runAdminAction({
        formData: form({
          returnTo: "/comments?status=hidden&error=comment_update_failed&message=Old",
          commentId: "c-1",
        }),
        fallbackPath: "/comments",
        fields: z.object({ commentId: runner.requiredText("comment_update_failed") }),
        failure: "comment_update_failed",
        run: async () => ({ query: { mutation: "comment_deleted" } }),
      }),
    );

    expect(result).toBe("REDIRECT:/comments?status=hidden&mutation=comment_deleted");
  });

  it("falls back when returnTo is not an admin path", async () => {
    signedIn();

    const result = await outcome(
      runner.runAdminAction({
        formData: form({ returnTo: "https://evil.example/comments", commentId: "c-1" }),
        fallbackPath: "/comments",
        fields: z.object({ commentId: runner.requiredText("comment_update_failed") }),
        failure: "comment_update_failed",
        run: async () => ({ query: { mutation: "comment_deleted" } }),
      }),
    );

    expect(result).toBe("REDIRECT:/comments?mutation=comment_deleted");
    expect(requireAdminActionSession).toHaveBeenCalledWith(cookieStore, "/comments");
  });

  it("clears the session and goes to login on 401", async () => {
    signedIn();

    const result = await outcome(
      runner.runAdminAction({
        formData: form({ returnTo: "/users/u-1", userId: "u-1" }),
        fallbackPath: "/users",
        fields: userFields(),
        failure: "sessions_revoke_failed",
        onAccessDenied: "banner",
        run: async () => {
          throw new ApiError("Unauthorized", 401);
        },
      }),
    );

    expect(clearAdminSession).toHaveBeenCalledWith(cookieStore);
    expect(result).toBe("REDIRECT:/login?next=%2Fusers%2Fu-1&error=session_expired");
  });

  it("signs out on 403 by default", async () => {
    signedIn();

    const result = await outcome(
      runner.runAdminAction({
        formData: form({ returnTo: "/comments", commentId: "c-1" }),
        fallbackPath: "/comments",
        fields: z.object({ commentId: runner.requiredText("comment_update_failed") }),
        failure: "comment_update_failed",
        run: async () => {
          throw new ApiError("Forbidden resource.", 403);
        },
      }),
    );

    expect(clearAdminSession).toHaveBeenCalledWith(cookieStore);
    expect(result).toBe("REDIRECT:/login?next=%2Fcomments&error=admin_access_denied");
  });

  it("shows a banner on 403 when onAccessDenied is banner", async () => {
    signedIn();

    const result = await outcome(
      runner.runAdminAction({
        formData: form({ returnTo: "/users/u-1", userId: "u-1" }),
        fallbackPath: "/users",
        fields: userFields(),
        failure: "sessions_revoke_failed",
        onAccessDenied: "banner",
        run: async () => {
          throw new ApiError("Cannot sign out an admin account.", 403);
        },
      }),
    );

    expect(clearAdminSession).not.toHaveBeenCalled();
    expect(result).toBe(
      "REDIRECT:/users/u-1?error=sessions_revoke_failed&message=Cannot+sign+out+an+admin+account.",
    );
  });

  it("carries the backend message on other errors", async () => {
    signedIn();

    const result = await outcome(
      runner.runAdminAction({
        formData: form({ returnTo: "/users/u-1", userId: "u-1" }),
        fallbackPath: "/users",
        fields: userFields(),
        failure: "sessions_revoke_failed",
        onAccessDenied: "banner",
        run: async () => {
          throw new ApiError("Account is deleted.", 409);
        },
      }),
    );

    expect(clearAdminSession).not.toHaveBeenCalled();
    expect(result).toBe(
      "REDIRECT:/users/u-1?error=sessions_revoke_failed&message=Account+is+deleted.",
    );
  });

  it("maps an API errorCode through onApiError", async () => {
    signedIn();

    const result = await outcome(
      runner.runAdminAction({
        formData: form({ returnTo: "/reviews/public-123", targetPublicId: "public-123" }),
        fallbackPath: "/reviews",
        fields: z.object({ targetPublicId: runner.requiredText("missing_public_id") }),
        baseQuery: reviewQuery,
        failure: "review_update_failed",
        showApiMessage: false,
        onApiError: (error) =>
          error.statusCode === 400 && error.errorCode === "REVIEW_STATE_CONFLICT"
            ? { query: { error: "review_state_conflict" } }
            : undefined,
        run: async () => {
          throw new ApiError("Republished", 400, "REVIEW_STATE_CONFLICT");
        },
      }),
    );

    expect(result).toBe(
      "REDIRECT:/reviews/public-123?targetPublicId=public-123&error=review_state_conflict",
    );
  });

  it("leaves the API message out when showApiMessage is false", async () => {
    signedIn();

    const result = await outcome(
      runner.runAdminAction({
        formData: form({ returnTo: "/reviews/public-123", targetPublicId: "public-123" }),
        fallbackPath: "/reviews",
        fields: z.object({ targetPublicId: runner.requiredText("missing_public_id") }),
        baseQuery: reviewQuery,
        failure: "review_requeue_failed",
        showApiMessage: false,
        run: async () => {
          throw new ApiError("Bad gateway", 502);
        },
      }),
    );

    expect(result).toBe(
      "REDIRECT:/reviews/public-123?targetPublicId=public-123&error=review_requeue_failed",
    );
  });

  it("sends a mapped outcome to another page", async () => {
    signedIn();

    const result = await outcome(
      runner.runAdminAction({
        formData: form({ returnTo: "/users/u-1", userId: "u-1" }),
        fallbackPath: "/users",
        fields: userFields(),
        failure: "sessions_revoke_failed",
        onAccessDenied: "banner",
        onApiError: (error) =>
          error.statusCode === 404
            ? { path: "/users", query: { error: "user_not_found" } }
            : undefined,
        run: async () => {
          throw new ApiError("User not found", 404);
        },
      }),
    );

    expect(result).toBe("REDIRECT:/users?error=user_not_found");
  });

  it("lands on the success outcome's own path", async () => {
    signedIn();

    const result = await outcome(
      runner.runAdminAction({
        formData: form({ returnTo: "/reviews/public-123", targetPublicId: "public-123" }),
        fallbackPath: "/reviews",
        fields: z.object({ targetPublicId: runner.requiredText("missing_public_id") }),
        baseQuery: reviewQuery,
        failure: "review_update_failed",
        run: async () => ({
          path: "/reviews/public-456?status=pending",
          query: {
            targetPublicId: "public-123",
            mutation: "review_updated",
            reviewStatus: "APPROVED",
          },
        }),
      }),
    );

    expect(result).toBe(
      "REDIRECT:/reviews/public-456?status=pending&targetPublicId=public-123&mutation=review_updated&reviewStatus=APPROVED",
    );
  });

  it("an unexpected failure is a banner without a message", async () => {
    signedIn();

    const result = await outcome(
      runner.runAdminAction({
        formData: form({ returnTo: "/users/u-1", userId: "u-1" }),
        fallbackPath: "/users",
        fields: userFields(),
        failure: "allowance_update_failed",
        onAccessDenied: "banner",
        run: async () => {
          throw new Error("boom");
        },
      }),
    );

    expect(result).toBe("REDIRECT:/users/u-1?error=allowance_update_failed");
  });

  it("redirects with the field's error code when fields fail, before the session", async () => {
    const run = vi.fn();

    const result = await outcome(
      runner.runAdminAction({
        formData: form({ returnTo: "/users/u-1", userId: " " }),
        fallbackPath: "/users",
        fields: userFields(),
        failure: "sessions_revoke_failed",
        run,
      }),
    );

    expect(result).toBe("REDIRECT:/users/u-1?error=missing_user_id");
    expect(requireAdminActionSession).not.toHaveBeenCalled();
    expect(run).not.toHaveBeenCalled();
  });

  it("adds the message an input error carries", async () => {
    const result = await outcome(
      runner.runAdminAction({
        formData: form({ returnTo: "/reports/r-1", userId: "" }),
        fallbackPath: "/reports",
        fields: userFields(),
        inputMessages: { missing_user_id: "User ID is required." },
        failure: "user_update_failed",
        run: vi.fn(),
      }),
    );

    expect(result).toBe(
      "REDIRECT:/reports/r-1?error=missing_user_id&message=User+ID+is+required.",
    );
  });

  it("redirects with error=invalid_input when an issue has no error code", async () => {
    const result = await outcome(
      runner.runAdminAction({
        formData: form({ returnTo: "/users/u-1" }),
        fallbackPath: "/users",
        fields: z.object({ userId: z.string() }),
        failure: "sessions_revoke_failed",
        run: vi.fn(),
      }),
    );

    expect(result).toBe("REDIRECT:/users/u-1?error=invalid_input");
  });

  it("reads each field's first text value and skips files", async () => {
    signedIn();
    const formData = form({ returnTo: "/users/u-1" });
    formData.append("userId", "u-1");
    formData.append("userId", "u-2");
    formData.set("reason", new File(["x"], "reason.txt"));
    const run = vi.fn(async () => ({ query: { mutation: "sessions_revoked" } }));

    await outcome(
      runner.runAdminAction({
        formData,
        fallbackPath: "/users",
        fields: z.object({
          userId: runner.requiredText("missing_user_id"),
          reason: runner.optionalText,
        }),
        failure: "sessions_revoke_failed",
        run,
      }),
    );

    expect(run).toHaveBeenCalledWith(
      { userId: "u-1", reason: undefined },
      { accessToken: "token" },
    );
  });
});
