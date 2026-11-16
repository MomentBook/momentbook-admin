import "server-only";

import createClient, { type ClientOptions, type Middleware } from "openapi-fetch";
import { z } from "zod";
import type { paths as AuthPaths } from "@/lib/api/generated/auth";
import type { paths as CorePaths } from "@/lib/api/generated/core";
import type { PageCounts } from "@/lib/api/types";
import { ENV } from "@/lib/env";

// ─── Error Classes ───────────────────────────

export class BackendApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    /** The API's machine-readable `errorCode`, when the error body has one
     * (e.g. `REVIEW_STATE_CONFLICT`). */
    public readonly errorCode?: string,
  ) {
    super(message);
    this.name = "BackendApiError";
  }
}

/**
 * Type guard that identifies BackendApiError instances (and subclasses)
 * without relying on `instanceof`, which can fail across Turbopack/Webpack
 * chunk boundaries. Uses structural duck typing on `statusCode` and `message`.
 */
export function isBackendApiError(
  error: unknown,
): error is { message: string; statusCode: number; errorCode?: string } {
  return (
    typeof error === "object" &&
    error !== null &&
    "statusCode" in error &&
    typeof (error as Record<string, unknown>).statusCode === "number" &&
    "message" in error &&
    typeof (error as Record<string, unknown>).message === "string"
  );
}

export class AdminSessionExpiredError extends BackendApiError {
  constructor(message = "Admin session expired") {
    super(message, 401);
    this.name = "AdminSessionExpiredError";
  }
}

export class AdminAccessDeniedError extends BackendApiError {
  constructor(message = "Admin access required") {
    super(message, 403);
    this.name = "AdminAccessDeniedError";
  }
}

// ─── Response (contract v3, ADR 0012) ───────

/** The top level of `ApiErrorResponseDto`; anything else in it is ignored,
 * and a field of the wrong type (a `null` errorCode) reads as absent. */
const apiErrorBody = z.object({
  message: z.string().optional().catch(undefined),
  errorCode: z.string().optional().catch(undefined),
});

/** The resource a 2xx carries (contract v3 has no envelope), nothing for a
 * 204, and the error classes for everything else: 401 and 403 end or deny the
 * session, any other status is a `BackendApiError` with the top-level
 * `errorCode` of `ApiErrorResponseDto`. */
export async function parseApiResponse<T>(response: Response): Promise<T> {
  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text().catch(() => "");
  let payload: unknown;
  let parsed = true;

  try {
    payload = JSON.parse(text);
  } catch {
    parsed = false;
  }

  if (!response.ok) {
    const body = apiErrorBody.safeParse(payload).data ?? {};
    const message = body.message ?? `Request failed with status ${response.status}`;

    if (response.status === 401) {
      throw new AdminSessionExpiredError(message);
    }

    if (response.status === 403) {
      throw new AdminAccessDeniedError(message);
    }

    throw new BackendApiError(message, response.status, body.errorCode);
  }

  if (!parsed) {
    throw new BackendApiError("Invalid backend response body", response.status);
  }

  return payload as T;
}

// ─── Clients ─────────────────────────────────

/** Every response goes through `parseApiResponse` first, so an error status
 * or a 2xx that is not JSON throws the classes above before openapi-fetch
 * reads the body. */
const contractV3: Middleware = {
  async onResponse({ response }) {
    await parseApiResponse(response.clone());
  },
};

/** `URLSearchParams` spelling (a space is `+`), as the API has always been
 * called; `undefined`, `null` and empty values are left out. */
function serializeQuery(query: Record<string, unknown>): string {
  const search = new URLSearchParams();

  for (const [name, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === "") {
      continue;
    }

    search.set(name, String(value));
  }

  return search.toString();
}

const clientOptions: ClientOptions = {
  baseUrl: ENV.API_BASE_URL,
  cache: "no-store",
  headers: { Accept: "application/json" },
  querySerializer: serializeQuery,
  // Read at call time, so the fetch Next patches (or a test stubs) is used.
  fetch: (request) => globalThis.fetch(request),
};

export const coreClient = createClient<CorePaths>(clientOptions);
coreClient.use(contractV3);

export const authClient = createClient<AuthPaths>(clientOptions);
authClient.use(contractV3);

export function bearer(accessToken: string): { Authorization: string } {
  return { Authorization: `Bearer ${accessToken}` };
}

/** The resource of a call. Errors never get here: the middleware has already
 * thrown them. */
export async function dataOf<T>(call: Promise<{ data?: T }>): Promise<T> {
  const { data } = await call;
  return data as T;
}

// ─── Page Counts ─────────────────────────────

/** Adds what v3 admin lists no longer send (`{items, total, page, limit}`),
 * so loaders and views keep their pagination props: `pages = ceil(total /
 * limit)`, 0 when `total` is 0, and `hasMore = page < pages`. */
export function withPageCounts<P extends { total: number; page: number; limit: number }>(
  page: P,
): P & PageCounts {
  const pages = page.total > 0 && page.limit > 0 ? Math.ceil(page.total / page.limit) : 0;

  return { ...page, pages, hasMore: page.page < pages };
}
