import "server-only";

import type {
  AdminPublishedJourneyPageDto,
  AdminPublishedJourneysDataDto,
  JourneyReviewStatus,
  PublishedJourneyDetailDto,
  RequeueJourneyReviewResultDto,
  UpdatePublishedJourneyReviewDataDto,
  UpdatePublishedJourneyReviewRequestDto,
} from "@/src/apis/types";
import { requestApi, withPageCounts } from "./client";

// ─── List Published Journeys ─────────────────

export async function listPublishedJourneys(input: {
  accessToken: string;
  page: number;
  limit: number;
  reviewStatus?: JourneyReviewStatus;
  localizationPending?: boolean;
  enqueueFailed?: boolean;
  userId?: string;
}): Promise<AdminPublishedJourneysDataDto> {
  const query: Record<string, string | number> = {
    page: input.page,
    limit: input.limit,
  };

  if (input.reviewStatus) {
    query.reviewStatus = input.reviewStatus;
  }

  if (input.localizationPending !== undefined) {
    query.localizationPending = String(input.localizationPending);
  }

  if (input.enqueueFailed !== undefined) {
    query.enqueueFailed = String(input.enqueueFailed);
  }

  if (input.userId) {
    query.userId = input.userId;
  }

  const page = await requestApi<AdminPublishedJourneyPageDto>({
    pathname: "/core/admin/journeys/publish",
    accessToken: input.accessToken,
    query,
  });

  return withPageCounts(page);
}

// ─── Re-dispatch a Journey's Translation ─────

export async function requeueJourneyReview(input: {
  accessToken: string;
  publicId: string;
}): Promise<void> {
  await requestApi<RequeueJourneyReviewResultDto>({
    pathname: `/core/admin/journeys/publish/${encodeURIComponent(input.publicId)}/review/requeue`,
    method: "POST",
    accessToken: input.accessToken,
  });
}

// ─── Get Published Journey Detail ───────────

/** `lang` is the locale tag to localize into, sent as `Accept-Language`
 * (v3 has no `lang` query); without it the original text comes back. */
export async function getPublishedJourneyDetail(input: {
  accessToken: string;
  publicId: string;
  lang?: string;
}): Promise<PublishedJourneyDetailDto> {
  return requestApi<PublishedJourneyDetailDto>({
    pathname: `/core/admin/journeys/publish/${encodeURIComponent(input.publicId)}`,
    accessToken: input.accessToken,
    headers: input.lang ? { "Accept-Language": input.lang } : undefined,
  });
}

// ─── Update Review Status ───────────────────

export async function updateReviewStatus(input: {
  accessToken: string;
  publicId: string;
  status: UpdatePublishedJourneyReviewRequestDto["status"];
  publishOperationId?: string;
  acceptUntranslated?: boolean;
}): Promise<UpdatePublishedJourneyReviewDataDto> {
  return requestApi<UpdatePublishedJourneyReviewDataDto>({
    pathname: `/core/admin/journeys/publish/${encodeURIComponent(input.publicId)}/review`,
    method: "PATCH",
    accessToken: input.accessToken,
    body: {
      status: input.status,
      ...(input.publishOperationId
        ? { publishOperationId: input.publishOperationId }
        : {}),
      ...(input.acceptUntranslated === true ? { acceptUntranslated: true } : {}),
    },
  });
}
