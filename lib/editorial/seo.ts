import type { EditorialMarkdownBlock } from "./body";
import type { EditorialArticleCoverImage } from "./types";

type EditorialImageCandidate = {
  url: string;
  alt: string | null;
};

function readText(value: string | null | undefined): string | null {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function collectEditorialImageCandidates(
  coverImage: EditorialArticleCoverImage | null,
  blocks: EditorialMarkdownBlock[],
): EditorialImageCandidate[] {
  const candidates: EditorialImageCandidate[] = [];
  const seen = new Set<string>();

  const appendCandidate = (url: string | null, alt: string | null) => {
    if (!url || seen.has(url)) {
      return;
    }

    seen.add(url);
    candidates.push({ url, alt });
  };

  appendCandidate(readText(coverImage?.url), readText(coverImage?.alt));

  for (const block of blocks) {
    if (block.type !== "image") {
      continue;
    }

    appendCandidate(readText(block.url), readText(block.alt));
  }

  return candidates;
}

export function collectEditorialImageUrls(
  coverImage: EditorialArticleCoverImage | null,
  blocks: EditorialMarkdownBlock[],
): string[] {
  return collectEditorialImageCandidates(coverImage, blocks).map((image) => image.url);
}
