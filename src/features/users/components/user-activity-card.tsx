import { Field } from "@/components/detail-parts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AdminUserCountsDto } from "@/lib/api/types";
import { formatCount } from "@/lib/format/number";

const ACTIVITY_COUNTS: ReadonlyArray<[keyof AdminUserCountsDto, string]> = [
  ["publishedJourneys", "Published journeys"],
  ["privateJourneys", "Private journeys"],
  ["activeComments", "Comments"],
  ["likesGiven", "Likes given"],
  ["followers", "Followers"],
  ["following", "Following"],
  ["blocking", "Blocking"],
  ["blockedBy", "Blocked by"],
  ["reportsReceived", "Reports on account"],
  ["reportsAgainstJourneys", "Reports on journeys"],
  ["reportsFiled", "Reports filed"],
];

/** What the account has done, as counts only: private journeys are never
 * shown, only counted (ADR 0011). */
export function UserActivityCard({ counts }: { counts: AdminUserCountsDto }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="grid grid-cols-2 gap-3">
          {ACTIVITY_COUNTS.map(([key, label]) => (
            <Field key={key} label={label}>
              <span className="tabular-nums">{formatCount(counts[key])}</span>
            </Field>
          ))}
        </dl>
      </CardContent>
    </Card>
  );
}
