import Link from "next/link";
import { Card } from "@astryxdesign/core/Card";
import { VStack } from "@astryxdesign/core/VStack";
import { HStack } from "@astryxdesign/core/HStack";
import { Heading } from "@astryxdesign/core/Heading";
import { Text } from "@astryxdesign/core/Text";
import { Banner } from "@astryxdesign/core/Banner";
import { Button } from "@astryxdesign/core/Button";
import { MetadataList, MetadataListItem } from "@astryxdesign/core/MetadataList";
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
      <VStack gap={4}>
        {/* Header */}
        <Card padding={3}>
          <HStack gap={2} vAlign="center" hAlign="between">
            <VStack gap={1}>
              <Link href={workspaceHref}>
                <Text type="body" size="sm" color="accent">Back to articles</Text>
              </Link>
              <Text type="label" size="2xs" color="secondary">Editorial admin</Text>
              <Heading level={1}>{headerTitle}</Heading>
              <Text type="body" color="secondary">
                Markdown body is the canonical content source.
              </Text>
            </VStack>

            <button form={formId} type="submit" style={{ border: "none", background: "none", padding: 0 }}>
              <Button variant="primary" size="sm" label={submitLabel} />
            </button>
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

        {/* Metadata summary */}
        <Card padding={3}>
          <MetadataList columns="multi" label={{ position: "start", width: 120 }}>
            <MetadataListItem label="Language">
              {article?.language ?? suggestedLanguage ?? "Choose on create"}
            </MetadataListItem>
            <MetadataListItem label="Slug">
              {article?.slug ?? "Optional on create"}
            </MetadataListItem>
            <MetadataListItem label="Translation group">
              {translationGroupId}
            </MetadataListItem>
            <MetadataListItem label="Category">
              {article ? getEditorialCategoryLabel("en", article.category) : "Set in form"}
            </MetadataListItem>
            <MetadataListItem label="Published">
              {formatAdminDate(article?.publishedAt)}
            </MetadataListItem>
            <MetadataListItem label="Updated">
              {formatAdminDate(article?.updatedAt)}
            </MetadataListItem>
          </MetadataList>
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
      </VStack>
    </AdminArticleShell>
  );
}
