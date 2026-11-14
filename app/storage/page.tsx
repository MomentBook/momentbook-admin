import type { Metadata } from "next";
import { buildNoIndexRobots } from "@/lib/seo/public-metadata";
import { isBackendApiError } from "@/lib/api/client";
import { loadAdminStorageData } from "@/lib/admin/storage";
import { loadAdminSubscriptionSummaryOrNull } from "@/lib/admin/subscriptions";
import { buildAdminStorageHref } from "@/lib/admin/paths";
import { loadWorkspacePage } from "@/app/_workspace/workspace-data";
import { WorkspaceShell } from "@/components/layout/workspace-shell";
import { AdminWorkspaceErrorPage } from "@/app/_workspace/AdminWorkspaceErrorPage";
import { AdminStoragePageView } from "./AdminStoragePageView";

export const metadata: Metadata = {
  title: "Storage",
  robots: buildNoIndexRobots(),
};

export default async function AdminStoragePage() {
  let page;

  try {
    page = await loadWorkspacePage({
      returnTo: buildAdminStorageHref(),
      load: async (accessToken) => {
        const [storage, subscriptions] = await Promise.all([
          loadAdminStorageData(accessToken),
          loadAdminSubscriptionSummaryOrNull(accessToken),
        ]);

        return { storage, subscriptions };
      },
    });
  } catch (error) {
    if (isBackendApiError(error)) {
      return (
        <AdminWorkspaceErrorPage
          heading="Storage figures are temporarily unavailable."
          message={error.message}
          statusCode={error.statusCode}
        />
      );
    }

    throw error;
  }

  return (
    <WorkspaceShell active="storage" counts={page.counts} session={page.session}>
      <AdminStoragePageView data={page.data.storage} subscriptions={page.data.subscriptions} />
    </WorkspaceShell>
  );
}
