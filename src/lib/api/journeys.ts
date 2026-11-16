import "server-only";

import type {
  AdminPublishedJourneysDataDto,
  JourneyReviewStatus,
  PublishedJourneyDetailDto,
  UpdatePublishedJourneyReviewDataDto,
  UpdatePublishedJourneyReviewRequestDto,
} from "@/lib/api/types";
import { bearer, coreClient, dataOf, withPageCounts } from "./client";

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
  const page = await dataOf(
    coreClient.GET("/core/admin/journeys/publish", {
      params: {
        query: {
          page: input.page,
          limit: input.limit,
          reviewStatus: input.reviewStatus,
          localizationPending: input.localizationPending,
          enqueueFailed: input.enqueueFailed,
          userId: input.userId,
        },
      },
      headers: bearer(input.accessToken),
    }),
  );

  return withPageCounts(page);
}

// ─── Re-dispatch a Journey's Translation ─────

export async function requeueJourneyReview(input: {
  accessToken: string;
  publicId: string;
}): Promise<void> {
  await coreClient.POST("/core/admin/journeys/publish/{publicId}/review/requeue", {
    params: { path: { publicId: input.publicId } },
    headers: bearer(input.accessToken),
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
  return dataOf(
    coreClient.GET("/core/admin/journeys/publish/{publicId}", {
      params: { path: { publicId: input.publicId } },
      headers: {
        ...bearer(input.accessToken),
        ...(input.lang ? { "Accept-Language": input.lang } : {}),
      },
    }),
  );
}

// ─── Update Review Status ───────────────────

export async function updateReviewStatus(input: {
  accessToken: string;
  publicId: string;
  status: UpdatePublishedJourneyReviewRequestDto["status"];
  publishOperationId?: string;
  acceptUntranslated?: boolean;
}): Promise<UpdatePublishedJourneyReviewDataDto> {
  return dataOf(
    coreClient.PATCH("/core/admin/journeys/publish/{publicId}/review", {
      params: { path: { publicId: input.publicId } },
      headers: bearer(input.accessToken),
      body: {
        status: input.status,
        ...(input.publishOperationId
          ? { publishOperationId: input.publishOperationId }
          : {}),
        ...(input.acceptUntranslated === true ? { acceptUntranslated: true } : {}),
      },
    }),
  );
}
