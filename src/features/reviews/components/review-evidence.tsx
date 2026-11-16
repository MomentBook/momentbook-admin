import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { formatCount } from "@/lib/format/number";
import type { AdminReviewEvidence, AdminReviewEvidenceSection } from "@/features/reviews/detail-model";
import { ReviewPhotoGallery, type GalleryPhoto } from "./review-photo-gallery";

function clusterNumber(index: number): string {
  return `Cluster ${String(index + 1).padStart(2, "0")}`;
}

function sectionHeading(section: AdminReviewEvidenceSection, index: number, total: number): string {
  if (section.kind === "remaining") {
    return total === 1 ? "All photos" : "Additional photos";
  }

  return section.title ?? clusterNumber(index);
}

function toGalleryPhotos(section: AdminReviewEvidenceSection, heading: string): GalleryPhoto[] {
  return section.photos.map((photo, photoIndex) => ({
    key: photo.key,
    thumbnailUrl: photo.thumbnailUrl,
    fullUrl: photo.fullUrl,
    alt: `${heading} photo ${photoIndex + 1} of ${section.photos.length}`,
    label: photo.locationName || "Journey photo",
    width: photo.width,
    height: photo.height,
  }));
}

function EvidenceSectionCard({
  index,
  section,
  total,
}: {
  index: number;
  section: AdminReviewEvidenceSection;
  total: number;
}) {
  const heading = sectionHeading(section, index, total);

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-muted-foreground">
              {section.kind === "cluster" ? clusterNumber(index) : "Remaining"}
            </span>
            <CardTitle className="text-lg">{heading}</CardTitle>
          </div>
          <Badge variant="outline">{formatCount(section.photoCount)} photos</Badge>
        </div>
      </CardHeader>

      <CardContent>
        {section.photos.length > 0 ? (
          <ReviewPhotoGallery photos={toGalleryPhotos(section, heading)} />
        ) : (
          <Empty className="py-8">
            <EmptyHeader>
              <EmptyTitle>No photo assets resolved</EmptyTitle>
              <EmptyDescription>
                This cluster exists in the moderation payload, but no photo assets were attached
                to it.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </CardContent>
    </Card>
  );
}

/** The journey's photos, one card per moment, then any photos no moment
 * holds. */
export function ReviewEvidence({ evidence }: { evidence: AdminReviewEvidence }) {
  if (evidence.sections.length === 0) {
    return (
      <Card>
        <CardContent>
          <Empty className="py-10">
            <EmptyHeader>
              <EmptyTitle>No evidence photos available</EmptyTitle>
              <EmptyDescription>
                {evidence.unavailableReason ??
                  "The admin detail contract did not return any photo evidence for this journey."}
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        </CardContent>
      </Card>
    );
  }

  return evidence.sections.map((section, index) => (
    <EvidenceSectionCard
      key={section.key}
      index={index}
      section={section}
      total={evidence.sections.length}
    />
  ));
}
