import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const redirect = vi.fn((href: string) => {
  throw new Error(`REDIRECT:${href}`);
});
const cookies = vi.fn();

const requireAdminActionSession = vi.fn();
const getStoredAdminSession = vi.fn();
const clearAdminSession = vi.fn();
const logoutAdminFromBackend = vi.fn();
const updatePublishedJourneyReviewStatus = vi.fn();
const getAdminPublishedJourneyDetail = vi.fn();
const fetchPublishedJourneySitemapChunks = vi.fn();
const requestWebRevalidation = vi.fn();

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

vi.mock("@/lib/admin/revalidation", () => ({
  requestWebRevalidation,
  WEB_REVALIDATION_FAILED_QUERY_VALUE: "failed",
}));

vi.mock("@/lib/admin/api", () => ({
  AdminAccessDeniedError: class AdminAccessDeniedError extends Error {},
  AdminSessionExpiredError: class AdminSessionExpiredError extends Error {},
  BackendApiError: class BackendApiError extends Error {
    statusCode: number;

    constructor(message: string, statusCode: number) {
      super(message);
      this.statusCode = statusCode;
    }
  },
  getAdminPublishedJourneyDetail,
  logoutAdminFromBackend,
  updatePublishedJourneyReviewStatus,
}));

vi.mock("@/lib/sitemap/public-content", () => ({
  PUBLISHED_JOURNEYS_SITEMAP_TAG: "published-journeys-sitemap",
  fetchPublishedJourneySitemapChunks,
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
    fetchPublishedJourneySitemapChunks
      .mockResolvedValueOnce([{ index: 1, items: [] }])
      .mockResolvedValueOnce([{ index: 2, items: [] }]);
    getAdminPublishedJourneyDetail
      .mockResolvedValueOnce({
        images: [{ photoId: "photo-before" }],
        timeline: [],
        recapDraft: { timeline: [] },
      })
      .mockResolvedValueOnce({
        images: [{ photoId: "photo-after" }],
        timeline: [],
        recapDraft: { timeline: [] },
      });
    updatePublishedJourneyReviewStatus.mockResolvedValue({
      publicId: "public-123",
      review: {
        status: "APPROVED",
      },
    });
    requestWebRevalidation.mockResolvedValue(true);

    const { updatePublishedJourneyReviewAction } = await loadActionsModule();
    const formData = new FormData();
    formData.set("returnTo", "/reviews/public-123");
    formData.set("targetPublicId", "public-123");
    formData.set("reviewStatus", "APPROVED");

    await expect(updatePublishedJourneyReviewAction(formData)).rejects.toThrow(
      "REDIRECT:/reviews/public-123?targetPublicId=public-123&mutation=review_updated&reviewStatus=APPROVED",
    );
    expect(updatePublishedJourneyReviewStatus).toHaveBeenCalledWith({
      accessToken: "admin-access-token",
      publicId: "public-123",
      status: "APPROVED",
    });
    expect(requestWebRevalidation).toHaveBeenCalledWith({
      paths: expect.arrayContaining([
        "/en",
        "/en/journeys",
        "/en/journeys/public-123",
        "/en/photos/photo-before",
        "/en/photos/photo-after",
        "/ko",
        "/ko/journeys",
        "/ko/journeys/public-123",
        "/ko/photos/photo-before",
        "/ko/photos/photo-after",
        "/sitemap.xml",
        "/sitemaps/journeys/1.xml",
        "/sitemaps/journeys/2.xml",
      ]),
      tags: ["published-journeys-sitemap"],
    });
    expect(clearAdminSession).not.toHaveBeenCalled();
    expect(redirect).toHaveBeenCalledTimes(1);
  });

  it("redirects with a revalidation warning when the web webhook fails", async () => {
    cookies.mockResolvedValue(new Map());
    requireAdminActionSession.mockResolvedValue({
      accessToken: "admin-access-token",
    });
    fetchPublishedJourneySitemapChunks
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([]);
    getAdminPublishedJourneyDetail.mockResolvedValue({
      images: [],
      timeline: [],
      recapDraft: { timeline: [] },
    });
    updatePublishedJourneyReviewStatus.mockResolvedValue({
      publicId: "public-123",
      review: {
        status: "APPROVED",
      },
    });
    requestWebRevalidation.mockResolvedValue(false);

    const { updatePublishedJourneyReviewAction } = await loadActionsModule();
    const formData = new FormData();
    formData.set("returnTo", "/reviews/public-123");
    formData.set("targetPublicId", "public-123");
    formData.set("reviewStatus", "APPROVED");

    await expect(updatePublishedJourneyReviewAction(formData)).rejects.toThrow(
      "REDIRECT:/reviews/public-123?targetPublicId=public-123&mutation=review_updated&reviewStatus=APPROVED&revalidation=failed",
    );
  });
});
