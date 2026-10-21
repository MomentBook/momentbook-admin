export function createAdminJourneyItem(overrides: Record<string, unknown> = {}) {
  return {
    publicId: "public-1",
    journeyId: "journey-1",
    userId: "user-1",
    startedAt: Date.parse("2026-04-01T00:00:00.000Z"),
    endedAt: Date.parse("2026-04-01T02:00:00.000Z"),
    startedAtLocal: null,
    endedAtLocal: null,
    recapStage: "FINALIZED",
    photoCount: 12,
    imageCount: 12,
    thumbnailUrl: undefined,
    metadata: undefined,
    publishedAt: "2026-04-02T00:00:00.000Z",
    createdAt: "2026-04-01T23:00:00.000Z",
    published: true,
    visibility: "public",
    review: {
      status: "PENDING",
      approved: false,
    },
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

  return {
    journeys,
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
