import { describe, expect, it } from "vitest";

const KB = 1024;
const MB = KB * 1024;
const GB = MB * 1024;
const TB = GB * 1024;

// The API's six buckets, ascending; null is above the last bound.
const API_BOUNDS = [100 * MB, 500 * MB, 1 * GB, 2.5 * GB, 5 * GB, null];

describe("formatBytes", () => {
  it("uses binary units with a space before the unit", async () => {
    const { formatBytes } = await import("@/lib/admin/storage-shared");

    expect(formatBytes(0)).toBe("0 B");
    expect(formatBytes(1)).toBe("1 B");
    expect(formatBytes(1023)).toBe("1023 B");
    expect(formatBytes(KB)).toBe("1 KB");
    expect(formatBytes(512 * KB)).toBe("512 KB");
    expect(formatBytes(222 * MB)).toBe("222 MB");
    expect(formatBytes(1.2 * GB)).toBe("1.2 GB");
    expect(formatBytes(5 * GB)).toBe("5 GB");
    expect(formatBytes(50 * GB)).toBe("50 GB");
    expect(formatBytes(1.5 * TB)).toBe("1.5 TB");
  });

  it("keeps one decimal for GB and TB below 10 and none from 10", async () => {
    const { formatBytes } = await import("@/lib/admin/storage-shared");

    expect(formatBytes(2.5 * GB)).toBe("2.5 GB");
    expect(formatBytes(9.5 * GB)).toBe("9.5 GB");
    expect(formatBytes(10.4 * GB)).toBe("10 GB");
    expect(formatBytes(12.6 * GB)).toBe("13 GB");
    expect(formatBytes(10.5 * TB)).toBe("11 TB");
  });

  it("shows no decimals for B, KB and MB", async () => {
    const { formatBytes } = await import("@/lib/admin/storage-shared");

    expect(formatBytes(1.5 * MB)).toBe("2 MB");
    expect(formatBytes(1.4 * KB)).toBe("1 KB");
  });

  it("moves to the next unit when rounding reaches 1024", async () => {
    const { formatBytes } = await import("@/lib/admin/storage-shared");

    expect(formatBytes(1023.6 * KB)).toBe("1 MB");
    expect(formatBytes(9.96 * GB)).toBe("10 GB");
  });

  it("turns negative and non-finite input into 0 B", async () => {
    const { formatBytes } = await import("@/lib/admin/storage-shared");

    expect(formatBytes(-1)).toBe("0 B");
    expect(formatBytes(Number.NaN)).toBe("0 B");
    expect(formatBytes(Number.POSITIVE_INFINITY)).toBe("0 B");
    expect(formatBytes(Number.NEGATIVE_INFINITY)).toBe("0 B");
  });
});

describe("storageBucketLabel", () => {
  it("labels the first bucket without a lower bound", async () => {
    const { storageBucketLabel } = await import("@/lib/admin/storage-shared");

    expect(storageBucketLabel(100 * MB, null)).toBe("Up to 100 MB");
  });

  it("labels a middle bucket from its previous bound to its own", async () => {
    const { storageBucketLabel } = await import("@/lib/admin/storage-shared");

    expect(storageBucketLabel(500 * MB, 100 * MB)).toBe("100 MB – 500 MB");
    expect(storageBucketLabel(2.5 * GB, 1 * GB)).toBe("1 GB – 2.5 GB");
  });

  it("labels the open-ended bucket as over the previous bound", async () => {
    const { storageBucketLabel } = await import("@/lib/admin/storage-shared");

    expect(storageBucketLabel(null, 5 * GB)).toBe("Over 5 GB");
  });

  it("labels a list like the API's six buckets", async () => {
    const { storageBucketLabel } = await import("@/lib/admin/storage-shared");

    const labels = API_BOUNDS.map((bound, index) =>
      storageBucketLabel(bound, index === 0 ? null : API_BOUNDS[index - 1]),
    );

    expect(labels).toEqual([
      "Up to 100 MB",
      "100 MB – 500 MB",
      "500 MB – 1 GB",
      "1 GB – 2.5 GB",
      "2.5 GB – 5 GB",
      "Over 5 GB",
    ]);
  });
});

