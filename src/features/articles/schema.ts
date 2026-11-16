import { z } from "zod";
import { editorialArticleCategories } from "@/lib/api/article-category";
import { languageList, type Language } from "@/lib/i18n";

// An article's fields as the editor checks them while you type and the
// server action checks them again, with the same sentences. The API decides
// the rest (a slug already taken, a translation group that does not exist).

const MARKDOWN_IMAGE = /!\[([^\]]*)\]\(([^)\s]+)\)/g;

/** What is wrong with the body's images, or `null`. Every image is
 * `![alt](http(s)://…)` with alt text, as the public site renders them. */
export function findMarkdownImageProblem(body: string): string | null {
  const imageStarts = body.match(/!\[/g)?.length ?? 0;
  const images = [...body.matchAll(MARKDOWN_IMAGE)];

  if (images.length !== imageStarts) {
    return "Markdown images must use ![alt](https://...) syntax.";
  }

  for (const [, alt, url] of images) {
    if (!alt?.trim()) {
      return "Markdown image alt text must not be empty.";
    }

    let protocol: string;

    try {
      protocol = new URL(url.trim()).protocol;
    } catch {
      return "Markdown image URLs must be absolute http or https URLs.";
    }

    if (protocol !== "http:" && protocol !== "https:") {
      return "Markdown image URLs must use http or https.";
    }
  }

  return null;
}

/** A trimmed text field that must not be blank. A missing field (a form
 * without it) reads the same as a blank one. */
function required(name: string) {
  return z
    .string({ error: `${name} is required.` })
    .trim()
    .min(1, `${name} is required.`);
}

/** A trimmed text field; `undefined` when blank or missing. */
const optional = z
  .string()
  .optional()
  .transform((value) => value?.trim() || undefined);

function oneOf<const T extends string>(name: string, values: readonly T[]) {
  return required(name).refine((value): value is T => values.includes(value as T), {
    error: `${name} is invalid.`,
  });
}

const category = oneOf("category", editorialArticleCategories);
const title = required("title");
const body = required("body").superRefine((value, context) => {
  const problem = findMarkdownImageProblem(value);

  if (problem) {
    context.addIssue({ code: "custom", message: problem });
  }
});

/** A new article. Language, slug and translation group are set only here:
 * an edit cannot change them. */
export const articleCreateFields = z.object({
  language: oneOf<Language>("language", languageList),
  category,
  title,
  body,
  slug: optional,
  translationGroupId: optional,
});

/** An edit sends the API only these. */
export const articleEditFields = z.object({ category, title, body });

export type ArticleCreateFields = z.output<typeof articleCreateFields>;
export type ArticleEditFields = z.output<typeof articleEditFields>;
