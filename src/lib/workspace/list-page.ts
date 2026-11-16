/** Rows every admin list asks the API for on one page. */
export const ADMIN_PAGE_SIZE = 20;

/** One page of a list as the views show it. `page` is the page asked for,
 * and `pages` is at least 1 so an empty list still reads "Page 1 of 1". */
export type ListPage<T> = {
  items: T[];
  total: number;
  page: number;
  pages: number;
};

export function toListPage<T>(
  list: { items: T[]; total: number; pages: number },
  page: number,
): ListPage<T> {
  return { items: list.items, total: list.total, page, pages: Math.max(1, list.pages) };
}
