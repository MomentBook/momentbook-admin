# 0006: Editorial Articles and Guide Support

## Status

Active.

## Decision

Admin articles are published-only editorial guide records managed from
`/articles`. This repository owns the admin CRUD workflow, not public
guide consumption or public SEO rendering.

Markdown body is the canonical authored content source. The backend derives
summary, cover image, reading time, route identity, and published guide records
from that body and article metadata.

## Implementation Shape

- `lib/editorial/admin.ts` loads admin article list/detail data through
  `lib/api/articles.ts` and normalizes it into local editorial types.
- `app/articles/page.tsx` loads the article dashboard in the workspace shell.
- `app/articles/new/page.tsx` and `app/articles/[articleId]/page.tsx` render
  the editor page.
- `EditorialArticleEditorForm` keeps a live markdown preview using
  `parseEditorialBody` and `EditorialMarkdownContent`.
- Create accepts language, category, title, body, optional slug, and optional
  translation group ID.
- Update sends only mutable fields: category, title, and body. Language, slug,
  and translation group are create-time identity and remain immutable in edit
  state.
- Delete is a hard delete of the article record, behind a confirmation dialog.

## Markdown Rules

- Body is required.
- Markdown images must use `![alt](https://...)` or `![alt](http://...)`.
- Image alt text must be non-empty.
- The first valid markdown image is treated by the backend as the derived cover
  source.
- The local parser intentionally supports a small markdown subset for preview:
  headings, paragraphs, lists, images, links, strong text, and inline code.

## Public Guide Support Code

- `lib/editorial/records.ts` and related helpers provide admin-compatible
  guide metadata where required. The public guide and sitemap helpers
  (`lib/editorial/public.ts`, `lib/sitemap/*`) were removed on 2026-10-22 as
  unreachable from any admin route.
- They do not make this repository responsible for public guide pages.

## Consequences

- Article banners report the backend mutation outcome; public freshness is
  provided by the public web's no-cache policy.
- Article filters, route previews, derived metadata summaries, and alternate
  language sibling visibility are part of the admin workflow.
- Do not add public guide pages, marketing pages, or public SEO rendering here.
- Article changes should run:
  `yarn vitest run scripts/__tests__/admin-article-actions.test.ts`
- Run `yarn tsc --noEmit` when changing shared editorial types, normalizers, or
  generated contract consumers.
