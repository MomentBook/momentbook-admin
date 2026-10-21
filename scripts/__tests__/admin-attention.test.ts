import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createAdminJourneysPage,
  isTestBackendApiError,
  TestBackendApiError,
} from "@/scripts/__fixtures__/admin-journeys";

vi.mock("server-only", () => ({}));

const listPublishedJourneys = vi.fn();
const getAdminReportStats = vi.fn();

vi.mock("@/lib/api/client", () => ({
  BackendApiError: TestBackendApiError,
  isBackendApiError: isTestBackendApiError,
}));
vi.mock("@/lib/api/journeys", () => ({ listPublishedJourneys }));
vi.mock("@/lib/api/reports", () => ({ getAdminReportStats }));

function mockJourneyTotals() {
  listPublishedJourneys.mockImplementation(
    async (input: { reviewStatus?: string; localizationPending?: boolean; enqueueFailed?: boolean }) => {
      if (input.reviewStatus === "PENDING") return createAdminJourneysPage({ total: 4 });
      if (input.localizationPending) return createAdminJourneysPage({ total: 1 });
      if (input.enqueueFailed) return createAdminJourneysPage({ total: 2 });
      throw new Error(`unexpected call ${JSON.stringify(input)}`);
    },
  );
}

const reportStats = {
  totalReports: 9,
  openReports: 3,
  pendingReports: 2,
  reviewedReports: 1,
  resolvedReports: 5,
  rejectedReports: 1,
  byTargetType: { userReports: 4, publishedJourneyReports: 5 },
};

async function loadModule() {
  return import("@/lib/admin/attention");
}

afterEach(() => {
  vi.clearAllMocks();
  vi.resetModules();
});

describe("loadAttentionCounts", () => {
  it("sends the three journey filters with limit 1", async () => {
    mockJourneyTotals();
    getAdminReportStats.mockResolvedValue(reportStats);
    const { loadAttentionCounts } = await loadModule();

    await loadAttentionCounts("t");

    expect(listPublishedJourneys).toHaveBeenCalledTimes(3);
    expect(listPublishedJourneys).toHaveBeenCalledWith({
      accessToken: "t",
      page: 1,
      limit: 1,
      reviewStatus: "PENDING",
    });
    expect(listPublishedJourneys).toHaveBeenCalledWith({
      accessToken: "t",
      page: 1,
      limit: 1,
      localizationPending: true,
    });
    expect(listPublishedJourneys).toHaveBeenCalledWith({
      accessToken: "t",
      page: 1,
      limit: 1,
      enqueueFailed: true,
    });
    expect(getAdminReportStats).toHaveBeenCalledWith({ accessToken: "t" });
  });

  it("maps totals and report stats", async () => {
    mockJourneyTotals();
    getAdminReportStats.mockResolvedValue(reportStats);
    const { loadAttentionCounts } = await loadModule();

    const counts = await loadAttentionCounts("t");

    expect(counts).toMatchObject({
      pendingReviews: 4,
      translationPending: 1,
      translationEnqueueFailed: 2,
      openReports: 3,
      pendingReports: 2,
      reviewedReports: 1,
    });
    expect(Number.isFinite(Date.parse(counts.asOf))).toBe(true);
  });

  it("report stats failure degrades to null", async () => {
    mockJourneyTotals();
    getAdminReportStats.mockRejectedValue(new TestBackendApiError("x", 500));
    const { loadAttentionCounts } = await loadModule();

    const counts = await loadAttentionCounts("t");

    expect(counts).toMatchObject({
      pendingReviews: 4,
      translationPending: 1,
      translationEnqueueFailed: 2,
      openReports: null,
      pendingReports: null,
      reviewedReports: null,
    });
  });

  it("report stats 401 propagates", async () => {
    mockJourneyTotals();
    getAdminReportStats.mockRejectedValue(new TestBackendApiError("expired", 401));
    const { loadAttentionCounts } = await loadModule();

    await expect(loadAttentionCounts("t")).rejects.toMatchObject({ statusCode: 401 });
  });

  it("journey count errors propagate", async () => {
    listPublishedJourneys.mockRejectedValue(new TestBackendApiError("boom", 500));
    getAdminReportStats.mockResolvedValue(reportStats);
    const { loadAttentionCounts } = await loadModule();

    await expect(loadAttentionCounts("t")).rejects.toMatchObject({ statusCode: 500 });
  });
});
