import type { EditorialArticleCategory } from "./types";

// The admin works in English: these are the category names editors see.
const ARTICLE_CATEGORY_LABELS: Record<EditorialArticleCategory, string> = {
  festival: "Festival Guide",
  "travel-guide": "Travel Guide",
  "destination-guide": "Destination Guide",
  "wellbeing-guide": "Wellbeing Guide",
};

export function getEditorialCategoryLabel(category: EditorialArticleCategory): string {
  return ARTICLE_CATEGORY_LABELS[category];
}
