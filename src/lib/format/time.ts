import { defaultLanguage, toLocaleTag } from "@/lib/i18n";

const LOCALE = toLocaleTag(defaultLanguage);

export type AdminTimeOptions = {
  /** Add the hour and minute. */
  withTime?: boolean;
  /** A fixed zone, named after a time of day (the server renders in UTC);
   * left out, the runtime's own zone, unnamed. */
  timeZone?: string;
  /** Shown for a missing or unreadable time. */
  fallback?: string;
};

/** An API time (ISO string or epoch milliseconds) as epoch milliseconds, or
 * `null` when it is missing or unreadable. */
export function toTimestamp(value: string | number | null | undefined): number | null {
  const timestamp = typeof value === "string" ? Date.parse(value) : value;
  return typeof timestamp === "number" && Number.isFinite(timestamp) ? timestamp : null;
}

/** An API time as every admin screen writes it: "Nov 15, 2026", or
 * "Nov 15, 2026, 01:05 PM" with the time. */
export function formatAdminTime(
  value: string | number | null | undefined,
  options: AdminTimeOptions = {},
): string {
  const { withTime = false, timeZone, fallback = "" } = options;
  const timestamp = toTimestamp(value);

  if (timestamp === null) {
    return fallback;
  }

  try {
    return new Intl.DateTimeFormat(LOCALE, {
      year: "numeric",
      month: "short",
      day: "numeric",
      ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
      ...(timeZone ? { timeZone, ...(withTime ? { timeZoneName: "short" } : {}) } : {}),
    }).format(timestamp);
  } catch {
    return fallback;
  }
}
