import { FlashBanner } from "@/components/flash-banner";
import { Button } from "@/components/ui/button";
import type { Flash } from "@/lib/navigation/flash";
import { updatePublishedJourneyReviewAction } from "@/features/reviews/actions";
import type { AdminReviewBanner } from "@/features/reviews/flash";

/** Mutation/error banner for review screens. After Approve or Reject it
 * offers Undo, which moves that journey back to pending (review state only;
 * notifications already sent are not recalled). */
export function ReviewBanner({
  banner,
  returnTo,
}: {
  banner: AdminReviewBanner | Flash | null;
  returnTo: string;
}) {
  const undoPublicId = banner && "undoPublicId" in banner ? banner.undoPublicId : undefined;

  return (
    <FlashBanner
      flash={banner}
      action={
        undoPublicId ? (
          <form action={updatePublishedJourneyReviewAction}>
            <input type="hidden" name="returnTo" value={returnTo} />
            <input type="hidden" name="targetPublicId" value={undoPublicId} />
            <input type="hidden" name="reviewStatus" value="PENDING" />
            <Button type="submit" variant="outline" size="sm">
              Undo
            </Button>
          </form>
        ) : undefined
      }
    />
  );
}
