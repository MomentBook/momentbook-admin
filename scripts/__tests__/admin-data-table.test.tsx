import { createColumnHelper } from "@tanstack/react-table";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { DataTable } from "@/components/data-table/data-table";
import type { DataTableFeatures } from "@/components/data-table/data-table-features";

type Row = { id: string; name: string; count: number };

const column = createColumnHelper<DataTableFeatures, Row>();
const columns = column.columns([
  column.accessor("name", { header: "Name" }),
  column.accessor("count", {
    header: "Count",
    cell: (info) => `${info.getValue()} items`,
    meta: { className: "text-right" },
  }),
]);

describe("DataTable", () => {
  it("renders the headers and one row per item", () => {
    const html = renderToStaticMarkup(
      <DataTable
        columns={columns}
        data={[
          { id: "a", name: "Ann", count: 2 },
          { id: "b", name: "Bo", count: 1200 },
        ]}
        empty="Nothing here."
        getRowId={(row) => row.id}
      />,
    );

    expect(html.match(/<th /g)).toHaveLength(2);
    expect(html).toContain(">Name</th>");
    expect(html.match(/<tr /g)).toHaveLength(3);
    expect(html).toContain(">Ann</td>");
    expect(html).toMatch(/<td [^>]*class="[^"]*text-right[^"]*"[^>]*>2 items<\/td>/);
    expect(html).not.toContain("Nothing here.");
  });

  it("shows the empty state across every column when there are no rows", () => {
    const html = renderToStaticMarkup(
      <DataTable columns={columns} data={[]} empty="Nothing here." />,
    );

    expect(html).toMatch(/<td [^>]*colSpan="2"[^>]*>Nothing here\.<\/td>/i);
    expect(html).toContain(">Count</th>");
  });
});
