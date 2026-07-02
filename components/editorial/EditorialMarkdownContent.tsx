/* eslint-disable @next/next/no-img-element -- user-authored markdown images are arbitrary remote URLs without stable image optimization contracts */

import type { ReactNode } from "react";
import {
  type EditorialInlineToken,
  type EditorialMarkdownBlock,
  tokenizeEditorialInlineMarkdown,
} from "@/lib/editorial/body";

type EditorialMarkdownContentProps = {
  blocks: EditorialMarkdownBlock[];
  classNames?: {
    heading?: string;
    paragraph?: string;
    list?: string;
    imageFigure?: string;
    image?: string;
    imageCaption?: string;
  };
};

function renderInlineTokens(
  tokens: EditorialInlineToken[],
  keyPrefix: string,
): ReactNode[] {
  return tokens.map((token, index) => {
    const key = `${keyPrefix}-${index}`;

    if (token.type === "text") {
      return token.text;
    }

    if (token.type === "link") {
      return (
        <a
          key={key}
          href={token.href}
          target="_blank"
          rel="noreferrer"
        >
          {token.text}
        </a>
      );
    }

    if (token.type === "strong") {
      return <strong key={key}>{renderInlineTokens(token.children, key)}</strong>;
    }

    return <code key={key}>{token.text}</code>;
  });
}

export function EditorialMarkdownContent({
  blocks,
  classNames,
}: EditorialMarkdownContentProps) {
  return blocks.map((block) => {
    if (block.type === "heading") {
      const HeadingTag =
        block.level <= 2 ? "h2" : block.level === 3 ? "h3" : "h4";

      return (
        <HeadingTag
          key={block.id}
          id={block.id}
          className={classNames?.heading}
          data-level={block.level}
        >
          {renderInlineTokens(
            tokenizeEditorialInlineMarkdown(block.text),
            block.id,
          )}
        </HeadingTag>
      );
    }

    if (block.type === "paragraph") {
      return (
        <p
          key={`${block.type}-${block.index}`}
          className={classNames?.paragraph}
        >
          {renderInlineTokens(
            tokenizeEditorialInlineMarkdown(block.text),
            `${block.type}-${block.index}`,
          )}
        </p>
      );
    }

    if (block.type === "list") {
      return (
        <ul
          key={`${block.type}-${block.index}`}
          className={classNames?.list}
        >
          {block.items.map((item, itemIndex) => (
            <li key={`${block.type}-${block.index}-${itemIndex}`}>
              {renderInlineTokens(
                tokenizeEditorialInlineMarkdown(item),
                `${block.type}-${block.index}-${itemIndex}`,
              )}
            </li>
          ))}
        </ul>
      );
    }

    return (
      <figure
        key={`${block.type}-${block.index}`}
        className={classNames?.imageFigure}
      >
        <img
          src={block.url}
          alt={block.alt}
          className={classNames?.image}
          loading="lazy"
        />
        <figcaption className={classNames?.imageCaption}>{block.alt}</figcaption>
      </figure>
    );
  });
}
