import { cache } from "react";
import type {
    Api,
    PublishedJourneyDetailDto,
    PublishedJourneyDetailResponseDto,
    PublishedJourneyItemDto,
    PublishedJourneysResponseDto,
} from "@/src/apis/core/client";
import {
    PUBLIC_JOURNEY_REVALIDATE_SECONDS,
    PUBLIC_PHOTO_REVALIDATE_SECONDS,
} from "@/lib/cache-policy";
import { normalizeHashtags as normalizeHashtagList } from "@/lib/hashtags";
import { appendPublicApiLanguage, fetchPublicApi } from "@/lib/public-api";
import { type Language, toLocaleTag } from "@/lib/i18n/config";
import {
    normalizeCaptureTimeContext,
    normalizeLocalDateTimeContext,
    type CaptureTimeContext,
    type LocalDateTimeContext,
} from "@/lib/local-time-context";
import {
    normalizePublishedImageUrl,
    normalizePublishedImageVariantUrls,
    resolvePublishedImageFullUrl,
    resolvePublishedImageThumbnailUrl,
} from "@/lib/published-image-variants";
export {
    publishedImageMatchesUrl,
    resolvePublishedImageDisplayUrl,
    resolvePublishedImageFullUrl,
    resolvePublishedImageThumbnailUrl,
} from "@/lib/published-image-variants";
export type { PublishedImageVariantSource } from "@/lib/published-image-variants";
import { normalizePublicImageUrl } from "@/lib/public-image-url";
//
export type JourneyMode = "ROUTE_STRONG" | "ROUTE_WEAK" | "ROUTE_NONE";
export type PublishedJourneyContentStatus =
    | "available"
    | "reported_hidden"
    | "review_pending"
    | "review_rejected";
export type PublishedJourneyReviewStatus = "PENDING" | "APPROVED" | "REJECTED";
export type ApprovedPublicJourneyReviewStatus = "APPROVED";

export type PublishedJourneyImage = {
    url: string;
    fullUrl?: string;
    displayUrl?: string;
    thumbnailUrl?: string;
    photoId: string;
    width?: number;
    height?: number;
    caption?: string;
    takenAt?: number;
    captureTime?: CaptureTimeContext | null;
    locationName?: string;
    location?: {
        lat: number;
        lng: number;
    };
};

export type PublishedJourneySeoImage = {
    url: string;
    width?: number;
    height?: number;
    alt?: string;
};

export type PublishedJourneyCluster = {
    clusterId: string;
    type: "STOP" | "MOVE" | "ORPHAN";
    time: {
        startAt: number;
        endAt: number;
        durationMs: number;
        startLocal?: LocalDateTimeContext | null;
        endLocal?: LocalDateTimeContext | null;
    };
    center: {
        lat: number;
        lng: number;
    };
    locationName?: string;
    impression?: string;
    photoIds: string[];
    photos: PublishedJourneyImage[];
};

export type PublishedJourneyLocalizedEntry = {
    locale: string;
    languageCode: string;
    countryCode: string;
    languageName: string;
    title?: string;
    description?: string;
    hashtags: string[];
};

export type PublishedJourneyClusterLocalization = {
    locale: string;
    languageCode: string;
    countryCode: string;
    languageName: string;
    impression?: string;
};

export type PublishedJourneyLocalizedClusterImpressions = {
    clusterId: string;
    translations: PublishedJourneyClusterLocalization[];
};

export type PublishedJourneyLocalizedContent = {
    sourceLanguage: string;
    generatedAt: string;
    entries: PublishedJourneyLocalizedEntry[];
    clusterImpressions: PublishedJourneyLocalizedClusterImpressions[];
};

export type PublishedJourneyApi = {
    publicId: string;
    userId: string;
    startedAt: number;
    endedAt: number;
    startedAtLocal?: LocalDateTimeContext | null;
    endedAtLocal?: LocalDateTimeContext | null;
    title: string;
    description?: string;
    thumbnailUrl?: string;
    mode: JourneyMode;
    photoCount: number;
    images: PublishedJourneyImage[];
    clusters: PublishedJourneyCluster[];
    publishedAt: string;
    createdAt: string;
    hashtags: string[];
    localizedContent?: PublishedJourneyLocalizedContent;
    reviewApproved?: boolean;
    reviewStatus?: PublishedJourneyReviewStatus;
    contentStatus?: PublishedJourneyContentStatus;
    notice?: string;
};

export type PublishedJourneyListItemApi = {
    publicId: string;
    journeyId?: string;
    userId: string;
    startedAt?: number;
    endedAt?: number;
    startedAtLocal?: LocalDateTimeContext | null;
    endedAtLocal?: LocalDateTimeContext | null;
    recapStage?: string;
    photoCount?: number;
    imageCount?: number;
    thumbnailUrl?: string;
    seoImages?: PublishedJourneySeoImage[];
    metadata?: Record<string, unknown>;
    title?: string;
    description?: string;
    publishedAt?: string;
    createdAt?: string;
    updatedAt?: string;
    reviewApproved?: boolean;
    reviewStatus?: PublishedJourneyReviewStatus;
    contentStatus?: PublishedJourneyContentStatus;
};

export type PublishedJourneysListApi = {
    journeys: PublishedJourneyListItemApi[];
    total: number;
    page?: number;
    pages?: number;
    limit: number;
    hasMore: boolean;
    nextCursor: string | null;
    discoverySeed: string | null;
};

