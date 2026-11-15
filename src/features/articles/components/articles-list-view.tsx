import Link from "next/link";
import { FilterTabs } from "@/components/filter-tabs";
import { FlashBanner } from "@/components/flash-banner";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { UrlPagination } from "@/components/url-pagination";
import { formatCount } from "@/lib/format/number";
import { languageList } from "@/lib/i18n";
import type { Flash } from "@/lib/navigation/flash";
import {
  buildAdminArticleDetailHref,
  buildAdminArticleNewHref,
  buildAdminArticleWorkspaceHref,
} from "@/lib/navigation/paths";
import { getEditorialCategoryLabel } from "@/entities/article/copy";
import { editorialArticleCategories } from "@/entities/article/types";
import type { AdminEditorialArticleDashboardData } from "@/features/articles/loader";
import { ArticlesTable, type ArticleRow } from "./articles-table";

export function ArticlesListView({
  banner,
  data,
}: {
  banner: Flash | null;
  data: AdminEditorialArticleDashboardData;
}) {
  const { language, category } = data;
  const listHref = (page?: number) =>
    buildAdminArticleWorkspaceHref({ page, lang: language, category });
  const currentHref = listHref(data.page);
  const rows: ArticleRow[] = data.items.map((item) => ({
    ...item,
    detailHref: buildAdminArticleDetailHref(item.id, { returnTo: currentHref }),
  }));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">Articles</h1>
          <p className="text-sm text-muted-foreground">
            {formatCount(data.total)} published records
          </p>
        </div>
        <Button asChild size="sm">
          <Link href={buildAdminArticleNewHref()}>New article</Link>
        </Button>
      </div>

      <FlashBanner flash={banner} />

      <div className="flex flex-col gap-3">
        <FilterTabs
          label="Language"
          variant="pill"
          items={[
            {
              label: "All",
              href: buildAdminArticleWorkspaceHref({ category }),
              active: !language,
            },
            ...languageList.map((option) => ({
              label: option.toUpperCase(),
              href: buildAdminArticleWorkspaceHref({ lang: option, category }),
              active: language === option,
            })),
          ]}
        />
        <FilterTabs
          label="Category"
          variant="pill"
          items={[
            {
              label: "All",
              href: buildAdminArticleWorkspaceHref({ lang: language }),
              active: !category,
            },
            ...editorialArticleCategories.map((option) => ({
              label: getEditorialCategoryLabel(option),
              href: buildAdminArticleWorkspaceHref({ lang: language, category: option }),
              active: category === option,
            })),
          ]}
        />
      </div>

      {rows.length > 0 ? (
        <>
          <div className="overflow-x-auto rounded-md border">
            <ArticlesTable rows={rows} />
          </div>
          <UrlPagination page={data.page} pages={data.pages} hrefFor={listHref} />
        </>
      ) : (
        <Empty className="border">
          <EmptyHeader>
            <EmptyTitle>No articles match the current filters.</EmptyTitle>
            <EmptyDescription>
              Widen the language or category filters, or create a new article.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
    </div>
  );
}
