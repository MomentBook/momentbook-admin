import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/src/configs/env.server", () => ({
  ENV: { API_BASE_URL: "https://api.test" },
}));

const fetchMock = vi.fn();

function ok(body: unknown) {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

function call(index = 0) {
  const [url, init] = fetchMock.mock.calls[index] ?? [];
  return { url, headers: (init?.headers ?? {}) as Record<string, string> };
}

beforeEach(() => {
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
  vi.resetModules();
});

describe("listPublishedJourneys", () => {
  it("sends filter flags", async () => {
    fetchMock.mockResolvedValueOnce(ok({ items: [], total: 0, page: 1, limit: 1 }));
    const { listPublishedJourneys } = await import("@/lib/api/journeys");

    await listPublishedJourneys({
      accessToken: "t",
      page: 1,
      limit: 1,
      localizationPending: true,
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0]?.[0]).toBe(
      "https://api.test/core/admin/journeys/publish?page=1&limit=1&localizationPending=true",
    );
  });

  it("returns the v3 page with the derived pages and hasMore", async () => {
    fetchMock.mockResolvedValueOnce(
      ok({ items: [{ publicId: "p1" }], total: 120, page: 2, limit: 50 }),
    );
    const { listPublishedJourneys } = await import("@/lib/api/journeys");

    await expect(listPublishedJourneys({ accessToken: "t", page: 2, limit: 50 })).resolves.toEqual({
      items: [{ publicId: "p1" }],
      total: 120,
      page: 2,
      limit: 50,
      pages: 3,
      hasMore: true,
    });
  });
});

describe("getPublishedJourneyDetail", () => {
  it("asks for the language in Accept-Language and sends no lang query", async () => {
    const detail = { publicId: "p1", moments: [] };
    fetchMock.mockResolvedValueOnce(ok(detail));
    const { getPublishedJourneyDetail } = await import("@/lib/api/journeys");

    await expect(
      getPublishedJourneyDetail({ accessToken: "t", publicId: "p 1", lang: "ko-KR" }),
    ).resolves.toEqual(detail);

    expect(call().url).toBe("https://api.test/core/admin/journeys/publish/p%201");
    expect(call().headers).toMatchObject({ "Accept-Language": "ko-KR" });
  });

  it("sends no Accept-Language without a language", async () => {
    fetchMock.mockResolvedValueOnce(ok({ publicId: "p1" }));
    const { getPublishedJourneyDetail } = await import("@/lib/api/journeys");

    await getPublishedJourneyDetail({ accessToken: "t", publicId: "p1" });

    expect(call().url).toBe("https://api.test/core/admin/journeys/publish/p1");
    expect(call().headers).not.toHaveProperty("Accept-Language");
  });
});

describe("requeueJourneyReview", () => {
  it("posts with no body", async () => {
    fetchMock.mockResolvedValueOnce(ok({ dispatched: ["LOCALIZATION"] }));
    const { requeueJourneyReview } = await import("@/lib/api/journeys");

    await requeueJourneyReview({ accessToken: "t", publicId: "p1" });

    expect(fetchMock.mock.calls[0]?.[0]).toBe(
      "https://api.test/core/admin/journeys/publish/p1/review/requeue",
    );
    expect(fetchMock.mock.calls[0]?.[1]).toMatchObject({ method: "POST" });
    expect(fetchMock.mock.calls[0]?.[1]).not.toHaveProperty("body");
  });
});

describe("updateReviewStatus", () => {
  it("sends acceptUntranslated only when true", async () => {
    const result = {
      publicId: "p1",
      journeyId: "j1",
      published: true,
      visibility: "PUBLIC",
      review: {
        status: "APPROVED",
        approved: true,
        localizationPending: false,
        decidedBy: "ADMIN",
        decidedAt: "2026-10-21T00:00:00.000Z",
        enqueueFailed: false,
      },
      updatedAt: "2026-10-21T00:00:00.000Z",
    };
    fetchMock.mockResolvedValueOnce(ok(result)).mockResolvedValueOnce(ok(result));
    const { updateReviewStatus } = await import("@/lib/api/journeys");

    await expect(
      updateReviewStatus({
        accessToken: "t",
        publicId: "p1",
        status: "APPROVED",
        publishOperationId: "op-1",
        acceptUntranslated: true,
      }),
    ).resolves.toEqual(result);
    await updateReviewStatus({
      accessToken: "t",
      publicId: "p1",
      status: "APPROVED",
      publishOperationId: "op-1",
      acceptUntranslated: false,
    });

    expect(fetchMock.mock.calls[0]?.[1]?.body).toBe(
      '{"status":"APPROVED","publishOperationId":"op-1","acceptUntranslated":true}',
    );
    expect(JSON.parse(fetchMock.mock.calls[1]?.[1]?.body as string)).not.toHaveProperty(
      "acceptUntranslated",
    );
  });
});