describe("usagePercent", () => {
  it("rounds down to a whole percent", async () => {
    const { usagePercent } = await import("@/lib/admin/storage-shared");

    expect(usagePercent(0, 5 * GB)).toBe(0);
    expect(usagePercent(1, 3)).toBe(33);
    expect(usagePercent(2, 3)).toBe(66);
    expect(usagePercent(5 * GB - 1, 5 * GB)).toBe(99);
    expect(usagePercent(5 * GB, 5 * GB)).toBe(100);
  });

  it("may exceed 100", async () => {
    const { usagePercent } = await import("@/lib/admin/storage-shared");

    expect(usagePercent(6 * GB, 5 * GB)).toBe(120);
  });

  it("is 0 when the quota is 0 or less", async () => {
    const { usagePercent } = await import("@/lib/admin/storage-shared");

    expect(usagePercent(100, 0)).toBe(0);
    expect(usagePercent(100, -5)).toBe(0);
  });
});

describe("allowanceTone", () => {
  it("is near from exactly 80% and at from exactly 100%", async () => {
    const { allowanceTone } = await import("@/lib/admin/storage-shared");

    expect(allowanceTone(79, 100)).toBe("ok");
    expect(allowanceTone(80, 100)).toBe("near");
    expect(allowanceTone(99, 100)).toBe("near");
    expect(allowanceTone(100, 100)).toBe("at");
    expect(allowanceTone(101, 100)).toBe("at");
  });

  it("uses exact boundaries on a real allowance", async () => {
    const { allowanceTone } = await import("@/lib/admin/storage-shared");

    const quota = 5 * GB;
    const eighty = (quota / 100) * 80;

    expect(allowanceTone(eighty - 1, quota)).toBe("ok");
    expect(allowanceTone(eighty, quota)).toBe("near");
    expect(allowanceTone(quota - 1, quota)).toBe("near");
    expect(allowanceTone(quota, quota)).toBe("at");
  });

  it("is ok with nothing used and at when the quota is 0 or less", async () => {
    const { allowanceTone } = await import("@/lib/admin/storage-shared");

    expect(allowanceTone(0, 5 * GB)).toBe("ok");
    expect(allowanceTone(0, 0)).toBe("at");
    expect(allowanceTone(10, -1)).toBe("at");
  });
});

describe("parseAllowanceGigabytes", () => {
  async function parse(raw: string) {
    const { parseAllowanceGigabytes } = await import("@/lib/admin/storage-shared");
    return parseAllowanceGigabytes(raw);
  }

  it("turns binary gigabytes into whole bytes", async () => {
    expect(await parse("5")).toEqual({ ok: true, bytes: 5368709120 });
    expect(await parse("0")).toEqual({ ok: true, bytes: 0 });
    expect(await parse("0.5")).toEqual({ ok: true, bytes: 536870912 });
    expect(await parse("1024")).toEqual({ ok: true, bytes: 1099511627776 });
    expect(await parse("1.5")).toEqual({ ok: true, bytes: 1610612736 });
    expect(await parse(".5")).toEqual({ ok: true, bytes: 536870912 });
  });

  it("rounds to a whole byte", async () => {
    // 0.0000000001 GB is 0.107 bytes.
    expect(await parse("0.0000000001")).toEqual({ ok: true, bytes: 0 });
    // 0.123456789 GB is 132560717.8 bytes.
    expect(await parse("0.123456789")).toEqual({ ok: true, bytes: 132560718 });
  });

  it("reads minus zero as zero", async () => {
    const result = await parse("-0");
    expect(result).toEqual({ ok: true, bytes: 0 });
    expect(Object.is((result as { bytes: number }).bytes, 0)).toBe(true);
  });

  it("rejects what is outside 0 to 1024 GB", async () => {
    expect(await parse("1024.1")).toEqual({ ok: false, error: "out_of_range" });
    expect(await parse("1025")).toEqual({ ok: false, error: "out_of_range" });
    expect(await parse("-1")).toEqual({ ok: false, error: "out_of_range" });
    expect(await parse("-0.0000000001")).toEqual({ ok: false, error: "out_of_range" });
  });

  it("rejects a blank amount as empty", async () => {
    expect(await parse("")).toEqual({ ok: false, error: "empty" });
    expect(await parse("  ")).toEqual({ ok: false, error: "empty" });
  });

  it("rejects text, exponents, infinity and NaN as not a number", async () => {
    for (const raw of ["abc", "1e999", "1e3", "NaN", "Infinity", "-Infinity", "5 GB", "1.2.3", "--1", "0x10", "."]) {
      expect(await parse(raw)).toEqual({ ok: false, error: "not_a_number" });
    }
    expect(await parse("9".repeat(400))).toEqual({ ok: false, error: "not_a_number" });
  });

  it("rejects a decimal comma and accepts surrounding spaces", async () => {
    expect(await parse("5,5")).toEqual({ ok: false, error: "not_a_number" });
    expect(await parse(" 5 ")).toEqual({ ok: true, bytes: 5368709120 });
  });
});
