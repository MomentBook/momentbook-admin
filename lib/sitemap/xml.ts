export const MAX_URLS_PER_SITEMAP = 50000;
const SITEMAP_CACHE_CONTROL = "public, max-age=3600, s-maxage=3600";

export type SitemapImageEntry = {
  loc: string;
};

export type SitemapAlternate = {
  lang: string;
  href: string;
};

export type SitemapUrlEntry = {
  loc: string;
  lastmod?: string | null;
  alternates?: SitemapAlternate[];
  images?: SitemapImageEntry[];
};

export type SitemapIndexEntry = {
  loc: string;
  lastmod?: string | null;
};

export function toIsoDateOrNull(value: string | number | Date | null | undefined): string | null {
  if (value === null || value === undefined) {
    return null;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  // Search engines expect lastmod to describe a completed change, not a future timestamp.
  return new Date(Math.min(parsed.getTime(), Date.now())).toISOString();
}

function xmlEscape(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function validateSitemapEntries<T>(entries: T[], label: string): T[] {
  if (entries.length <= MAX_URLS_PER_SITEMAP) {
    return entries;
  }

  throw new Error(
    `[${label}] Entry count ${entries.length} exceeds the sitemap protocol limit of ${MAX_URLS_PER_SITEMAP}.`,
  );
}

export function renderSitemapUrlset(urls: SitemapUrlEntry[]): string {
  const hasImages = urls.some((url) => (url.images?.length ?? 0) > 0);
  const body = urls
    .map((url) => {
      const lines = [
        "  <url>",
        `    <loc>${xmlEscape(url.loc)}</loc>`,
      ];

      if (url.lastmod) {
        lines.push(`    <lastmod>${xmlEscape(url.lastmod)}</lastmod>`);
      }
      if (url.alternates?.length) {
        lines.push(
          ...url.alternates.map(
            (alt) =>
              `    <xhtml:link rel="alternate" hreflang="${xmlEscape(alt.lang)}" href="${xmlEscape(alt.href)}"/>`,
          ),
        );
      }
      if (url.images?.length) {
        lines.push(
          ...url.images.map(
            (image) =>
              `    <image:image><image:loc>${xmlEscape(image.loc)}</image:loc></image:image>`,
          ),
        );
      }

      lines.push("  </url>");
      return lines.join("\n");
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"${hasImages ? '\n        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"' : ""}>
${body}
</urlset>`;
}

export function renderSitemapIndex(entries: SitemapIndexEntry[]): string {
  const body = entries
    .map((entry) => {
      const lines = [
        "  <sitemap>",
        `    <loc>${xmlEscape(entry.loc)}</loc>`,
      ];

      if (entry.lastmod) {
        lines.push(`    <lastmod>${xmlEscape(entry.lastmod)}</lastmod>`);
      }

      lines.push("  </sitemap>");
      return lines.join("\n");
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</sitemapindex>`;
}

export function resolveSitemapAbsoluteUrl(siteUrl: string, value: string) {
  return new URL(value, siteUrl).toString();
}

export function buildLocalizedSitemapUrl(
  siteUrl: string,
  lang: string,
  segments: string[],
) {
  const pathname = [lang, ...segments.map((segment) => encodeURIComponent(segment))]
    .join("/");

  return resolveSitemapAbsoluteUrl(siteUrl, `/${pathname}`);
}

export function buildSitemapXmlResponse(xml: string) {
  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": SITEMAP_CACHE_CONTROL,
    },
  });
}
