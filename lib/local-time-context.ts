import { toLocaleTag, type Language } from "@/lib/i18n/config";

export type LocalDateTimeType = "offset_aware" | "floating_local" | "unknown";
export type TimeZoneSource =
    | "exif_explicit_offset"
    | "gps_derived"
    | "user_input"
    | "unknown";

export type LocalDateTimeContext = {
    localDateTime: string | null;
    utcOffsetMinutes: number | null;
    timeZoneId: string | null;
    localDateTimeType: LocalDateTimeType;
};

export type CaptureTimeContext = LocalDateTimeContext & {
    timeZoneSource: TimeZoneSource;
};

type LocalDateTimeContextLike = Pick<
    LocalDateTimeContext,
    "localDateTime" | "utcOffsetMinutes" | "timeZoneId" | "localDateTimeType"
>;

type ParsedLocalDateTime = {
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
    second: number;
    millisecond: number;
    canonicalDate: string;
    canonicalDateTime: string;
};

const LOCAL_DATE_TIME_PATTERN =
    /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?$/;

function isRecord(value: unknown): value is Record<string, unknown> {
    return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function readText(value: unknown): string | null {
    if (typeof value !== "string") {
        return null;
    }

    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
}

function readNumber(value: unknown): number | null {
    if (typeof value === "number" && Number.isFinite(value)) {
        return value;
    }

    if (typeof value === "string") {
        const trimmed = value.trim();
        if (trimmed.length === 0) {
            return null;
        }

        const parsed = Number(trimmed);
        if (Number.isFinite(parsed)) {
            return parsed;
        }
    }

    return null;
}

function padNumber(value: number, length = 2): string {
    return String(value).padStart(length, "0");
}

function normalizeLocalDateTimeType(value: unknown): LocalDateTimeType {
    if (
        value === "offset_aware" ||
        value === "floating_local" ||
        value === "unknown"
    ) {
        return value;
    }

    return "unknown";
}

function normalizeTimeZoneSource(value: unknown): TimeZoneSource {
    if (
        value === "exif_explicit_offset" ||
        value === "gps_derived" ||
        value === "user_input" ||
        value === "unknown"
    ) {
        return value;
    }

    return "unknown";
}

function normalizeLocalDateTime(value: unknown): string | null {
    return readText(value);
}

export function normalizeLocalDateTimeContext(
    value: unknown,
): LocalDateTimeContext | null {
    if (!isRecord(value)) {
        return null;
    }

    return {
        localDateTime: normalizeLocalDateTime(value.localDateTime),
        utcOffsetMinutes: readNumber(value.utcOffsetMinutes),
        timeZoneId: readText(value.timeZoneId),
        localDateTimeType: normalizeLocalDateTimeType(value.localDateTimeType),
    };
}

export function normalizeCaptureTimeContext(
    value: unknown,
): CaptureTimeContext | null {
    if (!isRecord(value)) {
        return null;
    }

    const base = normalizeLocalDateTimeContext(value);
    if (!base) {
        return null;
    }

    return {
        ...base,
        timeZoneSource: normalizeTimeZoneSource(value.timeZoneSource),
    };
}

function parseMilliseconds(value: string | undefined): number {
    if (!value) {
        return 0;
    }

    return Number(value.padEnd(3, "0").slice(0, 3));
}

function parseLocalDateTimeValue(
    value: string | null | undefined,
): ParsedLocalDateTime | null {
    if (!value) {
        return null;
    }

    const match = LOCAL_DATE_TIME_PATTERN.exec(value);
    if (!match) {
        return null;
    }

    const [
        ,
        yearValue,
        monthValue,
        dayValue,
        hourValue,
        minuteValue,
        secondValue,
        millisecondValue,
    ] = match;

    const year = Number(yearValue);
    const month = Number(monthValue);
    const day = Number(dayValue);
    const hour = Number(hourValue);
    const minute = Number(minuteValue);
    const second = Number(secondValue ?? "0");
    const millisecond = parseMilliseconds(millisecondValue);

    const utcDate = new Date(
        Date.UTC(year, month - 1, day, hour, minute, second, millisecond),
    );

    if (
        utcDate.getUTCFullYear() !== year ||
        utcDate.getUTCMonth() !== month - 1 ||
        utcDate.getUTCDate() !== day ||
        utcDate.getUTCHours() !== hour ||
        utcDate.getUTCMinutes() !== minute ||
        utcDate.getUTCSeconds() !== second ||
        utcDate.getUTCMilliseconds() !== millisecond
    ) {
        return null;
    }

    const canonicalDate = `${padNumber(year, 4)}-${padNumber(month)}-${padNumber(day)}`;
    const canonicalDateTime = `${canonicalDate}T${padNumber(hour)}:${padNumber(minute)}:${padNumber(second)}${
        millisecond > 0 ? `.${padNumber(millisecond, 3)}` : ""
    }`;

    return {
        year,
        month,
        day,
        hour,
        minute,
        second,
        millisecond,
        canonicalDate,
        canonicalDateTime,
    };
}

function toUtcWallClockDate(parts: ParsedLocalDateTime): Date {
    return new Date(
        Date.UTC(
            parts.year,
            parts.month - 1,
            parts.day,
            parts.hour,
            parts.minute,
            parts.second,
            parts.millisecond,
        ),
    );
}

function resolveParsedContext(
    context: LocalDateTimeContextLike | null | undefined,
): ParsedLocalDateTime | null {
    if (!context || context.localDateTimeType === "unknown") {
        return null;
    }

    return parseLocalDateTimeValue(context.localDateTime);
}

export function isExplicitUnknownLocalDateTimeContext(
    context: LocalDateTimeContextLike | null | undefined,
): boolean {
    return context?.localDateTimeType === "unknown";
}

export function hasRenderableLocalDateTimeContext(
    context: LocalDateTimeContextLike | null | undefined,
): boolean {
    return resolveParsedContext(context) !== null;
}

export function formatLocalDateTimeContextValue(
    lang: Language,
    context: LocalDateTimeContextLike | null | undefined,
    options: Intl.DateTimeFormatOptions,
): string | null {
    const parsed = resolveParsedContext(context);
    if (!parsed) {
        return null;
    }

    try {
        return new Intl.DateTimeFormat(toLocaleTag(lang), {
            ...options,
            timeZone: "UTC",
        }).format(toUtcWallClockDate(parsed));
    } catch {
        return null;
    }
}

function formatUtcOffset(minutes: number): string {
    const sign = minutes >= 0 ? "+" : "-";
    const absoluteMinutes = Math.abs(minutes);
    const hours = Math.floor(absoluteMinutes / 60);
    const mins = absoluteMinutes % 60;

    return `${sign}${padNumber(hours)}:${padNumber(mins)}`;
}

export function buildLocalDateTimeMachineValue(
    context: LocalDateTimeContextLike | null | undefined,
): string | null {
    const parsed = resolveParsedContext(context);
    if (!parsed) {
        return null;
    }

    if (
        context?.localDateTimeType === "offset_aware" &&
        typeof context.utcOffsetMinutes === "number" &&
        Number.isFinite(context.utcOffsetMinutes)
    ) {
        return `${parsed.canonicalDateTime}${formatUtcOffset(context.utcOffsetMinutes)}`;
    }

    return parsed.canonicalDateTime;
}

export function buildLocalDateMachineValue(
    context: LocalDateTimeContextLike | null | undefined,
): string | null {
    const parsed = resolveParsedContext(context);
    return parsed?.canonicalDate ?? null;
}
