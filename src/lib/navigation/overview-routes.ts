import { createLoader, parseAsString, type inferParserType } from "nuqs/server";

/** `/`: the banner a review decision left, and the keys of bookmarks from
 * when every workspace screen lived at `/?tab=…` (the page sends those on
 * to the screen's own route, keys as they were). */
const overviewParams = {
  tab: parseAsString,
  status: parseAsString,
  page: parseAsString,
  targetType: parseAsString,
  reason: parseAsString,
  lang: parseAsString,
  category: parseAsString,
  articleSlug: parseAsString,
  targetPublicId: parseAsString,
  mutation: parseAsString,
  reviewStatus: parseAsString,
  error: parseAsString,
  message: parseAsString,
};

export const loadOverviewParams = createLoader(overviewParams);

export type OverviewParams = inferParserType<typeof overviewParams>;
