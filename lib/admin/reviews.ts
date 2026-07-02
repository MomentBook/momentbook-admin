import "server-only";

import {
  BackendApiError,
  getAdminPublishedJourneyDetail,
  getAdminPublishedJourneysPage,
} from "@/lib/admin/api";
import {
  normalizeCaptureTimeContext,
  normalizeLocalDateTimeContext,
  type CaptureTimeContext,
  type LocalDateTimeContext,
} from "@/lib/local-time-context";
import { type Language, toLocaleTag } from "@/lib/i18n/config";
import { readText, resolveJourneyListCoverUrl } from "@/lib/view-helpers";
import type {
  AdminPublishedJourneyItemDto,
  PublishedJourneyDetailDto,
  PublishedJourneyImageDto,
  PublishedJourneyLocalizedContentDto,
  PublishedJourneyLocalizationEntryDto,
  PublishedJourneyClusterLocalizedImpressionsDto,
  PublishedJourneyClusterLocalizationEntryDto,
  PublishedJourneyReviewDto,
} from "@/src/apis/client";

export const ADMIN_REVIEW_PAGE_SIZE = 20;
const ADMIN_REVIEW_API_PAGE_LIMIT = 50;

export type AdminReviewStatus = PublishedJourneyReviewDto["status"];
export type AdminReviewContentStatus = PublishedJourneyDetailDto["contentStatus"];
export type AdminReviewVisibility = PublishedJourneyDetailDto["visibility"];
export type AdminReviewQueueStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "all";

export type AdminReviewState = {
  status: AdminReviewStatus;
  approved: boolean;
};

export type AdminReviewSummary = {
  pendingCount: number;
  approvedCount: number;
  rejectedCount: number;
};

export type AdminReviewQueueItem = {
  publicId: string;
  journeyId: string;
  userId: string;
  title: string | null;
  description: string | null;
  thumbnailUrl: string | null;
  photoCount: number;
  createdAt: string;
  publishedAt: string | null;
  published: boolean;
  visibility: "public" | "hidden";
  review: AdminReviewState;
  startedAt: number;
  endedAt: number | null;
  startedAtLocal: LocalDateTimeContext | null;
  endedAtLocal: LocalDateTimeContext | null;
  recapStage: "NONE" | "FINALIZED";
};

export type AdminReviewQueueData = {
  summary: AdminReviewSummary;
  items: AdminReviewQueueItem[];
  total: number;
  page: number;
  pages: number;
  limit: number;
  status: AdminReviewQueueStatus;
};

export type AdminOverviewWeeklyIntake = {
  key: string;
  label: string;
  count: number;
};

export type AdminOverviewData = {
  totalCount: number;
  pendingCount: number;
  reviewedCount: number;
  approvedCount: number;
  rejectedCount: number;
  approvalRate: number | null;
  rejectionRate: number | null;
  latestSubmissionAt: string | null;
  oldestPendingAt: string | null;
  recentIntake: {
    totalCount: number;
    maxCount: number;
    weeks: AdminOverviewWeeklyIntake[];
  };
};

export type AdminReviewLocalizedEntry = {
  locale: string;
  languageCode: string;
  countryCode: string;
  languageName: string;
  title: string | null;
  description: string | null;
  hashtags: string[];
};

export type AdminReviewLocalizedClusterTranslation = {
  locale: string;
  languageCode: string;
  countryCode: string;
  languageName: string;
  impression: string | null;
};

export type AdminReviewLocalizedClusterImpressions = {
  clusterId: string;
  translations: AdminReviewLocalizedClusterTranslation[];
};

export type AdminReviewLocalizedContent = {
  sourceLanguage: string;
  generatedAt: string;
  entries: AdminReviewLocalizedEntry[];
  clusterImpressions: AdminReviewLocalizedClusterImpressions[];
};

export type AdminReviewJourney = {
  publicId: string;
  journeyId: string | null;
  userId: string;
  authorName: string | null;
  title: string | null;
  description: string | null;
  shareUrl: string | null;
  createdAt: string;
  publishedAt: string | null;
  startedAt: number;
  endedAt: number | null;
  startedAtLocal: LocalDateTimeContext | null;
  endedAtLocal: LocalDateTimeContext | null;
  visibility: AdminReviewVisibility;
  review: AdminReviewState;
  contentStatus: AdminReviewContentStatus;
  notice: string | null;
  localizedContent: AdminReviewLocalizedContent | null;
  requestedLocale: string | null;
};

