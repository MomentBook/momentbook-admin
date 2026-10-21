import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createAdminJourneyItem,
  createAdminJourneysPage,
  isTestBackendApiError,
  TestBackendApiError,
} from "@/scripts/__fixtures__/admin-journeys";

vi.mock("server-only", () => ({}));

const listPublishedJourneys = vi.fn();

vi.mock("@/lib/api/client", () => ({
  BackendApiError: TestBackendApiError,
  isBackendApiError: isTestBackendApiError,
}));
vi.mock("@/lib/api/journeys", () => ({ listPublishedJourneys }));

// Wednesday; the current UTC week starts Monday 2026-10-19, the six-week
// window starts Monday 2026-09-14.
const NOW = Date.parse("2026-10-21T12:00:00.000Z");

function mockOverview(options: {
  approved?: number;
  rejected?: number;
  intakePage: (page: number) => ReturnType<typeof createAdminJourneysPage>;
}) {
  listPublishedJourneys.mockImplementation(
    async (input: { page: number; limit: number; reviewStatus?: string }) => {
      if (input.limit === 1 && input.reviewStatus === "APPROVED") {
        return createAdminJourneysPage({ total: options.approved ?? 0 });
      }
      if (input.limit === 1 && input.reviewStatus === "REJECTED") {
        return createAdminJourneysPage({ total: options.rejected ?? 0 });
      }
      if (input.limit === 50 && input.reviewStatus === undefined) {
        return options.intakePage(input.page);
      }
      throw new Error(`unexpected call ${JSON.stringify(input)}`);
    },
  );
}

function intakeCalls() {
  return listPublishedJourneys.mock.calls.filter(([input]) => input.limit === 50);
}

async function loadModule() {
  return import("@/lib/admin/overview");
}

afterEach(() => {
  vi.clearAllMocks();
  vi.resetModules();
});

describe("loadAdminOverview", () => {
  it("stops at the first item older than the window", async () => {
    mockOverview({
      intakePage: (page) =>
        page === 1
          ? createAdminJourneysPage({
              journeys: [
                createAdminJourneyItem({ publicId: "a", publishedAt: "2026-10-20T08:00:00.000Z" }),
                createAdminJourneyItem({ publicId: "b", publishedAt: "2026-10-13T08:00:00.000Z" }),
              ],
              page: 1,
              pages: 3,
            })
          : createAdminJourneysPage({
              journeys: [
                // "b" shifted onto page 2 because a newer item arrived.
                createAdminJourneyItem({ publicId: "b", publishedAt: "2026-10-13T08:00:00.000Z" }),
                createAdminJourneyItem({ publicId: "c", publishedAt: null, createdAt: "2026-09-16T08:00:00.000Z" }),
                createAdminJourneyItem({ publicId: "d", publishedAt: "2026-09-10T08:00:00.000Z" }),
                createAdminJourneyItem({ publicId: "e", publishedAt: "2026-10-01T08:00:00.000Z" }),
              ],
              page: 2,
              pages: 3,
            }),
    });
    const { loadAdminOverview } = await loadModule();

    const overview = await loadAdminOverview({ accessToken: "t", now: NOW });

    expect(intakeCalls().map(([input]) => input.page)).toEqual([1, 2]);
    expect(overview.recentIntake.weeks.map((week) => week.count)).toEqual([1, 0, 0, 0, 1, 1]);
    expect(overview.recentIntake.weeks[0]?.label).toBe("Sep 14");
    expect(overview.recentIntake.weeks[5]?.label).toBe("Oct 19");
    expect(overview.recentIntake.totalCount).toBe(3);
    expect(overview.recentIntake.maxCount).toBe(1);
    expect(overview.recentIntake.truncated).toBe(false);
  });

  it("caps the scan at 4 pages and flags truncated", async () => {
    mockOverview({
      intakePage: (page) =>
        createAdminJourneysPage({
          journeys: Array.from({ length: 50 }, (_, index) =>
            createAdminJourneyItem({
              publicId: `p${page}-${index}`,
              publishedAt: "2026-10-20T08:00:00.000Z",
            }),
          ),
          page,
          pages: 10,
        }),
    });
    const { loadAdminOverview } = await loadModule();

    const overview = await loadAdminOverview({ accessToken: "t", now: NOW });

    expect(intakeCalls()).toHaveLength(4);
    expect(overview.recentIntake.totalCount).toBe(200);
    expect(overview.recentIntake.truncated).toBe(true);
  });

  it("approval rate is null with no decisions", async () => {
    mockOverview({ intakePage: () => createAdminJourneysPage({ journeys: [] }) });
    const { loadAdminOverview } = await loadModule();

    const overview = await loadAdminOverview({ accessToken: "t", now: NOW });

    expect(overview).toMatchObject({ approvedCount: 0, rejectedCount: 0, approvalRate: null });
    expect(overview.recentIntake.truncated).toBe(false);
  });

  it("approval rate rounds approved over decided", async () => {
    mockOverview({
      approved: 2,
      rejected: 1,
      intakePage: () => createAdminJourneysPage({ journeys: [] }),
    });
    const { loadAdminOverview } = await loadModule();

    const overview = await loadAdminOverview({ accessToken: "t", now: NOW });

    expect(overview).toMatchObject({ approvedCount: 2, rejectedCount: 1, approvalRate: 67 });
  });
});
