import "server-only";

import { isBackendApiError } from "@/lib/api/client";
import { getPublishedJourneyDetail } from "@/lib/api/journeys";
import { type Language, toLocaleTag } from "@/lib/i18n";
import { buildAdminReviewDetail, type AdminReviewDetail } from "./detail-model";

/** One journey for the review screen, from the admin detail endpoint only.
 * Returns null when the journey no longer exists (404). */
export async function loadAdminReviewDetail(input: {
  accessToken: string;
  publicId: string;
  lang?: Language | null;
}): Promise<AdminReviewDetail | null> {
  try {
    const detail = await getPublishedJourneyDetail({
      accessToken: input.accessToken,
      publicId: input.publicId,
      lang: input.lang ? toLocaleTag(input.lang) : undefined,
    });

    return buildAdminReviewDetail({ detail, lang: input.lang });
  } catch (error) {
    if (isBackendApiError(error) && error.statusCode === 404) {
      return null;
    }

    throw error;
  }
}
