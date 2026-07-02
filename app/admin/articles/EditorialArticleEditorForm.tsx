"use client";

import Link from "next/link";
import { useDeferredValue, useMemo, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { EditorialMarkdownContent } from "@/components/editorial/EditorialMarkdownContent";
import { parseEditorialBody } from "@/lib/editorial/body";
import { buildAdminArticleWorkspaceHref } from "@/lib/admin/paths";
import {
  editorialArticleCategories,
  type EditorialArticleCategory,
  type EditorialArticleRecord,
} from "@/lib/editorial/types";
import { languageList } from "@/lib/i18n/config";
import styles from "./article-admin.module.scss";

type EditorialArticleEditorFormProps = {
  article: EditorialArticleRecord | null;
  deleteAction?: (formData: FormData) => Promise<never>;
  formId: string;
  nextPath: string;
  returnTo: string;
  saveAction: (formData: FormData) => Promise<never>;
  suggestedLanguage?: string | null;
  translationGroupId?: string | null;
};

function insertSnippet(
  textarea: HTMLTextAreaElement,
  currentValue: string,
  snippet: string,
): string {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;

  return `${currentValue.slice(0, start)}${snippet}${currentValue.slice(end)}`;
}

function SubmitButton({
  label,
}: {
  label: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button type="submit" className={styles.button} disabled={pending}>
      {pending ? "Saving..." : label}
    </button>
  );
}

function DeleteButton() {
  const { pending } = useFormStatus();

  return (
    <button type="submit" className={styles.buttonDanger} disabled={pending}>
      {pending ? "Deleting..." : "Delete article"}
    </button>
  );
}

export function EditorialArticleEditorForm({
  article,
  deleteAction,
  formId,
  nextPath,
  returnTo,
  saveAction,
  suggestedLanguage,
  translationGroupId,
}: EditorialArticleEditorFormProps) {
  const isEditing = Boolean(article);
  const [titleText, setTitleText] = useState(article?.title ?? "");
  const [bodyText, setBodyText] = useState(article?.body ?? "");
  const [selectedLanguage, setSelectedLanguage] = useState(
    article?.language ?? suggestedLanguage ?? "en",
  );
  const [slugText, setSlugText] = useState(article?.slug ?? "");
  const [selectedCategory, setSelectedCategory] = useState<EditorialArticleCategory>(
    article?.category ?? "travel-guide",
  );
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const deferredBodyText = useDeferredValue(bodyText);
  const blocks = useMemo(
    () => parseEditorialBody(deferredBodyText),
    [deferredBodyText],
  );
  const currentTranslationGroupId = article?.translationGroupId ?? translationGroupId ?? "";
  const routeLanguage = article?.language ?? selectedLanguage;
  const routeSlug = article?.slug ?? slugText.trim();
  const routePreview = routeSlug
    ? `/${routeLanguage}/guides/${routeSlug}`
    : `/${routeLanguage}/guides/<generated-on-save>`;
  const summaryText =
    article?.summary ?? "Generated from the markdown body on save.";
  const coverText =
    article?.coverImage?.url ??
    "Derived when the body contains a valid markdown image.";
  const readingTimeText = article
    ? `${article.readingMinutes} min`
    : "Calculated after save";
  const submitLabel = isEditing ? "Save article" : "Create article";

  const handleInsert = (snippet: string) => {
    const textarea = textareaRef.current;
    if (!textarea) {
      setBodyText((current) => `${current}${current ? "\n\n" : ""}${snippet}`);
      return;
    }

    const nextValue = insertSnippet(textarea, bodyText, snippet);
    setBodyText(nextValue);

    requestAnimationFrame(() => {
      const cursor = textarea.selectionStart + snippet.length;
      textarea.focus();
      textarea.setSelectionRange(cursor, cursor);
    });
  };

  return (
    <div className={styles.editorGrid}>
      <form id={formId} action={saveAction} className={styles.editorMain}>
        <input type="hidden" name="nextPath" value={nextPath} />
        <input type="hidden" name="returnTo" value={returnTo} />
        {article ? <input type="hidden" name="articleId" value={article.id} /> : null}
        {!isEditing && currentTranslationGroupId ? (
          <input type="hidden" name="translationGroupId" value={currentTranslationGroupId} />
        ) : null}

        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <span className={styles.previewEyebrow}>Writing studio</span>
            <h2 className={styles.panelTitle}>Article body</h2>
            <p className={styles.previewBody}>
              Use the markdown body as the single authored source. The server
              derives summary, cover image, and reading time after save.
            </p>
          </div>

          <label className={styles.titleField}>
            <span className={styles.fieldLabel}>Title</span>
            <input
              name="title"
              value={titleText}
              onChange={(event) => setTitleText(event.target.value)}
              className={styles.titleInput}
              placeholder="Guide title"
              required
            />
          </label>

          <div className={styles.fieldGrid}>
            {!article ? (
              <>
                <label className={styles.field}>
                  <span className={styles.fieldLabel}>Language</span>
                  <select
                    name="language"
                    value={selectedLanguage}
                    onChange={(event) => setSelectedLanguage(event.target.value)}
                    className={styles.input}
                  >
                    {languageList.map((language) => (
                      <option key={language} value={language}>
                        {language.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </label>

                <label className={styles.field}>
                  <span className={styles.fieldLabel}>Slug</span>
                  <input
                    name="slug"
                    value={slugText}
                    onChange={(event) => setSlugText(event.target.value)}
                    className={styles.input}
                    placeholder="Optional language-localized slug"
                  />
                </label>
              </>
            ) : (
              <>
                <div className={styles.field}>
                  <span className={styles.fieldLabel}>Language</span>
                  <div className={styles.detailItem}>
                    <span className={styles.detailValue}>{article.language.toUpperCase()}</span>
                  </div>
                </div>
                <div className={styles.field}>
                  <span className={styles.fieldLabel}>Slug</span>
                  <div className={styles.detailItem}>
                    <span className={styles.detailValue}>{article.slug}</span>
                  </div>
                </div>
              </>
            )}

            <label className={`${styles.field} ${styles.fieldSpan}`}>
              <span className={styles.fieldLabel}>Category</span>
              <select
                name="category"
                value={selectedCategory}
                onChange={(event) =>
                  setSelectedCategory(event.target.value as EditorialArticleCategory)
                }
                className={styles.input}
              >
                {editorialArticleCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </section>

        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <span className={styles.previewEyebrow}>Markdown body</span>
            <h2 className={styles.panelTitle}>Compose</h2>
            <p className={styles.previewBody}>
              The first markdown image becomes the representative cover image.
              Use <code>![meaningful alt](https://...)</code>. Alt text must not
              be empty, and image URLs must be absolute http/https URLs.
            </p>
          </div>

          <div className={styles.toolbar}>
            <button
              type="button"
              className={styles.toolButton}
              onClick={() => handleInsert("## Section title\n\n")}
            >
              Heading
            </button>
            <button
              type="button"
              className={styles.toolButton}
              onClick={() => handleInsert("- Bullet point\n- Another point\n")}
            >
              List
            </button>
            <button
              type="button"
              className={styles.toolButton}
              onClick={() =>
                handleInsert(
                  "![Meaningful alt](https://example.com/guide-cover.jpg)\n",
                )
              }
            >
              Image
            </button>
          </div>

          <div className={styles.bodyWorkspace}>
            <label className={styles.field}>
              <span className={styles.fieldLabel}>Body</span>
              <textarea
                ref={textareaRef}
                name="body"
                value={bodyText}
                onChange={(event) => setBodyText(event.target.value)}
                className={styles.bodyInput}
                rows={18}
                placeholder="Write the article in markdown."
                required
              />
            </label>

            <div className={styles.previewCard}>
              <div className={styles.panelHeader}>
                <span className={styles.previewEyebrow}>Live preview</span>
                <h2 className={styles.previewTitle}>Rendered body</h2>
              </div>

              {blocks.length > 0 ? (
                <div className={styles.previewSurface}>
                  <EditorialMarkdownContent
                    blocks={blocks}
                    classNames={{
                      heading: styles.previewHeading,
                      paragraph: styles.previewParagraph,
                      list: styles.previewList,
                      imageFigure: styles.previewFigure,
                      image: styles.previewImage,
                      imageCaption: styles.previewCaption,
                    }}
                  />
                </div>
              ) : (
                <div className={styles.previewSurfaceEmpty}>
                  Start typing markdown to preview the article body.
                </div>
              )}
            </div>
          </div>
        </section>

        <div className={styles.formActions}>
          <Link
            href={returnTo || buildAdminArticleWorkspaceHref()}
            className={styles.buttonGhost}
          >
            Cancel
          </Link>
          <SubmitButton label={submitLabel} />
        </div>
      </form>

      <aside className={styles.editorRail}>
        <section className={styles.supportCard}>
          <span className={styles.supportEyebrow}>Identity</span>
          <h2 className={styles.supportTitle}>Article rules</h2>
          <p className={styles.supportBody}>
            Language, slug, and translation group are create-time identifiers.
            Edit state keeps that identity fixed.
          </p>
          <ul className={styles.supportList}>
            <li>
              Translation group:{" "}
              <strong>{currentTranslationGroupId || "Assigned on create"}</strong>
            </li>
            <li>
              Slug policy: <strong>Language-scoped and immutable after create</strong>
            </li>
            <li>
              Model: <strong>Published-only markdown article</strong>
            </li>
          </ul>
        </section>

        <section className={styles.supportCard}>
          <span className={styles.supportEyebrow}>Derived metadata</span>
          <h2 className={styles.supportTitle}>Server snapshot</h2>
          <ul className={styles.supportList}>
            <li>
              Summary: <span className={styles.metaValueMuted}>{summaryText}</span>
            </li>
            <li>
              Reading time: <strong>{readingTimeText}</strong>
            </li>
            <li>
              Cover image: <span className={styles.metaValueMuted}>{coverText}</span>
            </li>
          </ul>
        </section>

        <section className={styles.supportCard}>
          <span className={styles.supportEyebrow}>Route preview</span>
          <h2 className={styles.supportTitle}>Published path</h2>
          <ul className={styles.routeList}>
            <li className={styles.routeItem}>
              <span className={styles.routeText}>{routePreview}</span>
              <span className={styles.routeHint}>
                {routeSlug
                  ? "Uses the current slug."
                  : "Slug will be generated from the title when saved."}
              </span>
            </li>
          </ul>
        </section>

        {article ? (
          <section className={styles.supportCard}>
            <span className={styles.supportEyebrow}>Published alternates</span>
            <h2 className={styles.supportTitle}>Language siblings</h2>
            {article.alternates.length > 0 ? (
              <ul className={styles.alternateList}>
                {article.alternates.map((alternate) => (
                  <li
                    key={`${alternate.language}-${alternate.slug}`}
                    className={styles.alternateItem}
                  >
                    <span className={styles.alternateTitle}>{alternate.title}</span>
                    <span className={styles.alternateMeta}>
                      {alternate.language.toUpperCase()} · /{alternate.language}/guides/{alternate.slug}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className={styles.supportBody}>No published sibling translations.</p>
            )}
          </section>
        ) : null}

        {article && deleteAction ? (
          <form action={deleteAction} className={styles.dangerCard}>
            <input type="hidden" name="articleId" value={article.id} />
            <input type="hidden" name="nextPath" value={nextPath} />
            <input type="hidden" name="returnTo" value={returnTo} />
            <span className={styles.supportEyebrow}>Danger zone</span>
            <h2 className={styles.dangerTitle}>Delete article</h2>
            <p className={styles.dangerBody}>
              Deleting removes the article record and its published guide routes.
              This is a hard delete.
            </p>
            <DeleteButton />
          </form>
        ) : null}
      </aside>
    </div>
  );
}
