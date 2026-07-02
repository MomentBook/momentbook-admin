"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  AdminAccessDeniedError,
  AdminSessionExpiredError,
  BackendApiError,
  getAdminPublishedJourneyDetail,
  logoutAdminFromBackend,
  updatePublishedJourneyReviewStatus,
} from "@/lib/admin/api";
import {
  ADMIN_ROOT_PATH,
  buildAdminLoginHref,
  sanitizeAdminPath,
  withAdminQuery,
} from "@/lib/admin/paths";
import { languageList } from "@/lib/i18n/config";
import {
  clearAdminSession,
  requireAdminActionSession,
  getStoredAdminSession,
} from "@/lib/admin/session";
import {
  requestWebRevalidation,
  WEB_REVALIDATION_FAILED_QUERY_VALUE,
} from "@/lib/admin/revalidation";
import {
  PUBLISHED_JOURNEYS_SITEMAP_TAG,
  fetchPublishedJourneySitemapChunks,
} from "@/lib/sitemap/public-content";
import type {
  PublishedJourneyDetailDto,
  UpdatePublishedJourneyReviewRequestDto,
} from "@/src/apis/client";

function readText(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value.trim() : "";
}

function readOptionalString(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function buildReviewActionRedirect(
  nextPath: string,
  entries: Record<string, string | null | undefined>,
): never {
  redirect(withAdminQuery(nextPath, entries));
}

function readReviewStatus(
  value: FormDataEntryValue | null,
): UpdatePublishedJourneyReviewRequestDto["status"] | null {
  if (typeof value !== "string") {
    return null;
  }

  if (value === "PENDING" || value === "APPROVED" || value === "REJECTED") {
    return value;
  }

  return null;
}

async function captureJourneySitemapPaths(): Promise<string[]> {
  const chunks = await fetchPublishedJourneySitemapChunks();

  return chunks.map((chunk) => `/sitemaps/journeys/${chunk.index}.xml`);
}

function collectPhotoIdsFromTimelineBlocks(
  photoIds: Set<string>,
  blocks: Array<{
    photoIds?: string[];
    photos?: Array<{ photoId?: string }>;
  }> | undefined,
) {
  for (const block of blocks ?? []) {
    for (const photoId of block.photoIds ?? []) {
      const normalized = readOptionalString(photoId);
      if (normalized) {
        photoIds.add(normalized);
      }
    }

    for (const photo of block.photos ?? []) {
      const normalized = readOptionalString(photo.photoId);
      if (normalized) {
        photoIds.add(normalized);
      }
    }
  }
}

function collectPhotoIdsFromDetail(detail: PublishedJourneyDetailDto): string[] {
  const photoIds = new Set<string>();

  for (const image of detail.images ?? []) {
    const normalized = readOptionalString(image.photoId);
    if (normalized) {
      photoIds.add(normalized);
    }
  }

  collectPhotoIdsFromTimelineBlocks(photoIds, detail.timeline);
  collectPhotoIdsFromTimelineBlocks(photoIds, detail.recapDraft?.timeline);

  return [...photoIds];
}

async function loadJourneyPhotoIds(
  accessToken: string,
  publicId: string,
): Promise<string[]> {
  try {
    const detail = await getAdminPublishedJourneyDetail({
      accessToken,
      publicId,
    });

    return collectPhotoIdsFromDetail(detail);
  } catch {
    return [];
  }
}

function collectJourneySurfacePaths(
  publicId: string,
  journeySitemapPaths: string[],
  photoIds: string[],
): string[] {
  const paths = new Set<string>();

  for (const lang of languageList) {
    paths.add(`/${lang}`);
    paths.add(`/${lang}/journeys`);
    paths.add(`/${lang}/journeys/${publicId}`);

    for (const photoId of photoIds) {
      paths.add(`/${lang}/photos/${photoId}`);
    }
  }

  paths.add("/sitemap.xml");

  for (const sitemapPath of journeySitemapPaths) {
    paths.add(sitemapPath);
  }

  return [...paths];
}

export async function logoutAdminAction(): Promise<never> {
  const cookieStore = await cookies();
  const session = await getStoredAdminSession(cookieStore);

  if (session?.refreshToken) {
    try {
      await logoutAdminFromBackend(session.refreshToken);
    } catch {
      // Clear the local admin session even if backend logout fails.
    }
  }

  await clearAdminSession(cookieStore);
  redirect(
    buildAdminLoginHref({
      loggedOut: true,
    }),
  );
}

export async function updatePublishedJourneyReviewAction(
  formData: FormData,
): Promise<never> {
  const cookieStore = await cookies();
  const nextPath =
    sanitizeAdminPath(readText(formData.get("returnTo"))) ?? ADMIN_ROOT_PATH;
  const targetPublicId = readText(formData.get("targetPublicId"));
  const reviewStatus = readReviewStatus(formData.get("reviewStatus"));

  const buildReturnEntries = (
    extra: Record<string, string | null | undefined>,
  ) => ({
    targetPublicId: targetPublicId || null,
    mutation: null,
    reviewStatus: null,
    error: null,
    revalidation: null,
    ...extra,
  });

  if (!targetPublicId) {
    buildReviewActionRedirect(
      nextPath,
      buildReturnEntries({
        error: "missing_public_id",
      }),
    );
  }

  if (!reviewStatus) {
    buildReviewActionRedirect(
      nextPath,
      buildReturnEntries({
        error: "invalid_review_status",
      }),
    );
  }

  const session = await requireAdminActionSession(cookieStore, nextPath);
  const [previousJourneySitemapPaths, previousPhotoIds] =
    await Promise.all([
      captureJourneySitemapPaths(),
      loadJourneyPhotoIds(session.accessToken, targetPublicId),
    ]);
  let result: Awaited<ReturnType<typeof updatePublishedJourneyReviewStatus>>;

  try {
    result = await updatePublishedJourneyReviewStatus({
      accessToken: session.accessToken,
      publicId: targetPublicId,
      status: reviewStatus,
    });
  } catch (error) {
    if (error instanceof AdminSessionExpiredError) {
      await clearAdminSession(cookieStore);
      redirect(
        buildAdminLoginHref({
          next: nextPath,
          error: "session_expired",
        }),
      );
    }

    if (error instanceof AdminAccessDeniedError) {
      await clearAdminSession(cookieStore);
      redirect(
        buildAdminLoginHref({
          next: nextPath,
          error: "admin_access_denied",
        }),
      );
    }

    if (error instanceof BackendApiError && error.statusCode === 404) {
      buildReviewActionRedirect(
        nextPath,
        buildReturnEntries({
          error: "review_target_not_found",
        }),
      );
    }

    buildReviewActionRedirect(
      nextPath,
      buildReturnEntries({
        error: "review_update_failed",
      }),
    );
  }

  const [nextJourneySitemapPaths, nextPhotoIds] =
    await Promise.all([
      captureJourneySitemapPaths(),
      loadJourneyPhotoIds(session.accessToken, result.publicId),
    ]);
  const revalidationSucceeded = await requestWebRevalidation({
    paths: collectJourneySurfacePaths(
      result.publicId,
      [...new Set([...previousJourneySitemapPaths, ...nextJourneySitemapPaths])],
      [...new Set([...previousPhotoIds, ...nextPhotoIds])],
    ),
    tags: [PUBLISHED_JOURNEYS_SITEMAP_TAG],
  });

  buildReviewActionRedirect(
    nextPath,
    buildReturnEntries({
      targetPublicId: result.publicId,
      mutation: "review_updated",
      reviewStatus: result.review.status,
      revalidation: revalidationSucceeded
        ? null
        : WEB_REVALIDATION_FAILED_QUERY_VALUE,
    }),
  );
}
