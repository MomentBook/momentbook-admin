import {
  resolveFlash,
  type Flash,
  type FlashMessages,
  type FlashQuery,
} from "@/lib/navigation/flash";

const COMMENT_FLASH: FlashMessages<FlashQuery> = {
  mutations: {
    comment_deleted: "Comment hidden from the journey.",
  },
  errors: {
    comment_not_found: "That comment no longer exists.",
    comment_update_failed: ({ message }) => message || "Could not delete the comment. Try again.",
  },
};

export function resolveCommentBanner(query: FlashQuery): Flash | null {
  return resolveFlash(query, COMMENT_FLASH);
}
