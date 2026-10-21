import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/api/client", async () => {
  const fixtures = await import("@/scripts/__fixtures__/admin-journeys");
  return {
    BackendApiError: fixtures.TestBackendApiError,
    isBackendApiError: fixtures.isTestBackendApiError,
  };
});

const listAdminReports = vi.fn();

vi.mock("@/lib/api/reports", () => ({
  listAdminReports,
  getAdminReport: vi.fn(),
  getAdminReportStats: vi.fn(),
}));

afterEach(() => {
  vi.clearAllMocks();
  vi.resetModules();
});

describe("loadReportHistory", () => {
  it("filters by target with a default limit of 5", async () => {
    listAdminReports.mockResolvedValue({
      reports: [{ _id: "r1" }],
      total: 7,
      page: 1,
      pages: 2,
      limit: 5,
      hasMore: true,
    });
    const { loadReportHistory } = await import("@/lib/admin/reports");

    const history = await loadReportHistory({
      accessToken: "t",
      targetType: "PUBLISHED_JOURNEY",
      targetId: "public-1",
    });

    expect(listAdminReports).toHaveBeenCalledWith({
      accessToken: "t",
      query: { page: 1, limit: 5, targetType: "PUBLISHED_JOURNEY", targetId: "public-1" },
    });
    expect(history).toEqual({ items: [{ _id: "r1" }], total: 7 });
  });

  it("filters by reporter", async () => {
    listAdminReports.mockResolvedValue({
      reports: [],
      total: 0,
      page: 1,
      pages: 1,
      limit: 3,
      hasMore: false,
    });
    const { loadReportHistory } = await import("@/lib/admin/reports");

    await loadReportHistory({ accessToken: "t", reporterId: "user-9", limit: 3 });

    expect(listAdminReports).toHaveBeenCalledWith({
      accessToken: "t",
      query: { page: 1, limit: 3, reporterId: "user-9" },
    });
  });
});

describe("loadReportHistoryOrNull", () => {
  it("returns null when the reports endpoint fails", async () => {
    const { TestBackendApiError } = await import("@/scripts/__fixtures__/admin-journeys");
    listAdminReports.mockRejectedValue(new TestBackendApiError("boom", 500));
    const { loadReportHistoryOrNull } = await import("@/lib/admin/reports");

    await expect(
      loadReportHistoryOrNull({ accessToken: "t", targetType: "USER", targetId: "u1" }),
    ).resolves.toBeNull();
  });

  it("still propagates an expired session", async () => {
    const { TestBackendApiError } = await import("@/scripts/__fixtures__/admin-journeys");
    listAdminReports.mockRejectedValue(new TestBackendApiError("expired", 401));
    const { loadReportHistoryOrNull } = await import("@/lib/admin/reports");

    await expect(
      loadReportHistoryOrNull({ accessToken: "t", targetType: "USER", targetId: "u1" }),
    ).rejects.toMatchObject({ statusCode: 401 });
  });
});