export type PublishedPhotoApi = {
    photoId: string;
    url: string;
    fullUrl?: string;
    displayUrl?: string;
    thumbnailUrl?: string;
    takenAt?: number;
    captureTime?: CaptureTimeContext | null;
    locationName?: string;
    location?: {
        lat: number;
        lng: number;
    };
    caption?: string;
    journey: {
        publicId: string;
        title: string;
        startedAt?: number;
        endedAt?: number;
        startedAtLocal?: LocalDateTimeContext | null;
        endedAtLocal?: LocalDateTimeContext | null;
    };
};

type PublishedJourneyResponse = {
    status: string;
    data?: PublishedJourneyDetailDto | Record<string, unknown>;
    message?: unknown;
};

type PublishedPhotoResponse = {
    status?: string;
    data?: unknown;
    message?: unknown;
};

type FetchPublishedJourneyResult = {
    status: "success" | "hidden" | "not_found" | "error";
    data: PublishedJourneyApi | null;
    message?: string;
};

export type FetchPublishedPhotoResult = {
    status: "success" | "not_found" | "error";
    data: PublishedPhotoApi | null;
    message?: string;
};

const APPROVED_PUBLIC_JOURNEY_REVIEW_STATUS: ApprovedPublicJourneyReviewStatus = "APPROVED";

const untitledJourneyFallbackByLanguage: Record<Language, string> = {
    en: "Untitled journey",
    ko: "제목 없는 여정",
    ja: "タイトル未設定の旅",
    zh: "未命名旅程",
    es: "Viaje sin título",
    pt: "Viagem sem título",
    fr: "Voyage sans titre",
    th: "ทริปไม่มีชื่อ",
    vi: "Hành trình chưa đặt tên",
};

const genericJourneyFallbackByLanguage: Record<Language, string> = {
    en: "Journey",
    ko: "여정",
    ja: "旅",
    zh: "旅程",
    es: "Viaje",
    pt: "Viagem",
    fr: "Voyage",
    th: "ทริป",
    vi: "Hành trình",
};

const VISIBLE_TEXT_PLACEHOLDER_PATTERN = /^(?:null|undefined)$/iu;

