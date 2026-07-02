export type EditorialInlineToken =
  | { type: "text"; text: string }
  | { type: "link"; text: string; href: string }
  | { type: "strong"; children: EditorialInlineToken[] }
  | { type: "code"; text: string };

export type EditorialMarkdownBlock =
  | { type: "heading"; id: string; text: string; level: number; index: number }
  | { type: "paragraph"; text: string; index: number }
  | { type: "list"; items: string[]; index: number }
  | { type: "image"; url: string; alt: string; index: number };

const LINK_PATTERN = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/;
const STRONG_PATTERN = /\*\*([^*]+)\*\*/;
const CODE_PATTERN = /`([^`]+)`/;
const IMAGE_LINE_PATTERN = /^!\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)$/;
const HEADING_PATTERN = /^(#{1,6})\s+(.+)$/;
const LIST_ITEM_PATTERN = /^[-*]\s+(.+)$/;

function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-+)|(-+$)/g, "")
    .replace(/-{2,}/g, "-");
}

function appendTextToken(tokens: EditorialInlineToken[], text: string) {
  if (!text) {
    return;
  }

  const previousToken = tokens[tokens.length - 1];
  if (previousToken?.type === "text") {
    previousToken.text += text;
    return;
  }

  tokens.push({ type: "text", text });
}

export function tokenizeEditorialInlineMarkdown(
  text: string,
): EditorialInlineToken[] {
  const tokens: EditorialInlineToken[] = [];
  let remaining = text;

  while (remaining.length > 0) {
    const candidates = [
      { kind: "link" as const, match: remaining.match(LINK_PATTERN) },
      { kind: "strong" as const, match: remaining.match(STRONG_PATTERN) },
      { kind: "code" as const, match: remaining.match(CODE_PATTERN) },
    ]
      .filter(
        (
          candidate,
        ): candidate is {
          kind: "link" | "strong" | "code";
          match: RegExpMatchArray;
        } => Boolean(candidate.match?.index !== undefined),
      )
      .sort((left, right) => (left.match.index ?? 0) - (right.match.index ?? 0));

    const nextCandidate = candidates[0];
    if (!nextCandidate) {
      appendTextToken(tokens, remaining);
      break;
    }

    const { kind, match } = nextCandidate;
    const index = match.index ?? 0;
    appendTextToken(tokens, remaining.slice(0, index));

    if (kind === "link") {
      tokens.push({
        type: "link",
        text: match[1],
        href: match[2],
      });
    } else if (kind === "strong") {
      tokens.push({
        type: "strong",
        children: tokenizeEditorialInlineMarkdown(match[1]),
      });
    } else {
      tokens.push({
        type: "code",
        text: match[1],
      });
    }

    remaining = remaining.slice(index + match[0].length);
  }

  return tokens;
}

export function parseEditorialBody(body: string): EditorialMarkdownBlock[] {
  const blocks: EditorialMarkdownBlock[] = [];
  const headingIds = new Set<string>();
  let paragraphLines: string[] = [];
  let listItems: string[] = [];
  let blockIndex = 0;

  const flushParagraph = () => {
    const text = paragraphLines
      .map((line) => line.trim())
      .filter(Boolean)
      .join(" ");

    if (text) {
      blocks.push({
        type: "paragraph",
        text,
        index: blockIndex,
      });
      blockIndex += 1;
    }

    paragraphLines = [];
  };

  const flushList = () => {
    if (listItems.length > 0) {
      blocks.push({
        type: "list",
        items: listItems,
        index: blockIndex,
      });
      blockIndex += 1;
    }

    listItems = [];
  };

  for (const rawLine of body.split(/\r?\n/g)) {
    const line = rawLine.trim();

    if (!line) {
      flushParagraph();
      flushList();
      continue;
    }

    const headingMatch = line.match(HEADING_PATTERN);
    if (headingMatch) {
      flushParagraph();
      flushList();

      const text = headingMatch[2].trim();
      const baseId = slugifyHeading(text) || `section-${blockIndex + 1}`;
      let id = baseId;
      let suffix = 2;

      while (headingIds.has(id)) {
        id = `${baseId}-${suffix}`;
        suffix += 1;
      }

      headingIds.add(id);
      blocks.push({
        type: "heading",
        id,
        text,
        level: headingMatch[1].length,
        index: blockIndex,
      });
      blockIndex += 1;
      continue;
    }

    const imageMatch = line.match(IMAGE_LINE_PATTERN);
    if (imageMatch) {
      flushParagraph();
      flushList();
      blocks.push({
        type: "image",
        alt: imageMatch[1].trim(),
        url: imageMatch[2].trim(),
        index: blockIndex,
      });
      blockIndex += 1;
      continue;
    }

    const listMatch = line.match(LIST_ITEM_PATTERN);
    if (listMatch) {
      flushParagraph();
      listItems.push(listMatch[1].trim());
      continue;
    }

    flushList();
    paragraphLines.push(rawLine);
  }

  flushParagraph();
  flushList();

  return blocks;
}

export function extractEditorialPlainText(
  blocks: EditorialMarkdownBlock[],
): string {
  return blocks
    .map((block) => {
      if (block.type === "image") {
        return block.alt;
      }

      if (block.type === "list") {
        return block.items.join(" ");
      }

      return block.text;
    })
    .join("\n\n")
    .trim();
}
