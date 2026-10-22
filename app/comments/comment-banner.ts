import type { AdminDashboardBanner } from "@/app/_workspace/workspace-data";

export function resolveCommentBanner(options: {
  mutation: string | null;
  error: string | null;
  message: string | null;
}): AdminDashboardBanner | null {
  if (options.mutation === "comment_deleted") {
    return { tone: "success", message: "Comment hidden from the journey." };
  }

  if (options.error === "comment_not_found") {
    return { tone: "error", message: "That comment no longer exists." };
  }

  if (options.error === "comment_update_failed") {
    return {
      tone: "error",
      message: options.message || "Could not delete the comment. Try again.",
    };
  }

  return null;
}
