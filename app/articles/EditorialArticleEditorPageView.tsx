import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import type { AdminReviewQueueData } from "@/lib/admin/reviews";
import type { AdminSession } from "@/lib/admin/session";
import { buildAdminArticleWorkspaceHref } from "@/lib/admin/paths";
import { getEditorialCategoryLabel } from "@/lib/editorial/copy";
import type { EditorialArticleRecord } from "@/lib/editorial/types";
import type { AdminDashboardBanner } from "@/app/_workspace/workspace-data";
import { AdminArticleShell } from "./AdminArticleShell";
import { EditorialArticleEditorForm } from "./EditorialArticleEditorForm";

function formatAdminDate(value: string | null | undefined): string {
  if (!value) return "Not available";
  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp)) return value;
  return new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(timestamp);
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
    article?.translationGroupId ?? suggestedTranslationGroupId ?? "Assigned on create";
  const workspaceHref = returnTo || buildAdminArticleWorkspaceHref();
  const headerTitle = title ?? (article ? "Edit article" : "Create article");
  const submitLabel = article ? "Save article" : "Create article";
  const formId = article ? `article-editor-${article.id}` : "article-editor-new";

  return (
    <AdminArticleShell pendingReviews={queue.summary.pendingCount} session={session}>
      <div className="flex flex-col gap-4">
        {/* Header */}
        <Card>
          <CardContent className="flex items-center justify-between gap-2 pt-6">
            <div className="flex flex-col gap-1">
              <Link href={workspaceHref} className="text-sm text-primary hover:underline">
                Back to articles
              </Link>
              <span className="text-xs text-muted-foreground">Editorial admin</span>
              <h1 className="text-2xl font-semibold tracking-tight">{headerTitle}</h1>
              <p className="text-sm text-muted-foreground">
                Markdown body is the canonical content source.
              </p>
            </div>

            <button
              form={formId}
              type="submit"
              className="border-0 bg-transparent p-0"
            >
              <Button size="sm">{submitLabel}</Button>
            </button>
          </CardContent>
        </Card>

        {/* Banner */}
        {banner ? (
          <Alert variant={banner.tone === "error" ? "destructive" : "default"}>
            <AlertDescription>{banner.message}</AlertDescription>
          </Alert>
        ) : null}

        {/* Metadata summary */}
        <Card>
          <CardContent className="pt-6">
            <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <div className="flex justify-between gap-4 sm:flex-col">
                <dt className="text-sm text-muted-foreground">Language</dt>
                <dd className="text-sm">
                  {article?.language ?? suggestedLanguage ?? "Choose on create"}
                </dd>
              </div>
              <div className="flex justify-between gap-4 sm:flex-col">
                <dt className="text-sm text-muted-foreground">Slug</dt>
                <dd className="text-sm">
                  {article?.slug ?? "Optional on create"}
                </dd>
              </div>
              <div className="flex justify-between gap-4 sm:flex-col">
                <dt className="text-sm text-muted-foreground">Translation group</dt>
                <dd className="text-sm">{translationGroupId}</dd>
              </div>
              <div className="flex justify-between gap-4 sm:flex-col">
                <dt className="text-sm text-muted-foreground">Category</dt>
                <dd className="text-sm">
                  {article ? getEditorialCategoryLabel("en", article.category) : "Set in form"}
                </dd>
              </div>
              <div className="flex justify-between gap-4 sm:flex-col">
                <dt className="text-sm text-muted-foreground">Published</dt>
                <dd className="text-sm">{formatAdminDate(article?.publishedAt)}</dd>
              </div>
              <div className="flex justify-between gap-4 sm:flex-col">
                <dt className="text-sm text-muted-foreground">Updated</dt>
                <dd className="text-sm">{formatAdminDate(article?.updatedAt)}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        {/* Editor form */}
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
