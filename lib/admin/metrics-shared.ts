import type { AdminMetricsDailyDto } from "@/src/apis/types";

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
