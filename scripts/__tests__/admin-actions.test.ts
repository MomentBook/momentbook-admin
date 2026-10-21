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
const findNextPendingPublicId = vi.fn();

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

vi.mock("@/lib/admin/review-queue", () => ({
  findNextPendingPublicId,
}));

async function loadActionsModule() {
  return import("@/app/reviews/actions");
}

class ApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly errorCode?: string,
  ) {
    super(message);
  }
}

function decisionForm(fields: Record<string, string>) {
  const formData = new FormData();
  formData.set("returnTo", "/reviews/public-123");
  formData.set("targetPublicId", "public-123");
  for (const [key, value] of Object.entries(fields)) {
    formData.set(key, value);
  }
  return formData;
}

function mockDecision(status: "APPROVED" | "REJECTED" | "PENDING") {
  cookies.mockResolvedValue(new Map());
  requireAdminActionSession.mockResolvedValue({ accessToken: "admin-access-token" });
  updateReviewStatus.mockResolvedValue({ publicId: "public-123", review: { status } });
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

describe("updatePublishedJourneyReviewAction queue flow", () => {
  it("advances to the next pending journey", async () => {
    mockDecision("APPROVED");
    findNextPendingPublicId.mockResolvedValue("public-456");
    const { updatePublishedJourneyReviewAction } = await loadActionsModule();

    await expect(
      updatePublishedJourneyReviewAction(
        decisionForm({ reviewStatus: "APPROVED", queueStatus: "pending", publishOperationId: "op-1" }),
      ),
    ).rejects.toThrow(
      "REDIRECT:/reviews/public-456?targetPublicId=public-123&mutation=review_updated&reviewStatus=APPROVED",
    );
    expect(updateReviewStatus).toHaveBeenCalledWith({
      accessToken: "admin-access-token",
      publicId: "public-123",
      status: "APPROVED",
      publishOperationId: "op-1",
    });
    expect(findNextPendingPublicId).toHaveBeenCalledWith({
      accessToken: "admin-access-token",
      excludePublicId: "public-123",
    });
  });

  it("advances to the queue when nothing else is pending", async () => {
    mockDecision("REJECTED");
    findNextPendingPublicId.mockResolvedValue(null);
    const { updatePublishedJourneyReviewAction } = await loadActionsModule();

    await expect(
      updatePublishedJourneyReviewAction(
        decisionForm({ reviewStatus: "REJECTED", queueStatus: "pending" }),
      ),
    ).rejects.toThrow(
      "REDIRECT:/reviews?targetPublicId=public-123&mutation=review_updated&reviewStatus=REJECTED",
    );
  });

  it("stay checkbox keeps the journey", async () => {
    mockDecision("APPROVED");
    const { updatePublishedJourneyReviewAction } = await loadActionsModule();

    await expect(
      updatePublishedJourneyReviewAction(
        decisionForm({ reviewStatus: "APPROVED", queueStatus: "pending", stay: "1" }),
      ),
    ).rejects.toThrow(
      "REDIRECT:/reviews/public-123?targetPublicId=public-123&mutation=review_updated&reviewStatus=APPROVED",
    );
    expect(findNextPendingPublicId).not.toHaveBeenCalled();
  });

  it("decisions from another tab stay on the journey", async () => {
    mockDecision("APPROVED");
    const { updatePublishedJourneyReviewAction } = await loadActionsModule();

    await expect(
      updatePublishedJourneyReviewAction(
        decisionForm({
          returnTo: "/reviews/public-123?status=translation",
          reviewStatus: "APPROVED",
          queueStatus: "translation",
        }),
      ),
    ).rejects.toThrow(
      "REDIRECT:/reviews/public-123?status=translation&targetPublicId=public-123&mutation=review_updated&reviewStatus=APPROVED",
    );
    expect(findNextPendingPublicId).not.toHaveBeenCalled();
  });

  it("move to pending and approve-without-translation never advance", async () => {
    mockDecision("PENDING");
    const { updatePublishedJourneyReviewAction } = await loadActionsModule();

    await expect(
      updatePublishedJourneyReviewAction(
        decisionForm({ reviewStatus: "PENDING", queueStatus: "pending" }),
      ),
    ).rejects.toThrow(
      "REDIRECT:/reviews/public-123?targetPublicId=public-123&mutation=review_updated&reviewStatus=PENDING",
    );

    mockDecision("APPROVED");
    await expect(
      updatePublishedJourneyReviewAction(
        decisionForm({
          reviewStatus: "APPROVED",
          queueStatus: "pending",
          acceptUntranslated: "true",
          publishOperationId: "op-1",
        }),
      ),
    ).rejects.toThrow(
      "REDIRECT:/reviews/public-123?targetPublicId=public-123&mutation=review_updated&reviewStatus=APPROVED",
    );
    expect(updateReviewStatus).toHaveBeenLastCalledWith({
      accessToken: "admin-access-token",
      publicId: "public-123",
      status: "APPROVED",
      publishOperationId: "op-1",
      acceptUntranslated: true,
    });
    expect(findNextPendingPublicId).not.toHaveBeenCalled();
  });

  it("next lookup failure still reports the committed decision", async () => {
    mockDecision("APPROVED");
    findNextPendingPublicId.mockRejectedValue(new ApiError("boom", 500));
    const { updatePublishedJourneyReviewAction } = await loadActionsModule();

    await expect(
      updatePublishedJourneyReviewAction(
        decisionForm({ reviewStatus: "APPROVED", queueStatus: "pending" }),
      ),
    ).rejects.toThrow(
      "REDIRECT:/reviews?targetPublicId=public-123&mutation=review_updated&reviewStatus=APPROVED",
    );
  });

  it("conflict stays on the journey", async () => {
    cookies.mockResolvedValue(new Map());
    requireAdminActionSession.mockResolvedValue({ accessToken: "admin-access-token" });
    updateReviewStatus.mockRejectedValue(
      new ApiError("Republished", 400, "REVIEW_STATE_CONFLICT"),
    );
    const { updatePublishedJourneyReviewAction } = await loadActionsModule();

    await expect(
      updatePublishedJourneyReviewAction(
        decisionForm({ reviewStatus: "APPROVED", queueStatus: "pending", publishOperationId: "op-1" }),
      ),
    ).rejects.toThrow(
      "REDIRECT:/reviews/public-123?targetPublicId=public-123&error=review_state_conflict",
    );
    expect(findNextPendingPublicId).not.toHaveBeenCalled();
    expect(updateReviewStatus).toHaveBeenCalledTimes(1);
  });

  it("session expiry during decision goes to login", async () => {
    cookies.mockResolvedValue(new Map());
    requireAdminActionSession.mockResolvedValue({ accessToken: "admin-access-token" });
    updateReviewStatus.mockRejectedValue(new ApiError("Expired", 401));
    const { updatePublishedJourneyReviewAction } = await loadActionsModule();

    await expect(
      updatePublishedJourneyReviewAction(
        decisionForm({ reviewStatus: "APPROVED", queueStatus: "pending" }),
      ),
    ).rejects.toThrow("REDIRECT:/login?next=%2Freviews%2Fpublic-123&error=session_expired");
    expect(clearAdminSession).toHaveBeenCalledTimes(1);
  });
});

describe("requeueJourneyReviewAction", () => {
  it("requeue 502 maps to review_requeue_unavailable", async () => {
    cookies.mockResolvedValue(new Map());
    requireAdminActionSession.mockResolvedValue({ accessToken: "admin-access-token" });
    requeueJourneyReview.mockRejectedValue(new ApiError("Bad gateway", 502));
    const { requeueJourneyReviewAction } = await loadActionsModule();

    await expect(requeueJourneyReviewAction(decisionForm({}))).rejects.toThrow(
      "REDIRECT:/reviews/public-123?targetPublicId=public-123&error=review_requeue_unavailable",
    );
  });
});
