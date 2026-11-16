"use client";

import { useSyncExternalStore } from "react";
import { formatAdminTime, toTimestamp } from "@/lib/format/time";

const noopSubscribe = () => () => {};

/** An API time in the viewer's own zone. The server renders it in UTC (and
 * names the zone when it shows the time); the browser then shows its local
 * value without a hydration mismatch. */
export function Time({
  value,
  withTime = false,
  fallback = "",
  className,
}: {
  value: string | number | null | undefined;
  withTime?: boolean;
  fallback?: string;
  className?: string;
}) {
  const timestamp = toTimestamp(value);
  const text = useSyncExternalStore(
    noopSubscribe,
    () => formatAdminTime(timestamp, { withTime, fallback }),
    () => formatAdminTime(timestamp, { withTime, fallback, timeZone: "UTC" }),
  );

  return (
    <time
      className={className}
      dateTime={timestamp === null ? undefined : new Date(timestamp).toISOString()}
    >
      {text}
    </time>
  );
}
