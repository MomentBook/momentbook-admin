/** A v3 `AdminPublishedJourneyItemDto` (contract-v3 §8.4). */
export function createAdminJourneyItem(overrides: Record<string, unknown> = {}) {
  return {
    publicId: "public-1",
    journeyId: "journey-1",
    userId: "user-1",
    startedAt: "2026-04-01T00:00:00.000Z",
    endedAt: "2026-04-01T02:00:00.000Z",
    startedAtLocal: {
      localDateTime: "2026-04-01T09:00:00",
      utcOffsetMinutes: 540,
      timeZoneId: "Asia/Seoul",
      localDateTimeType: "OFFSET_AWARE",
    },
    endedAtLocal: null,
    photoCount: 12,
    thumbnailUrl: null,
    seoImages: [],
    metadata: {
      title: null,
      description: null,
      hashtags: [],
      sourceLanguage: null,
      thumbnailUri: null,
      localizedContent: null,
    },
    publishedAt: "2026-04-02T00:00:00.000Z",
    createdAt: "2026-04-01T23:00:00.000Z",
    updatedAt: null,
    review: {
      status: "PENDING",
      approved: false,
      localizationPending: false,
      decidedBy: null,
      decidedAt: null,
      enqueueFailed: false,
    },
    visibility: "PUBLIC",
    contentStatus: "REVIEW_PENDING",
    recapStage: "FINALIZED",
    published: true,
    publishOperationId: null,
    reviewRequestedAt: null,
    ...overrides,
  };
}

export function createAdminJourneysPage(options: {
  journeys?: Array<Record<string, unknown>>;
  total?: number;
  page?: number;
  pages?: number;
  limit?: number;
  hasMore?: boolean;
}) {
  const journeys = options.journeys ?? [];
  const page = options.page ?? 1;
  const pages = options.pages ?? 1;

  // What `listPublishedJourneys` returns: the v3 page plus the counts the
  // service layer derives.
  return {
    items: journeys,
    total: options.total ?? journeys.length,
    page,
    pages,
    limit: options.limit ?? 50,
    hasMore: options.hasMore ?? page < pages,
  };
}

export class TestBackendApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly errorCode?: string,
  ) {
    super(message);
    this.name = "BackendApiError";
  }
}

export function isTestBackendApiError(
  error: unknown,
): error is { message: string; statusCode: number } {
  return (
    typeof error === "object" &&
    error !== null &&
    typeof (error as { statusCode?: unknown }).statusCode === "number" &&
    typeof (error as { message?: unknown }).message === "string"
  );
}
