import { afterEach, describe, expect, it, vi } from "vitest";

// What the article actions do when the API turns the admin away, and with a
// form that fails its checks. The other actions' expectations hold here too.

vi.mock("server-only", () => ({}));

const redirect = vi.fn((href: string) => {
  throw new Error(`REDIRECT:${href}`);
});
const cookies = vi.fn();
const requireAdminActionSession = vi.fn();
const clearAdminSession = vi.fn();
const createAdminArticle = vi.fn();
const updateAdminArticle = vi.fn();
const deleteAdminArticle = vi.fn();
const loadAdminEditorialArticle = vi.fn();

class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
  ) {
    super(message);
  }
}

vi.mock("next/headers", () => ({ cookies }));
vi.mock("next/navigation", () => ({ redirect }));
vi.mock("@/lib/auth/session", () => ({ requireAdminActionSession, clearAdminSession }));
vi.mock("@/lib/api/articles", () => ({ createAdminArticle, deleteAdminArticle, updateAdminArticle }));
vi.mock("@/features/articles/loader", () => ({ loadAdminEditorialArticle }));

function createForm(fields: Record<string, string> = {}) {
  const formData = new FormData();
  formData.set("nextPath", "/articles/new");
  formData.set("returnTo", "/articles?lang=en");
  formData.set("language", "en");
  formData.set("category", "travel-guide");
  formData.set("title", "Fresh guide");
  formData.set("body", "# Fresh guide");
  for (const [key, value] of Object.entries(fields)) formData.set(key, value);
  return formData;
}

async function run(action: (formData: FormData) => Promise<never>, formData: FormData) {
  try {
    await action(formData);
  } catch (error) {
    return (error as Error).message;
  }

  throw new Error("expected a redirect");
}

afterEach(() => {
  vi.clearAllMocks();
  vi.resetModules();
});

describe("article actions", () => {
  function signedIn() {
    cookies.mockResolvedValue({});
    requireAdminActionSession.mockResolvedValue({ accessToken: "token" });
  }

  it("clears the session and goes to login on 401", async () => {
    signedIn();
    createAdminArticle.mockRejectedValue(new ApiError("Unauthorized", 401));
    const { createEditorialArticleAction } = await import("@/features/articles/actions");

    expect(await run(createEditorialArticleAction, createForm())).toBe(
      "REDIRECT:/login?next=%2Farticles%2Fnew&error=session_expired",
    );
    expect(clearAdminSession).toHaveBeenCalled();
  });

  it("signs out on 403", async () => {
    signedIn();
    deleteAdminArticle.mockRejectedValue(new ApiError("Forbidden", 403));
    loadAdminEditorialArticle.mockResolvedValue(null);
    const { deleteEditorialArticleAction } = await import("@/features/articles/actions");
    const formData = new FormData();
    formData.set("articleId", "a-1");
    formData.set("nextPath", "/articles/a-1");

    expect(await run(deleteEditorialArticleAction, formData)).toBe(
      "REDIRECT:/login?next=%2Farticles%2Fa-1&error=admin_access_denied",
    );
    expect(clearAdminSession).toHaveBeenCalled();
  });

  it("returns a failed check to the editor with its message, before asking for the session", async () => {
    signedIn();
    const { createEditorialArticleAction } = await import("@/features/articles/actions");

    expect(
      await run(createEditorialArticleAction, createForm({ body: "![](https://images.example.com/a.jpg)" })),
    ).toBe(
      "REDIRECT:/articles/new?error=article_validation&message=Markdown+image+alt+text+must+not+be+empty.",
    );
    expect(createAdminArticle).not.toHaveBeenCalled();
    expect(requireAdminActionSession).not.toHaveBeenCalled();
  });

  it("shows the API's reason for a 409 as a validation banner", async () => {
    signedIn();
    createAdminArticle.mockRejectedValue(new ApiError("Slug   already\nused", 409));
    const { createEditorialArticleAction } = await import("@/features/articles/actions");

    expect(await run(createEditorialArticleAction, createForm())).toBe(
      "REDIRECT:/articles/new?error=article_validation&message=Slug+already+used",
    );
  });

  it("an update of an article that is gone returns to the list", async () => {
    signedIn();
    loadAdminEditorialArticle.mockResolvedValue(null);
    const { updateEditorialArticleAction } = await import("@/features/articles/actions");

    expect(
      await run(updateEditorialArticleAction, createForm({ articleId: "a-1", nextPath: "/articles/a-1" })),
    ).toBe("REDIRECT:/articles?error=article_not_found");
    expect(updateAdminArticle).not.toHaveBeenCalled();
  });

  it("a delete returns to the list it came from", async () => {
    signedIn();
    loadAdminEditorialArticle.mockResolvedValue({ slug: "old-guide" });
    deleteAdminArticle.mockResolvedValue(undefined);
    const { deleteEditorialArticleAction } = await import("@/features/articles/actions");
    const formData = new FormData();
    formData.set("articleId", "a-1");
    formData.set("nextPath", "/articles/a-1");
    formData.set("returnTo", "/articles?lang=en&error=old");

    expect(await run(deleteEditorialArticleAction, formData)).toBe(
      "REDIRECT:/articles?lang=en&mutation=article_deleted&articleSlug=old-guide",
    );
  });
});
