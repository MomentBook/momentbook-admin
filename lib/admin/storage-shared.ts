const UNITS = ["B", "KB", "MB", "GB", "TB"] as const;
const BASE = 1024;
/** Index of "GB": from here, a value below 10 keeps one decimal. */
const DECIMAL_FROM_UNIT = 3;
const DECIMAL_BELOW = 10;

/** Binary units (1 KB = 1024 B) in English: `512 KB`, `1.2 GB`, `50 GB`. One
 * decimal for GB and TB below 10, none otherwise. Negative or non-finite input
 * reads as `0 B`. */
export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";

  let unit = 0;
  let value = bytes;
  while (value >= BASE && unit < UNITS.length - 1) {
    value /= BASE;
    unit += 1;
  }

  let rounded = roundForUnit(value, unit);
  // 1023.6 KB rounds to 1024 KB, which reads better as 1 MB.
  if (rounded >= BASE && unit < UNITS.length - 1) {
    rounded = roundForUnit(rounded / BASE, unit + 1);
    unit += 1;
  }

  return `${rounded} ${UNITS[unit]}`;
}

function roundForUnit(value: number, unit: number): number {
  const decimals = unit >= DECIMAL_FROM_UNIT && value < DECIMAL_BELOW ? 1 : 0;
  return Number(value.toFixed(decimals));
}

/** A backup-size bucket as a range: `Up to 100 MB`, `100 MB – 500 MB`, and for
 * the open-ended last bucket (`null` bound) `Over 5 GB`. The first bucket has
 * no previous bound. A bound belongs to the bucket it ends. */
export function storageBucketLabel(
  upToBytes: number | null,
  previousUpToBytes: number | null,
): string {
  if (upToBytes === null) {
    return previousUpToBytes === null ? "All sizes" : `Over ${formatBytes(previousUpToBytes)}`;
  }
  if (previousUpToBytes === null) return `Up to ${formatBytes(upToBytes)}`;
  return `${formatBytes(previousUpToBytes)} – ${formatBytes(upToBytes)}`;
}

/** Whole percent of the allowance used, rounded down; may exceed 100. 0 when
 * the allowance is 0 or less. */
export function usagePercent(usedBytes: number, quotaBytes: number): number {
  if (quotaBytes <= 0) return 0;
  return Math.floor((usedBytes * 100) / quotaBytes);
}

export type AllowanceTone = "ok" | "near" | "at";

const NEAR_PERCENT = 80;
const AT_PERCENT = 100;

/** `at` from 100% of the allowance, `near` from 80%. Compared in whole-number
 * products, so the boundaries are exact. An allowance of 0 or less is `at`. */
export function allowanceTone(usedBytes: number, quotaBytes: number): AllowanceTone {
  if (quotaBytes <= 0) return "at";
  if (usedBytes * 100 >= quotaBytes * AT_PERCENT) return "at";
  if (usedBytes * 100 >= quotaBytes * NEAR_PERCENT) return "near";
  return "ok";
}
