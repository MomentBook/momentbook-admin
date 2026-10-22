import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const redirect = vi.fn((href: string) => {
  throw new Error(`REDIRECT:${href}`);
});
const cookies = vi.fn();
const requireAdminActionSession = vi.fn();
const clearAdminSession = vi.fn();
const updateAdminCommentStatus = vi.fn();
const listAdminComments = vi.fn();

vi.mock("next/navigation", () => ({ redirect }));
vi.mock("next/headers", () => ({ cookies }));
vi.mock("@/lib/admin/session", () => ({ clearAdminSession, requireAdminActionSession }));
vi.mock("@/lib/api/client", () => ({
  isBackendApiError: (error: unknown) =>
    typeof error === "object" &&
    error !== null &&
    typeof (error as { statusCode?: unknown }).statusCode === "number" &&
    typeof (error as { message?: unknown }).message === "string",
}));
vi.mock("@/lib/api/comments", () => ({ updateAdminCommentStatus, listAdminComments }));

class ApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
  ) {
    super(message);
  }
}

const UUID = "123e4567-e89b-42d3-a456-426614174000";

afterEach(() => {
  vi.clearAllMocks();
});

describe("comment filters", () => {
  it("parseCommentStatusTab defaults to active and maps to the API status", async () => {
    const { parseCommentStatusTab, commentTabToApiStatus } = await import(
      "@/lib/admin/comments-shared"
    );

    expect(parseCommentStatusTab(undefined)).toBe("active");
    expect(parseCommentStatusTab("bogus")).toBe("active");
    expect(parseCommentStatusTab("deleted")).toBe("deleted");
    expect(parseCommentStatusTab("all")).toBe("all");
    expect(commentTabToApiStatus("active")).toBe("ACTIVE");
    expect(commentTabToApiStatus("deleted")).toBe("DELETED");
    expect(commentTabToApiStatus("all")).toBeUndefined();
  });

  it("parseUuidFilter (shared with reports) keeps only a UUID", async () => {
    const { parseUuidFilter } = await import("@/lib/admin/reports-shared");

    expect(parseUuidFilter(` ${UUID} `)).toBe(UUID);
    expect(parseUuidFilter("nope")).toBeUndefined();
    expect(parseUuidFilter(undefined)).toBeUndefined();
  });

  it("parsePublicId trims and drops empty or over-long values", async () => {
    const { parsePublicIdFilter } = await import("@/lib/admin/comments-shared");

    expect(parsePublicIdFilter(" abc ")).toBe("abc");
    expect(parsePublicIdFilter("  ")).toBeUndefined();
    expect(parsePublicIdFilter("x".repeat(65))).toBeUndefined();
  });
});

describe("loadAdminCommentsWorkspaceData", () => {
  it("passes the tab status and filters through", async () => {
    listAdminComments.mockResolvedValue({
      comments: [],
      total: 0,
      page: 2,
      pages: 0,
      limit: 20,
      hasMore: false,
    });
    const { loadAdminCommentsWorkspaceData } = await import("@/lib/admin/comments");

    const data = await loadAdminCommentsWorkspaceData("token", {
      tab: "deleted",
      userId: UUID,
      publicId: "j1",
      page: 2,
    });

    expect(listAdminComments).toHaveBeenCalledWith({
      accessToken: "token",
      status: "DELETED",
      userId: UUID,
      publicId: "j1",
      page: 2,
      limit: 20,
    });
    expect(data.pages).toBe(1);
  });
});

function deleteForm(fields: Record<string, string> = {}) {
  const formData = new FormData();
  formData.set("returnTo", "/comments?userId=" + UUID);
  formData.set("commentId", "c-1");
  for (const [key, value] of Object.entries(fields)) formData.set(key, value);
  return formData;
}

async function runDelete(formData: FormData): Promise<string> {
  const { deleteAdminCommentAction } = await import("@/app/comments/actions");

  try {
    await deleteAdminCommentAction(formData);
  } catch (error) {
    return (error as Error).message;
  }

  throw new Error("expected a redirect");
}

