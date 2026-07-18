import "server-only";

import { NextResponse } from "next/server";

import { resolveSiteUrl } from "@/lib/site-url";

const CRAWLER_PROBE_CACHE_CONTROL = "public, max-age=3600, s-maxage=3600";

export function redirectToCanonicalSitemap(request: Request) {
  void request;

  const canonicalUrl = new URL("/sitemap.xml", `${resolveSiteUrl()}/`);

  return NextResponse.redirect(canonicalUrl, 301);
}

export function buildCrawlerProbeNotFoundResponse(body?: string) {
  return new Response(body, {
    status: 404,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": CRAWLER_PROBE_CACHE_CONTROL,
    },
  });
}
