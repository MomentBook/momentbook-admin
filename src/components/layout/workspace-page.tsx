import "server-only";

import type { ReactElement, ReactNode } from "react";
import { isBackendApiError } from "@/lib/api/client";
import type { AttentionCounts } from "@/lib/workspace/attention";
import { loadWorkspacePage } from "@/lib/workspace/load-workspace-page";
import type { AdminNavKey } from "./admin-nav";
import { WorkspaceError } from "./workspace-error";
import { WorkspaceShell } from "./workspace-shell";

/**
 * A workspace page: loads its data with the attention counts under one admin
 * session (`loadWorkspacePage`, which also turns a 401 or 403 into a new
 * sign-in) and renders it inside the shell. An API failure renders inside the
 * shell too, so the sidebar stays; anything else reaches `(workspace)/error`.
 */
export async function renderWorkspacePage<T>(options: {
  active: AdminNavKey;
  /** Shown when the API fails; the shell's general wording when left out. */
  errorHeading?: string;
  /** This page's own URL, where a new sign-in returns to. */
  returnTo: string;
  load: (accessToken: string, counts: Promise<AttentionCounts>) => Promise<T>;
  render: (data: T, counts: AttentionCounts) => ReactNode;
}): Promise<ReactElement> {
  let page: Awaited<ReturnType<typeof loadWorkspacePage<T>>>;

  try {
    page = await loadWorkspacePage({ returnTo: options.returnTo, load: options.load });
  } catch (error) {
    if (isBackendApiError(error)) {
      return (
        <WorkspaceShell active={options.active}>
          <WorkspaceError
            heading={options.errorHeading}
            message={error.message}
            statusCode={error.statusCode}
          />
        </WorkspaceShell>
      );
    }

    throw error;
  }

  return (
    <WorkspaceShell active={options.active} counts={page.counts} session={page.session}>
      {options.render(page.data, page.counts)}
    </WorkspaceShell>
  );
}
