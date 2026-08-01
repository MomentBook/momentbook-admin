"use client";

import Link from "next/link";
import { useDeferredValue, useMemo, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EditorialMarkdownContent } from "@/components/editorial/EditorialMarkdownContent";
import { parseEditorialBody } from "@/lib/editorial/body";
import { buildAdminArticleWorkspaceHref } from "@/lib/admin/paths";
import {
  editorialArticleCategories,
  type EditorialArticleCategory,
  type EditorialArticleRecord,
} from "@/lib/editorial/types";
import { languageList } from "@/lib/i18n/config";

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
    <Button type="submit" disabled={pending}>
      {pending ? "Saving..." : label}
    </Button>
  );
}

function DeleteButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="ghost" disabled={pending}>
      {pending ? "Deleting..." : "Delete article"}
    </Button>
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
    <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(16rem,21rem)]">
      <form id={formId} action={saveAction}>
        <input type="hidden" name="nextPath" value={nextPath} />
        <input type="hidden" name="returnTo" value={returnTo} />
        {article ? <input type="hidden" name="articleId" value={article.id} /> : null}
        {!isEditing && currentTranslationGroupId ? (
          <input type="hidden" name="translationGroupId" value={currentTranslationGroupId} />
        ) : null}

        <div className="flex flex-col gap-4">
          {/* Article metadata */}
          <Card>
            <CardContent className="flex flex-col gap-2 pt-6">
              <span className="text-xs text-muted-foreground">Writing studio</span>
              <h3 className="text-lg font-semibold">Article body</h3>

              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  name="title"
                  value={titleText}
                  onChange={(e) => setTitleText(e.target.value)}
                  placeholder="Guide title"
                  required
                />
              </div>

              <div className="flex gap-2">
                {!article ? (
                  <>
                    <div className="flex-1 space-y-2">
                      <Label htmlFor="language">Language</Label>
                      <Select
                        name="language"
                        value={selectedLanguage}
                        onValueChange={setSelectedLanguage}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {languageList.map((lang) => (
                            <SelectItem key={lang} value={lang}>
                              {lang.toUpperCase()}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex-1 space-y-2">
                      <Label htmlFor="slug">Slug</Label>
                      <Input
                        id="slug"
                        name="slug"
                        value={slugText}
                        onChange={(e) => setSlugText(e.target.value)}
                        placeholder="Optional slug"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex-1">
                      <span className="text-xs text-muted-foreground">Language</span>
                      <p className="text-sm">{article.language.toUpperCase()}</p>
                    </div>
                    <div className="flex-1">
                      <span className="text-xs text-muted-foreground">Slug</span>
                      <p className="text-sm">{article.slug}</p>
                    </div>
                  </>
                )}
                <div className="flex-1 space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    name="category"
                    value={selectedCategory}
                    onValueChange={(val) => setSelectedCategory(val as EditorialArticleCategory)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {editorialArticleCategories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Markdown editor */}
          <Card>
            <CardContent className="flex flex-col gap-2 pt-6">
              <span className="text-xs text-muted-foreground">Markdown body</span>
              <h3 className="text-lg font-semibold">Compose</h3>
              <p className="text-xs text-muted-foreground">
                The first markdown image becomes the cover image. Use{" "}
                <code className="rounded bg-muted px-1 py-0.5 text-xs">
                  ![meaningful alt](https://...)
                </code>
                . Image URLs must be absolute.
              </p>

              {/* Toolbar */}
              <div className="flex flex-wrap gap-1.5">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleInsert("## Section title\n\n")}
                >
                  Heading
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleInsert("- Bullet point\n- Another point\n")}
                >
                  List
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    handleInsert("![Meaningful alt](https://example.com/guide-cover.jpg)\n")
                  }
                >
                  Image
                </Button>
              </div>

              <div className="space-y-2">
                <Label htmlFor="body">Body</Label>
                <Textarea
                  id="body"
                  name="body"
                  value={bodyText}
                  onChange={(e) => setBodyText(e.target.value)}
                  placeholder="Write the article in markdown."
                  rows={18}
                  required
                  ref={textareaRef as React.Ref<HTMLTextAreaElement>}
                />
              </div>

              {/* Live preview */}
              <div className="min-h-[120px] rounded-lg border p-4">
                <div className="flex flex-col gap-0.5 mb-3">
                  <span className="text-xs text-muted-foreground">Live preview</span>
                  <h4 className="font-semibold">Rendered body</h4>
                </div>

                {blocks.length > 0 ? (
                  <div>
                    <EditorialMarkdownContent
                      blocks={blocks}
                      classNames={{
                        heading: "mb-3 font-[family-name:var(--font-display)] text-foreground leading-tight",
                        paragraph: "mb-3 text-muted-foreground leading-relaxed",
                        list: "mb-4 pl-5 text-muted-foreground grid gap-1.5",
                        imageFigure: "mb-4 grid gap-2",
                        image: "w-full h-auto rounded-2xl object-cover",
                        imageCaption: "text-[0.8rem] text-muted-foreground",
                      }}
                    />
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Start typing markdown to preview the article body.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Form actions */}
          <div className="flex items-center justify-between gap-3">
            <Link href={returnTo || buildAdminArticleWorkspaceHref()}>
              <Button variant="outline" size="sm">Cancel</Button>
            </Link>
            <SubmitButton label={submitLabel} />
          </div>
        </div>
      </form>

      {/* Sidebar rail */}
      <div className="flex flex-col gap-3">
        {/* Language siblings */}
        {article && article.alternates.length > 0 ? (
          <Card>
            <CardContent className="flex flex-col gap-1 pt-6">
              <span className="text-xs text-muted-foreground">Published alternates</span>
              <h4 className="font-semibold">Language siblings</h4>
              {article.alternates.map((alternate) => (
                <div key={`${alternate.language}-${alternate.slug}`} className="flex flex-col gap-0.5">
                  <p className="text-sm">{alternate.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {alternate.language.toUpperCase()} · /{alternate.language}/guides/{alternate.slug}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        ) : null}

        {/* Route preview */}
        <Card>
          <CardContent className="flex flex-col gap-1 pt-6">
            <span className="text-xs text-muted-foreground">Route preview</span>
            <h4 className="font-semibold">Published path</h4>
            <p className="text-sm text-muted-foreground">{routePreview}</p>
            <p className="text-xs">
              {routeSlug
                ? "Uses the current slug."
                : "Slug will be generated from the title."}
            </p>
          </CardContent>
        </Card>

        {/* Danger zone */}
        {article && deleteAction ? (
          <Card className="border-destructive/50">
            <form action={deleteAction}>
              <input type="hidden" name="articleId" value={article.id} />
              <input type="hidden" name="nextPath" value={nextPath} />
              <input type="hidden" name="returnTo" value={returnTo} />
              <CardContent className="flex flex-col gap-1 pt-6">
                <span className="text-xs text-muted-foreground">Danger zone</span>
                <h4 className="font-semibold">Delete article</h4>
                <p className="text-xs text-muted-foreground">
                  This is a hard delete of the article and its published routes.
                </p>
                <div className="mt-2">
                  <DeleteButton />
                </div>
              </CardContent>
            </form>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
