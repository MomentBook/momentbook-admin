import type { AdminDashboardBanner } from "@/app/_workspace/workspace-data";

type ResolveArticleBannerOptions = {
  error: string | null;
  message: string | null;
  mutation: string | null;
  articleSlug: string | null;
};

function readSlugLabel(articleSlug: string | null): string {
  return articleSlug ? `"${articleSlug}"` : "Article";
}

export function resolveArticleBanner(
  options: ResolveArticleBannerOptions,
): AdminDashboardBanner | null {
  if (options.mutation === "article_created") {

    return {
      tone: "success",
      message: `${readSlugLabel(options.articleSlug)} created.`,
    };
  }

  if (options.mutation === "article_updated") {

    return {
      tone: "success",
      message: `${readSlugLabel(options.articleSlug)} updated.`,
    };
  }

  if (options.mutation === "article_deleted") {

    return {
      tone: "success",
      message: `${readSlugLabel(options.articleSlug)} deleted.`,
    };
  }

  switch (options.error) {
    case "article_validation":
      return {
        tone: "error",
        message: options.message || "Check the article fields and try again.",
      };
    case "article_not_found":
      return {
        tone: "error",
        message: "Article not found.",
      };
    case "article_create_failed":
      return {
        tone: "error",
        message: options.message || "Could not create the article. Try again.",
      };
    case "article_update_failed":
      return {
        tone: "error",
        message: options.message || "Could not update the article. Try again.",
      };
    case "article_delete_failed":
      return {
        tone: "error",
        message: options.message || "Could not delete the article. Try again.",
      };
    default:
      return null;
  }
}
