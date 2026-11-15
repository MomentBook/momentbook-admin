// Contract v3 spells these enums in UPPER_SNAKE_CASE (ADR 0012 item 6).
export type LocalDateTimeType = "OFFSET_AWARE" | "FLOATING_LOCAL" | "UNKNOWN";
export type TimeZoneSource =
    | "EXIF_EXPLICIT_OFFSET"
    | "GPS_DERIVED"
    | "USER_INPUT"
    | "UNKNOWN";

export type LocalDateTimeContext = {
    localDateTime: string | null;
    utcOffsetMinutes: number | null;
    timeZoneId: string | null;
    localDateTimeType: LocalDateTimeType;
};

export type CaptureTimeContext = LocalDateTimeContext & {
    timeZoneSource: TimeZoneSource;
};

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

function normalizeLocalDateTimeType(value: unknown): LocalDateTimeType {
    if (
        value === "OFFSET_AWARE" ||
        value === "FLOATING_LOCAL" ||
        value === "UNKNOWN"
    ) {
        return value;
    }

    return "UNKNOWN";
}

function normalizeTimeZoneSource(value: unknown): TimeZoneSource {
    if (
        value === "EXIF_EXPLICIT_OFFSET" ||
        value === "GPS_DERIVED" ||
        value === "USER_INPUT" ||
        value === "UNKNOWN"
    ) {
        return value;
    }

    return "UNKNOWN";
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
