import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createAdminJourneyItem,
  createAdminJourneysPage,
  isTestBackendApiError,
  TestBackendApiError,
} from "@/scripts/__fixtures__/admin-journeys";

vi.mock("server-only", () => ({}));

const listPublishedJourneys = vi.fn();
const getPublishedJourneyDetail = vi.fn();

vi.mock("@/lib/api/client", () => ({
  BackendApiError: TestBackendApiError,
  isBackendApiError: isTestBackendApiError,
}));
vi.mock("@/lib/api/journeys", () => ({ listPublishedJourneys, getPublishedJourneyDetail }));

const counts = {
  pendingReviews: 4,
  translationPending: 1,
  translationEnqueueFailed: 0,
  openReports: 2,
  pendingReports: 1,
  reviewedReports: 1,
  asOf: "2026-10-21T12:00:00.000Z",
};

async function loadModule() {
  return import("@/lib/admin/review-queue");
}

afterEach(() => {
  vi.clearAllMocks();
  vi.resetModules();
});

describe("review queue tabs", () => {
  it("queue context needs an explicit valid status", async () => {
    const { parseReviewQueueContext } = await loadModule();

    // A detail link from outside the queue (e.g. report detail) has no status,
    // so a decision there must not auto-advance.
    expect(parseReviewQueueContext(null)).toBeNull();
    expect(parseReviewQueueContext("")).toBeNull();
    expect(parseReviewQueueContext("garbage")).toBeNull();
    expect(parseReviewQueueContext("pending")).toBe("pending");
    expect(parseReviewQueueContext("all")).toBe("all");
  });

  it("maps every tab to its API filter", async () => {
    const { REVIEW_QUEUE_TABS, reviewQueueTabFilter } = await loadModule();
    const expected = {
      pending: { reviewStatus: "PENDING" },
      translation: { localizationPending: true },
      approved: { reviewStatus: "APPROVED" },
      rejected: { reviewStatus: "REJECTED" },
      all: {},
    };

    expect(REVIEW_QUEUE_TABS).toEqual(["pending", "translation", "approved", "rejected", "all"]);
    for (const tab of REVIEW_QUEUE_TABS) {
      expect(reviewQueueTabFilter(tab)).toEqual(expected[tab]);
    }
  });

  it("parseReviewQueueTab defaults to pending", async () => {
    const { parseReviewQueueTab } = await loadModule();

    expect(parseReviewQueueTab(null)).toBe("pending");
    expect(parseReviewQueueTab("garbage")).toBe("pending");
    expect(parseReviewQueueTab("all")).toBe("all");
    expect(parseReviewQueueTab("translation")).toBe("translation");
  });

  it("parseReviewQueuePage clamps", async () => {
    const { parseReviewQueuePage } = await loadModule();

    expect(parseReviewQueuePage(null)).toBe(1);
    expect(parseReviewQueuePage("0")).toBe(1);
    expect(parseReviewQueuePage("-3")).toBe(1);
    expect(parseReviewQueuePage("2.5")).toBe(1);
    expect(parseReviewQueuePage("abc")).toBe(1);
    expect(parseReviewQueuePage("999999")).toBe(100000);
    expect(parseReviewQueuePage("7")).toBe(7);
  });
});

