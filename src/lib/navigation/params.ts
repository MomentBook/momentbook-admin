import {
  createLoader,
  createParser,
  createSerializer,
  parseAsString,
  type inferParserType,
  type Nullable,
  type ParserMap,
} from "nuqs/server";

// Parsers shared by the routes' search params (nuqs). Each route module
// (`review-routes.ts`, `report-routes.ts`, …) lists its keys in URL order and
// builds its loader and links from that one list.

/** Every admin list endpoint refuses a page above this (`page` maximum in
 * the API contract). */
export const MAX_PAGE = 100000;

/** A whole page number, clamped to 1…MAX_PAGE; `null` for anything else. */
export function parsePageNumber(value: string): number | null {
  const trimmed = value.trim();

  if (!/^-?\d+$/.test(trimmed)) {
    return null;
  }

  return Math.min(MAX_PAGE, Math.max(1, Number(trimmed)));
}

/** `?page=`: 1 when missing or not a whole number, and left out of the URL
 * when it is 1. */
export const parseAsPage = createParser({ parse: parsePageNumber, serialize: String }).withDefault(1);

// validator.js `isUUID(str, "all")`, which the API's @IsUUID() applies.
const UUID_PATTERN =
  /^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$/i;

/** A UUID filter the API accepts (`reporterId`, `userId`, …), or `undefined`
 * (it answers 400 for a non-UUID). */
export function parseUuidFilter(value: string | null | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed && UUID_PATTERN.test(trimmed) ? trimmed : undefined;
}

/** A UUID filter; anything else is no filter. */
export const parseAsUuid = createParser({
  parse: (value) => parseUuidFilter(value) ?? null,
  serialize: String,
});

/** A trimmed text filter; blank is no filter. */
export const parseAsText = createParser({
  parse: (value) => value.trim() || null,
  serialize: String,
});

// Builder inputs, loosely typed for the callers that pass query strings on.

/** A page as a number or a string; `null` (page 1) unless a whole number. */
export function toPage(value: number | string | null | undefined): number | null {
  if (typeof value === "number") {
    return Number.isInteger(value) ? parsePageNumber(String(value)) : null;
  }

  return value ? parsePageNumber(value) : null;
}

/** Trimmed text; `null` when blank. */
export function toText(value: string | null | undefined): string | null {
  return value?.trim() || null;
}

/** The banner keys an action leaves on the page it returns to. */
export const flashParams = {
  mutation: parseAsString,
  error: parseAsString,
  message: parseAsString,
};

export const loadFlashParams = createLoader(flashParams);

const URL_BASE = "https://momentbook.admin.local";

export type SerializerValues<P extends ParserMap> = Partial<Nullable<inferParserType<P>>>;

/**
 * Builds `path?query` from typed values in the parsers' key order, leaving
 * out empty values and defaults. Keys already on `path` are kept unless a
 * value replaces or clears them.
 *
 * nuqs writes `/`, `?`, `@` and `:` as they are; the admin's links and
 * redirects have always been spelled as URLSearchParams spells them, and its
 * tests pin that spelling, so the query is written again that way.
 */
export function createAdminSerializer<P extends ParserMap>(parsers: P) {
  const serialize = createSerializer(parsers);

  return (path: string, values: SerializerValues<P>): string => {
    const cleaned = Object.fromEntries(
      Object.entries(values).map(([key, value]) => [key, value === "" ? null : value]),
    ) as SerializerValues<P>;
    const url = new URL(serialize(path, cleaned), URL_BASE);
    const search = url.searchParams.toString();

    return search ? `${url.pathname}?${search}` : url.pathname;
  };
}
