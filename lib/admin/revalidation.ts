import "server-only";

import { createHmac } from "node:crypto";
import { ENV } from "@/src/configs/env.server";

export const WEB_REVALIDATION_FAILED_QUERY_VALUE = "failed";

export type WebRevalidationTag =
  | "published-journeys-sitemap"
  | "published-guides-sitemap";

export type WebRevalidationPayload = {
  paths: string[];
  tags?: WebRevalidationTag[];
};

function uniqueSorted(values: string[]): string[] {
  return [...new Set(values.filter((value) => value.trim().length > 0))].sort();
}

function normalizePayload(
  payload: WebRevalidationPayload,
): WebRevalidationPayload {
  const tags = payload.tags
    ? (uniqueSorted(payload.tags) as WebRevalidationTag[])
    : [];

  return {
    paths: uniqueSorted(payload.paths),
    ...(tags.length > 0 ? { tags } : {}),
  };
}

function readWebhookUrl(): URL | null {
  const raw = ENV.WEB_REVALIDATION_URL?.trim();

  if (!raw) {
    return null;
  }

  try {
    const parsed = new URL(raw);

    return parsed.protocol === "http:" || parsed.protocol === "https:"
      ? parsed
      : null;
  } catch {
    return null;
  }
}

export async function requestWebRevalidation(
  payload: WebRevalidationPayload,
): Promise<boolean> {
  const webhookUrl = readWebhookUrl();
  const secret = ENV.WEB_REVALIDATION_SECRET?.trim();

  if (!webhookUrl || !secret) {
    return false;
  }

  const body = JSON.stringify(normalizePayload(payload));
  const timestamp = String(Date.now());
  const signature = createHmac("sha256", secret)
    .update(`${timestamp}.${body}`)
    .digest("hex");

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-momentbook-revalidate-timestamp": timestamp,
        "x-momentbook-revalidate-signature": signature,
      },
      body,
    });

    return response.ok;
  } catch {
    return false;
  }
}
