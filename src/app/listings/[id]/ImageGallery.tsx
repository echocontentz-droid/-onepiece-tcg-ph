"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, ZoomIn, Package } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ListingImage } from "@/types";

interface ImageGalleryProps {
  images: ListingImage[];
  cardName: string;
}

export function ImageGallery({ images, cardName }: ImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const sorted = [...images].sort((a, b) => {
    if (a.is_primary && !b.is_primary) return -1;
    if (!a.is_primary && b.is_primary) return 1;
    return a.display_order - b.display_order;
  });

  if (!sorted.length) {
    return (
      <div className="aspect-[4/3] rounded-2xl border border-border bg-muted flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <Package className="h-16 w-16 mx-auto mb-2 opacity-30" />
          <p className="text-sm">No images provided</p>
        </div>
      </div>
    );
  }

  const currentImage = sorted[activeIndex];

  return (
    <div>
      {/* Main image */}
      <div
        className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-muted cursor-zoom-in group"
        onClick={() => setLightboxOpen(true)}
      >
        <Image
          src={currentImage.url}
          alt={`${cardName} - Image ${activeIndex + 1}`}
          fill
          className="object-contain"
          priority
        />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/10">
          <ZoomIn className="h-8 w-8 text-white drop-shadow-lg" />
        </div>

        {sorted.length > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); setActiveIndex((i) => (i - 1 + sorted.length) % sorted.length); }}
              className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-background/80 border border-border flex items-center justify-center hover:bg-background transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setActiveIndex((i) => (i + 1) % sorted.length); }}
              className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-background/80 border border-border flex items-center justify-center hover:bg-background transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </>
        )}

        <div className="absolute bottom-2 right-2 rounded-full bg-background/80 px-2 py-0.5 text-xs text-foreground">
          {activeIndex + 1} / {sorted.length}
        </div>
      </div>

      {/* Thumbnails */}
      {sorted.length > 1 && (
        <div className="flex gap-2 mt-3 overflow-x-auto hide-scrollbar">
          {sorted.map((img, i) => (
            <button
              key={img.id}
              onClick={() => setActiveIndex(i)}
              className={cn(
                "shrink-0 h-16 w-16 rounded-lg overflow-hidden border-2 transition-all",
                i === activeIndex ? "border-primary" : "border-border hover:border-primary/50"
              )}
            >
              <Image
                src={img.url}
                alt={`Thumbnail ${i + 1}`}
                width={64}
                height={64}
                className="object-cover h-full w-full"
              />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
          onClick={() => setLightboxOpen(false)}
        >
          <div className="relative max-w-3xl max-h-[90vh] w-full h-full m-4">
            <Image
              src={currentImage.url}
              alt={cardName}
              fill
              className="object-contain"
            />
          </div>
          {sorted.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); setActiveIndex((i) => (i - 1 + sorted.length) % sorted.length); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20"
              >
                <ChevronLeft className="h-6 w-6 text-white" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setActiveIndex((i) => (i + 1) % sorted.length); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20"
              >
                <ChevronRight className="h-6 w-6 text-white" />
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
