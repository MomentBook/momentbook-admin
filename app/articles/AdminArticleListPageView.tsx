/* eslint-disable @next/next/no-img-element -- admin article cover images are arbitrary remote URLs without stable optimization contracts */

import Link from "next/link";
import { buildAdminArticleDetailHref, buildAdminArticleNewHref, buildAdminArticleWorkspaceHref } from "@/lib/admin/paths";
import type { AdminSession } from "@/lib/admin/session";
import {
  type AdminEditorialArticleDashboardData,
} from "@/lib/editorial/admin";
import { getEditorialCategoryLabel } from "@/lib/editorial/copy";
import { editorialArticleCategories } from "@/lib/editorial/types";
import { languageList } from "@/lib/i18n/config";
import type { AdminDashboardBanner } from "@/app/_workspace/workspace-data";
import { AdminArticleShell } from "./AdminArticleShell";
import styles from "./article-admin.module.scss";

function formatAdminDate(value: string): string {
  const timestamp = Date.parse(value);

  if (!Number.isFinite(timestamp)) {
    return value;
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
  }).format(timestamp);
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
  const bannerClassName =
    banner?.tone === "error"
      ? styles.bannerError
      : banner?.tone === "success"
        ? styles.bannerSuccess
        : styles.banner;
  const activeLanguageLabel = dashboard.language
    ? dashboard.language.toUpperCase()
    : "All languages";
  const activeCategoryLabel = dashboard.category
    ? getEditorialCategoryLabel("en", dashboard.category)
    : "All categories";

  return (
    <AdminArticleShell pendingReviews={pendingReviews} session={session}>
      <div className={styles.pageStack}>
        <section className={styles.headerCard}>
          <div className={styles.headerTop}>
            <div className={styles.headerCopy}>
              <span className={styles.eyebrow}>Editorial admin</span>
              <h1 className={styles.title}>Articles</h1>
              <p className={styles.description}>
                Published-only guide records. Summary, cover image, and reading
                time are derived from the markdown body on the server.
              </p>
              <p className={styles.sessionLine}>
                Session: {session.email || session.name || "Admin"} · {dashboard.total} records
              </p>
            </div>

            <div className={styles.headerActions}>
              <Link href={buildAdminArticleNewHref()} className={styles.button}>
                New article
              </Link>
            </div>
          </div>
        </section>

        {banner ? (
          <p className={bannerClassName} role="status" aria-live="polite">
            {banner.message}
          </p>
        ) : null}

        <section className={styles.summaryStrip}>
          <div className={styles.summaryCard}>
            <span className={styles.summaryLabel}>Current view</span>
            <span className={styles.summaryValue}>
              {activeLanguageLabel} · {activeCategoryLabel}
            </span>
          </div>
          <div className={styles.summaryCard}>
            <span className={styles.summaryLabel}>Pagination</span>
            <span className={styles.summaryValue}>
              Page {dashboard.page} of {Math.max(1, dashboard.pages)}
            </span>
          </div>
          <div className={styles.summaryCard}>
            <span className={styles.summaryLabel}>Model</span>
            <span className={styles.summaryValue}>Published-only markdown article</span>
          </div>
          <div className={styles.summaryCard}>
            <span className={styles.summaryLabel}>Derived fields</span>
            <span className={styles.summaryValue}>Summary, cover image, reading time</span>
          </div>
        </section>

        <section className={styles.filterSection}>
          <div className={styles.filterRow}>
            <div className={styles.filterGroup}>
              <span className={styles.filterLabel}>Language</span>
              <div className={styles.filterChips}>
                <Link
                  href={buildAdminArticleWorkspaceHref({
                    category: dashboard.category,
                  })}
                  className={
                    dashboard.language ? styles.filterChip : styles.filterChipActive
                  }
                >
                  All
                </Link>
                {languageList.map((language) => (
                  <Link
                    key={language}
                    href={buildAdminArticleWorkspaceHref({
                      page: 1,
                      lang: language,
                      category: dashboard.category,
                    })}
                    className={
                      dashboard.language === language
                        ? styles.filterChipActive
                        : styles.filterChip
                    }
                  >
                    {language.toUpperCase()}
                  </Link>
                ))}
              </div>
            </div>

            <div className={styles.filterGroup}>
              <span className={styles.filterLabel}>Category</span>
              <div className={styles.filterChips}>
                <Link
                  href={buildAdminArticleWorkspaceHref({
                    lang: dashboard.language,
                  })}
                  className={
                    dashboard.category ? styles.filterChip : styles.filterChipActive
                  }
                >
                  All
                </Link>
                {editorialArticleCategories.map((category) => (
                  <Link
                    key={category}
                    href={buildAdminArticleWorkspaceHref({
                      page: 1,
                      lang: dashboard.language,
                      category,
                    })}
                    className={
                      dashboard.category === category
                        ? styles.filterChipActive
                        : styles.filterChip
                    }
                  >
                    {getEditorialCategoryLabel("en", category)}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        {dashboard.items.length === 0 ? (
          <section className={styles.emptyState}>
            <h2 className={styles.emptyTitle}>No articles match the current filters.</h2>
            <p className={styles.emptyBody}>
              Widen the language or category filters, or create a new article.
            </p>
          </section>
        ) : (
          <>
            <div className={styles.listHeader}>
              <h2 className={styles.listTitle}>Editorial archive</h2>
              <span className={styles.listMeta}>{dashboard.total} published records</span>
            </div>

            <ol className={styles.articleList}>
              {dashboard.items.map((item) => (
                <li key={item.id} className={styles.articleCard}>
                  <Link
                    href={buildAdminArticleDetailHref(item.id, {
                      returnTo: currentWorkspaceHref,
                    })}
                    className={styles.articleCardLink}
                  >
                    <div className={styles.articleCover}>
                      {item.coverImage ? (
                        <img
                          alt={item.coverImage.alt}
                          className={styles.articleCoverImage}
                          src={item.coverImage.url}
                        />
                      ) : (
                        <div className={styles.articleCoverEmpty}>No derived cover image</div>
                      )}
                    </div>

                    <div className={styles.articleBody}>
                      <div className={styles.articleMetaGroup}>
                        <span className={styles.metaChip}>{item.language.toUpperCase()}</span>
                        <span className={styles.metaChip}>
                          {getEditorialCategoryLabel("en", item.category)}
                        </span>
                      </div>

                      <h3 className={styles.articleTitle}>{item.title}</h3>
                      <span className={styles.routeText}>
                        /{item.language}/guides/{item.slug}
                      </span>
                      <p className={styles.articleSummary}>{item.summary}</p>
                    </div>

                    <div className={styles.articleUtility}>
                      <div className={styles.articleUtilityTop}>
                        <span className={styles.utilityReadingTime}>
                          {item.readingMinutes} min
                        </span>
                        <span className={styles.statusChip}>
                          {item.coverImage ? "Cover derived" : "No cover"}
                        </span>
                      </div>

                      <dl className={styles.utilityMetaList}>
                        <div className={styles.utilityMetaItem}>
                          <dt className={styles.detailLabel}>Author</dt>
                          <dd className={styles.detailValue}>{item.authorName}</dd>
                        </div>
                        <div className={styles.utilityMetaItem}>
                          <dt className={styles.detailLabel}>Published</dt>
                          <dd className={styles.detailValue}>
                            {formatAdminDate(item.publishedAt)}
                          </dd>
                        </div>
                        <div className={styles.utilityMetaItem}>
                          <dt className={styles.detailLabel}>Updated</dt>
                          <dd className={styles.detailValue}>
                            {formatAdminDate(item.updatedAt)}
                          </dd>
                        </div>
                      </dl>

                      <span className={styles.editAffordance}>Open editor</span>
                    </div>
                  </Link>
                </li>
              ))}
            </ol>

            {dashboard.pages > 1 ? (
              <div className={styles.pagination}>
                <Link
                  href={buildAdminArticleWorkspaceHref({
                    page: Math.max(1, dashboard.page - 1),
                    lang: dashboard.language,
                    category: dashboard.category,
                  })}
                  className={
                    dashboard.page <= 1 ? styles.paginationDisabled : styles.paginationLink
                  }
                >
                  Previous
                </Link>
                <span className={styles.paginationStatus}>
                  Page {dashboard.page} of {dashboard.pages}
                </span>
                <Link
                  href={buildAdminArticleWorkspaceHref({
                    page: Math.min(dashboard.pages, dashboard.page + 1),
                    lang: dashboard.language,
                    category: dashboard.category,
                  })}
                  className={
                    dashboard.page >= dashboard.pages
                      ? styles.paginationDisabled
                      : styles.paginationLink
                  }
                >
                  Next
                </Link>
              </div>
            ) : null}
          </>
        )}
      </div>
    </AdminArticleShell>
  );
}
