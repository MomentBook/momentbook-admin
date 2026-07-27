// ──────────────────────────────────────────────
// Shared API types — hand-written from NestJS contract
// Do NOT edit by hand if regenerating from backend; instead, update this file directly.
// ──────────────────────────────────────────────

export type LocalDateTimeType = "offset_aware" | "floating_local" | "unknown";
export type TimeZoneSource = "exif_explicit_offset" | "gps_derived" | "user_input" | "unknown";

export interface LocalDateTimeContextDto {
  localDateTime?: string | null;
  utcOffsetMinutes?: number | null;
  timeZoneId?: string | null;
  localDateTimeType: LocalDateTimeType;
}

export interface CaptureTimeContextDto extends LocalDateTimeContextDto {
  timeZoneSource: TimeZoneSource;
}

export interface JourneyImageLocationDto {
  latitude: number;
  longitude: number;
}

export interface PublishedJourneySeoImageDto {
  url: string;
  width?: number;
  height?: number;
  alt?: string;
}