export type AdminReviewDetail = {
  journey: AdminReviewJourney;
  evidence: AdminReviewEvidence;
};

export type AdminReviewPhoto = {
  key: string;
  photoId: string | null;
  url: string;
  fullUrl: string;
  displayUrl: string;
  thumbnailUrl: string;
  width: number | null;
  height: number | null;
  takenAt: number | null;
  captureTime: CaptureTimeContext | null;
  locationName: string | null;
};

export type AdminReviewEvidenceSection = {
  key: string;
  kind: "cluster" | "remaining";
  clusterId: string | null;
  type: "STOP" | "MOVE" | "ORPHAN" | null;
  title: string | null;
  impression: string | null;
  photoCount: number;
  photos: AdminReviewPhoto[];
  time: {
    startAt: number | null;
    endAt: number | null;
    startLocal: LocalDateTimeContext | null;
    endLocal: LocalDateTimeContext | null;
  } | null;
};

export type AdminReviewEvidence = {
  photos: AdminReviewPhoto[];
  sections: AdminReviewEvidenceSection[];
  expectedCount: number;
  loadedCount: number;
  unavailableReason: string | null;
};

const ADMIN_REVIEW_STATUS_LABELS: Record<AdminReviewStatus, string> = {
  PENDING: "Pending",
  APPROVED: "Approved",
  REJECTED: "Rejected",
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export function parseAdminReviewStatus(
  value: string | null,
): AdminReviewStatus | null {
  if (value === "PENDING" || value === "APPROVED" || value === "REJECTED") {
    return value;
  }

  return null;
}

export function getAdminReviewStatusLabel(status: AdminReviewStatus): string {
  return ADMIN_REVIEW_STATUS_LABELS[status];
}

const OVERVIEW_WEEK_BUCKETS = 6;
const UTC_WEEK_LABEL_FORMATTER = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});

function normalizeJourneyMetadata(
  value: AdminPublishedJourneyItemDto["metadata"],
): {
  title: string | null;
  description: string | null;
  thumbnailUri: string | null;
} {
  if (!isRecord(value)) {
    return {
      title: null,
      description: null,
      thumbnailUri: null,
    };
  }

  return {
    title: readText(value.title) ?? readText(value.journeyTitle),
    description: readText(value.description) ?? readText(value.summary),
    thumbnailUri: readText(value.thumbnailUri),
  };
}

function normalizeAdminReviewItem(
  item: AdminPublishedJourneyItemDto,
): AdminReviewQueueItem {
  const metadata = normalizeJourneyMetadata(item.metadata);

  return {
    publicId: item.publicId,
    journeyId: item.journeyId,
    userId: item.userId,
    title: metadata.title,
    description: metadata.description,
    thumbnailUrl: resolveJourneyListCoverUrl({
      thumbnailUrl: item.thumbnailUrl,
      metadata: item.metadata,
    }) ?? metadata.thumbnailUri,
    photoCount: item.photoCount,
    createdAt: item.createdAt,
    publishedAt: item.publishedAt ?? null,
    published: item.published,
    visibility: item.visibility,
    review: {
      status: item.review.status,
      approved: item.review.approved,
    },
    startedAt: item.startedAt,
    endedAt: item.endedAt ?? null,
    startedAtLocal: normalizeLocalDateTimeContext(item.startedAtLocal),
    endedAtLocal: normalizeLocalDateTimeContext(item.endedAtLocal ?? null),
    recapStage: item.recapStage,
  };
}

function matchesQueueStatus(
  item: AdminReviewQueueItem,
  status: AdminReviewQueueStatus,
): boolean {
  if (status === "all") {
    return true;
  }

  if (status === "approved") {
    return item.review.status === "APPROVED";
  }

  if (status === "rejected") {
    return item.review.status === "REJECTED";
  }

  return item.review.status === "PENDING";
}

