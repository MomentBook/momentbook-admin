import type { Mock } from "vitest";

export type FetchCall = {
  url: string;
  method: string;
  cache: RequestCache;
  /** Names spelled the way the admin writes them (`Accept-Language`). */
  headers: Record<string, string>;
  /** The raw request body; absent when the request has none. */
  body?: string;
};

// A Request lowercases header names; the tests name them as the code does.
function canonicalHeaderName(name: string): string {
  return name
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("-");
}

/** One call of a mocked fetch, read the same way whether the code called
 * `fetch(url, init)` or `fetch(request)` (openapi-fetch does the latter). */
export async function readFetchCall(mock: Mock, index = 0): Promise<FetchCall> {
  const [input, init] = (mock.mock.calls[index] ?? []) as [
    RequestInfo | URL | undefined,
    RequestInit | undefined,
  ];
  if (input === undefined) {
    throw new Error(`fetch was not called ${index + 1} time(s)`);
  }

  const request = input instanceof Request ? input : new Request(String(input), init);
  // A clone, so the same call can be read again.
  const body = request.body ? await request.clone().text() : undefined;

  return {
    url: request.url,
    method: request.method,
    cache: request.cache,
    headers: Object.fromEntries(
      [...request.headers].map(([name, value]) => [canonicalHeaderName(name), value]),
    ),
    ...(body === undefined ? {} : { body }),
  };
}
