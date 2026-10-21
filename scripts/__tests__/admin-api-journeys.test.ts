import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/src/configs/env.server", () => ({
  ENV: { API_BASE_URL: "https://api.test" },
}));

const fetchMock = vi.fn();

function okEnvelope(data: unknown) {
  return new Response(JSON.stringify({ status: "success", data }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
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
    fetchMock.mockResolvedValueOnce(
      okEnvelope({ journeys: [], total: 0, page: 1, pages: 1, limit: 1, hasMore: false }),
    );
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
});

describe("updateReviewStatus", () => {
  it("sends acceptUntranslated only when true", async () => {
    const result = {
      publicId: "p1",
      journeyId: "j1",
      published: true,
      visibility: "public",
      review: { status: "APPROVED", approved: true },
      updatedAt: "2026-10-21T00:00:00.000Z",
    };
    fetchMock
      .mockResolvedValueOnce(okEnvelope(result))
      .mockResolvedValueOnce(okEnvelope(result));
    const { updateReviewStatus } = await import("@/lib/api/journeys");

    await updateReviewStatus({
      accessToken: "t",
      publicId: "p1",
      status: "APPROVED",
      publishOperationId: "op-1",
      acceptUntranslated: true,
    });
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