async function readAllAdminReviewItems(
  accessToken: string,
): Promise<AdminReviewQueueItem[]> {
  const seenPublicIds = new Set<string>();
  const items: AdminReviewQueueItem[] = [];

  let page = 1;
  let totalPages = 1;

  do {
    const response = await getAdminPublishedJourneysPage({
      accessToken,
      page,
      limit: ADMIN_REVIEW_API_PAGE_LIMIT,
    });

    totalPages = Math.max(1, response.pages);

    for (const journey of response.journeys) {
      const normalized = normalizeAdminReviewItem(journey);

      if (seenPublicIds.has(normalized.publicId)) {
        continue;
      }

      seenPublicIds.add(normalized.publicId);
      items.push(normalized);
    }

    page += 1;
  } while (page <= totalPages);

  return items;
}

function buildSummary(items: AdminReviewQueueItem[]): AdminReviewSummary {
  const summary: AdminReviewSummary = {
    pendingCount: 0,
    approvedCount: 0,
    rejectedCount: 0,
  };

  for (const item of items) {
    if (item.review.status === "APPROVED") {
      summary.approvedCount += 1;
      continue;
    }

    if (item.review.status === "REJECTED") {
      summary.rejectedCount += 1;
      continue;
    }

    summary.pendingCount += 1;
  }

  return summary;
}

function startOfUtcWeek(timestampMs: number): number {
  const date = new Date(timestampMs);
  const day = date.getUTCDay();
  const offset = day === 0 ? 6 : day - 1;

  date.setUTCDate(date.getUTCDate() - offset);
  date.setUTCHours(0, 0, 0, 0);

  return date.getTime();
}

function formatUtcWeekLabel(timestampMs: number): string {
  return UTC_WEEK_LABEL_FORMATTER.format(new Date(timestampMs));
}

function buildRecentIntake(
  items: AdminReviewQueueItem[],
): AdminOverviewData["recentIntake"] {
  const currentWeekStart = startOfUtcWeek(Date.now());
  const bucketStarts = Array.from({ length: OVERVIEW_WEEK_BUCKETS }, (_, index) => {
    const offset = OVERVIEW_WEEK_BUCKETS - index - 1;
    return currentWeekStart - offset * 7 * 24 * 60 * 60 * 1000;
  });
  const counts = new Map<number, number>(
    bucketStarts.map((bucketStart) => [bucketStart, 0]),
  );
  const firstBucketStart = bucketStarts[0] ?? currentWeekStart;

  for (const item of items) {
    const createdAt = Date.parse(item.createdAt);
    if (!Number.isFinite(createdAt) || createdAt < firstBucketStart) {
      continue;
    }

    const bucketStart = startOfUtcWeek(createdAt);
    if (!counts.has(bucketStart)) {
      continue;
    }

    counts.set(bucketStart, (counts.get(bucketStart) ?? 0) + 1);
  }

  const weeks = bucketStarts.map((bucketStart) => ({
    key: String(bucketStart),
    label: formatUtcWeekLabel(bucketStart),
    count: counts.get(bucketStart) ?? 0,
  }));
  const totalCount = weeks.reduce((sum, week) => sum + week.count, 0);
  const maxCount = Math.max(0, ...weeks.map((week) => week.count));

  return {
    totalCount,
    maxCount,
    weeks,
  };
}

function buildAdminOverviewData(items: AdminReviewQueueItem[]): AdminOverviewData {
  const summary = buildSummary(items);
  const reviewedCount = summary.approvedCount + summary.rejectedCount;
  const approvalRate =
    reviewedCount > 0
      ? Math.round((summary.approvedCount / reviewedCount) * 100)
      : null;
  const rejectionRate =
    reviewedCount > 0
      ? Math.round((summary.rejectedCount / reviewedCount) * 100)
      : null;

  let latestSubmissionAt: string | null = null;
  let latestSubmissionMs = Number.NEGATIVE_INFINITY;
  let oldestPendingAt: string | null = null;
  let oldestPendingMs = Number.POSITIVE_INFINITY;

  for (const item of items) {
    const createdAt = Date.parse(item.createdAt);
    if (Number.isFinite(createdAt) && createdAt > latestSubmissionMs) {
      latestSubmissionMs = createdAt;
      latestSubmissionAt = item.createdAt;
    }

    if (
      item.review.status === "PENDING" &&
      Number.isFinite(createdAt) &&
      createdAt < oldestPendingMs
    ) {
      oldestPendingMs = createdAt;
      oldestPendingAt = item.createdAt;
    }
  }

  return {
    totalCount: items.length,
    pendingCount: summary.pendingCount,
    reviewedCount,
    approvedCount: summary.approvedCount,
    rejectedCount: summary.rejectedCount,
    approvalRate,
    rejectionRate,
    latestSubmissionAt,
    oldestPendingAt,
    recentIntake: buildRecentIntake(items),
  };
}

