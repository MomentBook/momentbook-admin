import "server-only";

import { listPublishedJourneys } from "@/lib/api/journeys";
import { readText } from "@/lib/view-helpers";

export const OVERVIEW_WEEK_BUCKETS = 6;
// 4 pages x 50 = the newest 200 journeys; beyond that the chart says "200+".
const INTAKE_PAGE_CAP = 4;
const INTAKE_PAGE_LIMIT = 50;
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

const UTC_WEEK_LABEL_FORMATTER = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});

export type AdminOverviewWeek = {
  key: string;
  label: string;
  count: number;
};

export type AdminOverview = {
  approvedCount: number;
  rejectedCount: number;
  approvalRate: number | null;
  recentIntake: {
    weeks: AdminOverviewWeek[];
    totalCount: number;
    maxCount: number;
    /** The page cap stopped the scan before the window's start. */
    truncated: boolean;
  };
};

export function startOfUtcWeek(timestampMs: number): number {
  const date = new Date(timestampMs);
  const day = date.getUTCDay();
  const offset = day === 0 ? 6 : day - 1;

  date.setUTCDate(date.getUTCDate() - offset);
  date.setUTCHours(0, 0, 0, 0);

  return date.getTime();
}

export function formatUtcWeekLabel(timestampMs: number): string {
  return UTC_WEEK_LABEL_FORMATTER.format(new Date(timestampMs));
}

async function readReviewTotal(
  accessToken: string,
  reviewStatus: "APPROVED" | "REJECTED",
): Promise<number> {
  const response = await listPublishedJourneys({ accessToken, page: 1, limit: 1, reviewStatus });
  return response.total;
}

/**
 * Weekly publish counts for the last six UTC weeks. The list is ordered by
 * first publish time, newest first, so the scan stops at the first item older
 * than the window, or at the page cap.
 */
async function loadRecentIntake(
  accessToken: string,
  now: number,
): Promise<AdminOverview["recentIntake"]> {
  const currentWeekStart = startOfUtcWeek(now);
  const bucketStarts = Array.from(
    { length: OVERVIEW_WEEK_BUCKETS },
    (_, index) => currentWeekStart - (OVERVIEW_WEEK_BUCKETS - index - 1) * WEEK_MS,
  );
  const windowStart = bucketStarts[0] ?? currentWeekStart;
  const counts = new Map<number, number>(bucketStarts.map((start) => [start, 0]));
  const seenPublicIds = new Set<string>();

  let truncated = false;
  let reachedWindowStart = false;

  for (let page = 1; !reachedWindowStart; page += 1) {
    if (page > INTAKE_PAGE_CAP) {
      truncated = true;
      break;
    }

    const response = await listPublishedJourneys({
      accessToken,
      page,
      limit: INTAKE_PAGE_LIMIT,
    });

    for (const journey of response.journeys) {
      if (seenPublicIds.has(journey.publicId)) {
        continue;
      }
      seenPublicIds.add(journey.publicId);

      const timestamp = Date.parse(
        readText(journey.publishedAt) ?? readText(journey.createdAt) ?? "",
      );
      if (!Number.isFinite(timestamp)) {
        continue;
      }

      if (timestamp < windowStart) {
        reachedWindowStart = true;
        break;
      }

      const bucketStart = startOfUtcWeek(timestamp);
      if (counts.has(bucketStart)) {
        counts.set(bucketStart, (counts.get(bucketStart) ?? 0) + 1);
      }
    }

    if (!response.hasMore) {
      break;
    }
  }

  const weeks = bucketStarts.map((start) => ({
    key: String(start),
    label: formatUtcWeekLabel(start),
    count: counts.get(start) ?? 0,
  }));

  return {
    weeks,
    totalCount: weeks.reduce((sum, week) => sum + week.count, 0),
    maxCount: Math.max(0, ...weeks.map((week) => week.count)),
    truncated,
  };
}

export async function loadAdminOverview(input: {
  accessToken: string;
  now?: number;
}): Promise<AdminOverview> {
  const [approvedCount, rejectedCount, recentIntake] = await Promise.all([
    readReviewTotal(input.accessToken, "APPROVED"),
    readReviewTotal(input.accessToken, "REJECTED"),
    loadRecentIntake(input.accessToken, input.now ?? Date.now()),
  ]);
  const decided = approvedCount + rejectedCount;

  return {
    approvedCount,
    rejectedCount,
    approvalRate: decided > 0 ? Math.round((approvedCount / decided) * 100) : null,
    recentIntake,
  };
}
