import type { Metadata } from "next";
import { renderWorkspacePage } from "@/components/layout/workspace-page";
import { buildAdminStorageHref } from "@/lib/navigation/paths";
import { StorageView } from "@/features/storage/components/storage-view";
import { loadStoragePage } from "@/features/storage/loader";

export const metadata: Metadata = {
  title: "Storage",
};

export default async function StoragePage() {
  return renderWorkspacePage({
    active: "storage",
    errorHeading: "Storage figures are temporarily unavailable.",
    returnTo: buildAdminStorageHref(),
    load: (accessToken) => loadStoragePage(accessToken),
    render: (data) => <StorageView data={data.storage} subscriptions={data.subscriptions} />,
  });
}
