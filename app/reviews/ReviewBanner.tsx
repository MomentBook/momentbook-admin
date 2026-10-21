import { Alert, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import type { AdminDashboardBanner } from "@/app/_workspace/workspace-data";
import { updatePublishedJourneyReviewAction } from "./actions";
import type { AdminReviewBanner } from "./review-banner";

/** Mutation/error banner for review screens. After Approve or Reject it
 * offers Undo, which moves that journey back to pending (review state only;
 * notifications already sent are not recalled). */
export function ReviewBanner({
  banner,
  returnTo,
}: {
  banner: AdminReviewBanner | AdminDashboardBanner | null;
  returnTo: string;
}) {
  if (!banner) {
    return null;
  }

  const undoPublicId = "undoPublicId" in banner ? banner.undoPublicId : undefined;

  return (
    <Alert variant={banner.tone === "error" ? "destructive" : "default"}>
      <div className="col-start-2 flex flex-wrap items-center justify-between gap-3">
        <AlertTitle className="line-clamp-none">{banner.message}</AlertTitle>
        {undoPublicId ? (
          <form action={updatePublishedJourneyReviewAction}>
            <input type="hidden" name="returnTo" value={returnTo} />
            <input type="hidden" name="targetPublicId" value={undoPublicId} />
            <input type="hidden" name="reviewStatus" value="PENDING" />
            <Button type="submit" variant="outline" size="sm">
              Undo
            </Button>
          </form>
        ) : null}
      </div>
    </Alert>
  );
}
