export const ADMIN_ROOT_PATH = "/";
export const ADMIN_LOGIN_PATH = "/login";
export const ADMIN_REVIEWS_PATH = "/reviews";
export const ADMIN_ARTICLES_PATH = "/articles";
export const ADMIN_REPORTS_PATH = "/reports";
export const ADMIN_USERS_PATH = "/users";
export const ADMIN_COMMENTS_PATH = "/comments";
export const ADMIN_METRICS_PATH = "/metrics";
export const ADMIN_AUDIT_LOG_PATH = "/audit-log";
export const ADMIN_SESSION_PATH = "/session";
export const ADMIN_SESSION_REFRESH_PATH = "/session/refresh";
export const ADMIN_SESSION_INVALIDATE_PATH = "/session/invalidate";
export const ADMIN_DEFAULT_WORKSPACE_TAB = "overview";

export type AdminWorkspaceTab =
  | "overview"
  | "reviews"
  | "published"
  | "articles"
  | "reports";
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
    // Normalization can still produce "//host" (e.g. "/.//evil.com"), which a
    // redirect would treat as protocol-relative.
    if (url.pathname.startsWith("//")) {
      return null;
    }
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

  if (value === "published") {
    return "published";
  }

  if (value === "articles") {
    return "articles";
  }

  if (value === "reports") {
    return "reports";
  }

  if (value === "overview") {
    return value;
  }

  return ADMIN_DEFAULT_WORKSPACE_TAB;
}

/** The review queue; `pending` and page 1 are the defaults and stay out of
 * the URL. */
export function buildAdminReviewQueueHref(options?: {
  status?: string | null;
  page?: number | string | null;
  userId?: string | null;
  entries?: Record<string, string | null | undefined>;
}): string {
  const status = readOptionalQueryValue(options?.status);

  return withAdminQuery(ADMIN_REVIEWS_PATH, {
    status: status === "pending" ? null : status,
    userId: readOptionalQueryValue(options?.userId),
    page: normalizePageQuery(options?.page),
    ...options?.entries,
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

/** A review detail page's own URL (the action `returnTo`) and its links back
 * to the queue it was opened from. They carry the tab, page and author
 * filter, so going back lands on the same rows. `status` is the explicit
 * queue context, or `null` when opened from outside the queue. */
export function buildReviewDetailQueueLinks(options: {
  publicId: string;
  status: string | null;
  page: number;
  userId?: string | null;
  lang?: string | null;
}): { returnTo: string; backHref: string; notFoundHref: string } {
  const queue = { status: options.status, page: options.page, userId: options.userId };

  return {
    returnTo: buildAdminReviewDetailHref(options.publicId, {
      lang: options.lang,
      page: normalizePageQuery(options.page),
      status: options.status,
      userId: options.userId,
    }),
    backHref: buildAdminReviewQueueHref(queue),
    notFoundHref: buildAdminReviewQueueHref({
      ...queue,
      entries: { error: "review_target_not_found" },
    }),
  };
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

export type AdminReportsHrefOptions = {
  page?: number | string | null;
  status?: string | null;
  targetType?: string | null;
  reason?: string | null;
  targetId?: string | null;
  reporterId?: string | null;
  mutation?: string | null;
  error?: string | null;
  message?: string | null;
};

export function buildAdminReportsHref(
  options?: AdminReportsHrefOptions,
): string {
  return withAdminQuery(ADMIN_REPORTS_PATH, {
    page: normalizePageQuery(options?.page),
    status: readOptionalQueryValue(options?.status),
    targetType: readOptionalQueryValue(options?.targetType),
    reason: readOptionalQueryValue(options?.reason),
    targetId: readOptionalQueryValue(options?.targetId),
    reporterId: readOptionalQueryValue(options?.reporterId),
    mutation: readOptionalQueryValue(options?.mutation),
    error: readOptionalQueryValue(options?.error),
    message: readOptionalQueryValue(options?.message),
  });
}

export function buildAdminReportDetailHref(
  reportId: string,
  entries?: Record<string, string | null | undefined>,
): string {
  return withAdminQuery(
    `${ADMIN_REPORTS_PATH}/${encodeURIComponent(reportId)}`,
    entries ?? {},
  );
}

export function buildAdminUsersHref(options?: {
  q?: string | null;
  status?: string | null;
  role?: string | null;
  page?: number | string | null;
  error?: string | null;
}): string {
  return withAdminQuery(ADMIN_USERS_PATH, {
    q: readOptionalQueryValue(options?.q),
    status: readOptionalQueryValue(options?.status),
    role: readOptionalQueryValue(options?.role),
    page: normalizePageQuery(options?.page),
    error: readOptionalQueryValue(options?.error),
  });
}

export function buildAdminUserHref(
  userId: string,
  entries?: Record<string, string | null | undefined>,
): string {
  return withAdminQuery(
    `${ADMIN_USERS_PATH}/${encodeURIComponent(userId)}`,
    entries ?? {},
  );
}

export function buildAdminCommentsHref(options?: {
  status?: string | null;
  userId?: string | null;
  publicId?: string | null;
  page?: number | string | null;
  mutation?: string | null;
  error?: string | null;
  message?: string | null;
}): string {
  return withAdminQuery(ADMIN_COMMENTS_PATH, {
    status: readOptionalQueryValue(options?.status),
    userId: readOptionalQueryValue(options?.userId),
    publicId: readOptionalQueryValue(options?.publicId),
    page: normalizePageQuery(options?.page),
    mutation: readOptionalQueryValue(options?.mutation),
    error: readOptionalQueryValue(options?.error),
    message: readOptionalQueryValue(options?.message),
  });
}

export function buildAdminMetricsHref(options?: {
  days?: number | string | null;
}): string {
  const days = options?.days;

  return withAdminQuery(ADMIN_METRICS_PATH, {
    days: days === null || days === undefined ? null : String(days),
  });
}

export function buildAdminAuditLogHref(options?: {
  action?: string | null;
  actorId?: string | null;
  subjectUserId?: string | null;
  targetType?: string | null;
  targetId?: string | null;
  page?: number | string | null;
}): string {
  return withAdminQuery(ADMIN_AUDIT_LOG_PATH, {
    action: readOptionalQueryValue(options?.action),
    actorId: readOptionalQueryValue(options?.actorId),
    subjectUserId: readOptionalQueryValue(options?.subjectUserId),
    targetType: readOptionalQueryValue(options?.targetType),
    targetId: readOptionalQueryValue(options?.targetId),
    page: normalizePageQuery(options?.page),
  });
}
