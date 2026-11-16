# 0006: Editorial Articles and Guide Support

## Status

Active.

## Decision

> **Amended by [0014](0014-source-layout-and-layer-boundaries.md) and [0015](0015-library-adoption.md):** 2026-11-16, the code moved under
> `src/` (paths below updated); the editor validates with react-hook-form and
> the action's zod schema, and the preview renders with `react-markdown`.
> Articles with an empty summary or no update time are no longer dropped from
> the list.

Admin articles are published-only editorial guide records managed from
`/articles`. This repository owns the admin CRUD workflow, not public
guide consumption or public SEO rendering.

Markdown body is the canonical authored content source. The backend derives
summary, cover image, reading time, route identity, and published guide records
from that body and article metadata.

## Implementation Shape

- `src/features/articles/loader.ts` loads admin article list/detail data
  through `src/lib/api/articles.ts` and normalizes it into the editorial types
  in `src/entities/article/`.
- `src/app/(workspace)/articles/page.tsx` loads the article dashboard in the
  workspace shell.
- `src/app/(workspace)/articles/new/page.tsx` and
  `src/app/(workspace)/articles/[articleId]/page.tsx` render the editor page.
- `ArticleEditorForm` validates with `react-hook-form` and the zod schema the
  action uses (`src/features/articles/schema.ts`) and keeps a live preview with
  `MarkdownPreview` (`react-markdown`).
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
- The preview renders the subset the public site renders (ADR 0015):
  headings, paragraphs, bullet lists, images, links, strong text, and inline
  code; raw HTML is skipped and only http(s) URLs are kept. It shows `#` and
  `##` as h2, `###` as h3 and deeper as h4, and `*em*` and numbered lists as
  plain text. The image rules above are checked in the form and in the action
  (`findMarkdownImageProblem`).

## Public Guide Support Code

- `src/entities/article/records.ts` and related helpers provide
  admin-compatible guide metadata where required. The public guide and sitemap helpers
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
  `yarn vitest run scripts/__tests__/admin-article-actions.test.ts scripts/__tests__/admin-article-schema.test.ts scripts/__tests__/admin-article-actions-session.test.ts`
- Run `yarn tsc --noEmit` when changing shared editorial types, normalizers, or
  generated contract consumers.
