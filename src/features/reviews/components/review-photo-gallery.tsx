"use client";

import { useState } from "react";
import Image from "next/image";
import Lightbox from "yet-another-react-lightbox";
import Captions from "yet-another-react-lightbox/plugins/captions";
import Counter from "yet-another-react-lightbox/plugins/counter";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/captions.css";
import "yet-another-react-lightbox/plugins/counter.css";

export type GalleryPhoto = {
  key: string;
  thumbnailUrl: string;
  fullUrl: string;
  /** What the photo is, for screen readers and the open button. */
  alt: string;
  /** The place under the thumbnail and in the lightbox. */
  label: string;
  width: number | null;
  height: number | null;
};

const CLOSED = -1;

/** A section's photos as thumbnails; one opens the lightbox on it, where the
 * admin steps through the rest and zooms in (pinch, wheel or double tap). */
export function ReviewPhotoGallery({ photos }: { photos: GalleryPhoto[] }) {
  const [index, setIndex] = useState(CLOSED);

  return (
    <>
      <ul className="grid list-none gap-3 p-0" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(208px, 1fr))" }}>
        {photos.map((photo, photoIndex) => (
          <li key={photo.key}>
            <button
              type="button"
              onClick={() => setIndex(photoIndex)}
              aria-label={`Open ${photo.alt}`}
              className="flex w-full cursor-pointer flex-col gap-0.5 rounded-2xl text-left focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
            >
              <span className="relative block aspect-square overflow-hidden rounded-2xl bg-muted">
                <Image
                  src={photo.thumbnailUrl}
                  alt={photo.alt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 900px) 100vw, (max-width: 1320px) 50vw, 22rem"
                />
              </span>
              <span className="truncate text-sm">{photo.label}</span>
            </button>
          </li>
        ))}
      </ul>

      <Lightbox
        open={index !== CLOSED}
        index={Math.max(index, 0)}
        close={() => setIndex(CLOSED)}
        on={{ view: ({ index: current }) => setIndex(current) }}
        plugins={[Zoom, Counter, Captions]}
        slides={photos.map((photo) => ({
          src: photo.fullUrl,
          alt: photo.alt,
          description: photo.label,
          width: photo.width ?? undefined,
          height: photo.height ?? undefined,
        }))}
      />
    </>
  );
}
