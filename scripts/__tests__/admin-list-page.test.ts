import { describe, expect, it } from "vitest";

import { ADMIN_PAGE_SIZE, toListPage } from "@/lib/workspace/list-page";

describe("toListPage", () => {
  it("keeps the requested page, the items and the total", () => {
    const list = { items: ["a", "b"], total: 42, page: 3, limit: 20, pages: 3, hasMore: false };

    expect(toListPage(list, 3)).toEqual({ items: ["a", "b"], total: 42, page: 3, pages: 3 });
  });

  it("counts at least one page when the list is empty", () => {
    const list = { items: [], total: 0, page: 1, limit: 20, pages: 0, hasMore: false };

    expect(toListPage(list, 1).pages).toBe(1);
  });

  it("asks for 20 rows a page, as every list did", () => {
    expect(ADMIN_PAGE_SIZE).toBe(20);
  });
});