function buildQueue(options: {
  allItems: AdminReviewQueueItem[];
  page: number;
  limit: number;
  status: AdminReviewQueueStatus;
}): AdminReviewQueueData {
  const filteredItems = options.allItems.filter((item) =>
    matchesQueueStatus(item, options.status),
  );
  const total = filteredItems.length;
  const pages = Math.max(1, Math.ceil(total / options.limit));
  const page = Math.min(Math.max(1, options.page), pages);
  const startIndex = (page - 1) * options.limit;

  return {
    summary: buildSummary(options.allItems),
    items: filteredItems.slice(startIndex, startIndex + options.limit),
    total,
    page,
    pages,
    limit: options.limit,
    status: options.status,
  };
}

function readFiniteNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  return null;
}

function normalizeLocalizedHashtags(value: string[]): string[] {
  return value
    .map((item) => readText(item))
    .filter((item): item is string => Boolean(item));
}

function normalizeLocalizedJourneyEntry(
  entry: PublishedJourneyLocalizationEntryDto,
): AdminReviewLocalizedEntry {
  return {
    locale: entry.locale,
    languageCode: entry.languageCode,
    countryCode: entry.countryCode,
    languageName: entry.languageName,
    title: readText(entry.title),
    description: readText(entry.description),
    hashtags: normalizeLocalizedHashtags(entry.hashtags),
  };
}

function normalizeLocalizedClusterTranslation(
  translation: PublishedJourneyClusterLocalizationEntryDto,
): AdminReviewLocalizedClusterTranslation {
  return {
    locale: translation.locale,
    languageCode: translation.languageCode,
    countryCode: translation.countryCode,
    languageName: translation.languageName,
    impression: readText(translation.impression),
  };
}

function normalizeLocalizedClusterImpressions(
  entry: PublishedJourneyClusterLocalizedImpressionsDto,
): AdminReviewLocalizedClusterImpressions {
  return {
    clusterId: entry.clusterId,
    translations: entry.translations.map(normalizeLocalizedClusterTranslation),
  };
}

function normalizeLocalizedContent(
  localizedContent: PublishedJourneyLocalizedContentDto | undefined,
): AdminReviewLocalizedContent | null {
  if (!localizedContent) {
    return null;
  }

  return {
    sourceLanguage: localizedContent.sourceLanguage,
    generatedAt: localizedContent.generatedAt,
    entries: localizedContent.entries.map(normalizeLocalizedJourneyEntry),
    clusterImpressions: localizedContent.clusterImpressions.map(
      normalizeLocalizedClusterImpressions,
    ),
  };
}

function normalizeAdminReviewPhoto(
  image: PublishedJourneyImageDto,
  fallbackPhotoId?: string | null,
): AdminReviewPhoto | null {
  const fullUrl = readText(image.fullUrl) ?? readText(image.url);
  if (!fullUrl) {
    return null;
  }

  const displayUrl = readText(image.displayUrl) ?? fullUrl;
  const thumbnailUrl = readText(image.thumbnailUrl) ?? displayUrl;
  const photoId = readText(image.photoId) ?? fallbackPhotoId ?? null;
  const key = photoId ? `photo:${photoId}` : `url:${fullUrl}`;

  return {
    key,
    photoId,
    url: fullUrl,
    fullUrl,
    displayUrl,
    thumbnailUrl,
    width: readFiniteNumber(image.width),
    height: readFiniteNumber(image.height),
    takenAt: readFiniteNumber(image.takenAt),
    captureTime: normalizeCaptureTimeContext(image.captureTime),
    locationName: readText(image.locationName),
  };
}

type TimelineBlockLike = {
  clusterId?: string;
  type?: "STOP" | "MOVE" | "ORPHAN";
  time?: {
    startAt?: number;
    endAt?: number;
    startLocal?: unknown;
    endLocal?: unknown;
  } | null;
  locationName?: string;
  impression?: string;
  photoIds?: string[];
  photos?: PublishedJourneyImageDto[];
};

