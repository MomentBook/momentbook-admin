import "server-only";

import { isBackendApiError } from "@/lib/api/client";
import { listPublishedJourneys } from "@/lib/api/journeys";
import { getAdminReportStats } from "@/lib/api/reports";
import type { AdminReportStatsDataDto } from "@/src/apis/types";

/**
 * What needs the admin's attention, from the same backend filters the Slack
 * alerts use. Each journey number is the API `total` of a `limit=1` list, so
 * the cost stays constant as data grows.
 */
export type AttentionCounts = {
  pendingReviews: number;
  /** `localizationPending=true`, any review status. A superset of the Slack
   * stale-translation alert, which only counts ones untouched for 6 hours. */
  translationPending: number;
  translationEnqueueFailed: number;
  openReports: number | null;
  pendingReports: number | null;
  reviewedReports: number | null;
  /** ISO timestamp of the load. */
  asOf: string;
};

async function readJourneyTotal(
  accessToken: string,
  filter: { reviewStatus?: "PENDING"; localizationPending?: true; enqueueFailed?: true },
): Promise<number> {
  const response = await listPublishedJourneys({
    accessToken,
    page: 1,
    limit: 1,
    ...filter,
  });

  return response.total;
}

/** Report counts are secondary on every page: a failing stats endpoint must
 * not take the review pages down, but an expired or revoked session must
 * still reach the caller's 401/403 handling. */
async function readReportStats(accessToken: string): Promise<AdminReportStatsDataDto | null> {
  try {
    return await getAdminReportStats({ accessToken });
  } catch (error) {
    if (isBackendApiError(error) && (error.statusCode === 401 || error.statusCode === 403)) {
      throw error;
    }

    return null;
  }
}

export async function loadAttentionCounts(accessToken: string): Promise<AttentionCounts> {
  const [pendingReviews, translationPending, translationEnqueueFailed, reportStats] =
    await Promise.all([
      readJourneyTotal(accessToken, { reviewStatus: "PENDING" }),
      readJourneyTotal(accessToken, { localizationPending: true }),
      readJourneyTotal(accessToken, { enqueueFailed: true }),
      readReportStats(accessToken),
    ]);

  return {
    pendingReviews,
    translationPending,
    translationEnqueueFailed,
    openReports: reportStats?.openReports ?? null,
    pendingReports: reportStats?.pendingReports ?? null,
    reviewedReports: reportStats?.reviewedReports ?? null,
    asOf: new Date().toISOString(),
  };
}
