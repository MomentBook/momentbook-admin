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
import { VStack } from "@astryxdesign/core/VStack";
import { HStack } from "@astryxdesign/core/HStack";
import { Heading } from "@astryxdesign/core/Heading";
import { Text } from "@astryxdesign/core/Text";
import { Badge } from "@astryxdesign/core/Badge";
import { Banner } from "@astryxdesign/core/Banner";
import { Button } from "@astryxdesign/core/Button";
import { Card } from "@astryxdesign/core/Card";
import { Table, TableCell, TableHeaderCell, TableRow } from "@astryxdesign/core/Table";
import { EmptyState } from "@astryxdesign/core/EmptyState";

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
      <VStack gap={4}>
        {/* Header */}
        <Card padding={3}>
          <HStack gap={2} vAlign="center" hAlign="between" wrap="wrap">
            <VStack gap={1}>
              <Text type="label" size="2xs" color="secondary">Editorial admin</Text>
              <Heading level={1}>Articles</Heading>
              <Text type="body" color="secondary">
                {dashboard.total} published records
              </Text>
            </VStack>

            <Link href={buildAdminArticleNewHref()}>
              <Button variant="primary" size="sm" label="New article" />
            </Link>
          </HStack>
        </Card>

        {/* Banner */}
        {banner ? (
          <Banner
            status={
              banner.tone === "error" ? "error"
              : banner.tone === "success" ? "success"
              : "info"
            }
            title={banner.message}
          />
        ) : null}

        {/* Filters */}
        <Card padding={3}>
          <VStack gap={2}>
            {/* Language filter */}
            <VStack gap={1}>
              <Text type="label" size="2xs" color="secondary">Language</Text>
              <HStack gap={1} wrap="wrap">
                <Link
                  href={buildAdminArticleWorkspaceHref({ category: dashboard.category })}
                >
                  <Badge
                    label="All"
                    variant={!dashboard.language ? "info" : "neutral"}
                  />
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
                      label={language.toUpperCase()}
                      variant={dashboard.language === language ? "info" : "neutral"}
                    />
                  </Link>
                ))}
              </HStack>
            </VStack>

            {/* Category filter */}
            <VStack gap={1}>
              <Text type="label" size="2xs" color="secondary">Category</Text>
              <HStack gap={1} wrap="wrap">
                <Link
                  href={buildAdminArticleWorkspaceHref({ lang: dashboard.language })}
                >
                  <Badge
                    label="All"
                    variant={!dashboard.category ? "info" : "neutral"}
                  />
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
                      label={getEditorialCategoryLabel("en", category)}
                      variant={dashboard.category === category ? "info" : "neutral"}
                    />
                  </Link>
                ))}
              </HStack>
            </VStack>
          </VStack>
        </Card>

        {/* Article table or empty state */}
        {dashboard.items.length === 0 ? (
          <Card padding={3}>
            <EmptyState
              title="No articles match the current filters."
              description="Widen the language or category filters, or create a new article."
              isCompact
            />
          </Card>
        ) : (
          <Card padding={0}>
            <VStack gap={0} isScrollable>
              <Table>
                <TableHeaderCell>Title</TableHeaderCell>
                <TableHeaderCell>Language</TableHeaderCell>
                <TableHeaderCell>Category</TableHeaderCell>
                <TableHeaderCell>Route</TableHeaderCell>
                <TableHeaderCell>Reading time</TableHeaderCell>
                <TableHeaderCell>Published</TableHeaderCell>
                {dashboard.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Link
                        href={buildAdminArticleDetailHref(item.id, {
                          returnTo: currentWorkspaceHref,
                        })}
                      >
                        {item.title}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Badge label={item.language.toUpperCase()} variant="neutral" />
                    </TableCell>
                    <TableCell>
                      {getEditorialCategoryLabel("en", item.category)}
                    </TableCell>
                    <TableCell>
                      <Text type="body" size="xsm" color="secondary">
                        /{item.language}/guides/{item.slug}
                      </Text>
                    </TableCell>
                    <TableCell>
                      {item.readingMinutes} min
                    </TableCell>
                    <TableCell>
                      {formatAdminDate(item.publishedAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </Table>
            </VStack>
          </Card>
        )}

        {/* Pagination */}
        {dashboard.pages > 1 ? (
          <HStack gap={2} hAlign="between" vAlign="center">
            <Link
              href={buildAdminArticleWorkspaceHref({
                page: Math.max(1, dashboard.page - 1),
                lang: dashboard.language,
                category: dashboard.category,
              })}
            >
              <Button
                variant="secondary"
                size="sm"
                label="Previous"
                isDisabled={dashboard.page <= 1}
              />
            </Link>
            <Text type="supporting" size="xsm">
              Page {dashboard.page} of {dashboard.pages}
            </Text>
            <Link
              href={buildAdminArticleWorkspaceHref({
                page: Math.min(dashboard.pages, dashboard.page + 1),
                lang: dashboard.language,
                category: dashboard.category,
              })}
            >
              <Button
                variant="secondary"
                size="sm"
                label="Next"
                isDisabled={dashboard.page >= dashboard.pages}
              />
            </Link>
          </HStack>
        ) : null}
      </VStack>
    </AdminArticleShell>
  );
}
