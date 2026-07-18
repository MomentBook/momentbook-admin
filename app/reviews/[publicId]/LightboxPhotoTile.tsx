"use client";

import { useState } from "react";
import Image from "next/image";
import { Lightbox } from "@astryxdesign/core/Lightbox";
import { VStack } from "@astryxdesign/core/VStack";
import { Text } from "@astryxdesign/core/Text";

import type { AdminReviewPhoto } from "@/lib/admin/reviews";

const photoImageWrapStyle = {
  position: "relative" as const,
  overflow: "hidden",
  aspectRatio: "1 / 1",
  borderRadius: "0.9rem",
  background: "#ece7df",
  cursor: "pointer",
};

const photoImageStyle = { objectFit: "cover" as const };

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
        style={{
          background: "none",
          border: "none",
          padding: 0,
          width: "100%",
          textAlign: "left",
          cursor: "pointer",
        }}
      >
        <VStack gap={0.5}>
          <div style={photoImageWrapStyle}>
            <Image
              src={photo.thumbnailUrl}
              alt={alt}
              fill
              style={photoImageStyle}
              sizes={sizes}
            />
          </div>
          <Text type="body" size="sm" style={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}>
            {label}
          </Text>
        </VStack>
      </button>

      <Lightbox
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        hasZoom
        media={{
          src: photo.fullUrl,
          alt,
          caption: label,
        }}
      />
    </>
  );
}
