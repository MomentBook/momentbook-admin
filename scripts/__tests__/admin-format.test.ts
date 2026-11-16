import { afterEach, describe, expect, it, vi } from "vitest";

import { formatCount } from "@/lib/format/number";
import { formatAdminTime } from "@/lib/format/time";

const AT = "2026-11-15T13:05:00.000Z";

afterEach(() => {
  vi.unstubAllEnvs();
});

// Expected strings are what LocalizedDate and LocalizedDateTime rendered for
// the same instant: UTC with the zone named while the server renders, the
// viewer's own zone, unnamed, in the browser.
describe("formatAdminTime", () => {
  it("formats a UTC ISO date like LocalizedDate did", () => {
    expect(formatAdminTime(AT, { timeZone: "UTC" })).toBe("Nov 15, 2026");
    expect(formatAdminTime(Date.parse(AT), { timeZone: "UTC" })).toBe("Nov 15, 2026");
  });

  it("formats date and time like LocalizedDateTime did", () => {
    expect(formatAdminTime(AT, { withTime: true, timeZone: "UTC" })).toBe(
      "Nov 15, 2026, 01:05 PM UTC",
    );
  });

  it("uses the runtime's zone, unnamed, when none is given", () => {
    vi.stubEnv("TZ", "Asia/Seoul");

    expect(formatAdminTime(AT, { withTime: true })).toBe("Nov 15, 2026, 10:05 PM");
    expect(formatAdminTime("2026-11-15T20:00:00.000Z")).toBe("Nov 16, 2026");
  });

  it("returns the placeholder for null", () => {
    expect(formatAdminTime(null)).toBe("");
    expect(formatAdminTime(undefined, { fallback: "—" })).toBe("—");
    expect(formatAdminTime("not a date", { fallback: "—" })).toBe("—");
  });
});

describe("formatCount", () => {
  it("formatCount groups thousands", () => {
    expect(formatCount(1234567)).toBe("1,234,567");
    expect(formatCount(0)).toBe("0");
  });
});
