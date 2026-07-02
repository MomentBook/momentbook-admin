"use client";

import { useSyncExternalStore } from "react";
import { toLocaleTag, type Language } from "@/lib/i18n/config";
import {
  buildLocalDateMachineValue,
  formatLocalDateTimeContextValue,
  isExplicitUnknownLocalDateTimeContext,
  type LocalDateTimeContext,
} from "@/lib/local-time-context";

const noopSubscribe = () => () => {};

type BaseProps = {
  lang: Language;
  className?: string;
};

type LocalizedDateProps = BaseProps & {
  timestamp?: number | null;
  localContext?: LocalDateTimeContext | null;
  fallback?: string;
};

type LocalizedDateRangeProps = BaseProps & {
  start?: number | null;
  end?: number | null;
  startContext?: LocalDateTimeContext | null;
  endContext?: LocalDateTimeContext | null;
  fallback?: string;
};

type LocalizedDateTimeRangeProps = BaseProps & {
  start?: number | null;
  end?: number | null;
  startContext?: LocalDateTimeContext | null;
  endContext?: LocalDateTimeContext | null;
  fallback?: string;
};

function normalizeTimestamp(value: number | null | undefined): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  return null;
}

function resolveRange(
  start: number | null | undefined,
  end: number | null | undefined,
) {
  const resolvedStart = normalizeTimestamp(start);
  const resolvedEnd = normalizeTimestamp(end);

  if (resolvedStart === null && resolvedEnd === null) {
    return null;
  }

  const nextStart = resolvedStart ?? resolvedEnd;
  const nextEnd = resolvedEnd ?? resolvedStart;

  if (nextStart === null || nextEnd === null) {
    return null;
  }

  if (nextEnd < nextStart) {
    return { start: nextEnd, end: nextStart };
  }

  return { start: nextStart, end: nextEnd };
}

function formatDateToken(
  lang: Language,
  timestamp: number | null | undefined,
  localContext: LocalDateTimeContext | null | undefined,
  timeZone?: string,
  month: "long" | "short" = "short",
) {
  const localValue = formatLocalDateTimeContextValue(lang, localContext, {
    year: "numeric",
    month,
    day: "numeric",
  });

  if (localValue) {
    return localValue;
  }

  const normalized = normalizeTimestamp(timestamp);
  if (normalized === null) {
    return null;
  }

  try {
    return new Intl.DateTimeFormat(toLocaleTag(lang), {
      year: "numeric",
      month,
      day: "numeric",
      ...(timeZone ? { timeZone } : {}),
    }).format(normalized);
  } catch {
    return null;
  }
}

function formatTimeToken(
  lang: Language,
  localContext: LocalDateTimeContext | null | undefined,
) {
  return formatLocalDateTimeContextValue(lang, localContext, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDate(
  lang: Language,
  timestamp: number | null,
  localContext: LocalDateTimeContext | null | undefined,
  fallback: string,
  timeZone?: string,
) {
  return (
    formatDateToken(lang, timestamp, localContext, timeZone) ??
    fallback
  );
}

function formatDateRange(
  lang: Language,
  start: number | null | undefined,
  end: number | null | undefined,
  fallback: string,
  timeZone?: string,
  startContext?: LocalDateTimeContext | null,
  endContext?: LocalDateTimeContext | null,
) {
  const range = resolveRange(start, end);
  if (!range) {
    return fallback;
  }

  const startDate = formatDateToken(
    lang,
    range.start,
    startContext,
    timeZone,
    "long",
  );
  const endDate = formatDateToken(
    lang,
    range.end,
    endContext,
    timeZone,
    "long",
  );

  if (!startDate || !endDate) {
    return fallback;
  }

  if (startDate === endDate) {
    return startDate;
  }

  return `${startDate} - ${endDate}`;
}

function formatDateTimeRange(
  lang: Language,
  start: number | null | undefined,
  end: number | null | undefined,
  fallback: string,
  timeZone?: string,
  startContext?: LocalDateTimeContext | null,
  endContext?: LocalDateTimeContext | null,
) {
  const range = resolveRange(start, end);
  if (!range) {
    return fallback;
  }

  if (
    isExplicitUnknownLocalDateTimeContext(startContext) ||
    isExplicitUnknownLocalDateTimeContext(endContext)
  ) {
    return formatDateRange(
      lang,
      range.start,
      range.end,
      fallback,
      timeZone,
      startContext,
      endContext,
    );
  }

  const startDate = formatDateToken(
    lang,
    range.start,
    startContext,
    timeZone,
    "short",
  );
  const endDate = formatDateToken(
    lang,
    range.end,
    endContext,
    timeZone,
    "short",
  );
  const startTime = formatTimeToken(lang, startContext);
  const endTime = formatTimeToken(lang, endContext);

  if (startDate && endDate && startTime && endTime) {
    if (startDate === endDate) {
      return `${startDate} · ${startTime}-${endTime}`;
    }

    return `${startDate} ${startTime} - ${endDate} ${endTime}`;
  }

  try {
    const dateFormatter = new Intl.DateTimeFormat(toLocaleTag(lang), {
      year: "numeric",
      month: "short",
      day: "numeric",
      ...(timeZone ? { timeZone } : {}),
    });
    const timeFormatter = new Intl.DateTimeFormat(toLocaleTag(lang), {
      hour: "2-digit",
      minute: "2-digit",
      ...(timeZone ? { timeZone } : {}),
    });

    const startDateValue = dateFormatter.format(range.start);
    const endDateValue = dateFormatter.format(range.end);
    const startTimeValue = timeFormatter.format(range.start);
    const endTimeValue = timeFormatter.format(range.end);

    if (startDateValue === endDateValue) {
      return `${startDateValue} · ${startTimeValue}-${endTimeValue}`;
    }

    return `${startDateValue} ${startTimeValue} - ${endDateValue} ${endTimeValue}`;
  } catch {
    return fallback;
  }
}

export function LocalizedDate({
  lang,
  timestamp,
  localContext,
  className,
  fallback = "",
}: LocalizedDateProps) {
  const normalized = normalizeTimestamp(timestamp);
  const machineDate =
    buildLocalDateMachineValue(localContext) ??
    (normalized === null ? undefined : new Date(normalized).toISOString());
  const value = useSyncExternalStore(
    noopSubscribe,
    () => formatDate(lang, normalized, localContext, fallback),
    () => formatDate(lang, normalized, localContext, fallback, "UTC"),
  );

  return (
    <time className={className} dateTime={machineDate}>
      {value}
    </time>
  );
}

export function LocalizedDateRange({
  lang,
  start,
  end,
  startContext,
  endContext,
  className,
  fallback = "",
}: LocalizedDateRangeProps) {
  const value = useSyncExternalStore(
    noopSubscribe,
    () => formatDateRange(lang, start, end, fallback, undefined, startContext, endContext),
    () => formatDateRange(lang, start, end, fallback, "UTC", startContext, endContext),
  );

  return <span className={className}>{value}</span>;
}

export function LocalizedDateTimeRange({
  lang,
  start,
  end,
  startContext,
  endContext,
  className,
  fallback = "",
}: LocalizedDateTimeRangeProps) {
  const value = useSyncExternalStore(
    noopSubscribe,
    () =>
      formatDateTimeRange(
        lang,
        start,
        end,
        fallback,
        undefined,
        startContext,
        endContext,
      ),
    () =>
      formatDateTimeRange(
        lang,
        start,
        end,
        fallback,
        "UTC",
        startContext,
        endContext,
      ),
  );

  return <span className={className}>{value}</span>;
}
