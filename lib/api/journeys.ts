import "server-only";

import type {
  AdminPublishedJourneysDataDto,
  JourneyReviewStatus,
  PublishedJourneyDetailDto,
  UpdatePublishedJourneyReviewDataDto,
  UpdatePublishedJourneyReviewRequestDto,
} from "@/src/apis/types";
import { requestEnvelope } from "./client";

// ─── List Published Journeys ─────────────────

export async function listPublishedJourneys(input: {
  accessToken: string;
  page: number;
  limit: number;
  reviewStatus?: JourneyReviewStatus;
  flagged?: boolean;
}): Promise<AdminPublishedJourneysDataDto> {
  const query: Record<string, string | number> = {
    page: input.page,
    limit: input.limit,
  };

  if (input.reviewStatus) {
    query.reviewStatus = input.reviewStatus;
  }

  if (input.flagged !== undefined) {
    query.flagged = input.flagged ? "true" : "false";
  }

  const response = await requestEnvelope<AdminPublishedJourneysDataDto>({
    pathname: "/core/admin/journeys/publish",
    accessToken: input.accessToken,
    query,
  });

  return response.data;
}

// ─── Requeue Journey for AI Review ───────────

export async function requeueJourneyReview(input: {
  accessToken: string;
  publicId: string;
}): Promise<void> {
  await requestEnvelope<Record<string, never>>({
    pathname: `/core/admin/journeys/publish/${encodeURIComponent(input.publicId)}/review/requeue`,
    method: "POST",
    accessToken: input.accessToken,
  });
}

// ─── Get Published Journey Detail ───────────

export async function getPublishedJourneyDetail(input: {
  accessToken: string;
  publicId: string;
  lang?: string;
}): Promise<PublishedJourneyDetailDto> {
  const response = await requestEnvelope<PublishedJourneyDetailDto>({
    pathname: `/core/admin/journeys/publish/${encodeURIComponent(input.publicId)}`,
    accessToken: input.accessToken,
    query: input.lang ? { lang: input.lang } : undefined,
  });

  return response.data;
}

// ─── Update Review Status ───────────────────

export async function updateReviewStatus(input: {
  accessToken: string;
  publicId: string;
  status: UpdatePublishedJourneyReviewRequestDto["status"];
}): Promise<UpdatePublishedJourneyReviewDataDto> {
  const response = await requestEnvelope<UpdatePublishedJourneyReviewDataDto>({
    pathname: `/core/admin/journeys/publish/${encodeURIComponent(input.publicId)}/review`,
    method: "PATCH",
    accessToken: input.accessToken,
    body: {
      status: input.status,
    },
  });

  return response.data;
}
