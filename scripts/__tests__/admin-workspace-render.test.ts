import { isValidElement, type ReactElement } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

const loadWorkspacePage = vi.fn();
const WorkspaceShell = vi.fn();
const WorkspaceError = vi.fn();

vi.mock("@/lib/workspace/load-workspace-page", () => ({ loadWorkspacePage }));
vi.mock("@/components/layout/workspace-shell", () => ({ WorkspaceShell }));
vi.mock("@/components/layout/workspace-error", () => ({ WorkspaceError }));
vi.mock("@/lib/api/client", () => ({
  isBackendApiError: (error: unknown) =>
    typeof error === "object" &&
    error !== null &&
    typeof (error as { statusCode?: unknown }).statusCode === "number" &&
    typeof (error as { message?: unknown }).message === "string",
}));

class ApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
  ) {
    super(message);
  }
}

const COUNTS = { pendingReviews: 3, openReports: 1, hiddenComments: 0, bannedUsers: 0 };
const SESSION = { accessToken: "token", email: "admin@example.com" };

type ElementProps = Record<string, unknown> & { children?: unknown };

function asElement(value: unknown): ReactElement<ElementProps> {
  if (!isValidElement<ElementProps>(value)) {
    throw new Error("expected a React element");
  }

  return value;
}

afterEach(() => {
  vi.clearAllMocks();
});

describe("renderWorkspacePage", () => {
  it("renders the page inside the shell with its counts and session", async () => {
    loadWorkspacePage.mockResolvedValue({ data: "rows", counts: COUNTS, session: SESSION });
    const load = vi.fn();
    const { renderWorkspacePage } = await import("@/components/layout/workspace-page");

    const element = asElement(
      await renderWorkspacePage({
        active: "comments",
        errorHeading: "Comments are temporarily unavailable.",
        returnTo: "/comments?page=2",
        load,
        render: (data, counts) => `${data}:${counts.pendingReviews}`,
      }),
    );

    expect(loadWorkspacePage).toHaveBeenCalledWith({ returnTo: "/comments?page=2", load });
    expect(element.type).toBe(WorkspaceShell);
    expect(element.props).toEqual({
      active: "comments",
      counts: COUNTS,
      session: SESSION,
      children: "rows:3",
    });
  });

  it("renders an API failure inside the shell", async () => {
    loadWorkspacePage.mockRejectedValue(new ApiError("Service unavailable", 503));
    const { renderWorkspacePage } = await import("@/components/layout/workspace-page");

    const element = asElement(
      await renderWorkspacePage({
        active: "comments",
        errorHeading: "Comments are temporarily unavailable.",
        returnTo: "/comments",
        load: vi.fn(),
        render: () => null,
      }),
    );

    expect(element.type).toBe(WorkspaceShell);
    expect(element.props.active).toBe("comments");
    expect(element.props.counts).toBeUndefined();
    expect(element.props.session).toBeUndefined();

    const error = asElement(element.props.children);
    expect(error.type).toBe(WorkspaceError);
    expect(error.props).toEqual({
      heading: "Comments are temporarily unavailable.",
      message: "Service unavailable",
      statusCode: 503,
    });
  });

  it("rethrows any other error for the error boundary", async () => {
    loadWorkspacePage.mockRejectedValue(new Error("boom"));
    const { renderWorkspacePage } = await import("@/components/layout/workspace-page");

    await expect(
      renderWorkspacePage({
        active: "comments",
        returnTo: "/comments",
        load: vi.fn(),
        render: () => null,
      }),
    ).rejects.toThrow("boom");
  });
});