type AdminReviewPhotoRegistry = {
  orderedKeys: string[];
  photoByKey: Map<string, AdminReviewPhoto>;
  keyByPhotoId: Map<string, string>;
};

type MutableEvidenceSection = {
  key: string;
  clusterId: string | null;
  type: "STOP" | "MOVE" | "ORPHAN" | null;
  title: string | null;
  impression: string | null;
  photoKeys: string[];
  photoKeySet: Set<string>;
  time: {
    startAt: number | null;
    endAt: number | null;
    startLocal: LocalDateTimeContext | null;
    endLocal: LocalDateTimeContext | null;
  } | null;
  order: number;
};

function mergeAdminReviewPhoto(
  current: AdminReviewPhoto,
  incoming: AdminReviewPhoto,
): AdminReviewPhoto {
  const displayUrl =
    current.displayUrl !== current.fullUrl ? current.displayUrl : incoming.displayUrl;
  const thumbnailUrl =
    current.thumbnailUrl !== current.displayUrl ? current.thumbnailUrl : incoming.thumbnailUrl;

  return {
    ...current,
    photoId: current.photoId ?? incoming.photoId,
    fullUrl: current.fullUrl || incoming.fullUrl,
    url: current.url || incoming.url,
    displayUrl,
    thumbnailUrl,
    width: current.width ?? incoming.width,
    height: current.height ?? incoming.height,
    takenAt: current.takenAt ?? incoming.takenAt,
    captureTime: current.captureTime ?? incoming.captureTime,
    locationName: current.locationName ?? incoming.locationName,
  };
}

function createPhotoRegistry(): AdminReviewPhotoRegistry {
  return {
    orderedKeys: [],
    photoByKey: new Map<string, AdminReviewPhoto>(),
    keyByPhotoId: new Map<string, string>(),
  };
}

function registerAdminReviewPhoto(
  registry: AdminReviewPhotoRegistry,
  image: PublishedJourneyImageDto,
  fallbackPhotoId?: string | null,
): string | null {
  const normalized = normalizeAdminReviewPhoto(image, fallbackPhotoId);
  if (!normalized) {
    return null;
  }

  const existing = registry.photoByKey.get(normalized.key);
  if (existing) {
    registry.photoByKey.set(
      normalized.key,
      mergeAdminReviewPhoto(existing, normalized),
    );
  } else {
    registry.photoByKey.set(normalized.key, normalized);
    registry.orderedKeys.push(normalized.key);
  }

  if (normalized.photoId) {
    registry.keyByPhotoId.set(normalized.photoId, normalized.key);
  }

  return normalized.key;
}

function pushPhotoKey(
  value: string | null,
  target: string[],
  seen: Set<string>,
): void {
  if (!value || seen.has(value)) {
    return;
  }

  seen.add(value);
  target.push(value);
}

function createMutableEvidenceSection(options: {
  key: string;
  clusterId: string | null;
  order: number;
}): MutableEvidenceSection {
  return {
    key: options.key,
    clusterId: options.clusterId,
    type: null,
    title: null,
    impression: null,
    photoKeys: [],
    photoKeySet: new Set<string>(),
    time: null,
    order: options.order,
  };
}

function mergeSectionTime(
  current: MutableEvidenceSection["time"],
  incoming: MutableEvidenceSection["time"],
): MutableEvidenceSection["time"] {
  if (!incoming) {
    return current;
  }

  if (!current) {
    return incoming;
  }

  return {
    startAt: current.startAt ?? incoming.startAt,
    endAt: current.endAt ?? incoming.endAt,
    startLocal: current.startLocal ?? incoming.startLocal,
    endLocal: current.endLocal ?? incoming.endLocal,
  };
}

function normalizeTimelineBlocks(
  timeline: PublishedJourneyDetailDto["timeline"] | undefined,
): TimelineBlockLike[] {
  return Array.isArray(timeline)
    ? timeline.filter(Boolean) as TimelineBlockLike[]
    : [];
}

function normalizeRecapTimelineBlocks(
  timeline: PublishedJourneyDetailDto["recapDraft"]["timeline"] | undefined,
): TimelineBlockLike[] {
  return Array.isArray(timeline)
    ? timeline.filter(Boolean) as TimelineBlockLike[]
    : [];
}