describe("deleteAdminCommentAction", () => {
  function signedIn() {
    cookies.mockResolvedValue({});
    requireAdminActionSession.mockResolvedValue({ accessToken: "token" });
  }

  it("success deletes with the trimmed reason and reports comment_deleted", async () => {
    signedIn();
    updateAdminCommentStatus.mockResolvedValue({
      commentId: "c-1",
      status: "deleted",
      deletedByRole: "ADMIN",
    });

    const result = await runDelete(deleteForm({ reason: " spam " }));

    expect(updateAdminCommentStatus).toHaveBeenCalledWith({
      accessToken: "token",
      commentId: "c-1",
      data: { status: "deleted", reason: "spam" },
    });
    expect(result).toBe(`REDIRECT:/comments?userId=${UUID}&mutation=comment_deleted`);
  });

  it("omits an empty reason", async () => {
    signedIn();
    updateAdminCommentStatus.mockResolvedValue({});

    await runDelete(deleteForm());

    expect(updateAdminCommentStatus).toHaveBeenCalledWith({
      accessToken: "token",
      commentId: "c-1",
      data: { status: "deleted", reason: undefined },
    });
  });

  it("404 returns to the list with comment_not_found", async () => {
    signedIn();
    updateAdminCommentStatus.mockRejectedValue(new ApiError("Not found", 404));

    expect(await runDelete(deleteForm({ returnTo: "/comments" }))).toBe(
      "REDIRECT:/comments?error=comment_not_found",
    );
  });

  it("401 clears the session and goes to login", async () => {
    signedIn();
    updateAdminCommentStatus.mockRejectedValue(new ApiError("Unauthorized", 401));

    const result = await runDelete(deleteForm({ returnTo: "/comments" }));

    expect(clearAdminSession).toHaveBeenCalled();
    expect(result).toBe("REDIRECT:/login?next=%2Fcomments&error=session_expired");
  });

  it("another API error is a banner with its message", async () => {
    signedIn();
    updateAdminCommentStatus.mockRejectedValue(new ApiError("Boom", 500));

    expect(await runDelete(deleteForm({ returnTo: "/comments" }))).toBe(
      "REDIRECT:/comments?error=comment_update_failed&message=Boom",
    );
    expect(clearAdminSession).not.toHaveBeenCalled();
  });

  it("an unknown error is a banner without a message", async () => {
    signedIn();
    updateAdminCommentStatus.mockRejectedValue(new Error("network"));

    expect(await runDelete(deleteForm({ returnTo: "/comments" }))).toBe(
      "REDIRECT:/comments?error=comment_update_failed",
    );
  });

  it("falls back to /comments for an unsafe returnTo", async () => {
    signedIn();
    updateAdminCommentStatus.mockResolvedValue({});

    expect(await runDelete(deleteForm({ returnTo: "https://evil.example" }))).toBe(
      "REDIRECT:/comments?mutation=comment_deleted",
    );
  });

  it("a missing commentId never reaches the API", async () => {
    signedIn();

    const result = await runDelete(deleteForm({ commentId: " " }));

    expect(updateAdminCommentStatus).not.toHaveBeenCalled();
    expect(result).toContain("error=comment_update_failed");
  });
});

describe("resolveCommentBanner", () => {
  it("covers each code", async () => {
    const { resolveCommentBanner } = await import("@/app/comments/comment-banner");
    const base = { mutation: null, error: null, message: null };

    expect(resolveCommentBanner(base)).toBeNull();
    expect(resolveCommentBanner({ ...base, mutation: "comment_deleted" })).toEqual({
      tone: "success",
      message: "Comment hidden from the journey.",
    });
    expect(resolveCommentBanner({ ...base, error: "comment_not_found" })).toEqual({
      tone: "error",
      message: "That comment no longer exists.",
    });
    expect(resolveCommentBanner({ ...base, error: "comment_update_failed", message: "Boom" })).toEqual({
      tone: "error",
      message: "Boom",
    });
    expect(resolveCommentBanner({ ...base, error: "comment_update_failed" })).toEqual({
      tone: "error",
      message: "Could not delete the comment. Try again.",
    });
  });
});
