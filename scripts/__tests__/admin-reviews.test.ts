import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const listPublishedJourneys = vi.fn();
const getPublishedJourneyDetail = vi.fn();
class BackendApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
  ) {
    super(message);
    this.name = "BackendApiError";
  }
}

vi.mock("@/lib/api/client", () => ({
  BackendApiError,
  isBackendApiError: (error: unknown) =>
    typeof error === "object" &&
    error !== null &&
    typeof (error as { statusCode?: unknown }).statusCode === "number" &&
    typeof (error as { message?: unknown }).message === "string",
}));

vi.mock("@/lib/api/journeys", () => ({
  listPublishedJourneys,
  getPublishedJourneyDetail,
}));

function createAdminJourney(
  overrides: Record<string, unknown> = {},
) {
  return {
    publicId: "public-1",
    journeyId: "journey-1",
    userId: "user-1",
    startedAt: "2026-04-01T00:00:00.000Z",
    endedAt: "2026-04-01T02:00:00.000Z",
    startedAtLocal: localContext("2026-04-01T09:00:00"),
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
    review: review({ status: "PENDING", approved: false }),
    visibility: "PUBLIC",
    contentStatus: "REVIEW_PENDING",
    recapStage: "FINALIZED",
    published: true,
    publishOperationId: null,
    reviewRequestedAt: null,
    ...overrides,
  };
}

function localContext(localDateTime: string) {
  return {
    localDateTime,
    utcOffsetMinutes: 540,
    timeZoneId: "Asia/Seoul",
    localDateTimeType: "OFFSET_AWARE",
  };
}

function review(overrides: Record<string, unknown>) {
  return {
    status: "PENDING",
    approved: false,
    localizationPending: false,
    decidedBy: null,
    decidedAt: null,
    enqueueFailed: false,
    ...overrides,
  };
}

/** A v3 `PublishedJourneyImageDto`; with no variants every URL is the original. */
function image(photoId: string, overrides: Record<string, unknown> = {}) {
  const url = `https://images.example.com/${photoId}.jpg`;

  return {
    photoId,
    url,
    fullUrl: url,
    displayUrl: url,
    thumbnailUrl: url,
    width: null,
    height: null,
    takenAt: null,
    location: null,
    locationName: null,
    captureTime: {
      localDateTime: null,
      utcOffsetMinutes: null,
      timeZoneId: null,
      localDateTimeType: "UNKNOWN",
      timeZoneSource: "UNKNOWN",
    },
    ...overrides,
  };
}

function variants(photoId: string) {
  return image(photoId, {
    displayUrl: `https://images.example.com/variants/${photoId}.display.webp`,
    thumbnailUrl: `https://images.example.com/variants/${photoId}.thumbnail.webp`,
  });
}

/** A v3 `PublishedMomentDto`. */
function moment(overrides: Record<string, unknown> = {}) {
  return {
    id: "moment-1",
    type: "STOP",
    startAt: "2026-04-01T00:00:00.000Z",
    endAt: "2026-04-01T01:00:00.000Z",
    durationMs: 3_600_000,
    startLocal: localContext("2026-04-01T09:00:00"),
    endLocal: localContext("2026-04-01T10:00:00"),
    center: { lat: 37.57, lng: 126.98 },
    locationName: "Seoul",
    impression: "Quiet afternoon",
    photoIds: ["photo-1"],
    photos: [image("photo-1")],
    ...overrides,
  };
}

function createAdminPage(
  page: number,
  pages: number,
  journeys: Array<Record<string, unknown>>,
) {
  return {
    items: journeys,
    total: journeys.length,
    page,
    pages,
    limit: 50,
    hasMore: page < pages,
  };
}

