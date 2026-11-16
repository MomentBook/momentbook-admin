import { BackLink } from "@/components/back-link";
import { Field } from "@/components/detail-parts";
import { FlashBanner } from "@/components/flash-banner";
import { Time } from "@/components/time";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Flash } from "@/lib/navigation/flash";
import { getEditorialCategoryLabel } from "@/entities/article/copy";
import type { EditorialArticleRecord } from "@/entities/article/types";
import { ArticleEditorForm } from "./article-editor-form";

/** The article editor: what the record is (language, slug and group are
 * fixed once created), then the form. An edit also offers deleting. */
export function ArticleEditorView({
  article,
  banner,
  deleteAction,
  nextPath,
  returnTo,
  saveAction,
  suggestedLanguage,
  suggestedTranslationGroupId,
}: {
  article: EditorialArticleRecord | null;
  banner: Flash | null;
  deleteAction?: (formData: FormData) => Promise<never>;
  /** This page's own URL, where a refused save returns. */
  nextPath: string;
  /** The article list this editor was opened from. */
  returnTo: string;
  saveAction: (formData: FormData) => Promise<never>;
  suggestedLanguage?: string | null;
  suggestedTranslationGroupId?: string | null;
}) {
  const formId = article ? `article-editor-${article.id}` : "article-editor-new";
  const translationGroupId = article?.translationGroupId ?? suggestedTranslationGroupId ?? null;

  return (
    <div className="flex flex-col gap-4">
      <BackLink href={returnTo} label="Back to articles" />

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            {article ? "Edit article" : "Create article"}
          </h1>
          <p className="text-sm text-muted-foreground">
            Markdown body is the canonical content source.
          </p>
        </div>
        <Button type="submit" form={formId} size="sm">
          {article ? "Save article" : "Create article"}
        </Button>
      </div>

      <FlashBanner flash={banner} />

      <Card>
        <CardContent className="pt-6">
          <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Language">
              {article?.language ?? suggestedLanguage ?? "Choose on create"}
            </Field>
            <Field label="Slug">
              <span className="break-all">{article?.slug ?? "Optional on create"}</span>
            </Field>
            <Field label="Translation group">
              <span className="break-all">{translationGroupId ?? "Assigned on create"}</span>
            </Field>
            <Field label="Category">
              {article ? getEditorialCategoryLabel(article.category) : "Set in form"}
            </Field>
            <Field label="Published">
              <Time value={article?.publishedAt} fallback="Not available" />
            </Field>
            <Field label="Updated">
              <Time value={article?.updatedAt} fallback="Not available" />
            </Field>
          </dl>
        </CardContent>
      </Card>

      <ArticleEditorForm
        article={article}
        deleteAction={deleteAction}
        formId={formId}
        nextPath={nextPath}
        returnTo={returnTo}
        saveAction={saveAction}
        suggestedLanguage={suggestedLanguage}
        translationGroupId={translationGroupId}
      />
    </div>
  );
}
