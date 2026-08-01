import Link from "next/link";
import {
  buildAdminArticleDetailHref,
  buildAdminArticleNewHref,
  buildAdminArticleWorkspaceHref,
} from "@/lib/admin/paths";
import type { AdminSession } from "@/lib/admin/session";
import { type AdminEditorialArticleDashboardData } from "@/lib/editorial/admin";
import { getEditorialCategoryLabel } from "@/lib/editorial/copy";
import { editorialArticleCategories } from "@/lib/editorial/types";
import { languageList } from "@/lib/i18n/config";
import type { AdminDashboardBanner } from "@/app/_workspace/workspace-data";
import { AdminArticleShell } from "./AdminArticleShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

function formatAdminDate(value: string): string {
  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp)) return value;
  return new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(timestamp);
}

type AdminArticleListPageViewProps = {
  banner: AdminDashboardBanner | null;
  dashboard: AdminEditorialArticleDashboardData;
  pendingReviews?: number;
  session: AdminSession;
};

export function AdminArticleListPageView({
  banner,
  dashboard,
  pendingReviews,
  session,
}: AdminArticleListPageViewProps) {
  const currentWorkspaceHref = buildAdminArticleWorkspaceHref({
    page: dashboard.page,
    lang: dashboard.language,
    category: dashboard.category,
  });

  return (
    <AdminArticleShell pendingReviews={pendingReviews} session={session}>
      <div className="flex flex-col gap-4">
        {/* Header */}
        <Card>
          <CardContent className="flex items-center justify-between gap-2 pt-6">
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">Editorial admin</span>
              <h1 className="text-2xl font-semibold tracking-tight">Articles</h1>
              <p className="text-sm text-muted-foreground">
                {dashboard.total} published records
              </p>
            </div>

            <Link href={buildAdminArticleNewHref()}>
              <Button size="sm">New article</Button>
            </Link>
          </CardContent>
        </Card>

        {/* Banner */}
        {banner ? (
          <Alert variant={banner.tone === "error" ? "destructive" : "default"}>
            <AlertDescription>{banner.message}</AlertDescription>
          </Alert>
        ) : null}

        {/* Filters */}
        <Card>
          <CardContent className="flex flex-col gap-2 pt-6">
            {/* Language filter */}
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">Language</span>
              <div className="flex flex-wrap gap-1">
                <Link
                  href={buildAdminArticleWorkspaceHref({ category: dashboard.category })}
                >
                  <Badge variant={!dashboard.language ? "default" : "outline"}>
                    All
                  </Badge>
                </Link>
                {languageList.map((language) => (
                  <Link
                    key={language}
                    href={buildAdminArticleWorkspaceHref({
                      page: 1,
                      lang: language,
                      category: dashboard.category,
                    })}
                  >
                    <Badge
                      variant={dashboard.language === language ? "default" : "outline"}
                    >
                      {language.toUpperCase()}
                    </Badge>
                  </Link>
                ))}
              </div>
            </div>

            {/* Category filter */}
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">Category</span>
              <div className="flex flex-wrap gap-1">
                <Link
                  href={buildAdminArticleWorkspaceHref({ lang: dashboard.language })}
                >
                  <Badge variant={!dashboard.category ? "default" : "outline"}>
                    All
                  </Badge>
                </Link>
                {editorialArticleCategories.map((category) => (
                  <Link
                    key={category}
                    href={buildAdminArticleWorkspaceHref({
                      page: 1,
                      lang: dashboard.language,
                      category,
                    })}
                  >
                    <Badge
                      variant={dashboard.category === category ? "default" : "outline"}
                    >
                      {getEditorialCategoryLabel("en", category)}
                    </Badge>
                  </Link>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Article table or empty state */}
        {dashboard.items.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-10 text-center">
              <h3 className="text-lg font-semibold">No articles match the current filters.</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Widen the language or category filters, or create a new article.
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Language</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Route</TableHead>
                      <TableHead>Reading time</TableHead>
                      <TableHead>Published</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dashboard.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <Link
                            href={buildAdminArticleDetailHref(item.id, {
                              returnTo: currentWorkspaceHref,
                            })}
                            className="text-primary hover:underline"
                          >
                            {item.title}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{item.language.toUpperCase()}</Badge>
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {getEditorialCategoryLabel("en", item.category)}
                        </TableCell>
                        <TableCell>
                          <span className="text-xs text-muted-foreground">
                            /{item.language}/guides/{item.slug}
                          </span>
                        </TableCell>
                        <TableCell>
                          {item.readingMinutes} min
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {formatAdminDate(item.publishedAt)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pagination */}
        {dashboard.pages > 1 ? (
          <div className="flex items-center justify-between gap-2">
            <Link
              href={buildAdminArticleWorkspaceHref({
                page: Math.max(1, dashboard.page - 1),
                lang: dashboard.language,
                category: dashboard.category,
              })}
            >
              <Button
                variant="outline"
                size="sm"
                disabled={dashboard.page <= 1}
              >
                Previous
              </Button>
            </Link>
            <span className="text-xs text-muted-foreground">
              Page {dashboard.page} of {dashboard.pages}
            </span>
            <Link
              href={buildAdminArticleWorkspaceHref({
                page: Math.min(dashboard.pages, dashboard.page + 1),
                lang: dashboard.language,
                category: dashboard.category,
              })}
            >
              <Button
                variant="outline"
                size="sm"
                disabled={dashboard.page >= dashboard.pages}
              >
                Next
              </Button>
            </Link>
          </div>
        ) : null}
      </div>
    </AdminArticleShell>
  );
}
