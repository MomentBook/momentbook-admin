import type { ArticleCategory } from "@/lib/api/types";

// The article categories as the admin spells them in its URLs and forms
// (`travel-guide`). The API spells them in UPPER_SNAKE_CASE (contract-v3
// §2.7); the article services map between the two (ADR 0012 item 5), so this
// lives with them.

export const editorialArticleCategories = [
  "festival",
  "travel-guide",
  "destination-guide",
  "wellbeing-guide",
] as const;

export type EditorialArticleCategory =
  (typeof editorialArticleCategories)[number];

/** The API spells categories in UPPER_SNAKE_CASE (contract-v3 §2.7); admin
 * URLs and forms keep the editorial spelling (ADR 0012 item 5). */
const articleCategoryApiValues = {
  festival: "FESTIVAL",
  "travel-guide": "TRAVEL_GUIDE",
  "destination-guide": "DESTINATION_GUIDE",
  "wellbeing-guide": "WELLBEING_GUIDE",
} as const satisfies Record<EditorialArticleCategory, ArticleCategory>;

export function toArticleCategoryApiValue(
  category: EditorialArticleCategory,
): ArticleCategory {
  return articleCategoryApiValues[category];
}

/** The editorial category of an API value, or `null` for an unknown one. */
export function parseArticleCategoryApiValue(
  value: unknown,
): EditorialArticleCategory | null {
  return (
    editorialArticleCategories.find(
      (category) => articleCategoryApiValues[category] === value,
    ) ?? null
  );
}
