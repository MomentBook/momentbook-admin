import type {
  AdminMetricsDailyDto,
  AdminNotificationPermissionDto,
  AdminNotificationRetentionDto,
  AdminNotificationSkipDto,
  AdminPushPermission,
  AdminPushPlatform,
} from "@/src/apis/types";

export const METRICS_DAY_OPTIONS = [7, 30, 90] as const;
export type MetricsDays = (typeof METRICS_DAY_OPTIONS)[number];

const DEFAULT_METRICS_DAYS: MetricsDays = 30;

/** The `?days=` window. The API accepts 7..90; the page offers three fixed
 * windows so a URL never asks for an arbitrary one. */
export function parseMetricsDays(raw?: string | null): MetricsDays {
  return METRICS_DAY_OPTIONS.find((days) => String(days) === raw) ?? DEFAULT_METRICS_DAYS;
}

const MINUTE = 60;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/** A wait or a median as its two largest units (`3h 20m`, `2d 4h`), floored. */
export function formatDurationSeconds(seconds: number | null): string {
  if (seconds === null || !Number.isFinite(seconds)) return "—";

  const total = Math.max(0, Math.floor(seconds));
  const days = Math.floor(total / DAY);
  const hours = Math.floor((total % DAY) / HOUR);
  const minutes = Math.floor((total % HOUR) / MINUTE);

  if (days > 0) return hours > 0 ? `${days}d ${hours}h` : `${days}d`;
  if (hours > 0) return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  if (minutes > 0) return `${minutes}m`;
  return `${total}s`;
}

export type DailyMetricKey = Exclude<keyof AdminMetricsDailyDto, "date">;
export type DailyPoint = { date: string; value: number | null };

export function toDailySeries(daily: AdminMetricsDailyDto[], key: DailyMetricKey): DailyPoint[] {
  return daily.map((entry) => ({ date: entry.date, value: entry[key] }));
}

/** Window figures for a chart or tile. A null day has no data (active
 * accounts beyond the refresh-token TTL), so it is left out of the total and
 * the average rather than counted as zero. */
export function summarizeDailySeries(series: DailyPoint[]): {
  total: number;
  max: number;
  average: number | null;
  missingDays: number;
} {
  const values = series.flatMap((point) => (point.value === null ? [] : [point.value]));
  const total = values.reduce((sum, value) => sum + value, 0);

  return {
    total,
    max: values.length > 0 ? Math.max(...values) : 0,
    average: values.length > 0 ? total / values.length : null,
    missingDays: series.length - values.length,
  };
}

const DAY_FORMATTER = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});

/** `2026-10-22` → `Oct 22`. The API's days are UTC days, so they are formatted
 * in UTC: a local zone would shift them by one. */
export function formatMetricsDay(date: string): string {
  return DAY_FORMATTER.format(new Date(`${date}T00:00:00Z`));
}

// ─── Notifications (ADR-0096) ───────────────

const PERCENT_FORMATTER = new Intl.NumberFormat("en-US", {
  style: "percent",
  maximumFractionDigits: 1,
});

/** `part` of `whole` as a percentage; a dash when there is nothing to divide by. */
export function formatRate(part: number, whole: number): string {
  return whole > 0 ? PERCENT_FORMATTER.format(part / whole) : "—";
}

export function totalSkipped(skipped: AdminNotificationSkipDto[]): number {
  return skipped.reduce((sum, entry) => sum + entry.jobs, 0);
}

export type RetentionComparison = {
  target: AdminNotificationRetentionDto;
  holdout: AdminNotificationRetentionDto;
  /** Target rate minus holdout rate, in percentage points; null until both
   * cohorts have an account whose days are over. */
  d7Lift: number | null;
  d30Lift: number | null;
};

function emptyCohort(
  category: string,
  cohort: AdminNotificationRetentionDto["cohort"],
): AdminNotificationRetentionDto {
  return { category, cohort, accounts: 0, d7Eligible: 0, d7Returned: 0, d30Eligible: 0, d30Returned: 0 };
}

function liftPoints(targetReturned: number, targetEligible: number, holdoutReturned: number, holdoutEligible: number) {
  if (targetEligible === 0 || holdoutEligible === 0) return null;
  return (targetReturned / targetEligible - holdoutReturned / holdoutEligible) * 100;
}

/** One engagement category's target against its holdout. The API leaves out a
 * cohort with no account, which reads here as zeros. */
export function compareRetention(
  retention: AdminNotificationRetentionDto[],
  category: string,
): RetentionComparison {
  const find = (cohort: AdminNotificationRetentionDto["cohort"]) =>
    retention.find((row) => row.category === category && row.cohort === cohort) ??
    emptyCohort(category, cohort);
  const target = find("TARGET");
  const holdout = find("HOLDOUT");

  return {
    target,
    holdout,
    d7Lift: liftPoints(target.d7Returned, target.d7Eligible, holdout.d7Returned, holdout.d7Eligible),
    d30Lift: liftPoints(
      target.d30Returned,
      target.d30Eligible,
      holdout.d30Returned,
      holdout.d30Eligible,
    ),
  };
}

/** `+4.3 pp`, `−1.0 pp`; a dash when there is no comparison yet. */
export function formatLift(points: number | null): string {
  if (points === null) return "—";
  const magnitude = Math.abs(points).toFixed(1);
  if (Number(magnitude) === 0) return "0.0 pp";
  return `${points > 0 ? "+" : "−"}${magnitude} pp`;
}

export const PUSH_PLATFORMS: readonly AdminPushPlatform[] = ["IOS", "ANDROID", "UNKNOWN"];
export const PUSH_PERMISSIONS: readonly AdminPushPermission[] = [
  "GRANTED",
  "PROVISIONAL",
  "DENIED",
  "UNDETERMINED",
];

export type PermissionRow = {
  platform: AdminPushPlatform;
  total: number;
  counts: Record<AdminPushPermission, number>;
};

/** Devices per platform by permission, platforms in a fixed order, those without
 * a device left out. */
export function permissionMatrix(permissions: AdminNotificationPermissionDto[]): PermissionRow[] {
  return PUSH_PLATFORMS.flatMap((platform) => {
    const rows = permissions.filter((row) => row.platform === platform);
    if (rows.length === 0) return [];

    const counts = Object.fromEntries(
      PUSH_PERMISSIONS.map((permission) => [
        permission,
        rows.find((row) => row.permission === permission)?.devices ?? 0,
      ]),
    ) as Record<AdminPushPermission, number>;
    return [{ platform, total: rows.reduce((sum, row) => sum + row.devices, 0), counts }];
  });
}

// ─── Account deletions ──────────────────────

/** A reason's part of the deletion requests, as a percentage; a dash when
 * nothing was requested. */
export function deletionReasonShare(count: number, requested: number): string {
  return formatRate(count, requested);
}

/** Accounts scheduled for deletion, as the part of `users.total` the four
 * status counts leave. Derived from the same snapshot so the card's rows always
 * add up; never below 0. */
export function deletionScheduledAccounts(users: {
  total: number;
  active: number;
  inactive: number;
  banned: number;
  deleted: number;
}): number {
  return Math.max(0, users.total - (users.active + users.inactive + users.banned + users.deleted));
}
