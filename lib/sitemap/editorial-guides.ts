import { listPublishedGuidesForSitemap } from "@/lib/editorial/public";
import { MAX_URLS_PER_SITEMAP } from "@/lib/sitemap/xml";
import type { PublishedGuideSitemapEntry } from "@/lib/editorial/public";
import { defaultLanguage, type Language } from "@/lib/i18n/config";

export type SitemapChunk<T> = {
  index: number;
  items: T[];
};

export type PublishedGuideSitemapVariant = {
  language: Language;
  slug: string;
};

function parseUpdatedAtTimestamp(value: string): number {
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : Number.NEGATIVE_INFINITY;
}

function buildPublishedGuideLocaleKey(
  guide: Pick<PublishedGuideSitemapEntry, "language" | "translationGroupId">,
): string {
  return `${guide.language}:${guide.translationGroupId}`;
}

function compareGuideTimestamps(
  left: Pick<PublishedGuideSitemapEntry, "updatedAt">,
  right: Pick<PublishedGuideSitemapEntry, "updatedAt">,
): number {
  return parseUpdatedAtTimestamp(left.updatedAt) - parseUpdatedAtTimestamp(right.updatedAt);
}

function mergeGuideImageUrls(guides: PublishedGuideSitemapEntry[]): string[] {
  const imageUrls = new Set<string>();

  for (const guide of guides) {
    for (const imageUrl of guide.imageUrls) {
      imageUrls.add(imageUrl);
    }
  }

  return [...imageUrls];
}

function selectSitemapRepresentativeGuide(
  guides: PublishedGuideSitemapEntry[],
): PublishedGuideSitemapEntry {
  const defaultLanguageGuide = guides.find(
    (guide) => guide.language === defaultLanguage,
  );

  if (defaultLanguageGuide) {
    return defaultLanguageGuide;
  }

  return [...guides].sort((left, right) => {
    const byUpdated = compareGuideTimestamps(right, left);

    if (byUpdated !== 0) {
      return byUpdated;
    }

    return left.language.localeCompare(right.language);
  })[0]!;
}

type PublishedGuideVariantKeyInput = {
  language: Language;
  slug: string;
};

function buildPublishedGuideVariantKey(language: Language, slug: string): string {
  return `${language}:${slug}`;
}

export function buildPublishedGuideVariantSet(
  guides: PublishedGuideVariantKeyInput[],
): Set<string> {
  return new Set(
    guides.map((guide) => buildPublishedGuideVariantKey(guide.language, guide.slug)),
  );
}

export function filterPublishedGuideAlternates<T extends PublishedGuideVariantKeyInput>(
  alternates: T[],
  publishedVariants: ReadonlySet<string>,
  current: PublishedGuideVariantKeyInput,
): T[] {
  const currentKey = buildPublishedGuideVariantKey(current.language, current.slug);

  return alternates.filter((alternate) => {
    const alternateKey = buildPublishedGuideVariantKey(
      alternate.language,
      alternate.slug,
    );

    return alternateKey !== currentKey && publishedVariants.has(alternateKey);
  });
}

export function filterPublishedGuideSitemapEntries(
  guides: PublishedGuideSitemapEntry[],
): PublishedGuideSitemapEntry[] {
  const dedupedGuides = new Map<string, PublishedGuideSitemapEntry>();

  for (const guide of guides) {
    const key = buildPublishedGuideLocaleKey(guide);
    const existing = dedupedGuides.get(key);

    if (!existing) {
      dedupedGuides.set(key, guide);
      continue;
    }

    if (compareGuideTimestamps(guide, existing) > 0) {
      dedupedGuides.set(key, guide);
    }
  }

  const guidesByTranslationGroup = new Map<string, PublishedGuideSitemapEntry[]>();

  for (const guide of dedupedGuides.values()) {
    const groupedGuides = guidesByTranslationGroup.get(guide.translationGroupId) ?? [];
    groupedGuides.push(guide);
    guidesByTranslationGroup.set(guide.translationGroupId, groupedGuides);
  }

  return [...guidesByTranslationGroup.values()].map((groupedGuides) => {
    const representative = selectSitemapRepresentativeGuide(groupedGuides);
    const updatedAt = groupedGuides.reduce((latest, guide) => (
      compareGuideTimestamps(guide, { updatedAt: latest }) > 0
        ? guide.updatedAt
        : latest
    ), representative.updatedAt);

    return {
      ...representative,
      updatedAt,
      alternates: groupedGuides
        .filter((guide) => guide.id !== representative.id)
        .map((guide) => ({
          language: guide.language,
          locale: guide.locale,
          slug: guide.slug,
          title: guide.title,
        })),
      imageUrls: mergeGuideImageUrls(groupedGuides),
    };
  });
}

export function buildPublishedGuideSitemapVariants(
  guide: PublishedGuideSitemapEntry,
): PublishedGuideSitemapVariant[] {
  const variants: PublishedGuideSitemapVariant[] = [];
  const seen = new Set<string>();

  const appendVariant = (language: Language, slug: string) => {
    const key = `${language}:${slug}`;
    if (seen.has(key)) {
      return;
    }

    seen.add(key);
    variants.push({ language, slug });
  };

  appendVariant(guide.language, guide.slug);

  for (const alternate of guide.alternates) {
    appendVariant(alternate.language, alternate.slug);
  }

  return variants;
}

function countGuideLocalizedUrls(guide: PublishedGuideSitemapEntry): number {
  return buildPublishedGuideSitemapVariants(guide).length;
}

function chunkGuidesByLocalizedUrlCount(
  guides: PublishedGuideSitemapEntry[],
  maxUrlsPerChunk: number,
): PublishedGuideSitemapEntry[][] {
  const safeLimit = Math.max(1, Math.floor(maxUrlsPerChunk));
  const chunks: PublishedGuideSitemapEntry[][] = [];
  let currentChunk: PublishedGuideSitemapEntry[] = [];
  let currentUrlCount = 0;

  for (const guide of guides) {
    const localizedUrlCount = countGuideLocalizedUrls(guide);

    if (localizedUrlCount > safeLimit) {
      throw new Error(
        `Guide ${guide.id} requires ${localizedUrlCount} sitemap URLs, exceeding chunk limit ${safeLimit}.`,
      );
    }

    if (
      currentChunk.length > 0 &&
      currentUrlCount + localizedUrlCount > safeLimit
    ) {
      chunks.push(currentChunk);
      currentChunk = [];
      currentUrlCount = 0;
    }

    currentChunk.push(guide);
    currentUrlCount += localizedUrlCount;
  }

  if (currentChunk.length > 0) {
    chunks.push(currentChunk);
  }

  return chunks;
}

export async function fetchPublishedGuideSitemapChunks(): Promise<
  SitemapChunk<PublishedGuideSitemapEntry>[]
> {
  const guides = filterPublishedGuideSitemapEntries(
    await listPublishedGuidesForSitemap(),
  );

  return chunkGuidesByLocalizedUrlCount(guides, MAX_URLS_PER_SITEMAP).map((items, index) => ({
    index: index + 1,
    items,
  }));
}

export async function fetchPublishedGuideSitemapPartParams(): Promise<
  Array<{ part: string }>
> {
  const chunks = await fetchPublishedGuideSitemapChunks();

  return chunks.map((chunk) => ({
    part: `${chunk.index}.xml`,
  }));
}