function isRecord(value: unknown): value is Record<string, unknown> {
    return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function readText(value: unknown): string | null {
    if (typeof value !== "string") {
        return null;
    }

    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
}

function readVisibleText(value: unknown): string | null {
    const text = readText(value);

    if (!text || VISIBLE_TEXT_PLACEHOLDER_PATTERN.test(text)) {
        return null;
    }

    return text;
}

function readNumber(value: unknown): number | null {
    if (typeof value === "number" && Number.isFinite(value)) {
        return value;
    }

    if (typeof value === "string") {
        const parsed = Number(value);
        if (Number.isFinite(parsed)) {
            return parsed;
        }
    }

    return null;
}

function readBoolean(value: unknown): boolean | null {
    if (typeof value === "boolean") {
        return value;
    }

    if (typeof value === "string") {
        if (value === "true") {
            return true;
        }

        if (value === "false") {
            return false;
        }
    }

    return null;
}

function readMessage(value: unknown): string | null {
    if (typeof value === "string") {
        return value;
    }

    if (Array.isArray(value)) {
        const firstString = value.find((item) => typeof item === "string");
        return typeof firstString === "string" ? firstString : null;
    }

    if (isRecord(value)) {
        return readText(value.message) ?? null;
    }

    return null;
}

function getUntitledJourneyFallback(lang?: Language): string {
    if (!lang) {
        return untitledJourneyFallbackByLanguage.en;
    }

    return untitledJourneyFallbackByLanguage[lang] ?? untitledJourneyFallbackByLanguage.en;
}

function getGenericJourneyFallback(lang?: Language): string {
    if (!lang) {
        return genericJourneyFallbackByLanguage.en;
    }

    return genericJourneyFallbackByLanguage[lang] ?? genericJourneyFallbackByLanguage.en;
}

function isHiddenJourneyMessage(message: string | null | undefined): boolean {
    if (!message) {
        return false;
    }

    const normalized = message.toLowerCase();
    return (
        message.includes("숨김") ||
        message.includes("신고가 누적") ||
        normalized.includes("hidden") ||
        normalized.includes("reported")
    );
}

function isPendingOrRejectedJourneyMessage(
    message: string | null | undefined,
): boolean {
    if (!message) {
        return false;
    }

    const normalized = message.toLowerCase();
    return (
        message.includes("심사") ||
        message.includes("검토") ||
        message.includes("반려") ||
        normalized.includes("review") ||
        normalized.includes("pending") ||
        normalized.includes("rejected") ||
        normalized.includes("not approved")
    );
}

function normalizeContentStatus(
    value: unknown,
): PublishedJourneyContentStatus | undefined {
    if (
        value === "available" ||
        value === "reported_hidden" ||
        value === "review_pending" ||
        value === "review_rejected"
    ) {
        return value;
    }

    if (value === "web_review_pending") {
        return "review_pending";
    }

    if (value === "web_review_rejected") {
        return "review_rejected";
    }

    return undefined;
}

function normalizeReviewStatus(
    value: unknown,
): PublishedJourneyReviewStatus | undefined {
    if (value === "PENDING" || value === "APPROVED" || value === "REJECTED") {
        return value;
    }

    return undefined;
}

function isUnavailableForWeb(
    journey: Pick<
        PublishedJourneyApi,
        "contentStatus" | "reviewApproved" | "reviewStatus"
    >,
): boolean {
    if (journey.contentStatus && journey.contentStatus !== "available") {
        return true;
    }

    if (journey.reviewApproved === false) {
        return true;
    }

    if (journey.reviewStatus && journey.reviewStatus !== "APPROVED") {
        return true;
    }

    return false;
}

function shouldRenderHiddenJourneyNotice(
    journey: Pick<PublishedJourneyApi, "contentStatus">,
): boolean {
    return journey.contentStatus === "reported_hidden";
}

function normalizeJourneyMode(value: unknown): JourneyMode {
    if (value === "ROUTE_STRONG" || value === "ROUTE_WEAK" || value === "ROUTE_NONE") {
        return value;
    }

    return "ROUTE_NONE";
}

function normalizeLocation(
    value: unknown,
): { lat: number; lng: number } | null {
    if (!isRecord(value)) {
        return null;
    }

    const lat =
        readNumber(value.lat) ??
        readNumber(value.latitude);
    const lng =
        readNumber(value.lng) ??
        readNumber(value.longitude);

    if (lat === null || lng === null) {
        return null;
    }

    return { lat, lng };
}

function normalizePhotoIds(value: unknown): string[] {
    if (!Array.isArray(value)) {
        return [];
    }

    return value
        .map((item) => readText(item))
        .filter((item): item is string => Boolean(item));
}

function normalizeClusterType(value: unknown): "STOP" | "MOVE" | "ORPHAN" {
    if (value === "STOP" || value === "ROUTE_STOP") {
        return "STOP";
    }

    if (value === "MOVE" || value === "ROUTE_MOVE") {
        return "MOVE";
    }

    return "ORPHAN";
}

function normalizePublishedJourneyImage(
    value: unknown,
): PublishedJourneyImage | null {
    const urls = normalizePublishedImageVariantUrls(value);
    if (!urls) {
        return null;
    }

    if (typeof value === "string") {
        return {
            ...urls,
            photoId: "",
        };
    }

    if (!isRecord(value)) {
        return null;
    }
    const location = normalizeLocation(value.location) ?? undefined;

    return {
        ...urls,
        photoId:
            readText(value.photoId) ??
            readText(value.id) ??
            readText(value.imageId) ??
            readText(value.assetId) ??
            readText(value.archivePath) ??
            "",
        width: readNumber(value.width) ?? undefined,
        height: readNumber(value.height) ?? undefined,
        caption: readVisibleText(value.caption) ?? undefined,
        takenAt:
            readNumber(value.takenAt) ??
            readNumber(value.capturedAt) ??
            undefined,
        captureTime: normalizeCaptureTimeContext(value.captureTime),
        locationName:
            readVisibleText(value.locationName) ??
            (isRecord(value.location)
                ? readVisibleText(value.location.displayName) ??
                  readVisibleText(value.location.name) ??
                  readVisibleText(value.location.label)
                : null) ??
            undefined,
        location,
    };
}

function normalizePublishedJourneySeoImage(
    value: unknown,
): PublishedJourneySeoImage | null {
    const image = normalizePublishedJourneyImage(value);
    if (image) {
        const record = isRecord(value) ? value : null;
        return {
            url: image.displayUrl ?? image.fullUrl ?? image.url,
            width: image.width,
            height: image.height,
            alt:
                image.caption ??
                image.locationName ??
                readVisibleText(record?.alt) ??
                undefined,
        };
    }

    if (!isRecord(value)) {
        return null;
    }

    const url =
        normalizePublishedImageUrl(value.url) ??
        normalizePublishedImageUrl(value.imageUrl) ??
        normalizePublishedImageUrl(value.src);

    if (!url) {
        return null;
    }

    return {
        url,
        width: readNumber(value.width) ?? undefined,
        height: readNumber(value.height) ?? undefined,
        alt:
            readVisibleText(value.alt) ??
            readVisibleText(value.caption) ??
            readVisibleText(value.locationName) ??
            undefined,
    };
}

function normalizePublishedJourneySeoImages(
    value: unknown,
): PublishedJourneySeoImage[] {
    if (!Array.isArray(value)) {
        return [];
    }

    const seen = new Set<string>();
    const images: PublishedJourneySeoImage[] = [];

    for (const item of value) {
        const image = normalizePublishedJourneySeoImage(item);
        if (!image || seen.has(image.url)) {
            continue;
        }

        seen.add(image.url);
        images.push(image);
    }

    return images;
}

function normalizePublishedJourneyCluster(
    value: unknown,
    index: number,
): PublishedJourneyCluster | null {
    if (!isRecord(value)) {
        return null;
    }

    const clusterId =
        readText(value.clusterId) ??
        readText(value.timelineId) ??
        readText(value.id) ??
        `cluster-${index}`;

    const time = isRecord(value.time) ? value.time : null;
    const startAt =
        readNumber(time?.startAt) ??
        readNumber(value.startedAt);
    const endAt =
        readNumber(time?.endAt) ??
        readNumber(value.endedAt) ??
        startAt;

    const center =
        normalizeLocation(value.center) ??
        normalizeLocation(value.location);

    if (startAt === null || endAt === null || !center) {
        return null;
    }

    const durationMs =
        readNumber(time?.durationMs) ??
        Math.max(0, endAt - startAt);

    const locationRecord = isRecord(value.location) ? value.location : null;
    const locationName =
        readVisibleText(value.locationName) ??
        readVisibleText(locationRecord?.displayName) ??
        readVisibleText(locationRecord?.name) ??
        readVisibleText(locationRecord?.label) ??
        undefined;

    const photoIds = normalizePhotoIds(value.photoIds);
    const singlePhotoId = readText(value.photoId);
    const photos = Array.isArray(value.photos)
        ? value.photos
            .map((item) => normalizePublishedJourneyImage(item))
            .filter((item): item is PublishedJourneyImage => Boolean(item))
        : [];

    return {
        clusterId,
        type: normalizeClusterType(value.type),
        time: {
            startAt,
            endAt,
            durationMs,
            startLocal: normalizeLocalDateTimeContext(time?.startLocal),
            endLocal: normalizeLocalDateTimeContext(time?.endLocal),
        },
        center,
        locationName,
        impression: readVisibleText(value.impression) ?? undefined,
        photoIds: singlePhotoId ? [...photoIds, singlePhotoId] : photoIds,
        photos,
    };
}

function normalizeJourneyMetadata(
    value: unknown,
): Record<string, unknown> | undefined {
    return isRecord(value) ? value : undefined;
}

function normalizeJourneyClusters(
    value: unknown,
): PublishedJourneyCluster[] {
    if (!Array.isArray(value)) {
        return [];
    }

    return value
        .map((item, index) => normalizePublishedJourneyCluster(item, index))
        .filter((item): item is PublishedJourneyCluster => Boolean(item));
}

function normalizeHashtags(value: unknown): string[] {
    if (!Array.isArray(value)) {
        return [];
    }

    return normalizeHashtagList(
        value.map((item) => readVisibleText(item)),
    );
}

function normalizeLocalizedJourneyEntry(
    value: unknown,
): PublishedJourneyLocalizedEntry | null {
    if (!isRecord(value)) {
        return null;
    }

    const locale = readText(value.locale);
    const languageCode = readText(value.languageCode);
    const countryCode = readText(value.countryCode);
    const languageName = readText(value.languageName);

    if (!locale || !languageCode || !countryCode || !languageName) {
        return null;
    }

    return {
        locale,
        languageCode,
        countryCode,
        languageName,
        title: readVisibleText(value.title) ?? undefined,
        description: readVisibleText(value.description) ?? undefined,
        hashtags: normalizeHashtags(value.hashtags),
    };
}

function normalizeLocalizedClusterTranslation(
    value: unknown,
): PublishedJourneyClusterLocalization | null {
    if (!isRecord(value)) {
        return null;
    }

    const locale = readText(value.locale);
    const languageCode = readText(value.languageCode);
    const countryCode = readText(value.countryCode);
    const languageName = readText(value.languageName);

    if (!locale || !languageCode || !countryCode || !languageName) {
        return null;
    }

    return {
        locale,
        languageCode,
        countryCode,
        languageName,
        impression: readVisibleText(value.impression) ?? undefined,
    };
}

function normalizeLocalizedClusterImpressions(
    value: unknown,
): PublishedJourneyLocalizedClusterImpressions | null {
    if (!isRecord(value)) {
        return null;
    }

    const clusterId = readText(value.clusterId);
    if (!clusterId) {
        return null;
    }

    const translations = Array.isArray(value.translations)
        ? value.translations
            .map((item) => normalizeLocalizedClusterTranslation(item))
            .filter((item): item is PublishedJourneyClusterLocalization => Boolean(item))
        : [];

    return {
        clusterId,
        translations,
    };
}

function normalizeLocalizedContent(
    value: unknown,
): PublishedJourneyLocalizedContent | undefined {
    if (!isRecord(value)) {
        return undefined;
    }

    const sourceLanguage = readText(value.sourceLanguage);
    const generatedAt = readText(value.generatedAt);

    if (!sourceLanguage || !generatedAt) {
        return undefined;
    }

    const entries = Array.isArray(value.entries)
        ? value.entries
            .map((item) => normalizeLocalizedJourneyEntry(item))
            .filter((item): item is PublishedJourneyLocalizedEntry => Boolean(item))
        : [];

    const clusterImpressions = Array.isArray(value.clusterImpressions)
        ? value.clusterImpressions
            .map((item) => normalizeLocalizedClusterImpressions(item))
            .filter((item): item is PublishedJourneyLocalizedClusterImpressions => Boolean(item))
        : [];

    return {
        sourceLanguage,
        generatedAt,
        entries,
        clusterImpressions,
    };
}

function findLocalizedJourneyEntry(
    localizedContent: PublishedJourneyLocalizedContent | undefined,
    lang?: Language,
): PublishedJourneyLocalizedEntry | undefined {
    if (!localizedContent || !lang) {
        return undefined;
    }

    const localeTag = toLocaleTag(lang).toLowerCase();

    return (
        localizedContent.entries.find((entry) => entry.locale.toLowerCase() === localeTag) ??
        localizedContent.entries.find((entry) => entry.languageCode.toLowerCase() === lang)
    );
}

function findLocalizedClusterImpression(
    localizedContent: PublishedJourneyLocalizedContent | undefined,
    clusterId: string,
    lang?: Language,
): string | undefined {
    if (!localizedContent || !lang) {
        return undefined;
    }

    const clusterEntry = localizedContent.clusterImpressions.find(
        (entry) => entry.clusterId === clusterId,
    );

    if (!clusterEntry) {
        return undefined;
    }

    const localeTag = toLocaleTag(lang).toLowerCase();
    const translation =
        clusterEntry.translations.find((entry) => entry.locale.toLowerCase() === localeTag) ??
        clusterEntry.translations.find((entry) => entry.languageCode.toLowerCase() === lang);

    return translation?.impression;
}

function normalizeJourneyListItem(value: unknown): PublishedJourneyListItemApi | null {
    if (!isRecord(value)) {
        return null;
    }

    const publicId = readText(value.publicId);
    const userId = readText(value.userId);

    if (!publicId || !userId) {
        return null;
    }

    const metadata = normalizeJourneyMetadata(value.metadata);
    const review = isRecord(value.review) ? value.review : null;
    const reviewStatus = normalizeReviewStatus(
        review?.status ?? value.reviewStatus ?? value.webReviewStatus,
    );
    const reviewApproved =
        readBoolean(review?.approved) ??
        readBoolean(value.reviewApproved) ??
        (reviewStatus ? reviewStatus === "APPROVED" : null);

    return {
        publicId,
        journeyId: readText(value.journeyId) ?? undefined,
        userId,
        startedAt: readNumber(value.startedAt) ?? undefined,
        endedAt: readNumber(value.endedAt) ?? undefined,
        startedAtLocal: normalizeLocalDateTimeContext(value.startedAtLocal),
        endedAtLocal: normalizeLocalDateTimeContext(value.endedAtLocal),
        recapStage: readText(value.recapStage) ?? undefined,
        photoCount: readNumber(value.photoCount) ?? undefined,
        imageCount: readNumber(value.imageCount) ?? undefined,
        thumbnailUrl:
            normalizePublicImageUrl(readText(value.thumbnailUrl)) ??
            undefined,
        seoImages: normalizePublishedJourneySeoImages(value.seoImages),
        metadata,
        title:
            readVisibleText(metadata?.title) ??
            readVisibleText(metadata?.journeyTitle) ??
            readVisibleText(value.title) ??
            undefined,
        description:
            readVisibleText(metadata?.description) ??
            readVisibleText(metadata?.summary) ??
            readVisibleText(value.description) ??
            undefined,
        publishedAt: readText(value.publishedAt) ?? undefined,
        createdAt: readText(value.createdAt) ?? undefined,
        updatedAt: readText(value.updatedAt) ?? undefined,
        reviewApproved: reviewApproved ?? undefined,
        reviewStatus,
        contentStatus: normalizeContentStatus(value.contentStatus),
    };
}

function resolvePublishedJourneyThumbnailUrl(
    value: Record<string, unknown>,
    metadata: Record<string, unknown> | undefined,
    images: PublishedJourneyImage[],
): string | undefined {
    const topLevelThumbnailUrl = normalizePublishedImageUrl(value.thumbnailUrl);

    if (topLevelThumbnailUrl) {
        return topLevelThumbnailUrl;
    }

    const metadataThumbnailFullUrl = normalizePublishedImageUrl(metadata?.thumbnailUri);

    if (!metadataThumbnailFullUrl) {
        return undefined;
    }

    const sourceImage = images.find(
        (image) => resolvePublishedImageFullUrl(image) === metadataThumbnailFullUrl,
    );

    return sourceImage
        ? resolvePublishedImageThumbnailUrl(sourceImage)
        : metadataThumbnailFullUrl;
}

function normalizePublishedJourney(
    value: unknown,
    fallbackMessage?: string,
    lang?: Language,
): PublishedJourneyApi | null {
    if (!isRecord(value)) {
        return null;
    }

    const metadata = normalizeJourneyMetadata(value.metadata);
    const localizedContent = normalizeLocalizedContent(value.localizedContent);
    const review = isRecord(value.review) ? value.review : null;
    const reviewStatus = normalizeReviewStatus(
        review?.status ?? value.webReviewStatus,
    );
    const reviewApproved =
        readBoolean(review?.approved) ??
        (reviewStatus ? reviewStatus === "APPROVED" : null) ??
        undefined;
    const contentStatus = normalizeContentStatus(value.contentStatus);
    const publicId = readText(value.publicId);
    const userId = readText(value.userId);
    const unavailableForWeb =
        (contentStatus && contentStatus !== "available") ||
        reviewApproved === false ||
        (reviewStatus ? reviewStatus !== "APPROVED" : false);

    if (!publicId || (!userId && !unavailableForWeb)) {
        return null;
    }

    const localizedJourneyEntry = findLocalizedJourneyEntry(localizedContent, lang);
    const images = Array.isArray(value.images)
        ? value.images
            .map((item) => normalizePublishedJourneyImage(item))
            .filter((item): item is PublishedJourneyImage => Boolean(item))
        : [];
    const recapDraft = isRecord(value.recapDraft) ? value.recapDraft : null;
    const normalizedClusters = normalizeJourneyClusters(value.clusters);
    const normalizedTimeline = normalizeJourneyClusters(value.timeline);
    const normalizedRecapTimeline = normalizeJourneyClusters(recapDraft?.timeline);
    const clusters =
        normalizedClusters.length > 0
            ? normalizedClusters
            : normalizedTimeline.length > 0
                ? normalizedTimeline
                : normalizedRecapTimeline;
    const localizedClusters = clusters.map((cluster) => ({
        ...cluster,
        impression:
            findLocalizedClusterImpression(localizedContent, cluster.clusterId, lang) ??
            cluster.impression,
    }));

    const clusterStarts = localizedClusters.map((cluster) => cluster.time.startAt);
    const clusterEnds = localizedClusters.map((cluster) => cluster.time.endAt);

    const publishedAt =
        readText(value.publishedAt) ??
        readText(value.createdAt) ??
        new Date().toISOString();

    const startedAt =
        readNumber(value.startedAt) ??
        (clusterStarts.length > 0 ? Math.min(...clusterStarts) : null) ??
        Date.parse(publishedAt);
    const endedAt =
        readNumber(value.endedAt) ??
        (clusterEnds.length > 0 ? Math.max(...clusterEnds) : null) ??
        startedAt;

    return {
        publicId,
        userId: userId ?? "",
        startedAt,
        endedAt,
        startedAtLocal: normalizeLocalDateTimeContext(value.startedAtLocal),
        endedAtLocal: normalizeLocalDateTimeContext(value.endedAtLocal),
        title:
            localizedJourneyEntry?.title ??
            readVisibleText(value.title) ??
            readVisibleText(metadata?.title) ??
            readVisibleText(metadata?.journeyTitle) ??
            getUntitledJourneyFallback(lang),
        description:
            localizedJourneyEntry?.description ??
            readVisibleText(value.description) ??
            readVisibleText(metadata?.description) ??
            readVisibleText(metadata?.summary) ??
            undefined,
        thumbnailUrl: resolvePublishedJourneyThumbnailUrl(value, metadata, images),
        mode: normalizeJourneyMode(value.mode),
        photoCount: readNumber(value.photoCount) ?? images.length,
        images,
        clusters: localizedClusters,
        publishedAt,
        createdAt: readText(value.createdAt) ?? publishedAt,
        hashtags:
            (localizedJourneyEntry?.hashtags.length ?? 0) > 0
                ? localizedJourneyEntry?.hashtags ?? []
                : normalizeHashtags(value.hashtags),
        localizedContent,
        reviewApproved,
        reviewStatus,
        contentStatus,
        notice: readMessage(value.notice) ?? fallbackMessage,
    };
}

function normalizePublishedPhoto(
    value: unknown,
    lang?: Language,
): PublishedPhotoApi | null {
    if (!isRecord(value)) {
        return null;
    }

    const journeySource = isRecord(value.journey) ? value.journey : null;
    const imageSource = isRecord(value.image) ? value.image : null;

    const photoId = readText(value.photoId);
    const urls =
        normalizePublishedImageVariantUrls(value) ??
        normalizePublishedImageVariantUrls(imageSource);
    const journeyPublicId =
        readText(journeySource?.publicId) ??
        readText(value.journeyPublicId);

    if (!photoId || !urls || !journeyPublicId) {
        return null;
    }

    const journeyTitle =
        (isRecord(journeySource?.metadata)
            ? readVisibleText(journeySource.metadata.title)
            : null) ??
        readVisibleText(journeySource?.title) ??
        getGenericJourneyFallback(lang);

    const locationName =
        readVisibleText(value.locationName) ??
        (isRecord(value.location) ? readVisibleText(value.location.displayName) : null) ??
        undefined;

    return {
        photoId,
        ...urls,
        takenAt:
            readNumber(value.takenAt) ??
            readNumber(value.capturedAt) ??
            undefined,
        captureTime: normalizeCaptureTimeContext(value.captureTime),
        locationName,
        location: normalizeLocation(value.location) ?? undefined,
        caption: readVisibleText(value.caption) ?? undefined,
        journey: {
            publicId: journeyPublicId,
            title: journeyTitle,
            startedAt: readNumber(journeySource?.startedAt) ?? undefined,
            endedAt: readNumber(journeySource?.endedAt) ?? undefined,
            startedAtLocal: normalizeLocalDateTimeContext(journeySource?.startedAtLocal),
            endedAtLocal: normalizeLocalDateTimeContext(journeySource?.endedAtLocal),
        },
    };
}

function isPublishedJourneyResponse(
    payload: unknown,
): payload is PublishedJourneyResponse {
    return Boolean(
        payload &&
        typeof payload === "object" &&
        "status" in payload,
    );
}

export const fetchPublishedJourneyResult = cache(async function fetchPublishedJourneyResult(
    publicId: string,
    lang?: Language,
): Promise<FetchPublishedJourneyResult> {
    try {
        const params = new URLSearchParams({ viewer: "web" });
        appendPublicApiLanguage(params, lang);
        const response = await fetchPublicApi(
            `/v2/journeys/public/${encodeURIComponent(publicId)}/viewer?${params.toString()}`,
            { next: { revalidate: PUBLIC_JOURNEY_REVALIDATE_SECONDS } },
        );

        if (!response) {
            return { status: "error", data: null };
        }

        const payload = (await response.json().catch(() => null)) as
            | PublishedJourneyDetailResponseDto
            | PublishedJourneyResponse
            | { message?: unknown }
            | null;
        const message =
            isRecord(payload) && "message" in payload
                ? (readMessage(payload.message) ?? undefined)
                : undefined;

        if (response.ok) {
            if (!isPublishedJourneyResponse(payload)) {
                return { status: "error", data: null, message };
            }

            if (payload.status !== "success" || !payload.data) {
                return { status: "error", data: null, message };
            }

            const data = normalizePublishedJourney(payload.data, message, lang);

            if (!data) {
                return { status: "error", data: null, message };
            }

            if (isUnavailableForWeb(data)) {
                if (!shouldRenderHiddenJourneyNotice(data)) {
                    return {
                        status: "not_found",
                        data: null,
                        message: data.notice ?? message,
                    };
                }

                return {
                    status: "hidden",
                    data,
                    message: data.notice ?? message,
                };
            }

            return {
                status: "success",
                data,
                message,
            };
        }

        if (response.status === 403 || response.status === 404) {
            if (isPendingOrRejectedJourneyMessage(message)) {
                return { status: "not_found", data: null, message };
            }

            if (isHiddenJourneyMessage(message)) {
                return { status: "hidden", data: null, message };
            }

            return { status: "not_found", data: null, message };
        }

        return { status: "error", data: null, message };
    } catch {
        console.warn(
            "[published-journey] Failed to fetch published journey",
        );
        return { status: "error", data: null };
    }
});

export async function fetchPublishedJourney(
    publicId: string,
    lang?: Language,
): Promise<PublishedJourneyApi | null> {
    const result = await fetchPublishedJourneyResult(publicId, lang);
    return result.status === "success" ? result.data : null;
}

type PublishedJourneysQuery = NonNullable<
    Parameters<Api<unknown>["v2"]["publishJourneyPublicControllerGetPublishedJourneys"]>[0]
>;

export type PublishedJourneyListSort = NonNullable<
    PublishedJourneysQuery["sort"]
>;

type CursorPublishedJourneySort = Extract<PublishedJourneyListSort, "recent">;

type BaseFetchPublishedJourneysOptions = {
    limit?: number;
    lang?: Language;
    excludeMine?: boolean;
    accessToken?: string;
};

type OffsetPublishedJourneysOptions = BaseFetchPublishedJourneysOptions & {
    page?: number,
    sort?: Exclude<PublishedJourneyListSort, "discovery">,
    cursor?: never;
    discoverySeed?: never;
};

type DiscoveryPublishedJourneysOptions = BaseFetchPublishedJourneysOptions & {
    page?: number,
    sort: "discovery";
    cursor?: never;
    discoverySeed?: string;
};

type CursorPublishedJourneysOptions = BaseFetchPublishedJourneysOptions & {
    cursor: string;
    limit?: number;
    page?: never;
    sort?: CursorPublishedJourneySort;
    discoverySeed?: never;
};

export type FetchPublishedJourneysOptions =
    | DiscoveryPublishedJourneysOptions
    | OffsetPublishedJourneysOptions
    | CursorPublishedJourneysOptions;

type ResolvedPublishedJourneysRequest = {
    page: number;
    limit: number;
    sort: PublishedJourneyListSort;
    cursor: string | null;
    discoverySeed: string | null;
    reviewStatus: ApprovedPublicJourneyReviewStatus;
    excludeMine: boolean;
    accessToken?: string;
    lang?: Language,
};

function resolvePublishedJourneysRequest(
    options?: FetchPublishedJourneysOptions,
): ResolvedPublishedJourneysRequest {
    const page = Math.max(1, options?.page ?? 1);
    const limit = Math.max(1, options?.limit ?? 20);
    const sort = options?.sort ?? "recent";
    const excludeMine = options?.excludeMine === true;
    const accessToken = readText(options?.accessToken) ?? undefined;
    const cursorOption =
        options && "cursor" in options ? options.cursor : undefined;
    const cursor = readText(cursorOption) ?? null;
    const discoverySeedOption =
        options && "discoverySeed" in options ? options.discoverySeed : undefined;
    const discoverySeed = readText(discoverySeedOption) ?? null;

    if ("cursor" in (options ?? {}) && !cursor) {
        throw new Error(
            "[published-journey] Cursor pagination requires a non-empty cursor.",
        );
    }

    if (cursor && sort !== "recent") {
        throw new Error(
            "[published-journey] Cursor pagination supports only recent sort.",
        );
    }

    if (cursor && page > 1) {
        throw new Error(
            "[published-journey] Cursor pagination does not support page > 1.",
        );
    }

    if (cursor && discoverySeed) {
        throw new Error(
            "[published-journey] Cursor pagination does not support discovery seeds.",
        );
    }

    if (discoverySeed && sort !== "discovery") {
        throw new Error(
            "[published-journey] Discovery seeds support only discovery sort.",
        );
    }

    if (sort === "discovery" && page > 1 && !discoverySeed) {
        throw new Error(
            "[published-journey] Discovery page > 1 requires a non-empty discovery seed.",
        );
    }

    if (excludeMine && !accessToken) {
        throw new Error(
            "[published-journey] excludeMine requires an access token.",
        );
    }

    return {
        page,
        limit,
        sort,
        cursor,
        discoverySeed,
        reviewStatus: APPROVED_PUBLIC_JOURNEY_REVIEW_STATUS,
        excludeMine,
        accessToken,
        lang: options?.lang,
    };
}

function normalizeHasMore(
    value: unknown,
    page: number,
    pages: number | null,
): boolean {
    const hasMore = readBoolean(value);
    if (hasMore !== null) {
        return hasMore;
    }

    return pages !== null ? page < pages : false;
}

async function requestPublishedJourneys(
    request: ResolvedPublishedJourneysRequest,
): Promise<PublishedJourneysListApi | null> {
    try {
        const params = new URLSearchParams({
            page: request.page.toString(),
            limit: request.limit.toString(),
            sort: request.sort,
            reviewStatus: request.reviewStatus,
        });

        if (request.cursor) {
            params.set("cursor", request.cursor);
        }

        if (request.discoverySeed) {
            params.set("discoverySeed", request.discoverySeed);
        }

        if (request.excludeMine) {
            params.set("excludeMine", "true");
        }

        appendPublicApiLanguage(params, request.lang);

        const headers =
            request.excludeMine && request.accessToken
                ? {
                    Authorization: `Bearer ${request.accessToken}`,
                }
                : undefined;
        const fetchOptions =
            request.sort === "discovery"
                ? {
                    cache: "no-store" as const,
                }
                : {
                    next: { revalidate: PUBLIC_JOURNEY_REVALIDATE_SECONDS },
                };
        const response = await fetchPublicApi(
            `/v2/journeys/public?${params.toString()}`,
            {
                ...fetchOptions,
                ...(headers ? { headers } : {}),
            },
            { attemptsPerBase: 2 },
        );

        if (!response || !response.ok) {
            return null;
        }

        const payload = (await response.json()) as
            | PublishedJourneysResponseDto
            | {
                status: string;
                data?: {
                    journeys?: PublishedJourneyItemDto[];
                    total?: number;
                    page?: number;
                    pages?: number;
                    limit?: number;
                    hasMore?: boolean;
                    nextCursor?: unknown;
                    discoverySeed?: unknown;
                };
            };

        if (payload?.status !== "success" || !payload.data) {
            return null;
        }

        const journeys = Array.isArray(payload.data.journeys)
            ? payload.data.journeys
                .map((item) => normalizeJourneyListItem(item))
                .filter((item): item is PublishedJourneyListItemApi => Boolean(item))
            : [];
        const currentPage = readNumber(payload.data.page);
        const totalPages = readNumber(payload.data.pages);

        return {
            journeys,
            total: readNumber(payload.data.total) ?? journeys.length,
            page: currentPage ?? undefined,
            pages: totalPages ?? undefined,
            limit: readNumber(payload.data.limit) ?? request.limit,
            hasMore: normalizeHasMore(
                payload.data.hasMore,
                currentPage ?? request.page,
                totalPages,
            ),
            nextCursor: readText(payload.data.nextCursor) ?? null,
            discoverySeed: readText(payload.data.discoverySeed) ?? null,
        };
    } catch {
        console.warn(
            "[published-journey] Failed to fetch published journeys",
        );
        return null;
    }
}

const fetchPublishedJourneysCached = cache(async function fetchPublishedJourneysCached(
    page: number,
    limit: number,
    sort: PublishedJourneyListSort,
    cursor: string | null,
    lang?: Language,
): Promise<PublishedJourneysListApi | null> {
    return requestPublishedJourneys({
        page,
        limit,
        sort,
        cursor,
        discoverySeed: null,
        reviewStatus: APPROVED_PUBLIC_JOURNEY_REVIEW_STATUS,
        excludeMine: false,
        lang,
    });
});

export async function fetchPublishedJourneys(
    options?: FetchPublishedJourneysOptions,
): Promise<PublishedJourneysListApi | null> {
    const request = resolvePublishedJourneysRequest(options);

    if (
        request.excludeMine ||
        request.accessToken ||
        request.sort === "discovery"
    ) {
        return requestPublishedJourneys(request);
    }

    return fetchPublishedJourneysCached(
        request.page,
        request.limit,
        request.sort,
        request.cursor,
        request.lang,
    );
}

export async function fetchPublishedJourneysOrThrow(
    options?: FetchPublishedJourneysOptions,
): Promise<PublishedJourneysListApi> {
    const data = await fetchPublishedJourneys(options);

    if (!data) {
        throw new Error("[published-journey] Failed to fetch published journeys.");
    }

    return data;
}

export const fetchPublishedPhotoResult = cache(async function fetchPublishedPhotoResult(
    photoId: string,
    lang?: Language,
): Promise<FetchPublishedPhotoResult> {
    try {
        const params = new URLSearchParams();
        appendPublicApiLanguage(params, lang);
        const query = params.toString();
        const response = await fetchPublicApi(
            `/v2/journeys/public/photos/${encodeURIComponent(photoId)}${query ? `?${query}` : ""}`,
            { next: { revalidate: PUBLIC_PHOTO_REVALIDATE_SECONDS } },
        );

        if (!response) {
            return { status: "error", data: null };
        }

        if (!response.ok) {
            const payload = (await response.json().catch(() => null)) as
                | PublishedPhotoResponse
                | Record<string, unknown>
                | null;
            const message =
                isRecord(payload) && "message" in payload
                    ? (readMessage(payload.message) ?? undefined)
                    : undefined;

            if (response.status === 403 || response.status === 404) {
                return { status: "not_found", data: null, message };
            }

            return { status: "error", data: null, message };
        }

        const payload = (await response.json().catch(() => null)) as
            | PublishedPhotoResponse
            | Record<string, unknown>
            | null;

        if (!payload) {
            return { status: "error", data: null };
        }

        if (isRecord(payload) && "status" in payload && payload.status !== "success") {
            return {
                status: "error",
                data: null,
                message: readMessage(payload.message) ?? undefined,
            };
        }

        const source =
            isRecord(payload) && "data" in payload
                ? (payload.data as unknown)
                : payload;

        const photo = normalizePublishedPhoto(source, lang);

        if (!photo) {
            return { status: "error", data: null };
        }

        return {
            status: "success",
            data: photo,
        };
    } catch {
        console.warn(
            "[published-journey] Failed to fetch published photo",
        );
        return { status: "error", data: null };
    }
});

export const fetchPublishedPhoto = cache(async function fetchPublishedPhoto(
    photoId: string,
    lang?: Language,
): Promise<PublishedPhotoApi | null> {
    const result = await fetchPublishedPhotoResult(photoId, lang);
    return result.status === "success" ? result.data : null;
});
