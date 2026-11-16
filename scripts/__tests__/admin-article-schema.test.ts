import { describe, expect, it } from "vitest";

// The article fields the editor checks as you type and the server action
// checks again: the same messages either way.

const VALID = {
  language: "en",
  category: "travel-guide",
  title: "Table Mountain by cableway",
  body: [
    "# Table Mountain by cableway",
    "",
    "![The cableway cabin above Cape Town](https://images.example.com/cableway.jpg)",
    "",
    "Book the **first car** of the day and bring a [map](https://example.com/map).",
    "",
    "- Water",
    "- A jacket",
  ].join("\n"),
};

async function firstMessage(input: Record<string, unknown>, mode: "create" | "edit" = "create") {
  const { articleCreateFields, articleEditFields } = await import("@/features/articles/schema");
  const result = (mode === "create" ? articleCreateFields : articleEditFields).safeParse(input);
  return result.success ? null : result.error.issues[0]?.message;
}

describe("article fields", () => {
  it("accepts the current valid fixture body", async () => {
    expect(await firstMessage(VALID)).toBeNull();
  });

  it("rejects an image without alt text", async () => {
    expect(await firstMessage({ ...VALID, body: "Intro\n\n![ ](https://images.example.com/a.jpg)" })).toBe(
      "Markdown image alt text must not be empty.",
    );
  });

  it("rejects a non-http image url", async () => {
    expect(await firstMessage({ ...VALID, body: "![Harbour](ftp://images.example.com/a.jpg)" })).toBe(
      "Markdown image URLs must use http or https.",
    );
  });

  it("rejects a relative image url", async () => {
    expect(await firstMessage({ ...VALID, body: "![Harbour](/images/a.jpg)" })).toBe(
      "Markdown image URLs must be absolute http or https URLs.",
    );
  });

  it("rejects an image outside the ![alt](url) form", async () => {
    expect(await firstMessage({ ...VALID, body: "![Harbour] (https://images.example.com/a.jpg)" })).toBe(
      "Markdown images must use ![alt](https://...) syntax.",
    );
  });

  it("names the first missing field, in form order", async () => {
    expect(await firstMessage({})).toBe("language is required.");
    expect(await firstMessage({ ...VALID, title: "   " })).toBe("title is required.");
    expect(await firstMessage({ ...VALID, body: "" })).toBe("body is required.");
  });

  it("rejects a language or category the API does not know", async () => {
    expect(await firstMessage({ ...VALID, language: "xx" })).toBe("language is invalid.");
    expect(await firstMessage({ ...VALID, category: "food" })).toBe("category is invalid.");
  });

  it("trims the text and drops a blank slug", async () => {
    const { articleCreateFields } = await import("@/features/articles/schema");

    expect(
      articleCreateFields.parse({ ...VALID, title: "  Guide  ", slug: "  ", body: ` ${VALID.body} ` }),
    ).toEqual({
      language: "en",
      category: "travel-guide",
      title: "Guide",
      body: VALID.body,
      slug: undefined,
      translationGroupId: undefined,
    });
  });

  it("an edit keeps only category, title and body", async () => {
    const { articleEditFields } = await import("@/features/articles/schema");

    expect(articleEditFields.parse({ ...VALID, language: "ko", slug: "tampered" })).toEqual({
      category: "travel-guide",
      title: VALID.title,
      body: VALID.body,
    });
    expect(await firstMessage({ title: "Guide", body: "Text" }, "edit")).toBe("category is required.");
  });
});
