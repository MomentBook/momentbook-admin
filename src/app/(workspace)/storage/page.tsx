import type { Metadata } from "next";
import { buildNoIndexRobots } from "@/lib/seo";
import { isBackendApiError } from "@/lib/api/client";
import { loadAdminStorageData } from "@/features/storage/loader";
import { loadAdminSubscriptionSummaryOrNull } from "@/features/users/subscriptions-loader";
import { buildAdminStorageHref } from "@/lib/navigation/paths";
import { loadWorkspacePage } from "@/lib/workspace/load-workspace-page";
import { WorkspaceShell } from "@/components/layout/workspace-shell";
import { AdminWorkspaceErrorPage } from "@/components/layout/workspace-error";
import { AdminStoragePageView } from "@/features/storage/components/storage-view";

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
