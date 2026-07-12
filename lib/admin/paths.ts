export const ADMIN_ROOT_PATH = "/";
export const ADMIN_LOGIN_PATH = "/login";
export const ADMIN_REVIEWS_PATH = "/reviews";
export const ADMIN_ARTICLES_PATH = "/articles";
export const ADMIN_SESSION_PATH = "/session";
export const ADMIN_SESSION_REFRESH_PATH = "/session/refresh";
export const ADMIN_SESSION_INVALIDATE_PATH = "/session/invalidate";
export const ADMIN_DEFAULT_WORKSPACE_TAB = "overview";

export type AdminWorkspaceTab = "overview" | "reviews" | "articles";
export type AdminSessionRedirectError =
  | "session_expired"
  | "admin_access_denied";
export type AdminArticleWorkspaceStatus =
  | "published"
  | "archived"
  | "all";

type AdminArticleWorkspaceHrefOptions = {
  page?: number | string | null;
  status?: AdminArticleWorkspaceStatus | string | null;
  lang?: string | null;
  category?: string | null;
  articleSlug?: string | null;
  mutation?: string | null;
  error?: string | null;
  message?: string | null;
};

function buildUrl(path: string): URL {
  return new URL(path, "https://momentbook.admin.local");
}

function readOptionalQueryValue(value: string | null | undefined): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function normalizePageQuery(value: number | string | null | undefined): string | null {
  if (typeof value === "number") {
    return Number.isInteger(value) && value > 1 ? String(value) : null;
  }

  const trimmed = readOptionalQueryValue(value);

  if (!trimmed) {
    return null;
  }

  const parsed = Number(trimmed);
  return Number.isInteger(parsed) && parsed > 1 ? String(parsed) : null;
}

function normalizeAdminArticleWorkspaceStatus(
  value: string | null | undefined,
): "published" | "archived" | null {
  if (value === "published" || value === "archived") {
    return value;
  }

  return null;
}

export function sanitizeAdminPath(
  value: string | null | undefined,
): string | null {
  if (!value) {
    return null;
  }

  // Reject protocol-relative URLs to prevent open redirect attacks.
  if (value.startsWith("//")) {
    return null;
  }

  // Reject absolute URLs (e.g. https://evil.com) which would bypass the
  // dummy base resolution in buildUrl.
  try {
    new URL(value);
    return null;
  } catch {
    // Not an absolute URL — safe to resolve against the dummy base.
  }

  try {
    const url = buildUrl(value);
    return `${url.pathname}${url.search}`;
  } catch {
    return null;
  }
}

export function buildAdminLoginHref(options?: {
  next?: string | null;
  error?: string | null;
  loggedOut?: boolean;
}): string {
  const url = buildUrl(ADMIN_LOGIN_PATH);
  const next = sanitizeAdminPath(options?.next);

  if (next && next !== ADMIN_ROOT_PATH) {
    url.searchParams.set("next", next);
  }

  if (options?.error) {
    url.searchParams.set("error", options.error);
  }

  if (options?.loggedOut) {
    url.searchParams.set("loggedOut", "1");
  }

  return `${url.pathname}${url.search}`;
}

export function sanitizeAdminSessionRedirectError(
  value: string | null | undefined,
): AdminSessionRedirectError | null {
  if (value === "session_expired" || value === "admin_access_denied") {
    return value;
  }

  return null;
}

export function withAdminQuery(
  path: string,
  entries: Record<string, string | null | undefined>,
): string {
  const url = buildUrl(path);

  for (const [key, value] of Object.entries(entries)) {
    if (!value) {
      url.searchParams.delete(key);
      continue;
    }

    url.searchParams.set(key, value);
  }

  return `${url.pathname}${url.search}`;
}

export function buildAdminSessionRefreshHref(options?: {
  next?: string | null;
}): string {
  return withAdminQuery(ADMIN_SESSION_REFRESH_PATH, {
    next: sanitizeAdminPath(options?.next),
  });
}

export function buildAdminSessionInvalidateHref(options?: {
  next?: string | null;
  error?: AdminSessionRedirectError | null;
}): string {
  return withAdminQuery(ADMIN_SESSION_INVALIDATE_PATH, {
    next: sanitizeAdminPath(options?.next),
    error: sanitizeAdminSessionRedirectError(options?.error),
  });
}

export function parseAdminWorkspaceTab(
  value: string | null | undefined,
): AdminWorkspaceTab {
  if (value === "reviews" || value === "live") {
    return "reviews";
  }

  if (value === "articles") {
    return "articles";
  }

  if (value === "overview") {
    return value;
  }

  return ADMIN_DEFAULT_WORKSPACE_TAB;
}

export function buildAdminWorkspaceHref(
  tab: AdminWorkspaceTab,
  entries?: Record<string, string | null | undefined>,
): string {
  return withAdminQuery(ADMIN_ROOT_PATH, {
    ...entries,
    tab: tab === ADMIN_DEFAULT_WORKSPACE_TAB ? null : tab,
  });
}

export function buildAdminReviewDetailHref(
  publicId: string,
  entries?: Record<string, string | null | undefined>,
): string {
  return withAdminQuery(
    `${ADMIN_REVIEWS_PATH}/${encodeURIComponent(publicId)}`,
    entries ?? {},
  );
}

export function buildAdminArticlesHref(
  entries?: Record<string, string | null | undefined>,
): string {
  return withAdminQuery(ADMIN_ARTICLES_PATH, entries ?? {});
}

export function buildAdminArticleWorkspaceHref(
  options?: AdminArticleWorkspaceHrefOptions,
): string {
  return withAdminQuery(ADMIN_ARTICLES_PATH, {
    page: normalizePageQuery(options?.page),
    status: normalizeAdminArticleWorkspaceStatus(options?.status),
    lang: readOptionalQueryValue(options?.lang),
    category: readOptionalQueryValue(options?.category),
    articleSlug: readOptionalQueryValue(options?.articleSlug),
    mutation: readOptionalQueryValue(options?.mutation),
    error: readOptionalQueryValue(options?.error),
    message: readOptionalQueryValue(options?.message),
  });
}

export function buildAdminArticleNewHref(
  entries?: Record<string, string | null | undefined>,
): string {
  return withAdminQuery(`${ADMIN_ARTICLES_PATH}/new`, entries ?? {});
}

export function buildAdminArticleDetailHref(
  articleId: string,
  entries?: Record<string, string | null | undefined>,
): string {
  return withAdminQuery(
    `${ADMIN_ARTICLES_PATH}/${encodeURIComponent(articleId)}`,
    entries ?? {},
  );
}

export function buildAdminArticleTableDetailHref(options: {
  articleId: string;
  page: number;
  status: AdminArticleWorkspaceStatus;
  lang: string | null;
  category: string | null;
}): string {
  return buildAdminArticleDetailHref(options.articleId, {
    returnTo: buildAdminArticleWorkspaceHref({
      page: options.page,
      status: options.status,
      lang: options.lang,
      category: options.category,
    }),
  });
}
