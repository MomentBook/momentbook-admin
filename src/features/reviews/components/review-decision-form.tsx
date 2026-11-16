import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import type { ReviewQueueTab } from "@/lib/navigation/review-routes";
import type { AdminReviewStatus } from "@/entities/journey/model";
import { updatePublishedJourneyReviewAction } from "@/features/reviews/actions";
import type { AdminReviewJourney } from "@/features/reviews/detail-model";

const DECISIONS = [
  { status: "APPROVED", label: "Approve", variant: "default" },
  { status: "REJECTED", label: "Reject", variant: "destructive" },
  { status: "PENDING", label: "Move to pending", variant: "outline" },
] as const satisfies ReadonlyArray<{ status: AdminReviewStatus; label: string; variant: string }>;

/** Approve, reject or move back to pending. From the pending tab, Approve
 * and Reject open the next pending journey unless the admin stays. */
export function ReviewDecisionForm({
  journey,
  queueStatus,
  returnTo,
}: {
  journey: AdminReviewJourney;
  /** The queue tab the admin came from; `null` outside the queue. */
  queueStatus: ReviewQueueTab | null;
  returnTo: string;
}) {
  const autoAdvance = queueStatus === "pending";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Decision</CardTitle>
        <CardDescription>
          {autoAdvance
            ? "Approve and Reject open the next pending journey."
            : "Decisions keep you on this journey."}{" "}
          You can change a decision here at any time.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={updatePublishedJourneyReviewAction} className="flex flex-col gap-3">
          <input type="hidden" name="returnTo" value={returnTo} />
          <input type="hidden" name="targetPublicId" value={journey.publicId} />
          {queueStatus ? <input type="hidden" name="queueStatus" value={queueStatus} /> : null}
          {journey.publishOperationId ? (
            <input type="hidden" name="publishOperationId" value={journey.publishOperationId} />
          ) : null}
          <div className="grid gap-2">
            {DECISIONS.map((decision) => (
              <Button
                key={decision.status}
                type="submit"
                name="reviewStatus"
                value={decision.status}
                variant={decision.variant}
                disabled={journey.review.status === decision.status}
              >
                {decision.label}
              </Button>
            ))}
          </div>
          {autoAdvance ? (
            <div className="flex items-center gap-2">
              <Checkbox id="review-stay" name="stay" value="1" />
              <Label htmlFor="review-stay" className="font-normal">
                Stay on this journey
              </Label>
            </div>
          ) : null}
        </form>
      </CardContent>
    </Card>
  );
}
