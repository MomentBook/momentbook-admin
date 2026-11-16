import { createLoader, parseAsString } from "nuqs/server";
import { flashParams, parseAsPage, parseAsUuid } from "./params";

/** `/comments`: the tab (`status`, checked by the comment model: active
 * unless named), the author (a non-UUID is dropped: the API answers 400),
 * the journey, the page, and the banner a delete left. */
export const loadCommentsParams = createLoader({
  status: parseAsString,
  userId: parseAsUuid,
  publicId: parseAsString,
  page: parseAsPage,
  ...flashParams,
});
