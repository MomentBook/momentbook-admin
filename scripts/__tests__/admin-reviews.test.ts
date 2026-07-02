import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const getAdminPublishedJourneysPage = vi.fn();
const getAdminPublishedJourneyDetail = vi.fn();
class BackendApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
  ) {
    super(message);
    this.name = "BackendApiError";
  }
}

vi.mock("@/lib/admin/api", () => ({
  BackendApiError,
  getAdminPublishedJourneysPage,
  getAdminPublishedJourneyDetail,
}));

function createAdminJourney(
  overrides: Record<string, unknown> = {},
) {
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

function createAdminPage(
  page: number,
  pages: number,
  journeys: Array<Record<string, unknown>>,
) {
  return {
    journeys,
    total: journeys.length,
    page,
    pages,
    limit: 50,
    hasMore: page < pages,
  };
}

function createAdminDetail(
  overrides: Record<string, unknown> = {},
) {
  return {
    publicId: "public-1",
    userId: "user-1",
    author: {
      userId: "user-1",
      name: "Admin User",
      picture: null,
    },
    startedAt: Date.parse("2026-04-01T00:00:00.000Z"),
    endedAt: Date.parse("2026-04-01T02:00:00.000Z"),
    startedAtLocal: null,
    endedAtLocal: null,
    title: "Journey title",
    description: "Journey description",
    thumbnailUrl: undefined,
    shareUrl: undefined,
    mode: "PHOTO_ONLY",
    photoCount: 1,
    images: [
      {
        photoId: "photo-1",
        url: "https://images.example.com/photo-1.jpg",
      },
    ],
    clusters: ["timeline-1"],
    timeline: [
      {
        clusterId: "timeline-1",
        type: "STOP",
        locationName: "Seoul",
        impression: "Quiet afternoon",
        time: {
          startAt: Date.parse("2026-04-01T00:00:00.000Z"),
          endAt: Date.parse("2026-04-01T01:00:00.000Z"),
          startLocal: null,
          endLocal: null,
        },
        photoIds: ["photo-1"],
        photos: [],
      },
    ],
    recapDraft: {
      timeline: [],
      photoCount: 1,
      imageCount: 1,
    },
    localizedContent: undefined,
    publishedAt: "2026-04-02T00:00:00.000Z",
    createdAt: "2026-04-01T23:00:00.000Z",
    review: {
      status: "PENDING",
      approved: false,
    },
    contentStatus: "available",
    visibility: "public",
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

describe("loadAdminReviewWorkspaceData", () => {
  it("normalizes legacy metadata aliases and keeps detail lookup independent from the active filter", async () => {
    getAdminPublishedJourneysPage
      .mockResolvedValueOnce(
        createAdminPage(1, 2, [
          createAdminJourney({
            publicId: "pending-1",
            thumbnailUrl: "",
            metadata: {
              journeyTitle: "Legacy title",
              summary: "Legacy summary",
              thumbnailUri: "https://images.example.com/legacy.jpg",
            },
          }),
          createAdminJourney({
            publicId: "approved-1",
            journeyId: "journey-2",
            userId: "user-2",
            metadata: {
              title: "Approved title",
              description: "Approved description",
            },
            review: {
              status: "APPROVED",
              approved: true,
            },
          }),
        ]),
      )
      .mockResolvedValueOnce(
        createAdminPage(2, 2, [
          createAdminJourney({
            publicId: "rejected-1",
            journeyId: "journey-3",
            userId: "user-3",
            review: {
              status: "REJECTED",
              approved: false,
            },
          }),
        ]),
      );
    getAdminPublishedJourneyDetail.mockResolvedValueOnce(
      createAdminDetail({
        publicId: "approved-1",
        userId: "user-2",
        title: "Approved title",
        description: "Approved description",
        review: {
          status: "APPROVED",
          approved: true,
        },
      }),
    );

    const { loadAdminReviewWorkspaceData } = await loadAdminReviewsModule();
    const result = await loadAdminReviewWorkspaceData({
      accessToken: "admin-token",
      page: 1,
      status: "pending",
      limit: 20,
      publicId: "approved-1",
    });

    expect(getAdminPublishedJourneysPage).toHaveBeenCalledTimes(2);
    expect(result.queue.total).toBe(1);
    expect(result.queue.items).toHaveLength(1);
    expect(result.queue.items[0]).toMatchObject({
      publicId: "pending-1",
      title: "Legacy title",
      description: "Legacy summary",
      thumbnailUrl: "https://images.example.com/legacy.jpg",
    });
    expect(result.detail?.journey.publicId).toBe("approved-1");
    expect(result.detail?.journey.review.status).toBe("APPROVED");
    expect(result.detail?.evidence.loadedCount).toBe(1);
  });

  it("builds summary counts from the full dataset and paginates the filtered queue", async () => {
    getAdminPublishedJourneysPage
      .mockResolvedValueOnce(
        createAdminPage(1, 2, [
          createAdminJourney({
            publicId: "pending-1",
          }),
          createAdminJourney({
            publicId: "approved-1",
            review: {
              status: "APPROVED",
              approved: true,
            },
          }),
        ]),
      )
      .mockResolvedValueOnce(
        createAdminPage(2, 2, [
          createAdminJourney({
            publicId: "approved-2",
            journeyId: "journey-3",
            review: {
              status: "APPROVED",
              approved: true,
            },
          }),
          createAdminJourney({
            publicId: "rejected-1",
            journeyId: "journey-4",
            review: {
              status: "REJECTED",
              approved: false,
            },
          }),
        ]),
      );

    const { loadAdminReviewWorkspaceData } = await loadAdminReviewsModule();
    const result = await loadAdminReviewWorkspaceData({
      accessToken: "admin-token",
      page: 2,
      status: "approved",
      limit: 1,
    });

    expect(result.queue.summary).toEqual({
      pendingCount: 1,
      approvedCount: 2,
      rejectedCount: 1,
    });
    expect(result.queue.total).toBe(2);
    expect(result.queue.pages).toBe(2);
    expect(result.queue.page).toBe(2);
    expect(result.queue.items).toHaveLength(1);
    expect(result.queue.items[0]?.publicId).toBe("approved-2");
  });

  it("keeps photos that exist only in timeline media references and merges them into cluster evidence", async () => {
    getAdminPublishedJourneysPage.mockResolvedValueOnce(
      createAdminPage(1, 1, [
        createAdminJourney({
          publicId: "approved-1",
          review: {
            status: "APPROVED",
            approved: true,
          },
          photoCount: 3,
        }),
      ]),
    );
    getAdminPublishedJourneyDetail.mockResolvedValueOnce(
      createAdminDetail({
        publicId: "approved-1",
        photoCount: 3,
        images: [
          {
            photoId: "photo-1",
            url: "https://images.example.com/photo-1.jpg",
          },
        ],
        timeline: [
          {
            clusterId: "timeline-1",
            type: "STOP",
            locationName: "Seoul",
            impression: "Quiet afternoon",
            time: {
              startAt: Date.parse("2026-04-01T00:00:00.000Z"),
              endAt: Date.parse("2026-04-01T01:00:00.000Z"),
              startLocal: null,
              endLocal: null,
            },
            photoIds: ["photo-1", "photo-2"],
            photos: [
              {
                photoId: "photo-1",
                url: "https://images.example.com/photo-1.jpg",
                fullUrl: "https://images.example.com/photo-1.jpg",
                displayUrl: "https://images.example.com/variants/photo-1.display.webp",
                thumbnailUrl: "https://images.example.com/variants/photo-1.thumbnail.webp",
              },
              {
                photoId: "photo-2",
                url: "https://images.example.com/photo-2.jpg",
                fullUrl: "https://images.example.com/photo-2.jpg",
                displayUrl: "https://images.example.com/variants/photo-2.display.webp",
                thumbnailUrl: "https://images.example.com/variants/photo-2.thumbnail.webp",
              },
            ],
          },
        ],
        recapDraft: {
          timeline: [
            {
              clusterId: "timeline-1",
              type: "STOP",
              locationName: "Seoul",
              impression: "Quiet afternoon",
              time: {
                startAt: Date.parse("2026-04-01T00:00:00.000Z"),
                endAt: Date.parse("2026-04-01T01:00:00.000Z"),
                startLocal: null,
                endLocal: null,
              },
              photoIds: ["photo-1", "photo-2", "photo-3"],
              photos: [
                {
                  photoId: "photo-3",
                  url: "https://images.example.com/photo-3.jpg",
                },
              ],
            },
          ],
          photoCount: 3,
          imageCount: 3,
        },
      }),
    );

    const { loadAdminReviewWorkspaceData } = await loadAdminReviewsModule();
    const result = await loadAdminReviewWorkspaceData({
      accessToken: "admin-token",
      page: 1,
      status: "approved",
      limit: 20,
      publicId: "approved-1",
    });

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
      clusterId: "timeline-1",
      title: "Seoul",
      impression: "Quiet afternoon",
      photoCount: 3,
    });
  });

  it("adds a remaining-photos section for assets that are not attached to any cluster", async () => {
    getAdminPublishedJourneysPage.mockResolvedValueOnce(
      createAdminPage(1, 1, [
        createAdminJourney({
          publicId: "pending-1",
          photoCount: 2,
        }),
      ]),
    );
    getAdminPublishedJourneyDetail.mockResolvedValueOnce(
      createAdminDetail({
        publicId: "pending-1",
        photoCount: 2,
        images: [
          {
            photoId: "photo-1",
            url: "https://images.example.com/photo-1.jpg",
          },
          {
            photoId: "photo-2",
            url: "https://images.example.com/photo-2.jpg",
          },
        ],
        timeline: [
          {
            clusterId: "timeline-1",
            type: "STOP",
            locationName: "Busan",
            impression: "Harbor walk",
            time: {
              startAt: Date.parse("2026-04-01T00:00:00.000Z"),
              endAt: Date.parse("2026-04-01T01:00:00.000Z"),
              startLocal: null,
              endLocal: null,
            },
            photoIds: ["photo-1"],
            photos: [],
          },
        ],
      }),
    );

    const { loadAdminReviewWorkspaceData } = await loadAdminReviewsModule();
    const result = await loadAdminReviewWorkspaceData({
      accessToken: "admin-token",
      page: 1,
      status: "pending",
      limit: 20,
      publicId: "pending-1",
    });

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

  it("passes locale-tagged lang to admin detail and prefers detail moderation fields", async () => {
    getAdminPublishedJourneysPage.mockResolvedValueOnce(
      createAdminPage(1, 1, [
        createAdminJourney({
          publicId: "pending-1",
          review: {
            status: "PENDING",
            approved: false,
          },
          visibility: "public",
        }),
      ]),
    );
    getAdminPublishedJourneyDetail.mockResolvedValueOnce(
      createAdminDetail({
        publicId: "pending-1",
        title: "로컬라이즈된 제목",
        description: "로컬라이즈된 설명",
        review: {
          status: "REJECTED",
          approved: false,
        },
        visibility: "hidden",
        contentStatus: "review_rejected",
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
          clusterImpressions: [],
        },
      }),
    );

    const { loadAdminReviewWorkspaceData } = await loadAdminReviewsModule();
    const result = await loadAdminReviewWorkspaceData({
      accessToken: "admin-token",
      page: 1,
      status: "pending",
      limit: 20,
      publicId: "pending-1",
      lang: "ko",
    });

    expect(getAdminPublishedJourneyDetail).toHaveBeenCalledWith({
      accessToken: "admin-token",
      publicId: "pending-1",
      lang: "ko-KR",
    });
    expect(result.detail?.journey.review.status).toBe("REJECTED");
    expect(result.detail?.journey.visibility).toBe("hidden");
    expect(result.detail?.journey.contentStatus).toBe("review_rejected");
    expect(result.detail?.journey.requestedLocale).toBe("ko-KR");
    expect(result.detail?.journey.localizedContent?.entries[0]?.title).toBe(
      "로컬라이즈된 제목",
    );
  });

  it("returns null detail when the admin detail endpoint responds with 404", async () => {
    getAdminPublishedJourneysPage.mockResolvedValueOnce(
      createAdminPage(1, 1, [
        createAdminJourney({
          publicId: "missing-1",
        }),
      ]),
    );
    getAdminPublishedJourneyDetail.mockRejectedValueOnce(
      new BackendApiError("Not found", 404),
    );

    const { loadAdminReviewWorkspaceData } = await loadAdminReviewsModule();
    const result = await loadAdminReviewWorkspaceData({
      accessToken: "admin-token",
      page: 1,
      status: "pending",
      limit: 20,
      publicId: "missing-1",
    });

    expect(result.queue.items[0]?.publicId).toBe("missing-1");
    expect(result.detail).toBeNull();
  });
});
