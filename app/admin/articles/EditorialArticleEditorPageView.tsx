import Link from "next/link";
import type { AdminReviewQueueData } from "@/lib/admin/reviews";
import type { AdminSession } from "@/lib/admin/session";
import { buildAdminArticleWorkspaceHref } from "@/lib/admin/paths";
import { getEditorialCategoryLabel } from "@/lib/editorial/copy";
import type { EditorialArticleRecord } from "@/lib/editorial/types";
import type { AdminDashboardBanner } from "../workspace-data";
import { AdminArticleShell } from "./AdminArticleShell";
import { EditorialArticleEditorForm } from "./EditorialArticleEditorForm";
import styles from "./article-admin.module.scss";

function formatAdminDate(value: string | null | undefined): string {
  if (!value) {
    return "Not available";
  }

  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp)) {
    return value;
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
  }).format(timestamp);
}

type EditorialArticleEditorPageViewProps = {
  article: EditorialArticleRecord | null;
  banner: AdminDashboardBanner | null;
  deleteAction?: (formData: FormData) => Promise<never>;
  nextPath: string;
  queue: AdminReviewQueueData;
  returnTo: string;
  saveAction: (formData: FormData) => Promise<never>;
  session: AdminSession;
  suggestedLanguage?: string | null;
  suggestedTranslationGroupId?: string | null;
  title?: string;
};

export function EditorialArticleEditorPageView({
  article,
  banner,
  deleteAction,
  nextPath,
  queue,
  returnTo,
  saveAction,
  session,
  suggestedLanguage,
  suggestedTranslationGroupId,
  title,
}: EditorialArticleEditorPageViewProps) {
  const translationGroupId =
    article?.translationGroupId ??
    suggestedTranslationGroupId ??
    "Assigned on create";
  const workspaceHref = returnTo || buildAdminArticleWorkspaceHref();
  const headerTitle = title ?? (article ? "Edit article" : "Create article");
  const submitLabel = article ? "Save article" : "Create article";
  const formId = article ? `article-editor-${article.id}` : "article-editor-new";
  const bannerClassName =
    banner?.tone === "error"
      ? styles.bannerError
      : banner?.tone === "success"
        ? styles.bannerSuccess
        : styles.banner;

  return (
    <AdminArticleShell
      pendingReviews={queue.summary.pendingCount}
      session={session}
    >
      <div className={styles.pageStack}>
        <section className={styles.headerCard}>
          <div className={styles.headerTop}>
            <div className={styles.headerCopy}>
              <Link href={workspaceHref} className={styles.backLink}>
                Back to articles
              </Link>
              <span className={styles.eyebrow}>Editorial admin</span>
              <h1 className={styles.title}>{headerTitle}</h1>
              <p className={styles.description}>
                Markdown body is the canonical content source. The server derives
                the summary, cover image, and reading time after save.
              </p>
              <p className={styles.sessionLine}>
                Session: {session.email || session.name || "Admin"} · Pending reviews: {queue.summary.pendingCount}
              </p>
            </div>

            <div className={styles.headerActions}>
              <button form={formId} type="submit" className={styles.button}>
                {submitLabel}
              </button>
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
            <span className={styles.summaryLabel}>Language</span>
            <span className={styles.summaryValue}>
              {article?.language ?? suggestedLanguage ?? "Choose on create"}
            </span>
          </div>
          <div className={styles.summaryCard}>
            <span className={styles.summaryLabel}>Slug</span>
            <span className={styles.summaryValue}>
              {article?.slug ?? "Optional on create"}
            </span>
          </div>
          <div className={styles.summaryCard}>
            <span className={styles.summaryLabel}>Translation group</span>
            <span className={styles.summaryValue}>{translationGroupId}</span>
          </div>
          <div className={styles.summaryCard}>
            <span className={styles.summaryLabel}>Category</span>
            <span className={styles.summaryValue}>
              {article ? getEditorialCategoryLabel("en", article.category) : "Set in form"}
            </span>
          </div>
          <div className={styles.summaryCard}>
            <span className={styles.summaryLabel}>Published</span>
            <span className={styles.summaryValue}>
              {formatAdminDate(article?.publishedAt)}
            </span>
          </div>
          <div className={styles.summaryCard}>
            <span className={styles.summaryLabel}>Updated</span>
            <span className={styles.summaryValue}>
              {formatAdminDate(article?.updatedAt)}
            </span>
          </div>
        </section>

        <EditorialArticleEditorForm
          article={article}
          deleteAction={deleteAction}
          formId={formId}
          nextPath={nextPath}
          returnTo={returnTo}
          saveAction={saveAction}
          suggestedLanguage={suggestedLanguage}
          translationGroupId={article?.translationGroupId ?? suggestedTranslationGroupId ?? null}
        />
      </div>
    </AdminArticleShell>
  );
}
