import "server-only";

import { ENV } from "@/src/configs/env.server";

// ─── Response Envelope ───────────────────────

export type Envelope<T> = {
  status: string;
  data: T;
  message?: string;
};

// ─── Error Classes ───────────────────────────

export class BackendApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
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
): error is { message: string; statusCode: number } {
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

// ─── URL Builder ────────────────────────────

function buildApiUrl(pathname: string, query?: Record<string, string | number>): string {
  const url = new URL(pathname, ENV.API_BASE_URL);

  if (query) {
    for (const [key, value] of Object.entries(query)) {
      url.searchParams.set(key, String(value));
    }
  }

  return url.toString();
}

// ─── Envelope Parser ─────────────────────────

export async function parseEnvelope<T>(response: Response): Promise<Envelope<T>> {
  const payload = (await response.json().catch(() => null)) as
    | Envelope<T>
    | { message?: string }
    | null;

  if (!response.ok) {
    const message =
      typeof payload?.message === "string"
        ? payload.message
        : `Request failed with status ${response.status}`;

    if (response.status === 401) {
      throw new AdminSessionExpiredError(message);
    }

    if (response.status === 403) {
      throw new AdminAccessDeniedError(message);
    }

    throw new BackendApiError(message, response.status);
  }

  if (!payload || typeof payload !== "object" || !("data" in payload)) {
    throw new BackendApiError("Invalid backend response shape", response.status);
  }

  return payload as Envelope<T>;
}

// ─── Core Request Function ───────────────────

export interface RequestEnvelopeOptions {
  pathname: string;
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  accessToken?: string;
  body?: unknown;
  query?: Record<string, string | number>;
}

export async function requestEnvelope<T>(options: RequestEnvelopeOptions): Promise<Envelope<T>> {
  const response = await fetch(buildApiUrl(options.pathname, options.query), {
    method: options.method ?? "GET",
    headers: {
      Accept: "application/json",
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(options.accessToken
        ? { Authorization: `Bearer ${options.accessToken}` }
        : {}),
    },
    ...(options.body ? { body: JSON.stringify(options.body) } : {}),
    cache: "no-store",
  });

  return parseEnvelope<T>(response);
}
