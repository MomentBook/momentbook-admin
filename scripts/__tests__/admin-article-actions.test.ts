import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const redirect = vi.fn((href: string) => {
  throw new Error(`REDIRECT:${href}`);
});
const cookies = vi.fn();
const requireAdminActionSession = vi.fn();
const createAdminArticle = vi.fn();
const updateAdminArticle = vi.fn();
const deleteAdminArticle = vi.fn();
const loadAdminEditorialArticle = vi.fn();

vi.mock("next/headers", () => ({
  cookies,
}));

vi.mock("next/navigation", () => ({
  redirect,
}));

vi.mock("next/dist/client/components/redirect-error", () => ({
  isRedirectError: (error: unknown) =>
    error instanceof Error && error.message.startsWith("REDIRECT:"),
}));

vi.mock("@/lib/admin/session", () => ({
  requireAdminActionSession,
}));

vi.mock("@/lib/admin/api", () => ({
  BackendApiError: class BackendApiError extends Error {
    statusCode: number;

    constructor(message: string, statusCode: number) {
      super(message);
      this.statusCode = statusCode;
    }
  },
  createAdminArticle,
  deleteAdminArticle,
  updateAdminArticle,
}));

vi.mock("@/lib/editorial/admin", () => ({
  loadAdminEditorialArticle,
}));

async function loadArticleActionsModule() {
  return import("@/app/articles/actions");
}

afterEach(() => {
  vi.clearAllMocks();
  vi.resetModules();
});

describe("createEditorialArticleAction", () => {
  it("redirects to the success banner after creating an article", async () => {
    cookies.mockResolvedValue(new Map());
    requireAdminActionSession.mockResolvedValue({
      accessToken: "admin-access-token",
    });
    createAdminArticle.mockResolvedValue({
      articleId: "article-123",
      slug: "fresh-guide",
    });
    loadAdminEditorialArticle.mockResolvedValue({
      id: "article-123",
      translationGroupId: "group-1",
      language: "en",
      locale: "en-US",
      category: "travel-guide",
      slug: "fresh-guide",
      title: "Fresh guide",
      summary: "Summary",
      body: "# Fresh guide",
      coverImage: null,
      readingMinutes: 3,
      authorName: "MomentBook Editorial",
      alternates: [],
      publishedAt: "2026-04-18T00:00:00.000Z",
      updatedAt: "2026-04-18T00:00:00.000Z",
    });

    const { createEditorialArticleAction } = await loadArticleActionsModule();
    const formData = new FormData();
    formData.set("language", "en");
    formData.set("category", "travel-guide");
    formData.set("title", "Fresh guide");
    formData.set("body", "# Fresh guide");

    await expect(createEditorialArticleAction(formData)).rejects.toThrow(
      "REDIRECT:/articles/article-123?mutation=article_created&articleSlug=fresh-guide",
    );
  });
});

describe("updateEditorialArticleAction", () => {
  it("sends only mutable article fields to the update API", async () => {
    cookies.mockResolvedValue(new Map());
    requireAdminActionSession.mockResolvedValue({
      accessToken: "admin-access-token",
    });
    const article = {
      id: "article-123",
      translationGroupId: "group-1",
      language: "en",
      locale: "en-US",
      category: "travel-guide",
      slug: "fresh-guide",
      title: "Fresh guide",
      summary: "Summary",
      body: "# Fresh guide",
      coverImage: null,
      readingMinutes: 3,
      authorName: "MomentBook Editorial",
      alternates: [],
      publishedAt: "2026-04-18T00:00:00.000Z",
      updatedAt: "2026-04-18T00:00:00.000Z",
    };
    loadAdminEditorialArticle.mockResolvedValue(article);
    updateAdminArticle.mockResolvedValue({
      articleId: "article-123",
      slug: "fresh-guide",
    });

    const { updateEditorialArticleAction } = await loadArticleActionsModule();
    const formData = new FormData();
    formData.set("articleId", "article-123");
    formData.set("language", "ko");
    formData.set("slug", "tampered-slug");
    formData.set("translationGroupId", "tampered-group");
    formData.set("category", "wellbeing-guide");
    formData.set("title", "Fresh guide updated");
    formData.set("body", "# Fresh guide updated");

    await expect(updateEditorialArticleAction(formData)).rejects.toThrow(
      "REDIRECT:/articles/article-123?mutation=article_updated&articleSlug=fresh-guide",
    );

    expect(updateAdminArticle).toHaveBeenCalledWith({
      accessToken: "admin-access-token",
      articleId: "article-123",
      article: {
        category: "wellbeing-guide",
        title: "Fresh guide updated",
        body: "# Fresh guide updated",
      },
    });
  });
});
