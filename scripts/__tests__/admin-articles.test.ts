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
  return { url, method: init?.method, body: init?.body ? JSON.parse(init.body as string) : undefined };
}

/** A v3 `AdminArticleSummaryDto`. */
function summary(overrides: Record<string, unknown> = {}) {
  return {
    articleId: "art-1",
    language: "ko",
    locale: "ko-KR",
    category: "DESTINATION_GUIDE",
    slug: "seoul-walks",
    title: "Seoul walks",
    summary: "Three walks",
    coverImage: null,
    readingTimeMinutes: 4,
    authorName: "MomentBook Editorial",
    publishedAt: "2026-10-01T00:00:00.000Z",
    updatedAt: "2026-10-02T00:00:00.000Z",
    translationGroupId: "group-1",
    ...overrides,
  };
}

beforeEach(() => {
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
  vi.resetModules();
});

describe("article services", () => {
  it("lists with the language filter and the v3 category enum", async () => {
    fetchMock.mockResolvedValueOnce(ok({ items: [summary()], total: 21, page: 1, limit: 20 }));
    const { listAdminArticles } = await import("@/lib/api/articles");

    const list = await listAdminArticles({
      accessToken: "t",
      page: 1,
      limit: 20,
      language: "ko",
      category: "travel-guide",
    });

    expect(call().url).toBe(
      "https://api.test/core/admin/articles?page=1&limit=20&language=ko&category=TRAVEL_GUIDE",
    );
    expect(list).toEqual({
      items: [summary()],
      total: 21,
      page: 1,
      limit: 20,
      pages: 2,
      hasMore: true,
    });
  });

  it("sends the v3 category enum when creating and updating", async () => {
    fetchMock.mockImplementation(async () => ok({ articleId: "art-1" }));
    const { createAdminArticle, updateAdminArticle } = await import("@/lib/api/articles");

    await createAdminArticle({
      accessToken: "t",
      article: { language: "en", category: "festival", title: "T", body: "B" },
    });
    await updateAdminArticle({
      accessToken: "t",
      articleId: "art-1",
      article: { category: "wellbeing-guide", title: "T2" },
    });
    await updateAdminArticle({ accessToken: "t", articleId: "art-1", article: { body: "B2" } });

    expect(call(0)).toMatchObject({
      url: "https://api.test/core/admin/articles",
      method: "POST",
      body: { language: "en", category: "FESTIVAL", title: "T", body: "B" },
    });
    expect(call(1)).toMatchObject({
      url: "https://api.test/core/admin/articles/art-1",
      method: "PATCH",
      body: { category: "WELLBEING_GUIDE", title: "T2" },
    });
    expect(call(2).body).toEqual({ body: "B2" });
  });

  it("returns the bare detail and deletion bodies", async () => {
    const detail = { ...summary(), body: "Body", alternates: [] };
    fetchMock
      .mockResolvedValueOnce(ok(detail))
      .mockResolvedValueOnce(ok({ articleId: "art-1", deleted: true }));
    const { deleteAdminArticle, getAdminArticle } = await import("@/lib/api/articles");

    await expect(getAdminArticle({ accessToken: "t", articleId: "art-1" })).resolves.toEqual(detail);
    await expect(deleteAdminArticle({ accessToken: "t", articleId: "art-1" })).resolves.toEqual({
      articleId: "art-1",
      deleted: true,
    });
    expect(call(1)).toMatchObject({ method: "DELETE" });
  });
});

describe("article loaders", () => {
  it("the dashboard reads v3 items and shows the editorial category", async () => {
    fetchMock.mockResolvedValueOnce(
      ok({ items: [summary(), summary({ articleId: "art-2", category: "FESTIVAL" })], total: 2, page: 1, limit: 20 }),
    );
    const { loadAdminEditorialArticleDashboard } = await import("@/lib/editorial/admin");

    const dashboard = await loadAdminEditorialArticleDashboard({
      accessToken: "t",
      page: 1,
      limit: 20,
      language: "ko",
      category: "destination-guide",
    });

    expect(call().url).toBe(
      "https://api.test/core/admin/articles?page=1&limit=20&language=ko&category=DESTINATION_GUIDE",
    );
    expect(dashboard).toMatchObject({ page: 1, pages: 1, total: 2, language: "ko" });
    expect(dashboard.items.map((item) => [item.id, item.category])).toEqual([
      ["art-1", "destination-guide"],
      ["art-2", "festival"],
    ]);
  });

  it("an article record keeps its editorial category", async () => {
    fetchMock.mockResolvedValueOnce(
      ok({ ...summary({ category: "WELLBEING_GUIDE" }), body: "Body", alternates: [] }),
    );
    const { loadAdminEditorialArticle } = await import("@/lib/editorial/admin");

    const record = await loadAdminEditorialArticle({ accessToken: "t", articleId: "art-1" });

    expect(record).toMatchObject({
      id: "art-1",
      translationGroupId: "group-1",
      category: "wellbeing-guide",
      body: "Body",
    });
  });
});
