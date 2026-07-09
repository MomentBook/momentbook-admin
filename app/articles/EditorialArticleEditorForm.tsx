"use client";

import Link from "next/link";
import { useDeferredValue, useMemo, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { Card } from "@astryxdesign/core/Card";
import { VStack } from "@astryxdesign/core/VStack";
import { HStack } from "@astryxdesign/core/HStack";
import { Heading } from "@astryxdesign/core/Heading";
import { Text } from "@astryxdesign/core/Text";
import { TextInput } from "@astryxdesign/core/TextInput";
import { TextArea } from "@astryxdesign/core/TextArea";
import { Selector } from "@astryxdesign/core/Selector";
import { Button } from "@astryxdesign/core/Button";
import { EmptyState } from "@astryxdesign/core/EmptyState";
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

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      variant="primary"
      label={pending ? "Saving..." : label}
      isLoading={pending}
    />
  );
}

function DeleteButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      variant="ghost"
      label={pending ? "Deleting..." : "Delete article"}
      isLoading={pending}
    />
  );
}

const editorGridStyle = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) minmax(16rem, 21rem)",
  gap: "1rem",
  alignItems: "start",
} as const;

const toolbarStyle = {
  display: "flex",
  flexWrap: "wrap" as const,
  gap: 6,
};

const previewCardStyle = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr)",
  gap: "0.75rem",
  padding: "1rem",
  border: "1px solid var(--color-border)",
  borderRadius: "var(--radius-element, 8px)",
  minHeight: 120,
};

const formActionsStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "0.75rem",
};

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
    <div style={editorGridStyle}>
      <form id={formId} action={saveAction}>
        <input type="hidden" name="nextPath" value={nextPath} />
        <input type="hidden" name="returnTo" value={returnTo} />
        {article ? <input type="hidden" name="articleId" value={article.id} /> : null}
        {!isEditing && currentTranslationGroupId ? (
          <input type="hidden" name="translationGroupId" value={currentTranslationGroupId} />
        ) : null}

        <VStack gap={4}>
          {/* Article metadata */}
          <Card padding={3}>
            <VStack gap={2}>
              <Text type="label" size="2xs" color="secondary">Writing studio</Text>
              <Heading level={3}>Article body</Heading>

              <TextInput
                label="Title"
                htmlName="title"
                value={titleText}
                onChange={setTitleText}
                placeholder="Guide title"
                isRequired
              />

              <HStack gap={2}>
                {!article ? (
                  <>
                    <div style={{ flex: 1 }}>
                      <Selector
                        label="Language"
                        htmlName="language"
                        value={selectedLanguage}
                        onChange={setSelectedLanguage}
                        options={languageList.map((lang) => ({
                          label: lang.toUpperCase(),
                          value: lang,
                        }))}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <TextInput
                        label="Slug"
                        htmlName="slug"
                        value={slugText}
                        onChange={setSlugText}
                        placeholder="Optional slug"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{ flex: 1 }}>
                      <VStack gap={0.5}>
                        <Text type="label" size="2xs">Language</Text>
                        <Text type="body">{article.language.toUpperCase()}</Text>
                      </VStack>
                    </div>
                    <div style={{ flex: 1 }}>
                      <VStack gap={0.5}>
                        <Text type="label" size="2xs">Slug</Text>
                        <Text type="body">{article.slug}</Text>
                      </VStack>
                    </div>
                  </>
                )}
                <div style={{ flex: 1 }}>
                  <Selector
                    label="Category"
                    htmlName="category"
                    value={selectedCategory}
                    onChange={(val) => setSelectedCategory(val as EditorialArticleCategory)}
                    options={editorialArticleCategories.map((cat) => ({
                      label: cat,
                      value: cat,
                    }))}
                  />
                </div>
              </HStack>
            </VStack>
          </Card>

          {/* Markdown editor */}
          <Card padding={3}>
            <VStack gap={2}>
              <Text type="label" size="2xs" color="secondary">Markdown body</Text>
              <Heading level={3}>Compose</Heading>
              <Text type="supporting" size="xsm" color="secondary">
                The first markdown image becomes the cover image. Use{" "}
                <code>![meaningful alt](https://...)</code>. Image URLs must be absolute.
              </Text>

              {/* Toolbar */}
              <div style={toolbarStyle}>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  label="Heading"
                  onClick={() => handleInsert("## Section title\n\n")}
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  label="List"
                  onClick={() => handleInsert("- Bullet point\n- Another point\n")}
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  label="Image"
                  onClick={() =>
                    handleInsert("![Meaningful alt](https://example.com/guide-cover.jpg)\n")
                  }
                />
              </div>

              <TextArea
                label="Body"
                htmlName="body"
                value={bodyText}
                onChange={setBodyText}
                placeholder="Write the article in markdown."
                rows={18}
                isRequired
                ref={textareaRef as React.Ref<HTMLTextAreaElement>}
              />

              {/* Live preview */}
              <div style={previewCardStyle}>
                <VStack gap={0.5}>
                  <Text type="label" size="2xs" color="secondary">Live preview</Text>
                  <Heading level={4}>Rendered body</Heading>
                </VStack>

                {blocks.length > 0 ? (
                  <div>
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
                  <Text type="body" size="sm" color="secondary">
                    Start typing markdown to preview the article body.
                  </Text>
                )}
              </div>
            </VStack>
          </Card>

          {/* Form actions */}
          <div style={formActionsStyle}>
            <Link href={returnTo || buildAdminArticleWorkspaceHref()}>
              <Button variant="secondary" size="sm" label="Cancel" />
            </Link>
            <SubmitButton label={submitLabel} />
          </div>
        </VStack>
      </form>

      {/* Sidebar rail */}
      <VStack gap={3}>
        {/* Language siblings */}
        {article && article.alternates.length > 0 ? (
          <Card padding={3}>
            <VStack gap={1}>
              <Text type="label" size="2xs" color="secondary">Published alternates</Text>
              <Heading level={4}>Language siblings</Heading>
              {article.alternates.map((alternate) => (
                <VStack key={`${alternate.language}-${alternate.slug}`} gap={0.5}>
                  <Text type="body" size="sm">{alternate.title}</Text>
                  <Text type="body" size="xsm" color="secondary">
                    {alternate.language.toUpperCase()} · /{alternate.language}/guides/{alternate.slug}
                  </Text>
                </VStack>
              ))}
            </VStack>
          </Card>
        ) : null}

        {/* Route preview */}
        <Card padding={3}>
          <VStack gap={1}>
            <Text type="label" size="2xs" color="secondary">Route preview</Text>
            <Heading level={4}>Published path</Heading>
            <Text type="body" size="sm" color="secondary">{routePreview}</Text>
            <Text type="supporting" size="xsm">
              {routeSlug
                ? "Uses the current slug."
                : "Slug will be generated from the title."}
            </Text>
          </VStack>
        </Card>

        {/* Danger zone */}
        {article && deleteAction ? (
          <Card padding={3}>
            <form action={deleteAction}>
              <input type="hidden" name="articleId" value={article.id} />
              <input type="hidden" name="nextPath" value={nextPath} />
              <input type="hidden" name="returnTo" value={returnTo} />
              <VStack gap={1}>
                <Text type="label" size="2xs" color="secondary">Danger zone</Text>
                <Heading level={4}>Delete article</Heading>
                <Text type="supporting" size="xsm" color="secondary">
                  This is a hard delete of the article and its published routes.
                </Text>
                <div style={{ marginTop: 8 }}>
                  <DeleteButton />
                </div>
              </VStack>
            </form>
          </Card>
        ) : null}
      </VStack>
    </div>
  );
}
