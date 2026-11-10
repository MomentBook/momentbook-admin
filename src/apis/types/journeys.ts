// ──────────────────────────────────────────────
// Published journey admin API types: aliases of the generated v3 DTOs
// (ADR 0012).
// ──────────────────────────────────────────────

import type {
  AdminPublishedJourneyDetailDto,
  AdminPublishedJourneyItemDto as GeneratedAdminPublishedJourneyItemDto,
  AdminPublishedJourneyPageDto,
  AdminPublishedJourneyReviewDto,
  PublishedJourneyImageDto as GeneratedPublishedJourneyImageDto,
  PublishedJourneyLocalizationEntryDto as GeneratedPublishedJourneyLocalizationEntryDto,
  PublishedJourneyLocalizedContentDto as GeneratedPublishedJourneyLocalizedContentDto,
  PublishedJourneyMomentImpressionDto as GeneratedPublishedJourneyMomentImpressionDto,
  PublishedJourneyMomentTranslationDto as GeneratedPublishedJourneyMomentTranslationDto,
  PublishedJourneyReviewResultDto,
  PublishedMomentDto as GeneratedPublishedMomentDto,
  RequeueJourneyReviewResultDto as GeneratedRequeueJourneyReviewResultDto,
  UpdatePublishedJourneyReviewRequestDto as GeneratedUpdatePublishedJourneyReviewRequestDto,
} from "../generated/core";
import type { PageCounts } from "./shared";

export type JourneyReviewStatus = AdminPublishedJourneyReviewDto["status"];

/** The review state on the admin list, the admin detail and a decision. */
export type PublishedJourneyReviewDto = AdminPublishedJourneyReviewDto;

// ─── Detail ──────────────────────────────────

export type PublishedJourneyImageDto = GeneratedPublishedJourneyImageDto;
export type PublishedMomentDto = GeneratedPublishedMomentDto;
export type PublishedJourneyLocalizationEntryDto = GeneratedPublishedJourneyLocalizationEntryDto;
export type PublishedJourneyMomentTranslationDto = GeneratedPublishedJourneyMomentTranslationDto;
export type PublishedJourneyMomentImpressionDto = GeneratedPublishedJourneyMomentImpressionDto;
export type PublishedJourneyLocalizedContentDto = GeneratedPublishedJourneyLocalizedContentDto;
/** `GET /core/admin/journeys/publish/{publicId}`: the public detail plus the
 * review fields (contract-v3 §8.4). */
export type PublishedJourneyDetailDto = AdminPublishedJourneyDetailDto;

// ─── List ────────────────────────────────────

export type AdminPublishedJourneyItemDto = GeneratedAdminPublishedJourneyItemDto;
export type { AdminPublishedJourneyPageDto };
export type AdminPublishedJourneysDataDto = AdminPublishedJourneyPageDto & PageCounts;

// ─── Review Decision ─────────────────────────

export type UpdatePublishedJourneyReviewRequestDto = GeneratedUpdatePublishedJourneyReviewRequestDto;
export type UpdatePublishedJourneyReviewDataDto = PublishedJourneyReviewResultDto;
export type RequeueJourneyReviewResultDto = GeneratedRequeueJourneyReviewResultDto;
