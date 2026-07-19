import "server-only";

import { unstable_cache } from "next/cache";
import { cache } from "react";
import { appendPublicApiLanguage, fetchPublicApi } from "@/lib/public-api";
import { languageList, type Language } from "@/lib/i18n/config";
import type {
  PublicArticleDetailDto,
  PublicArticleDetailResponseDto,
  PublicArticlesDataDto,
  PublicArticleListItemDto,
  PublicArticlesResponseDto,
} from "@/src/apis/core/client";
import {
  parseEditorialBody,
  type EditorialMarkdownBlock,
} from "./body";
import {
  type EditorialArticleListItem,
  type EditorialArticleCategory,
  type EditorialArticleRecord,
} from "./types";
import {
  normalizeEditorialArticleListItem,
  normalizeEditorialArticleRecord,
} from "./records";

// Backend public article list contract currently caps limit at 50.
const GUIDE_LIST_PAGE_SIZE = 50;
export const PUBLISHED_GUIDES_SITEMAP_TAG = "published-guides-sitemap";
const PUBLISHED_GUIDE_VARIANTS_CACHE_KEY = "published-guides-variants";
type PublishedGuideDetail = {
  article: EditorialArticleRecord;
  blocks: EditorialMarkdownBlock[];
};

export type PublishedGuideDetailResult =
  | {
      status: "success";
      data: PublishedGuideDetail;
    }
  | {
      status: "not_found" | "error";
      data: null;
    };

export type PublishedGuideSitemapEntry = {
  id: string;
  translationGroupId: string;
  language: Language;
  locale: string;
  slug: string;
  title: string;
  updatedAt: string;
  alternates: EditorialArticleRecord["alternates"];
  imageUrls: string[];
};

export type PublishedGuideVariantEntry = {
  language: Language;
  slug: string;
};

function normalizeListItem(
  item: PublicArticleListItemDto,
): EditorialArticleListItem | null {
  return normalizeEditorialArticleListItem(item);
}

function normalizeDetail(item: PublicArticleDetailDto): PublishedGuideDetail | null {
  const article = normalizeEditorialArticleRecord(item);

  if (!article) {
    return null;
  }

  const blocks = parseEditorialBody(article.body);

  return {
    article,
    blocks,
  };
}

const fetchPublicArticlesPage = cache(
  async function fetchPublicArticlesPage(
    page: number,
    language: Language | null,
    category: EditorialArticleCategory | null,
  ): Promise<PublicArticlesDataDto | null> {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(GUIDE_LIST_PAGE_SIZE),
    });

    if (language) {
      appendPublicApiLanguage(params, language);
    }

    if (category) {
      params.set("category", category);
    }

    const response = await fetchPublicApi(`/core/articles?${params.toString()}`, {
      next: {
        revalidate: 3600,
      },
    });

    if (!response || !response.ok) {
      return null;
    }

    const payload = (await response.json()) as PublicArticlesResponseDto;
    if (payload?.status !== "success" || !payload.data) {
      return null;
    }

    return payload.data;
  },
);

const listNormalizedArticles = cache(
  async function listNormalizedArticles(
    language: Language | null,
    strict = false,
    category: EditorialArticleCategory | null = null,
  ): Promise<EditorialArticleListItem[]> {
    const items: EditorialArticleListItem[] = [];
    const seenIds = new Set<string>();
    const firstPage = await fetchPublicArticlesPage(1, language, category);
    if (!firstPage) {
      if (strict) {
        throw new Error(
          `[editorial/public] Failed to fetch public article list page 1${language ? ` for ${language}` : ""}${category ? ` in ${category}` : ""}.`,
        );
      }

      return items;
    }

    const remainingPageNumbers = Array.from(
      { length: Math.max(0, (firstPage.pages ?? 1) - 1) },
      (_, index) => index + 2,
    );
    const remainingPages = remainingPageNumbers.length > 0
      ? await Promise.all(
          remainingPageNumbers.map((page) =>
            fetchPublicArticlesPage(page, language, category),
          ),
        )
      : [];

    for (const [index, payload] of [firstPage, ...remainingPages].entries()) {
      if (!payload) {
        if (strict) {
          const failedPage = index === 0 ? 1 : remainingPageNumbers[index - 1];

          throw new Error(
            `[editorial/public] Failed to fetch public article list page ${failedPage}${language ? ` for ${language}` : ""}${category ? ` in ${category}` : ""}.`,
          );
        }

        continue;
      }

      for (const item of payload.articles ?? []) {
        const normalized = normalizeListItem(item);
        if (!normalized || seenIds.has(normalized.id)) {
          continue;
        }

        seenIds.add(normalized.id);
        items.push(normalized);
      }
    }

    return items;
  },
);

