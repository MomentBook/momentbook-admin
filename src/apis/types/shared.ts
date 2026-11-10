// ──────────────────────────────────────────────
// Types shared across admin domains.
// ──────────────────────────────────────────────

/** Not in the API documents: the service layer derives these from a v3 page
 * (`{items, total, page, limit}`, ADR 0012 item 3) so pagination props stay. */
export type PageCounts = {
  pages: number;
  hasMore: boolean;
};
