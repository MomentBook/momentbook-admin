"use client";

import Link from "next/link";
import { useDeferredValue, useRef, useTransition, type FormEvent } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ConfirmActionForm } from "@/components/confirm-action-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { languageList, languages } from "@/lib/i18n";
import {
  editorialArticleCategories,
  type EditorialArticleRecord,
} from "@/entities/article/types";
import { articleCreateFields } from "@/features/articles/schema";
import { MarkdownPreview } from "./markdown-preview";

type ArticleEditorFormProps = {
  article: EditorialArticleRecord | null;
  deleteAction?: (formData: FormData) => Promise<never>;
  formId: string;
  nextPath: string;
  returnTo: string;
  saveAction: (formData: FormData) => Promise<never>;
  suggestedLanguage?: string | null;
  translationGroupId?: string | null;
};

const SNIPPETS = [
  { label: "Heading", text: "## Section title\n\n" },
  { label: "List", text: "- Bullet point\n- Another point\n" },
  { label: "Image", text: "![Meaningful alt](https://example.com/guide-cover.jpg)\n" },
] as const;

/**
 * The article form. The fields are checked as they are left and again on
 * save, with the same rules the server action applies (`schema.ts`); the
 * save itself is the server action, which returns to this page with a
 * banner when the API refuses it. An edit shows language and slug but never
 * sends them.
 */
