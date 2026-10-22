import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const getAdminMetrics = vi.fn();
vi.mock("@/lib/api/metrics", () => ({ getAdminMetrics }));

afterEach(() => {
  vi.clearAllMocks();
  vi.resetModules();
});

type Daily = import("@/src/apis/types").AdminMetricsDailyDto;

function day(date: string, overrides: Partial<Daily> = {}): Daily {
  return {
    date,
    signups: 0,
    activeAccounts: 0,
    newPublishedJourneys: 0,
    reviewDecisions: 0,
    reportsOpened: 0,
    reportsClosed: 0,
    commentsCreated: 0,
    ...overrides,
  };
}

describe("parseMetricsDays", () => {
  it("accepts only 7, 30 or 90 and defaults to 30", async () => {
    const { parseMetricsDays } = await import("@/lib/admin/metrics-shared");

    expect(parseMetricsDays("7")).toBe(7);
    expect(parseMetricsDays("90")).toBe(90);
    expect(parseMetricsDays("30")).toBe(30);
    expect(parseMetricsDays("45")).toBe(30);
    expect(parseMetricsDays(undefined)).toBe(30);
    expect(parseMetricsDays(null)).toBe(30);
    expect(parseMetricsDays("")).toBe(30);
    expect(parseMetricsDays("7.0")).toBe(30);
    expect(parseMetricsDays(" 7")).toBe(30);
  });
});

describe("formatDurationSeconds", () => {
  it("formats the two largest units", async () => {
    const { formatDurationSeconds } = await import("@/lib/admin/metrics-shared");

    expect(formatDurationSeconds(null)).toBe("—");
    expect(formatDurationSeconds(2700)).toBe("45m");
    expect(formatDurationSeconds(12000)).toBe("3h 20m");
    expect(formatDurationSeconds(187200)).toBe("2d 4h");
  });

  it("drops a zero second unit, floors fractions and clamps below zero", async () => {
    const { formatDurationSeconds } = await import("@/lib/admin/metrics-shared");

    expect(formatDurationSeconds(3600)).toBe("1h");
    expect(formatDurationSeconds(86400)).toBe("1d");
    expect(formatDurationSeconds(2759.9)).toBe("45m");
    expect(formatDurationSeconds(42)).toBe("42s");
    expect(formatDurationSeconds(0)).toBe("0s");
    expect(formatDurationSeconds(-5)).toBe("0s");
    expect(formatDurationSeconds(Number.NaN)).toBe("—");
  });
});

describe("daily series", () => {
  it("toDailySeries picks one metric per day, keeping null", async () => {
    const { toDailySeries } = await import("@/lib/admin/metrics-shared");
    const daily = [
      day("2026-10-21", { signups: 2, activeAccounts: null }),
      day("2026-10-22", { signups: 5, activeAccounts: 9 }),
    ];

    expect(toDailySeries(daily, "signups")).toEqual([
      { date: "2026-10-21", value: 2 },
      { date: "2026-10-22", value: 5 },
    ]);
    expect(toDailySeries(daily, "activeAccounts")).toEqual([
      { date: "2026-10-21", value: null },
      { date: "2026-10-22", value: 9 },
    ]);
  });

  it("summarizeDailySeries skips null days instead of counting them as zero", async () => {
    const { summarizeDailySeries } = await import("@/lib/admin/metrics-shared");

    expect(
      summarizeDailySeries([
        { date: "2026-10-20", value: null },
        { date: "2026-10-21", value: 4 },
        { date: "2026-10-22", value: 0 },
        { date: "2026-10-23", value: 8 },
      ]),
    ).toEqual({ total: 12, max: 8, average: 4, missingDays: 1 });

    expect(
      summarizeDailySeries([
        { date: "2026-10-22", value: null },
        { date: "2026-10-23", value: null },
      ]),
    ).toEqual({ total: 0, max: 0, average: null, missingDays: 2 });
  });

  it("formatMetricsDay renders the UTC day, whatever the server time zone", async () => {
    const { formatMetricsDay } = await import("@/lib/admin/metrics-shared");

    expect(formatMetricsDay("2026-10-22")).toBe("Oct 22");
    expect(formatMetricsDay("2026-01-01")).toBe("Jan 1");
  });
});

describe("loadAdminMetricsData", () => {
  it("asks the API for the parsed window", async () => {
    const data = { days: 90 };
    getAdminMetrics.mockResolvedValue(data);
    const { loadAdminMetricsData } = await import("@/lib/admin/metrics");

    await expect(loadAdminMetricsData("token", 90)).resolves.toBe(data);
    expect(getAdminMetrics).toHaveBeenCalledWith({ accessToken: "token", days: 90 });
  });
});