/** A v3 `AdminPublishedJourneyDetailDto` (contract-v3 §8.4). */
function createAdminDetail(
  overrides: Record<string, unknown> = {},
) {
  return {
    publicId: "public-1",
    journeyId: "journey-1",
    userId: "user-1",
    author: {
      id: "user-1",
      name: "Admin User",
      picture: null,
      biography: null,
    },
    startedAt: "2026-04-01T00:00:00.000Z",
    endedAt: "2026-04-01T02:00:00.000Z",
    startedAtLocal: localContext("2026-04-01T09:00:00"),
    endedAtLocal: null,
    title: "Journey title",
    description: "Journey description",
    hashtags: [],
    thumbnailUrl: null,
    shareUrl: null,
    photoCount: 1,
    images: [image("photo-1")],
    moments: [moment()],
    localizedContent: null,
    seoImages: [],
    publishedAt: "2026-04-02T00:00:00.000Z",
    createdAt: "2026-04-01T23:00:00.000Z",
    updatedAt: "2026-04-02T00:00:00.000Z",
    review: review({ status: "PENDING", approved: false }),
    contentStatus: "REVIEW_PENDING",
    visibility: "PUBLIC",
    notice: null,
    localizationModel: null,
    publishedWithoutTranslation: false,
    publishOperationId: null,
    ...overrides,
  };
}

async function loadAdminReviewsModule() {
  return import("@/lib/admin/reviews");
}

afterEach(() => {
  vi.clearAllMocks();
  vi.resetModules();
});

const attentionCounts = {
  pendingReviews: 1,
  translationPending: 0,
  translationEnqueueFailed: 0,
  openReports: 0,
  pendingReports: 0,
  reviewedReports: 0,
  asOf: "2026-04-03T00:00:00.000Z",
};

async function loadReviewQueueModule() {
  return import("@/lib/admin/review-queue");
}

