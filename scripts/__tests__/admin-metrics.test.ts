import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const getAdminMetrics = vi.fn();
const getAdminNotificationMetrics = vi.fn();
vi.mock("@/lib/api/metrics", () => ({ getAdminMetrics, getAdminNotificationMetrics }));

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

type Retention = import("@/src/apis/types").AdminNotificationRetentionDto;

function cohort(overrides: Partial<Retention> & Pick<Retention, "cohort">): Retention {
  return {
    category: "memories.on_this_day",
    accounts: 0,
    d7Eligible: 0,
    d7Returned: 0,
    d30Eligible: 0,
    d30Returned: 0,
    ...overrides,
  };
}

describe("notification metrics", () => {
  it("formatRate shows a share as a percentage, and nothing to divide by as a dash", async () => {
    const { formatRate } = await import("@/lib/admin/metrics-shared");

    expect(formatRate(1, 3)).toBe("33.3%");
    expect(formatRate(2, 2)).toBe("100%");
    expect(formatRate(0, 5)).toBe("0%");
    expect(formatRate(0, 0)).toBe("—");
    expect(formatRate(3, 0)).toBe("—");
  });

  it("compareRetention sets the target against the holdout, in percentage points", async () => {
    const { compareRetention } = await import("@/lib/admin/metrics-shared");
    const retention = [
      cohort({ cohort: "HOLDOUT", accounts: 10, d7Eligible: 10, d7Returned: 2, d30Eligible: 8, d30Returned: 4 }),
      cohort({ cohort: "TARGET", accounts: 90, d7Eligible: 80, d7Returned: 24, d30Eligible: 50, d30Returned: 30 }),
      cohort({ category: "memories.first_journey", cohort: "TARGET", accounts: 5, d7Eligible: 5, d7Returned: 5 }),
    ];

    const result = compareRetention(retention, "memories.on_this_day");
    expect(result.target.accounts).toBe(90);
    expect(result.holdout.accounts).toBe(10);
    expect(result.d7Lift).toBeCloseTo(10);
    expect(result.d30Lift).toBeCloseTo(10);
  });

  it("compareRetention has no lift until both cohorts have someone to judge", async () => {
    const { compareRetention } = await import("@/lib/admin/metrics-shared");

    const onlyTarget = compareRetention(
      [cohort({ cohort: "TARGET", accounts: 3, d7Eligible: 3, d7Returned: 1 })],
      "memories.on_this_day",
    );
    expect(onlyTarget.holdout).toEqual(cohort({ cohort: "HOLDOUT" }));
    expect(onlyTarget.d7Lift).toBeNull();
    expect(onlyTarget.d30Lift).toBeNull();

    const nobody = compareRetention([], "memories.first_journey");
    expect(nobody.target).toEqual(cohort({ category: "memories.first_journey", cohort: "TARGET" }));
    expect(nobody.d30Lift).toBeNull();
  });

  it("formatLift signs the difference and leaves a missing one blank", async () => {
    const { formatLift } = await import("@/lib/admin/metrics-shared");

    expect(formatLift(4.25)).toBe("+4.3 pp");
    expect(formatLift(-1)).toBe("−1.0 pp");
    expect(formatLift(0)).toBe("0.0 pp");
    expect(formatLift(null)).toBe("—");
  });

  it("permissionMatrix lays out each platform's devices by permission, in a fixed order", async () => {
    const { permissionMatrix } = await import("@/lib/admin/metrics-shared");

    expect(
      permissionMatrix([
        { platform: "ANDROID", permission: "DENIED", devices: 4 },
        { platform: "IOS", permission: "GRANTED", devices: 10 },
        { platform: "ANDROID", permission: "GRANTED", devices: 6 },
        { platform: "IOS", permission: "PROVISIONAL", devices: 1 },
      ]),
    ).toEqual([
      { platform: "IOS", total: 11, counts: { GRANTED: 10, PROVISIONAL: 1, DENIED: 0, UNDETERMINED: 0 } },
      { platform: "ANDROID", total: 10, counts: { GRANTED: 6, PROVISIONAL: 0, DENIED: 4, UNDETERMINED: 0 } },
    ]);
    expect(permissionMatrix([])).toEqual([]);
  });

  it("totalSkipped adds up every reason", async () => {
    const { totalSkipped } = await import("@/lib/admin/metrics-shared");

    expect(
      totalSkipped([
        { reason: "weekly_cap", jobs: 4 },
        { reason: "holdout", jobs: 2 },
      ]),
    ).toBe(6);
    expect(totalSkipped([])).toBe(0);
  });
});

describe("loadAdminNotificationMetricsData", () => {
  it("asks the API for the parsed window", async () => {
    const data = { days: 7 };
    getAdminNotificationMetrics.mockResolvedValue(data);
    const { loadAdminNotificationMetricsData } = await import("@/lib/admin/metrics");

    await expect(loadAdminNotificationMetricsData("token", 7)).resolves.toBe(data);
    expect(getAdminNotificationMetrics).toHaveBeenCalledWith({ accessToken: "token", days: 7 });
  });

  it("gives null when the section fails, so the rest of the page still renders", async () => {
    const { BackendApiError } = await import("@/lib/api/client");
    getAdminNotificationMetrics.mockRejectedValue(new BackendApiError("Not Found", 404));
    const { loadAdminNotificationMetricsData } = await import("@/lib/admin/metrics");

    await expect(loadAdminNotificationMetricsData("token", 30)).resolves.toBeNull();
  });

  it("still rejects a 401, for the page's session handling", async () => {
    const { BackendApiError } = await import("@/lib/api/client");
    getAdminNotificationMetrics.mockRejectedValue(new BackendApiError("Unauthorized", 401));
    const { loadAdminNotificationMetricsData } = await import("@/lib/admin/metrics");

    await expect(loadAdminNotificationMetricsData("token", 30)).rejects.toMatchObject({
      statusCode: 401,
    });
  });
});
