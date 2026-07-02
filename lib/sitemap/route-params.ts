type RouteHandlerParams = Record<string, string | string[] | undefined>;

export type AppRouteContext<T extends RouteHandlerParams> = {
  params?: Promise<T>;
};

export async function resolveAppRouteParams<T extends RouteHandlerParams>(
  context: AppRouteContext<T>,
): Promise<T | null> {
  return (await context.params) ?? null;
}

export function readSingleRouteParam(
  value: string | string[] | undefined,
): string | undefined {
  return typeof value === "string" ? value : undefined;
}

export function stripRequiredRouteSuffix(
  value: string | undefined,
  suffix: string,
): string | undefined {
  if (!value || !value.endsWith(suffix)) {
    return undefined;
  }

  const stripped = value.slice(0, -suffix.length);
  return stripped.length > 0 ? stripped : undefined;
}

export function parsePositiveIntegerRouteParam(
  value: string | undefined,
): number | null {
  if (!value) {
    return null;
  }

  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed < 1) {
    return null;
  }

  return parsed;
}

/**
 * Returns HTTP 404 for a sitemap part that does not exist.
 * Use this when a dynamic [part] param refers to an unknown chunk index.
 * Google will eventually de-index the URL once it consistently returns 404.
 */
export function buildSitemapPartNotFoundResponse() {
  return new Response(null, { status: 404 });
}