function readSectionTime(
  value: TimelineBlockLike["time"],
): MutableEvidenceSection["time"] {
  if (!value) {
    return null;
  }

  return {
    startAt: readFiniteNumber(value.startAt),
    endAt: readFiniteNumber(value.endAt),
    startLocal: normalizeLocalDateTimeContext(value.startLocal),
    endLocal: normalizeLocalDateTimeContext(value.endLocal),
  };
}

function collectEvidenceSections(options: {
  registry: AdminReviewPhotoRegistry;
  blocks: TimelineBlockLike[];
  sections: Map<string, MutableEvidenceSection>;
  nextOrderRef: { current: number };
  keyPrefix: string;
}): void {
  for (const [index, block] of options.blocks.entries()) {
    const clusterId = readText(block.clusterId);
    const sectionKey = clusterId ?? `${options.keyPrefix}-${index}`;
    const existing =
      options.sections.get(sectionKey) ??
      createMutableEvidenceSection({
        key: sectionKey,
        clusterId,
        order: options.nextOrderRef.current++,
      });

    existing.type = existing.type ?? block.type ?? null;
    existing.title = existing.title ?? readText(block.locationName);
    existing.impression = existing.impression ?? readText(block.impression);
    existing.time = mergeSectionTime(existing.time, readSectionTime(block.time));

    const blockPhotoIds = Array.isArray(block.photoIds)
      ? block.photoIds.map((value) => readText(value))
      : [];
    const blockPhotoKeys = Array.isArray(block.photos)
      ? block.photos.map((photo, photoIndex) =>
          registerAdminReviewPhoto(
            options.registry,
            photo,
            blockPhotoIds[photoIndex] ?? null,
          ),
        )
      : [];

    for (const photoId of blockPhotoIds) {
      const key = photoId
        ? options.registry.keyByPhotoId.get(photoId) ?? null
        : null;
      pushPhotoKey(key, existing.photoKeys, existing.photoKeySet);
    }

    for (const photoKey of blockPhotoKeys) {
      pushPhotoKey(photoKey, existing.photoKeys, existing.photoKeySet);
    }

    options.sections.set(sectionKey, existing);
  }
}

function resolveEvidenceSections(
  registry: AdminReviewPhotoRegistry,
  sections: Map<string, MutableEvidenceSection>,
): AdminReviewEvidenceSection[] {
  return Array.from(sections.values())
    .sort((left, right) => left.order - right.order)
    .map<AdminReviewEvidenceSection>((section) => {
      const photos = section.photoKeys
        .map((key) => registry.photoByKey.get(key) ?? null)
        .filter((photo): photo is AdminReviewPhoto => Boolean(photo));

      return {
        key: section.key,
        kind: "cluster",
        clusterId: section.clusterId,
        type: section.type,
        title: section.title,
        impression: section.impression,
        photoCount: photos.length,
        photos,
        time: section.time,
      };
    });
}

function buildEvidenceFromDetail(options: {
  detail: PublishedJourneyDetailDto;
  expectedCount: number;
}): AdminReviewEvidence {
  const registry = createPhotoRegistry();

  for (const image of options.detail.images) {
    registerAdminReviewPhoto(registry, image);
  }

  const sections = new Map<string, MutableEvidenceSection>();
  const nextOrderRef = { current: 0 };

  collectEvidenceSections({
    registry,
    blocks: normalizeTimelineBlocks(options.detail.timeline),
    sections,
    nextOrderRef,
    keyPrefix: "timeline",
  });
  collectEvidenceSections({
    registry,
    blocks: normalizeRecapTimelineBlocks(options.detail.recapDraft.timeline),
    sections,
    nextOrderRef,
    keyPrefix: "recap",
  });

  const resolvedSections = resolveEvidenceSections(registry, sections);
  const consumedKeys = new Set<string>();

  for (const section of resolvedSections) {
    for (const photo of section.photos) {
      consumedKeys.add(photo.key);
    }
  }

  const photos = registry.orderedKeys
    .map((key) => registry.photoByKey.get(key) ?? null)
    .filter((photo): photo is AdminReviewPhoto => Boolean(photo));

  const remainingPhotos = photos.filter((photo) => !consumedKeys.has(photo.key));
  const evidenceSections =
    resolvedSections.length > 0
      ? [
          ...resolvedSections,
          ...(remainingPhotos.length > 0
            ? [
                {
                  key: "remaining-photos",
                  kind: "remaining" as const,
                  clusterId: null,
                  type: null,
                  title: null,
                  impression: null,
                  photoCount: remainingPhotos.length,
                  photos: remainingPhotos,
                  time: null,
                },
              ]
            : []),
        ]
      : photos.length > 0
        ? [
            {
              key: "all-photos",
              kind: "remaining" as const,
              clusterId: null,
              type: null,
              title: null,
              impression: null,
              photoCount: photos.length,
              photos,
              time: null,
            },
          ]
        : [];

  const expectedCount = Math.max(
    options.expectedCount,
    options.detail.photoCount,
    photos.length,
  );

  return {
    photos,
    sections: evidenceSections,
    expectedCount,
    loadedCount: photos.length,
    unavailableReason:
      photos.length === 0 && expectedCount > 0
        ? "The admin detail contract returned no photo assets for this journey."
        : null,
  };
}

