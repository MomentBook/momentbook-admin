import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

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
