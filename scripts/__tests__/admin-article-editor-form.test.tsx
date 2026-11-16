import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { ArticleEditorForm } from "@/features/articles/components/article-editor-form";

async function saveAction(): Promise<never> {
  throw new Error("not submitted in this test");
}

describe("ArticleEditorForm", () => {
  // Before hydration (or when the bundle fails to load) the browser submits
  // the form natively. Without an action it would GET the current URL with
  // the title and body in the query string and save nothing.
  it("posts to its save action without JavaScript", () => {
    const html = renderToStaticMarkup(
      <ArticleEditorForm
        article={null}
        formId="article-form"
        nextPath="/articles/new"
        returnTo="/articles"
        saveAction={saveAction}
      />,
    );

    const formTag = html.match(/<form [^>]*id="article-form"[^>]*>/)?.[0];

    expect(formTag).toBeDefined();
    expect(formTag).toMatch(/ action="/);
  });
});
