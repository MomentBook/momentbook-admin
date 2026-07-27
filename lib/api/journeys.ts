import "server-only";

import type {
  AdminPublishedJourneysDataDto,
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
}): Promise<AdminPublishedJourneysDataDto> {
  const response = await requestEnvelope<AdminPublishedJourneysDataDto>({
    pathname: "/core/admin/journeys/publish",
    accessToken: input.accessToken,
    query: {
      page: input.page,
      limit: input.limit,
    },
  });

  return response.data;
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
