import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const redirect = vi.fn((href: string) => {
  throw new Error(`REDIRECT:${href}`);
});
const cookies = vi.fn();

const requireAdminActionSession = vi.fn();
const getStoredAdminSession = vi.fn();
const clearAdminSession = vi.fn();
const logoutAdmin = vi.fn();
const updateReviewStatus = vi.fn();
const requeueJourneyReview = vi.fn();

vi.mock("next/navigation", () => ({
  redirect,
}));

vi.mock("next/headers", () => ({
  cookies,
}));

vi.mock("@/lib/admin/session", () => ({
  clearAdminSession,
  requireAdminActionSession,
  getStoredAdminSession,
}));

vi.mock("@/lib/api/client", () => ({
  BackendApiError: class BackendApiError extends Error {
    statusCode: number;
    errorCode?: string;

    constructor(message: string, statusCode: number, errorCode?: string) {
      super(message);
      this.statusCode = statusCode;
      this.errorCode = errorCode;
    }
  },
  isBackendApiError: (error: unknown) =>
    typeof error === "object" &&
    error !== null &&
    typeof (error as { statusCode?: unknown }).statusCode === "number" &&
    typeof (error as { message?: unknown }).message === "string",
}));

vi.mock("@/lib/api/auth", () => ({
  logoutAdmin,
}));

vi.mock("@/lib/api/journeys", () => ({
  requeueJourneyReview,
  updateReviewStatus,
}));

async function loadActionsModule() {
  return import("@/app/_workspace/actions");
}

afterEach(() => {
  vi.clearAllMocks();
  vi.resetModules();
});

describe("updatePublishedJourneyReviewAction", () => {
  it("redirects to the success banner query after a successful review update", async () => {
    cookies.mockResolvedValue(new Map());
    requireAdminActionSession.mockResolvedValue({
      accessToken: "admin-access-token",
    });
    updateReviewStatus.mockResolvedValue({
      publicId: "public-123",
      review: {
        status: "APPROVED",
      },
    });

    const { updatePublishedJourneyReviewAction } = await loadActionsModule();
    const formData = new FormData();
    formData.set("returnTo", "/reviews/public-123");
    formData.set("targetPublicId", "public-123");
    formData.set("reviewStatus", "APPROVED");

    await expect(updatePublishedJourneyReviewAction(formData)).rejects.toThrow(
      "REDIRECT:/reviews/public-123?targetPublicId=public-123&mutation=review_updated&reviewStatus=APPROVED",
    );
    expect(updateReviewStatus).toHaveBeenCalledWith({
      accessToken: "admin-access-token",
      publicId: "public-123",
      status: "APPROVED",
    });
    expect(clearAdminSession).not.toHaveBeenCalled();
    expect(redirect).toHaveBeenCalledTimes(1);
  });
});