describe("review queue and detail loaders", () => {
  it("reads the title, description and cover from the metadata", async () => {
    listPublishedJourneys.mockImplementation(async (input: { limit: number }) =>
      input.limit === 1
        ? createAdminPage(1, 1, [])
        : createAdminPage(1, 1, [
            createAdminJourney({
              publicId: "pending-1",
              thumbnailUrl: null,
              metadata: {
                title: "Metadata title",
                description: "Metadata summary",
                hashtags: [],
                sourceLanguage: "ko",
                thumbnailUri: "https://images.example.com/cover.jpg",
                localizedContent: null,
              },
            }),
          ]),
    );

    const { loadReviewQueue } = await loadReviewQueueModule();
    const queue = await loadReviewQueue({
      accessToken: "admin-token",
      tab: "pending",
      page: 1,
      counts: attentionCounts,
    });

    // One filtered page plus the approved/rejected/all tab totals.
    expect(listPublishedJourneys).toHaveBeenCalledTimes(4);
    expect(queue.total).toBe(1);
    expect(queue.items).toHaveLength(1);
    expect(queue.items[0]).toMatchObject({
      publicId: "pending-1",
      title: "Metadata title",
      description: "Metadata summary",
      thumbnailUrl: "https://images.example.com/cover.jpg",
    });
  });

  it("detail lookup is independent from the active filter", async () => {
    getPublishedJourneyDetail.mockResolvedValueOnce(
      createAdminDetail({
        publicId: "approved-1",
        userId: "user-2",
        title: "Approved title",
        description: "Approved description",
        review: review({ status: "APPROVED", approved: true }),
      }),
    );

    const { loadAdminReviewDetail } = await loadAdminReviewsModule();
    const result = {
      detail: await loadAdminReviewDetail({
        accessToken: "admin-token",
        publicId: "approved-1",
      }),
    };

    expect(result.detail?.journey.publicId).toBe("approved-1");
    expect(result.detail?.journey.review.status).toBe("APPROVED");
    expect(result.detail?.evidence.loadedCount).toBe(1);
  });

  it("queue items come from the server-filtered list", async () => {
    listPublishedJourneys.mockImplementation(async (input: { limit: number }) =>
      input.limit === 1
        ? { ...createAdminPage(1, 1, []), total: 9 }
        : {
            ...createAdminPage(1, 3, [
              createAdminJourney({ publicId: "pending-1" }),
              createAdminJourney({ publicId: "pending-2", journeyId: "journey-2" }),
            ]),
            total: 41,
            limit: 20,
          },
    );

    const { loadReviewQueue } = await loadReviewQueueModule();
    const queue = await loadReviewQueue({
      accessToken: "admin-token",
      tab: "pending",
      page: 1,
      counts: attentionCounts,
    });

    expect(listPublishedJourneys).toHaveBeenCalledWith({
      accessToken: "admin-token",
      page: 1,
      limit: 20,
      reviewStatus: "PENDING",
    });
    expect(listPublishedJourneys.mock.calls.every(([input]) => input.page === 1)).toBe(true);
    expect(queue.total).toBe(41);
    expect(queue.pages).toBe(3);
    expect(queue.tabTotals.pending).toBe(41);
    expect(queue.items.map((item) => item.publicId)).toEqual(["pending-1", "pending-2"]);
  });

  it("reads a queue item's times and enums as v3 sends them", async () => {
    listPublishedJourneys.mockImplementation(async (input: { limit: number }) =>
      input.limit === 1
        ? createAdminPage(1, 1, [])
        : createAdminPage(1, 1, [createAdminJourney({ publicId: "pending-1", endedAt: null })]),
    );

    const { loadReviewQueue } = await loadReviewQueueModule();
    const queue = await loadReviewQueue({
      accessToken: "admin-token",
      tab: "pending",
      page: 1,
      counts: attentionCounts,
    });

    expect(queue.items[0]).toMatchObject({
      startedAt: Date.parse("2026-04-01T00:00:00.000Z"),
      endedAt: null,
      visibility: "PUBLIC",
      startedAtLocal: localContext("2026-04-01T09:00:00"),
    });
  });

  it("keeps photos that exist only in moment media references and merges them into cluster evidence", async () => {
    getPublishedJourneyDetail.mockResolvedValueOnce(
      createAdminDetail({
        publicId: "approved-1",
        photoCount: 3,
        images: [image("photo-1")],
        moments: [
          moment({
            photoIds: ["photo-1", "photo-2", "photo-3"],
            photos: [variants("photo-1"), variants("photo-2"), image("photo-3")],
          }),
        ],
      }),
    );

    const { loadAdminReviewDetail } = await loadAdminReviewsModule();
    const result = {
      detail: await loadAdminReviewDetail({
        accessToken: "admin-token",
        publicId: "approved-1",
      }),
    };

    expect(result.detail?.evidence.loadedCount).toBe(3);
    expect(result.detail?.evidence.photos.map((photo) => photo.photoId)).toEqual([
      "photo-1",
      "photo-2",
      "photo-3",
    ]);
    expect(result.detail?.evidence.photos[0]).toMatchObject({
      url: "https://images.example.com/photo-1.jpg",
      fullUrl: "https://images.example.com/photo-1.jpg",
      displayUrl: "https://images.example.com/variants/photo-1.display.webp",
      thumbnailUrl: "https://images.example.com/variants/photo-1.thumbnail.webp",
    });
    expect(result.detail?.evidence.photos[2]).toMatchObject({
      url: "https://images.example.com/photo-3.jpg",
      fullUrl: "https://images.example.com/photo-3.jpg",
      displayUrl: "https://images.example.com/photo-3.jpg",
      thumbnailUrl: "https://images.example.com/photo-3.jpg",
    });
    expect(result.detail?.evidence.sections).toHaveLength(1);
    expect(result.detail?.evidence.sections[0]).toMatchObject({
      kind: "cluster",
      momentId: "moment-1",
      title: "Seoul",
      impression: "Quiet afternoon",
      photoCount: 3,
    });
  });

  it("adds a remaining-photos section for assets that are not attached to any cluster", async () => {
    getPublishedJourneyDetail.mockResolvedValueOnce(
      createAdminDetail({
        publicId: "pending-1",
        photoCount: 2,
        images: [image("photo-1"), image("photo-2")],
        moments: [
          moment({
            locationName: "Busan",
            impression: "Harbor walk",
            photoIds: ["photo-1"],
            photos: [image("photo-1")],
          }),
        ],
      }),
    );

    const { loadAdminReviewDetail } = await loadAdminReviewsModule();
    const result = {
      detail: await loadAdminReviewDetail({
        accessToken: "admin-token",
        publicId: "pending-1",
      }),
    };

    expect(result.detail?.evidence.loadedCount).toBe(2);
    expect(result.detail?.evidence.sections).toHaveLength(2);
    expect(result.detail?.evidence.sections[1]).toMatchObject({
      kind: "remaining",
      photoCount: 1,
    });
    expect(
      result.detail?.evidence.sections[1]?.photos.map((photo) => photo.photoId),
    ).toEqual(["photo-2"]);
  });

  it("passes the locale tag to the admin detail and reads its moderation fields", async () => {
    getPublishedJourneyDetail.mockResolvedValueOnce(
      createAdminDetail({
        publicId: "pending-1",
        title: "로컬라이즈된 제목",
        description: "로컬라이즈된 설명",
        review: review({ status: "REJECTED", approved: false }),
        visibility: "HIDDEN",
        contentStatus: "REVIEW_REJECTED",
        localizedContent: {
          sourceLanguage: "ko",
          generatedAt: "2026-04-03T00:00:00.000Z",
          entries: [
            {
              locale: "ko-KR",
              languageCode: "ko",
              countryCode: "KR",
              languageName: "Korean",
              title: "로컬라이즈된 제목",
              description: "로컬라이즈된 설명",
              hashtags: ["#서울"],
            },
          ],
          momentImpressions: [],
        },
      }),
    );

    const { loadAdminReviewDetail } = await loadAdminReviewsModule();
    const result = {
      detail: await loadAdminReviewDetail({
        accessToken: "admin-token",
        publicId: "pending-1",
        lang: "ko",
      }),
    };

    expect(getPublishedJourneyDetail).toHaveBeenCalledWith({
      accessToken: "admin-token",
      publicId: "pending-1",
      lang: "ko-KR",
    });
    expect(result.detail?.journey.review.status).toBe("REJECTED");
    expect(result.detail?.journey.visibility).toBe("HIDDEN");
    expect(result.detail?.journey.contentStatus).toBe("REVIEW_REJECTED");
    expect(result.detail?.journey.requestedLocale).toBe("ko-KR");
    expect(result.detail?.journey.localizedContent?.entries[0]?.title).toBe(
      "로컬라이즈된 제목",
    );
  });

  it("returns null detail when the admin detail endpoint responds with 404", async () => {
    getPublishedJourneyDetail.mockRejectedValueOnce(
      new BackendApiError("Not found", 404),
    );

    const { loadAdminReviewDetail } = await loadAdminReviewsModule();
    const result = {
      detail: await loadAdminReviewDetail({
        accessToken: "admin-token",
        publicId: "missing-1",
      }),
    };

    expect(result.detail).toBeNull();
  });
});