const listAllLocalizedArticlesForSitemap = cache(
  async function listAllLocalizedArticlesForSitemap(): Promise<
    EditorialArticleListItem[]
  > {
    const localizedLists = await Promise.all(
      languageList.map((language) => listNormalizedArticles(language)),
    );
    const seenIds = new Set<string>();
    const items: EditorialArticleListItem[] = [];

    for (const localizedItems of localizedLists) {
      for (const item of localizedItems) {
        if (seenIds.has(item.id)) {
          continue;
        }

        seenIds.add(item.id);
        items.push(item);
      }
    }

    return items;
  },
);

const listPublishedGuideVariantsCached = unstable_cache(
  async function listPublishedGuideVariantsCached(): Promise<
    PublishedGuideVariantEntry[]
  > {
    const entries = await listAllLocalizedArticlesForSitemap();

    return entries.map((entry) => ({
      language: entry.language,
      slug: entry.slug,
    }));
  },
  [PUBLISHED_GUIDE_VARIANTS_CACHE_KEY],
  {
    revalidate: 3600,
    tags: [PUBLISHED_GUIDES_SITEMAP_TAG],
  },
);

export async function listPublishedGuideVariants(): Promise<
  PublishedGuideVariantEntry[]
> {
  return listPublishedGuideVariantsCached();
}

export async function listPublishedGuideCards(
  language: Language,
  options?: {
    strict?: boolean;
    category?: EditorialArticleCategory | null;
  },
): Promise<EditorialArticleListItem[]> {
  const items = await listNormalizedArticles(
    language,
    options?.strict === true,
    options?.category ?? null,
  );

  return items.filter((item) => item.language === language);
}

export const getPublishedGuideDetailResult = cache(async function getPublishedGuideDetailResult(
  slug: string,
  language: Language,
): Promise<PublishedGuideDetailResult> {
  const normalizedSlug = slug.trim();
  if (!normalizedSlug) {
    return {
      status: "not_found",
      data: null,
    };
  }

  const params = new URLSearchParams();
  appendPublicApiLanguage(params, language);
  const query = params.toString();
  const response = await fetchPublicApi(
    `/core/articles/${encodeURIComponent(normalizedSlug)}${query ? `?${query}` : ""}`,
    {
      next: {
        revalidate: 3600,
      },
    },
  );

  if (!response) {
    return {
      status: "error",
      data: null,
    };
  }

  if (response.status === 404) {
    return {
      status: "not_found",
      data: null,
    };
  }

  if (!response.ok) {
    return {
      status: "error",
      data: null,
    };
  }

  const payload = (await response.json()) as PublicArticleDetailResponseDto;
  if (payload?.status !== "success" || !payload.data) {
    return {
      status: "error",
      data: null,
    };
  }

  const detail = normalizeDetail(payload.data);
  if (!detail) {
    return {
      status: "error",
      data: null,
    };
  }

  return {
    status: "success",
    data: detail,
  };
});

export const getPublishedGuideDetail = cache(async function getPublishedGuideDetail(
  slug: string,
  language: Language,
): Promise<PublishedGuideDetail | null> {
  const result = await getPublishedGuideDetailResult(slug, language);

  return result.status === "success" ? result.data : null;
});

export async function listPublishedGuidesForSitemap(): Promise<
  PublishedGuideSitemapEntry[]
> {
  const entries = await listAllLocalizedArticlesForSitemap();
  const results = await Promise.allSettled(
    entries.map((entry) => getPublishedGuideDetail(entry.slug, entry.language)),
  );

  return results
    .map((result) => {
      if (result.status === "rejected" || !result.value) {
        return null;
      }

      const detail = result.value;

      return {
        id: detail.article.id,
        translationGroupId: detail.article.translationGroupId,
        language: detail.article.language,
        locale: detail.article.locale,
        slug: detail.article.slug,
        title: detail.article.title,
        updatedAt: detail.article.updatedAt,
        alternates: detail.article.alternates,
        imageUrls: detail.article.coverImage
          ? [detail.article.coverImage.url]
          : [],
      } satisfies PublishedGuideSitemapEntry;
    })
    .filter((entry): entry is PublishedGuideSitemapEntry => Boolean(entry));
}
