import { unstable_cache } from "next/cache";
import { languageList } from "@/lib/i18n/config";
import { normalizePublicImageUrl } from "@/lib/public-image-url";
import type { PublishedJourneyListItemApi } from "@/lib/published-journey";
import {
  fetchPublishedJourney,
  fetchPublishedJourneys,
} from "@/lib/published-journey";
import { MAX_URLS_PER_SITEMAP } from "@/lib/sitemap/xml";

const DEFAULT_JOURNEY_PAGE_LIMIT = 50;
const LOCALIZED_URLS_PER_RESOURCE = languageList.length;
const SITEMAP_REVALIDATE_SECONDS = 3600;
const JOURNEY_DETAIL_SITEMAP_FETCH_BATCH_SIZE = 10;
export const PUBLISHED_JOURNEYS_SITEMAP_TAG = "published-journeys-sitemap";
const PUBLISHED_JOURNEY_STATIC_PARAMS_CACHE_KEY = "published-journeys-static-params";

export const MAX_RESOURCES_PER_SITEMAP = Math.max(
  1,
  Math.floor(MAX_URLS_PER_SITEMAP / LOCALIZED_URLS_PER_RESOURCE),
);

export type SitemapChunk<T> = {
  index: number;
  items: T[];
};

function chunkItems<T>(items: T[], size: number): T[][] {
  const safeSize = Math.max(1, Math.floor(size));
  const chunks: T[][] = [];

  for (let index = 0; index < items.length; index += safeSize) {
    chunks.push(items.slice(index, index + safeSize));
  }

  return chunks;
}

function buildSitemapChunks<T>(items: T[], size: number): SitemapChunk<T>[] {
  return chunkItems(items, size).map((chunk, index) => ({
    index: index + 1,
    items: chunk,
  }));
}

function resolveListAvailabilityProjection(
  journey: PublishedJourneyListItemApi,
): boolean | null {
  if (journey.contentStatus && journey.contentStatus !== "available") {
    return false;
  }

  if (journey.reviewApproved === false) {
    return false;
  }

  if (journey.reviewStatus && journey.reviewStatus !== "APPROVED") {
    return false;
  }

  if (
    journey.contentStatus === "available" &&
    (journey.reviewApproved === true || journey.reviewStatus === "APPROVED")
  ) {
    return true;
  }

  return null;
}

async function filterUnavailableJourneys(
  journeys: PublishedJourneyListItemApi[],
): Promise<PublishedJourneyListItemApi[]> {
  const availableJourneys: Array<PublishedJourneyListItemApi | null> =
    journeys.map(() => null);
  const journeysRequiringDetailCheck: Array<{
    index: number;
    journey: PublishedJourneyListItemApi;
  }> = [];

  for (const [index, journey] of journeys.entries()) {
    const projectedAvailability = resolveListAvailabilityProjection(journey);

    if (projectedAvailability === true) {
      availableJourneys[index] = journey;
      continue;
    }

    if (projectedAvailability === false) {
      continue;
    }

    journeysRequiringDetailCheck.push({ index, journey });
  }

  for (
    let index = 0;
    index < journeysRequiringDetailCheck.length;
    index += JOURNEY_DETAIL_SITEMAP_FETCH_BATCH_SIZE
  ) {
    const batch = journeysRequiringDetailCheck.slice(
      index,
      index + JOURNEY_DETAIL_SITEMAP_FETCH_BATCH_SIZE,
    );
    const details = await Promise.all(
      batch.map((entry) => fetchPublishedJourney(entry.journey.publicId)),
    );

    for (const [detailIndex, detail] of details.entries()) {
      if (!detail) {
        continue;
      }

      const entry = batch[detailIndex];
      if (entry) {
        availableJourneys[entry.index] = entry.journey;
      }
    }
  }

  return availableJourneys.filter(
    (journey): journey is PublishedJourneyListItemApi => Boolean(journey),
  );
}

async function collectPublishedJourneyListItems(): Promise<
  PublishedJourneyListItemApi[]
