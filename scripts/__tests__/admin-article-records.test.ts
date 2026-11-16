import { describe, expect, it } from "vitest";

import { normalizeEditorialArticleListItem } from "@/entities/article/records";

const LISTED_ARTICLE = {
  articleId: "article-1",
  translationGroupId: "group-1",
  language: "en",
  locale: "en-US",
  category: "TRAVEL_GUIDE",
  slug: "kyoto-in-autumn",
  title: "Kyoto in autumn",
  summary: "Where the maples turn first.",
  publishedAt: "2026-11-01T00:00:00.000Z",
  updatedAt: "2026-11-02T00:00:00.000Z",
};

describe("normalizeEditorialArticleListItem", () => {
  it("keeps an article whose summary is empty", () => {
    const item = normalizeEditorialArticleListItem({ ...LISTED_ARTICLE, summary: "" });

    expect(item).not.toBeNull();
    expect(item?.summary).toBe("");
  });

  it("keeps an article whose updatedAt is missing", () => {
    const item = normalizeEditorialArticleListItem({ ...LISTED_ARTICLE, updatedAt: undefined });

    expect(item).not.toBeNull();
    expect(item?.updatedAt).toBe(LISTED_ARTICLE.publishedAt);
  });

  it("keeps the summary text as the backend sent it", () => {
    const summary = "더 매끄럽고 더 풍부한 여행을 위한 핵심 여행 팁 좋은 여행은 계획에서 시작한다";
    const item = normalizeEditorialArticleListItem({ ...LISTED_ARTICLE, summary });

    expect(item?.summary).toBe(summary);
  });
});
