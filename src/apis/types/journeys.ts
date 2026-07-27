// ──────────────────────────────────────────────
// Journey API types — hand-written from NestJS contract
// Do NOT edit by hand if regenerating from backend; instead, update this file directly.
// ──────────────────────────────────────────────

import type {
  LocalDateTimeContextDto,
  CaptureTimeContextDto,
  JourneyImageLocationDto,
  PublishedJourneySeoImageDto,
} from "./shared";

// ─── Enums / Literal Unions ───────────────────

export type JourneyReviewStatus = "PENDING" | "APPROVED" | "REJECTED";
export type RecapStage = "NONE" | "FINALIZED";
export type ContentAvailability = "available" | "reported_hidden" | "review_pending" | "review_rejected";
export type JourneyVisibility = "public" | "hidden";
export type JourneyMode = "PHOTO_ONLY";
export type TimelineBlockType = "STOP" | "MOVE" | "ORPHAN";
export type PublishedJourneyListSort = "recent" | "oldest" | "discovery";

// ─── Review ──────────────────────────────────

export interface PublishedJourneyReviewDto {
  approved: boolean;
  status: JourneyReviewStatus;
  flagged?: boolean;
  flagReasons?: string[];
  decidedBy?: "AI" | "ADMIN";
  decidedAt?: string;
}

// ─── Time Range ──────────────────────────────

export interface PublishedJourneyTimeRangeDto {
  startAt: number;
  endAt: number;
  durationMs: number;
  startLocal: LocalDateTimeContextDto;
  endLocal: LocalDateTimeContextDto;
}

// ─── Image ───────────────────────────────────

export interface PublishedJourneyImageDto {
  photoId: string;
  url: string;
  fullUrl: string;
  displayUrl: string;
  thumbnailUrl: string;
  width?: number;
  height?: number;
  takenAt?: number;
  location?: JourneyImageLocationDto;
  locationName?: string;
  captureTime?: CaptureTimeContextDto;
}

// ─── Localization ────────────────────────────

export interface PublishedJourneyLocalizationEntryDto {
  locale: string;
  languageCode: string;
  countryCode: string;
  languageName: string;
  title?: string;
  description?: string;
  hashtags: string[];
}

export interface PublishedJourneyClusterLocalizationEntryDto {
  locale: string;
  languageCode: string;
  countryCode: string;
  languageName: string;
  impression?: string;
}

export interface PublishedJourneyClusterLocalizedImpressionsDto {
  clusterId: string;
  translations: PublishedJourneyClusterLocalizationEntryDto[];
}

export interface PublishedJourneyLocalizedContentDto {
  sourceLanguage: string;
  generatedAt: string;
  entries: PublishedJourneyLocalizationEntryDto[];
  clusterImpressions: PublishedJourneyClusterLocalizedImpressionsDto[];
}

// ─── Timeline Block ──────────────────────────

export interface TimelineBlockDto {
  clusterId?: string;
  type?: TimelineBlockType;
  time?: PublishedJourneyTimeRangeDto;
  center?: {
    lat?: number;
    lng?: number;
  };
  locationName?: string;
  impression?: string;
  photoIds?: string[];
  photos?: PublishedJourneyImageDto[];
}

// ─── Recap Draft ─────────────────────────────

export interface RecapDraftSummaryDto {
  timeline?: TimelineBlockDto[];
  photoCount?: number;
  imageCount?: number;
}

// ─── Author ──────────────────────────────────

export interface JourneyAuthorDto {
  userId?: string;
  name?: string | null;
  picture?: string | null;
}

// ─── Public Journey List Item ────────────────

export interface PublishedJourneyItemDto {
  publicId: string;
  journeyId: string;
  userId: string;
  startedAt: number;
  endedAt?: number;
  startedAtLocal: LocalDateTimeContextDto;
  endedAtLocal?: LocalDateTimeContextDto | null;
  recapStage: RecapStage;
  photoCount: number;
  /** @deprecated */
  imageCount: number;
  thumbnailUrl?: string;
  seoImages?: PublishedJourneySeoImageDto[];
  metadata?: Record<string, unknown>;
  publishedAt: string;
  createdAt: string;
  updatedAt?: string;
  review: PublishedJourneyReviewDto;
  visibility: JourneyVisibility;
  contentStatus: ContentAvailability;
}

// ─── Public Journey List Response ────────────

export interface PublishedJourneysDataDto {
  journeys: PublishedJourneyItemDto[];
  total: number;
  page?: number;
  pages?: number;
  limit: number;
  hasMore: boolean;
  nextCursor?: string | null;
  discoverySeed?: string;
}

export interface PublishedJourneysResponseDto {
  status: string;
  data: PublishedJourneysDataDto;
}

// ─── Public Journey Detail ───────────────────

export interface PublishedJourneyDetailDto {
  publicId: string;
  userId: string;
  author: JourneyAuthorDto;
  startedAt: number;
  endedAt?: number;
  startedAtLocal: LocalDateTimeContextDto;
  endedAtLocal?: LocalDateTimeContextDto | null;
  title?: string;
  description?: string;
  thumbnailUrl?: string;
  shareUrl?: string;
  mode: JourneyMode;
  photoCount: number;
  images: PublishedJourneyImageDto[];
  clusters: string[];
  timeline: TimelineBlockDto[];
  recapDraft: RecapDraftSummaryDto;
  localizedContent?: PublishedJourneyLocalizedContentDto;
  seoImages?: PublishedJourneySeoImageDto[];
  publishedAt: string;
  createdAt: string;
  updatedAt?: string;
  review: PublishedJourneyReviewDto;
  contentStatus: ContentAvailability;
  visibility: JourneyVisibility;
  notice?: string;
}

export interface PublishedJourneyDetailResponseDto {
  status: string;
  data: PublishedJourneyDetailDto;
}

// ─── Public Journey Fetch Query ──────────────

export interface PublishedJourneysQueryDto {
  page?: number;
  limit?: number;
  sort?: PublishedJourneyListSort;
  userId?: string;
  reviewStatus?: "APPROVED";
}

// ─── Admin Journey List Query ────────────────

export interface AdminPublishedJourneysQueryDto {
  page?: number;
  limit?: number;
  reviewStatus?: JourneyReviewStatus;
  flagged?: boolean;
}

// ─── Admin Journey List Item ─────────────────

export interface AdminPublishedJourneyItemDto extends PublishedJourneyItemDto {
  published: boolean;
}

// ─── Admin Journey List Response ─────────────

export interface AdminPublishedJourneysDataDto {
  journeys: AdminPublishedJourneyItemDto[];
  total: number;
  page: number;
  pages: number;
  limit: number;
  hasMore: boolean;
}

export interface AdminPublishedJourneysResponseDto {
  status: string;
  data: AdminPublishedJourneysDataDto;
}

// ─── Admin Journey Detail Response ───────────

export interface AdminPublishedJourneyDetailResponseDto {
  status: string;
  data: PublishedJourneyDetailDto;
}

// ─── Admin Review Update Request/Response ────

export interface UpdatePublishedJourneyReviewRequestDto {
  status: JourneyReviewStatus;
}

export interface UpdatePublishedJourneyReviewDataDto {
  publicId: string;
  journeyId: string;
  published: boolean;
  visibility: JourneyVisibility;
  review: PublishedJourneyReviewDto;
  updatedAt: string;
}

export interface UpdatePublishedJourneyReviewResponseDto {
  status: string;
  data: UpdatePublishedJourneyReviewDataDto;
}

// ─── Admin Requeue Journey Review ────────────

export interface RequeueJourneyReviewResponseDto {
  status: string;
  data: Record<string, never>;
}