> {
  const journeys: PublishedJourneyListItemApi[] = [];
  const seen = new Set<string>();
  const appendJourneys = (items: PublishedJourneyListItemApi[] | undefined) => {
    for (const journey of items ?? []) {
      if (!journey.publicId || seen.has(journey.publicId)) {
        continue;
      }

      seen.add(journey.publicId);
      const seoImages = (journey.seoImages ?? [])
        .map((image) => ({
          ...image,
          url: normalizePublicImageUrl(image.url) ?? image.url,
        }))
        .filter((image) => Boolean(image.url));
      journeys.push({
        ...journey,
        thumbnailUrl:
          normalizePublicImageUrl(journey.thumbnailUrl) ?? journey.thumbnailUrl,
        ...(seoImages.length > 0 ? { seoImages } : {}),
      });
    }
  };

  const firstPage = await fetchPublishedJourneys({
    page: 1,
    limit: DEFAULT_JOURNEY_PAGE_LIMIT,
    sort: "recent",
  });

  if (!firstPage) {
    return journeys;
  }

  appendJourneys(firstPage.journeys);

  const totalPages = firstPage.pages;
  if (typeof totalPages === "number" && totalPages > 1) {
    const remainingPageNumbers = Array.from(
      { length: totalPages - 1 },
      (_, index) => index + 2,
    );
    const remainingPages = await Promise.all(
      remainingPageNumbers.map((page) =>
        fetchPublishedJourneys({
          page,
          limit: DEFAULT_JOURNEY_PAGE_LIMIT,
          sort: "recent",
        })
      ),
    );

    for (const response of remainingPages) {
      if (!response) {
        continue;
      }

      appendJourneys(response.journeys);
    }

    return journeys;
  }

  for (let page = 2; firstPage.hasMore; page += 1) {
    const response = await fetchPublishedJourneys({
      page,
      limit: DEFAULT_JOURNEY_PAGE_LIMIT,
      sort: "recent",
    });

    if (!response) {
      break;
    }

    appendJourneys(response.journeys);

    if (!response.hasMore) {
      break;
    }
  }

  return journeys;
}

const fetchPublishedJourneyStaticParamsCached = unstable_cache(
  async function fetchPublishedJourneyStaticParamsCached(): Promise<
    PublishedJourneyListItemApi[]
  > {
    return collectPublishedJourneyListItems();
  },
  [PUBLISHED_JOURNEY_STATIC_PARAMS_CACHE_KEY],
  {
    revalidate: SITEMAP_REVALIDATE_SECONDS,
    tags: [PUBLISHED_JOURNEYS_SITEMAP_TAG],
  },
);

const fetchAllPublishedJourneysForSitemapCached = unstable_cache(
  async function fetchAllPublishedJourneysForSitemapCached(): Promise<PublishedJourneyListItemApi[]> {
    const journeys = await collectPublishedJourneyListItems();

    return filterUnavailableJourneys(journeys);
  },
  [PUBLISHED_JOURNEYS_SITEMAP_TAG],
  {
    revalidate: SITEMAP_REVALIDATE_SECONDS,
    tags: [PUBLISHED_JOURNEYS_SITEMAP_TAG],
  },
);

export async function fetchAllPublishedJourneysForSitemap(): Promise<
  PublishedJourneyListItemApi[]
> {
  return fetchAllPublishedJourneysForSitemapCached();
}

export async function fetchPublishedJourneyStaticParams(): Promise<
  PublishedJourneyListItemApi[]
> {
  return fetchPublishedJourneyStaticParamsCached();
}

export async function fetchPublishedJourneySitemapChunks(): Promise<
  SitemapChunk<PublishedJourneyListItemApi>[]
> {
  const journeys = await fetchAllPublishedJourneysForSitemap();
  return buildSitemapChunks(journeys, MAX_RESOURCES_PER_SITEMAP);
}

export async function fetchPublishedJourneySitemapPartParams(): Promise<
  Array<{ part: string }>
> {
  const chunks = await fetchPublishedJourneySitemapChunks();

  return chunks.map((chunk) => ({
    part: `${chunk.index}.xml`,
  }));
}