export function ArticleEditorForm({
  article,
  deleteAction,
  formId,
  nextPath,
  returnTo,
  saveAction,
  suggestedLanguage,
  translationGroupId,
}: ArticleEditorFormProps) {
  const bodyRef = useRef<HTMLTextAreaElement | null>(null);
  const [saving, startSaving] = useTransition();
  const form = useForm({
    resolver: zodResolver(articleCreateFields),
    mode: "onTouched",
    defaultValues: {
      language: article?.language ?? suggestedLanguage ?? "en",
      category: article?.category ?? "travel-guide",
      title: article?.title ?? "",
      slug: article?.slug ?? "",
      body: article?.body ?? "",
    },
  });
  const [language, slug, body] = useWatch({
    control: form.control,
    name: ["language", "slug", "body"],
  });
  const previewBody = useDeferredValue(body);
  const { ref: registerBody, ...bodyField } = form.register("body");
  const groupId = article?.translationGroupId ?? translationGroupId ?? "";
  const routeSlug = slug?.trim();
  const routePreview = `/${language}/guides/${routeSlug || "<generated-on-save>"}`;
  const errors = form.formState.errors;

  // The checked fields go to the server action as the form posts them, so
  // the Select's hidden input and the hidden fields travel too.
  const save = (event: FormEvent<HTMLFormElement>) => {
    const element = event.currentTarget;

    return form.handleSubmit(() => {
      startSaving(() => saveAction(new FormData(element)));
    })(event);
  };

  const insert = (snippet: string) => {
    const current = form.getValues("body") ?? "";
    const textarea = bodyRef.current;
    const start = textarea?.selectionStart ?? current.length;
    const end = textarea?.selectionEnd ?? current.length;
    const options = { shouldDirty: true, shouldValidate: form.formState.isSubmitted };

    form.setValue("body", `${current.slice(0, start)}${snippet}${current.slice(end)}`, options);
    requestAnimationFrame(() => {
      const cursor = start + snippet.length;
      textarea?.focus();
      textarea?.setSelectionRange(cursor, cursor);
    });
  };

  return (
    <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(16rem,21rem)]">
      <form id={formId} noValidate onSubmit={save}>
        <input type="hidden" name="nextPath" value={nextPath} />
        <input type="hidden" name="returnTo" value={returnTo} />
        {article ? <input type="hidden" name="articleId" value={article.id} /> : null}
        {!article && groupId ? (
          <input type="hidden" name="translationGroupId" value={groupId} />
        ) : null}

        <div className="flex flex-col gap-4">
          <Card>
            <CardContent className="flex flex-col gap-4 pt-6">
              <div className="flex flex-col gap-0.5">
                <span className="text-xs text-muted-foreground">Writing studio</span>
                <h2 className="text-lg font-semibold">Article</h2>
              </div>

              <Field data-invalid={Boolean(errors.title)}>
                <FieldLabel htmlFor="title">Title</FieldLabel>
                <Input
                  id="title"
                  placeholder="Guide title"
                  aria-invalid={Boolean(errors.title)}
                  {...form.register("title")}
                />
                <FieldError errors={[errors.title]} />
              </Field>

              <div className="grid gap-4 sm:grid-cols-3">
                {article ? (
                  <>
                    <Field>
                      <FieldLabel>Language</FieldLabel>
                      <p className="text-sm">{article.language.toUpperCase()}</p>
                    </Field>
                    <Field>
                      <FieldLabel>Slug</FieldLabel>
                      <p className="break-all text-sm">{article.slug}</p>
                    </Field>
                  </>
                ) : (
                  <>
                    <Controller
                      control={form.control}
                      name="language"
                      render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <FieldLabel htmlFor="language">Language</FieldLabel>
                          <Select name={field.name} value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger id="language" aria-invalid={fieldState.invalid}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {languageList.map((option) => (
                                <SelectItem key={option} value={option}>
                                  {option.toUpperCase()}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FieldError errors={[fieldState.error]} />
                        </Field>
                      )}
                    />
                    <Field data-invalid={Boolean(errors.slug)}>
                      <FieldLabel htmlFor="slug">Slug</FieldLabel>
                      <Input id="slug" placeholder="Optional slug" {...form.register("slug")} />
                      <FieldError errors={[errors.slug]} />
                    </Field>
                  </>
                )}
                <Controller
                  control={form.control}
                  name="category"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="category">Category</FieldLabel>
                      <Select name={field.name} value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger id="category" aria-invalid={fieldState.invalid}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {editorialArticleCategories.map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FieldError errors={[fieldState.error]} />
                    </Field>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex flex-col gap-3 pt-6">
              <div className="flex flex-col gap-0.5">
                <span className="text-xs text-muted-foreground">Markdown body</span>
                <h2 className="text-lg font-semibold">Compose</h2>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {SNIPPETS.map((snippet) => (
                  <Button
                    key={snippet.label}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => insert(snippet.text)}
                  >
                    {snippet.label}
                  </Button>
                ))}
              </div>

              <Field data-invalid={Boolean(errors.body)}>
                <FieldLabel htmlFor="body">Body</FieldLabel>
                <FieldDescription className="text-xs">
                  The first image becomes the cover. Write images as{" "}
                  <code className="rounded bg-muted px-1 py-0.5">![meaningful alt](https://...)</code>{" "}
                  with an absolute URL.
                </FieldDescription>
                <Textarea
                  id="body"
                  placeholder="Write the article in markdown."
                  rows={18}
                  aria-invalid={Boolean(errors.body)}
                  {...bodyField}
                  ref={(element) => {
                    registerBody(element);
                    bodyRef.current = element;
                  }}
                />
                <FieldError errors={[errors.body]} />
              </Field>

              <div className="min-h-[120px] rounded-lg border p-4">
                <div className="mb-3 flex flex-col gap-0.5">
                  <span className="text-xs text-muted-foreground">Live preview</span>
                  <h3 className="font-semibold">Rendered body</h3>
                </div>
                {previewBody?.trim() ? (
                  <MarkdownPreview body={previewBody} />
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Start typing markdown to preview the article body.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-between gap-3">
            <Button asChild variant="outline" size="sm">
              <Link href={returnTo}>Cancel</Link>
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : article ? "Save article" : "Create article"}
            </Button>
          </div>
        </div>
      </form>

      <div className="flex flex-col gap-3">
        {article && article.alternates.length > 0 ? (
          <Card>
            <CardContent className="flex flex-col gap-1 pt-6">
              <span className="text-xs text-muted-foreground">Published alternates</span>
              <h3 className="font-semibold">Language siblings</h3>
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

        <Card>
          <CardContent className="flex flex-col gap-1 pt-6">
            <span className="text-xs text-muted-foreground">Route preview</span>
            <h3 className="font-semibold">Published path</h3>
            <p className="break-all text-sm text-muted-foreground">{routePreview}</p>
            <p className="text-xs">
              {routeSlug ? "Uses the current slug." : "Slug will be generated from the title."}
            </p>
          </CardContent>
        </Card>

        {article && deleteAction ? (
          <Card className="border-destructive/50">
            <CardContent className="flex flex-col gap-1 pt-6">
              <span className="text-xs text-muted-foreground">Danger zone</span>
              <h3 className="font-semibold">Delete article</h3>
              <p className="text-xs text-muted-foreground">
                This is a hard delete of the article and its published routes.
              </p>
              <div className="mt-2">
                <ConfirmActionForm
                  action={deleteAction}
                  fields={{ articleId: article.id, nextPath, returnTo }}
                  triggerLabel="Delete article"
                  triggerVariant="destructive"
                  title="Delete this article?"
                  description={`Permanently deletes ${article.title} in ${languages[article.language].name}. Other languages of its translation group are kept.`}
                  confirmLabel="Delete article"
                />
              </div>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
