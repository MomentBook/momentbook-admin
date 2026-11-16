import {
  resolveFlash,
  type Flash,
  type FlashMessages,
  type FlashQuery,
} from "@/lib/navigation/flash";

type ArticleFlashQuery = FlashQuery & { articleSlug?: string | null };

function slugLabel(articleSlug: string | null | undefined): string {
  return articleSlug ? `"${articleSlug}"` : "Article";
}

const ARTICLE_FLASH: FlashMessages<ArticleFlashQuery> = {
  mutations: {
    article_created: ({ articleSlug }) => `${slugLabel(articleSlug)} created.`,
    article_updated: ({ articleSlug }) => `${slugLabel(articleSlug)} updated.`,
    article_deleted: ({ articleSlug }) => `${slugLabel(articleSlug)} deleted.`,
  },
  errors: {
    article_validation: ({ message }) => message || "Check the article fields and try again.",
    article_not_found: "Article not found.",
    article_create_failed: ({ message }) => message || "Could not create the article. Try again.",
    article_update_failed: ({ message }) => message || "Could not update the article. Try again.",
    article_delete_failed: ({ message }) => message || "Could not delete the article. Try again.",
  },
};

export function resolveArticleBanner(query: ArticleFlashQuery): Flash | null {
  return resolveFlash(query, ARTICLE_FLASH);
}
