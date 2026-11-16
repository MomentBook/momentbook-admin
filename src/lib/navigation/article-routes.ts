import { createLoader, parseAsString } from "nuqs/server";
import { flashParams, parseAsPage } from "./params";

// The article pages' search params. The link builders stay in `paths.ts`
// (`buildAdminArticleWorkspaceHref` and the rest), whose spelling the tests
// pin.

/** `/articles`: the page, the language and category filters (checked by the
 * article entity: an unknown one is no filter), and the banner an action
 * left. */
export const loadArticlesParams = createLoader({
  page: parseAsPage,
  lang: parseAsString,
  category: parseAsString,
  ...flashParams,
  articleSlug: parseAsString,
});

/** `/articles/new` and `/articles/<id>`: the list to return to, what a new
 * translation starts from, and the banner an action left. */
export const loadArticleEditorParams = createLoader({
  returnTo: parseAsString,
  translationGroupId: parseAsString,
  language: parseAsString,
  ...flashParams,
  articleSlug: parseAsString,
});
