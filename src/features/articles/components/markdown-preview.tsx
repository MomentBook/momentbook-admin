/* eslint-disable @next/next/no-img-element -- user-authored markdown images are arbitrary remote URLs without stable image optimization contracts */

import Markdown, { type Components } from "react-markdown";

// The editor's preview of an article body. It renders only what the public
// site renders (momentbook-web `lib/guides/markdown.ts`): headings,
// paragraphs, bullet lists, images, links, bold and inline code. Anything
// else shows as its text, raw HTML is dropped, and only http(s) URLs are
// kept. ADR 0006 lists what still differs.

const ALLOWED_ELEMENTS = ["h1", "h2", "h3", "h4", "h5", "h6", "p", "ul", "li", "img", "a", "strong", "code"];

const HEADING = "mb-3 font-[family-name:var(--font-display)] text-foreground leading-tight";

function httpOnly(url: string): string | null {
  return /^https?:\/\//i.test(url) ? url : null;
}

const COMPONENTS: Components = {
  // The site renders # and ## as h2, ### as h3 and anything deeper as h4.
  h1: ({ children }) => <h2 className={HEADING}>{children}</h2>,
  h2: ({ children }) => <h2 className={HEADING}>{children}</h2>,
  h3: ({ children }) => <h3 className={HEADING}>{children}</h3>,
  h4: ({ children }) => <h4 className={HEADING}>{children}</h4>,
  h5: ({ children }) => <h4 className={HEADING}>{children}</h4>,
  h6: ({ children }) => <h4 className={HEADING}>{children}</h4>,
  p: ({ node, children }) => {
    const only = node?.children.length === 1 ? node.children[0] : null;

    // An image on its own line is a figure, which a paragraph cannot hold.
    if (only?.type === "element" && only.tagName === "img") {
      return <>{children}</>;
    }

    return <p className="mb-3 leading-relaxed text-muted-foreground">{children}</p>;
  },
  ul: ({ children }) => <ul className="mb-4 grid gap-1.5 pl-5 text-muted-foreground">{children}</ul>,
  a: ({ href, children }) => (
    <a href={href} target="_blank" rel="noreferrer">
      {children}
    </a>
  ),
  img: ({ src, alt }) => (
    <figure className="mb-4 grid gap-2">
      <img src={typeof src === "string" ? src : undefined} alt={alt ?? ""} className="h-auto w-full rounded-2xl object-cover" loading="lazy" />
      <figcaption className="text-xs text-muted-foreground">{alt}</figcaption>
    </figure>
  ),
};

export function MarkdownPreview({ body }: { body: string }) {
  return (
    <Markdown
      allowedElements={ALLOWED_ELEMENTS}
      unwrapDisallowed
      skipHtml
      urlTransform={httpOnly}
      components={COMPONENTS}
    >
      {body}
    </Markdown>
  );
}