describe("loadReviewQueue", () => {
  it("loadReviewQueue uses API totals and counts", async () => {
    listPublishedJourneys.mockImplementation(
      async (input: { limit: number; reviewStatus?: string }) => {
        if (input.limit === 20) {
          return createAdminJourneysPage({
            journeys: [
              createAdminJourneyItem({
                publicId: "approved-1",
                metadata: { journeyTitle: "Legacy title" },
                review: { status: "APPROVED", approved: true },
              }),
            ],
            total: 21,
            page: 2,
            pages: 2,
            limit: 20,
          });
        }
        if (input.reviewStatus === "REJECTED") return createAdminJourneysPage({ total: 3 });
        if (input.reviewStatus === undefined) return createAdminJourneysPage({ total: 28 });
        throw new Error(`unexpected call ${JSON.stringify(input)}`);
      },
    );
    const { loadReviewQueue } = await loadModule();

    const result = await loadReviewQueue({
      accessToken: "t",
      tab: "approved",
      page: 2,
      counts,
    });

    expect(listPublishedJourneys).toHaveBeenCalledWith({
      accessToken: "t",
      page: 2,
      limit: 20,
      reviewStatus: "APPROVED",
    });
    expect(listPublishedJourneys).toHaveBeenCalledWith({
      accessToken: "t",
      page: 1,
      limit: 1,
      reviewStatus: "REJECTED",
    });
    expect(listPublishedJourneys).toHaveBeenCalledWith({ accessToken: "t", page: 1, limit: 1 });
    expect(listPublishedJourneys).toHaveBeenCalledTimes(3);
    expect(result).toMatchObject({
      tab: "approved",
      total: 21,
      page: 2,
      pages: 2,
      tabTotals: { pending: 4, translation: 1, approved: 21, rejected: 3, all: 28 },
    });
    expect(result.items).toHaveLength(1);
    expect(result.items[0]).toMatchObject({ publicId: "approved-1", title: "Legacy title" });
  });

  it("accepts the in-flight counts promise", async () => {
    listPublishedJourneys.mockImplementation(async (input: { limit: number }) =>
      input.limit === 20
        ? createAdminJourneysPage({ journeys: [], total: 4, limit: 20 })
        : createAdminJourneysPage({ total: 7 }),
    );
    const { loadReviewQueue } = await loadModule();

    const result = await loadReviewQueue({
      accessToken: "t",
      tab: "pending",
      page: 1,
      counts: Promise.resolve(counts),
    });

    expect(result.tabTotals).toEqual({ pending: 4, translation: 1, approved: 7, rejected: 7, all: 7 });
    expect(listPublishedJourneys).toHaveBeenCalledTimes(4);
  });

  it("an author filter applies to the rows and to every tab total", async () => {
    listPublishedJourneys.mockImplementation(
      async (input: { limit: number; reviewStatus?: string; localizationPending?: boolean }) => {
        if (input.limit === 20) {
          return createAdminJourneysPage({
            journeys: [createAdminJourneyItem({ reviewRequestedAt: null })],
            total: 2,
            limit: 20,
          });
        }
        if (input.reviewStatus === "PENDING") return createAdminJourneysPage({ total: 1 });
        if (input.localizationPending) return createAdminJourneysPage({ total: 0 });
        if (input.reviewStatus === "APPROVED") return createAdminJourneysPage({ total: 1 });
        if (input.reviewStatus === "REJECTED") return createAdminJourneysPage({ total: 0 });
        throw new Error(`unexpected call ${JSON.stringify(input)}`);
      },
    );
    const { loadReviewQueue } = await loadModule();

    const result = await loadReviewQueue({
      accessToken: "t",
      tab: "all",
      page: 1,
      counts,
      userId: "u-1",
    });

    expect(listPublishedJourneys).toHaveBeenCalledWith({
      accessToken: "t",
      page: 1,
      limit: 20,
      userId: "u-1",
    });
    expect(listPublishedJourneys).toHaveBeenCalledWith({
      accessToken: "t",
      page: 1,
      limit: 1,
      reviewStatus: "PENDING",
      userId: "u-1",
    });
    expect(listPublishedJourneys).toHaveBeenCalledTimes(5);
    // The global attention counts do not describe one author's journeys.
    expect(result.tabTotals).toEqual({ pending: 1, translation: 0, approved: 1, rejected: 0, all: 2 });
    expect(result.userId).toBe("u-1");
  });

  it("Submitted is the review request time, else the first publish", async () => {
    listPublishedJourneys.mockImplementation(async (input: { limit: number }) =>
      input.limit === 20
        ? createAdminJourneysPage({
            journeys: [
              createAdminJourneyItem({
                publicId: "republished",
                reviewRequestedAt: "2026-04-05T00:00:00.000Z",
              }),
              createAdminJourneyItem({ publicId: "legacy", reviewRequestedAt: null }),
            ],
            limit: 20,
          })
        : createAdminJourneysPage({ total: 0 }),
    );
    const { loadReviewQueue } = await loadModule();

    const result = await loadReviewQueue({ accessToken: "t", tab: "pending", page: 1, counts });

    expect(result.userId).toBeNull();
    expect(result.items.map((item) => [item.publicId, item.submittedAt])).toEqual([
      ["republished", "2026-04-05T00:00:00.000Z"],
      ["legacy", "2026-04-02T00:00:00.000Z"],
    ]);
  });
});

describe("findNextPendingPublicId", () => {
  it("findNextPendingPublicId skips the excluded id", async () => {
    const { findNextPendingPublicId } = await loadModule();

    listPublishedJourneys.mockResolvedValueOnce(
      createAdminJourneysPage({
        journeys: [
          createAdminJourneyItem({ publicId: "current" }),
          createAdminJourneyItem({ publicId: "other" }),
        ],
      }),
    );
    await expect(
      findNextPendingPublicId({ accessToken: "t", excludePublicId: "current" }),
    ).resolves.toBe("other");
    expect(listPublishedJourneys).toHaveBeenCalledWith({
      accessToken: "t",
      page: 1,
      limit: 2,
      reviewStatus: "PENDING",
    });

    listPublishedJourneys.mockResolvedValueOnce(
      createAdminJourneysPage({ journeys: [createAdminJourneyItem({ publicId: "current" })] }),
    );
    await expect(
      findNextPendingPublicId({ accessToken: "t", excludePublicId: "current" }),
    ).resolves.toBeNull();

    listPublishedJourneys.mockResolvedValueOnce(createAdminJourneysPage({ journeys: [] }));
    await expect(
      findNextPendingPublicId({ accessToken: "t", excludePublicId: "current" }),
    ).resolves.toBeNull();
  });
});