async function fetchAdminReviewDetailPayload(options: {
  accessToken: string;
  publicId: string;
  lang?: Language | null;
}): Promise<PublishedJourneyDetailDto | null> {
  try {
    return await getAdminPublishedJourneyDetail({
      accessToken: options.accessToken,
      publicId: options.publicId,
      lang: options.lang ? toLocaleTag(options.lang) : undefined,
    });
  } catch (error) {
    if (error instanceof BackendApiError && error.statusCode === 404) {
      return null;
    }

    throw error;
  }
}

function buildAdminReviewDetail(options: {
  detail: PublishedJourneyDetailDto;
  queueItem: AdminReviewQueueItem | null;
  lang?: Language | null;
}): AdminReviewDetail {
  const title = readText(options.detail.title) ?? options.queueItem?.title ?? null;
  const description =
    readText(options.detail.description) ?? options.queueItem?.description ?? null;
  const photoCount = Math.max(
    options.detail.photoCount,
    options.queueItem?.photoCount ?? 0,
  );

  return {
    journey: {
      publicId: options.detail.publicId,
      journeyId: options.queueItem?.journeyId ?? null,
      userId: options.detail.userId,
      authorName: readText(options.detail.author?.name),
      title,
      description,
      shareUrl: readText(options.detail.shareUrl),
      createdAt: options.detail.createdAt,
      publishedAt: readText(options.detail.publishedAt),
      startedAt: options.detail.startedAt,
      endedAt: options.detail.endedAt ?? null,
      startedAtLocal: normalizeLocalDateTimeContext(options.detail.startedAtLocal),
      endedAtLocal: normalizeLocalDateTimeContext(options.detail.endedAtLocal ?? null),
      visibility: options.detail.visibility,
      review: {
        status: options.detail.review.status,
        approved: options.detail.review.approved,
      },
      contentStatus: options.detail.contentStatus,
      notice: readText(options.detail.notice),
      localizedContent: normalizeLocalizedContent(options.detail.localizedContent),
      requestedLocale: options.lang ? toLocaleTag(options.lang) : null,
    },
    evidence: buildEvidenceFromDetail({
      detail: options.detail,
      expectedCount: photoCount,
    }),
  };
}

export async function loadAdminReviewWorkspaceData(options: {
  accessToken: string;
  page: number;
  status: AdminReviewQueueStatus;
  limit?: number;
  publicId?: string | null;
  lang?: Language | null;
}): Promise<{
  queue: AdminReviewQueueData;
  detail: AdminReviewDetail | null;
  overview: AdminOverviewData;
}> {
  const limit = Math.max(1, options.limit ?? ADMIN_REVIEW_PAGE_SIZE);
  const [allItems, detailPayload] = await Promise.all([
    readAllAdminReviewItems(options.accessToken),
    options.publicId
      ? fetchAdminReviewDetailPayload({
          accessToken: options.accessToken,
          publicId: options.publicId,
          lang: options.lang,
        })
      : Promise.resolve(null),
  ]);
  const queueItem = options.publicId
    ? allItems.find((item) => item.publicId === options.publicId) ?? null
    : null;

  return {
    queue: buildQueue({
      allItems,
      page: options.page,
      limit,
      status: options.status,
    }),
    overview: buildAdminOverviewData(allItems),
    detail: detailPayload
      ? buildAdminReviewDetail({
          detail: detailPayload,
          queueItem,
          lang: options.lang,
        })
      : null,
  };
}