describe("loadAdminReviewDetail", () => {
  it("reads journey fields from the detail only", async () => {
    getPublishedJourneyDetail.mockResolvedValueOnce(
      createAdminDetail({
        journeyId: "journey-9",
        photoCount: 3,
        publishOperationId: "op-9",
        updatedAt: "2026-04-03T00:00:00.000Z",
        localizationModel: "gpt-test",
        review: review({ status: "APPROVED", approved: true, localizationPending: true }),
      }),
    );

    const { loadAdminReviewDetail } = await loadAdminReviewsModule();
    const detail = await loadAdminReviewDetail({
      accessToken: "admin-token",
      publicId: "public-1",
    });

    expect(listPublishedJourneys).not.toHaveBeenCalled();
    expect(detail?.journey).toMatchObject({
      publicId: "public-1",
      journeyId: "journey-9",
      title: "Journey title",
      description: "Journey description",
      publishOperationId: "op-9",
      updatedAt: "2026-04-03T00:00:00.000Z",
      localizationModel: "gpt-test",
      publishedWithoutTranslation: false,
      review: { status: "APPROVED", localizationPending: true },
    });
    expect(detail?.evidence.expectedCount).toBe(3);
  });

  it("builds one section per moment, in order, keyed by the moment id with its times", async () => {
    getPublishedJourneyDetail.mockResolvedValueOnce(
      createAdminDetail({
        photoCount: 2,
        images: [image("photo-1"), image("photo-2")],
        moments: [
          moment(),
          moment({
            id: "moment-2",
            type: "MOVE",
            startAt: "2026-04-01T01:00:00.000Z",
            endAt: "2026-04-01T02:00:00.000Z",
            locationName: null,
            impression: null,
            photoIds: ["photo-2"],
            photos: [image("photo-2")],
          }),
        ],
      }),
    );

    const { loadAdminReviewDetail } = await loadAdminReviewsModule();
    const detail = await loadAdminReviewDetail({ accessToken: "admin-token", publicId: "public-1" });

    expect(detail?.evidence.sections.map((section) => [section.key, section.momentId])).toEqual([
      ["moment-1", "moment-1"],
      ["moment-2", "moment-2"],
    ]);
    expect(detail?.evidence.sections[0]?.time).toEqual({
      startAt: Date.parse("2026-04-01T00:00:00.000Z"),
      endAt: Date.parse("2026-04-01T01:00:00.000Z"),
      startLocal: localContext("2026-04-01T09:00:00"),
      endLocal: localContext("2026-04-01T10:00:00"),
    });
    expect(detail?.evidence.sections[1]).toMatchObject({
      kind: "cluster",
      type: "MOVE",
      title: null,
      impression: null,
      photoCount: 1,
    });
  });

  it("reads RFC 3339 times as epoch milliseconds", async () => {
    getPublishedJourneyDetail.mockResolvedValueOnce(
      createAdminDetail({
        images: [image("photo-1", { takenAt: "2026-04-01T00:30:00.000Z" })],
      }),
    );

    const { loadAdminReviewDetail } = await loadAdminReviewsModule();
    const detail = await loadAdminReviewDetail({ accessToken: "admin-token", publicId: "public-1" });

    expect(detail?.journey.startedAt).toBe(Date.parse("2026-04-01T00:00:00.000Z"));
    expect(detail?.journey.endedAt).toBe(Date.parse("2026-04-01T02:00:00.000Z"));
    expect(detail?.evidence.photos[0]?.takenAt).toBe(Date.parse("2026-04-01T00:30:00.000Z"));
  });

  it("keeps the moment impressions keyed by momentId", async () => {
    const translation = {
      locale: "en-US",
      languageCode: "en",
      countryCode: "US",
      languageName: "English",
      impression: "Quiet afternoon",
    };
    getPublishedJourneyDetail.mockResolvedValueOnce(
      createAdminDetail({
        localizedContent: {
          sourceLanguage: "ko",
          generatedAt: "2026-04-03T00:00:00.000Z",
          entries: [],
          momentImpressions: [{ momentId: "moment-1", translations: [translation] }],
        },
      }),
    );

    const { loadAdminReviewDetail } = await loadAdminReviewsModule();
    const detail = await loadAdminReviewDetail({ accessToken: "admin-token", publicId: "public-1" });

    expect(detail?.journey.localizedContent?.momentImpressions).toEqual([
      { momentId: "moment-1", translations: [translation] },
    ]);
  });

  it("returns null when the detail endpoint responds with 404", async () => {
    getPublishedJourneyDetail.mockRejectedValueOnce(new BackendApiError("Not found", 404));

    const { loadAdminReviewDetail } = await loadAdminReviewsModule();

    await expect(
      loadAdminReviewDetail({ accessToken: "admin-token", publicId: "missing-1" }),
    ).resolves.toBeNull();
  });
});
