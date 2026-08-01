"use client";

import { useState } from "react";
import Image from "next/image";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

import type { AdminReviewPhoto } from "@/lib/admin/reviews";

type LightboxPhotoTileProps = {
  photo: AdminReviewPhoto;
  label: string;
  alt: string;
  sizes: string;
  triggerLabel: string;
};

export function LightboxPhotoTile({
  photo,
  label,
  alt,
  sizes,
  triggerLabel,
}: LightboxPhotoTileProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label={triggerLabel}
        className="w-full cursor-pointer border-0 bg-transparent p-0 text-left"
      >
        <div className="flex flex-col gap-0.5">
          <div className="relative aspect-square overflow-hidden rounded-2xl bg-[#ece7df]">
            <Image
              src={photo.thumbnailUrl}
              alt={alt}
              fill
              className="object-cover"
              sizes={sizes}
            />
          </div>
          <p className="overflow-hidden text-ellipsis whitespace-nowrap text-sm">
            {label}
          </p>
        </div>
      </button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 border-0 bg-black/90">
          <VisuallyHidden asChild>
            <DialogTitle>{alt}</DialogTitle>
          </VisuallyHidden>
          <div className="relative flex items-center justify-center w-full h-full min-h-[50vh]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo.fullUrl}
              alt={alt}
              className="max-h-[90vh] max-w-full object-contain"
            />
          </div>
          {label ? (
            <p className="px-4 pb-4 text-center text-sm text-white/70">{label}</p>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
