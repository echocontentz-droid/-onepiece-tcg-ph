"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart, MapPin, Shield, Star, Package, Handshake } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { cn, formatPHP, timeAgo } from "@/lib/utils";
import { CARD_CONDITIONS, CARD_RARITIES } from "@/lib/constants";
import type { Listing } from "@/types";

interface ListingCardProps {
  listing: Listing;
  onSave?: (id: string, saved: boolean) => void;
  showSeller?: boolean;
}

export function ListingCard({ listing, onSave, showSeller = true }: ListingCardProps) {
  const [saved, setSaved] = useState(listing.is_saved ?? false);
  const [saving, setSaving] = useState(false);

  const primaryImage = listing.images?.find((i) => i.is_primary) ?? listing.images?.[0];
  const condition = CARD_CONDITIONS[listing.condition];
  const rarity = CARD_RARITIES[listing.rarity];

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (saving) return;
    setSaving(true);
    setSaved((s) => !s);
    await onSave?.(listing.id, !saved);
    setSaving(false);
  };

  return (
    <Link href={`/listings/${listing.id}`} className="group block">
      <div className="listing-card rounded-2xl border border-border bg-card overflow-hidden">
        {/* Image */}
        <div className="relative aspect-[3/4] bg-muted overflow-hidden">
          {primaryImage ? (
            <Image
              src={primaryImage.url}
              alt={listing.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
              <Package className="h-12 w-12 opacity-30" />
            </div>
          )}

          {/* Save button */}
          <button
            onClick={handleSave}
            className="absolute top-2 right-2 p-1.5 rounded-full bg-background/80 backdrop-blur-sm border border-border/50 hover:bg-background transition-colors"
          >
            <Heart
              className={cn(
                "h-4 w-4 transition-colors",
                saved ? "fill-primary text-primary" : "text-muted-foreground"
              )}
            />
          </button>

          {/* Foil badge */}
          {listing.is_foil && (
            <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white text-[10px] font-bold shadow">
              FOIL ✨
            </div>
          )}

          {/* Status overlay */}
          {listing.status !== "active" && (
            <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
              <span className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                {listing.status}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-3">
          {/* Rarity + Condition */}
          <div className="flex items-center gap-1.5 mb-2 flex-wrap">
            <span className={cn(
              "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold",
              `badge-${listing.rarity}`
            )}>
              {rarity.label}
            </span>
            <span className={cn(
              "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium",
              `badge-${listing.condition}`
            )}>
              {listing.condition === "near_mint" ? "NM" :
               listing.condition === "lightly_played" ? "LP" :
               listing.condition === "moderately_played" ? "MP" :
               listing.condition === "heavily_played" ? "HP" :
               listing.condition === "damaged" ? "D" : "M"}
            </span>
            <span className="text-[10px] text-muted-foreground font-mono">
              {listing.card_set}
            </span>
          </div>

          {/* Card name */}
          <h3 className="font-semibold text-sm text-foreground leading-snug line-clamp-1 mb-0.5">
            {listing.card_name}
          </h3>

          {/* Title */}
          <p className="text-xs text-muted-foreground line-clamp-1 mb-2">
            {listing.title}
          </p>

          {/* Price */}
          <div className="flex items-baseline gap-1.5 mb-2">
            <span className="text-lg font-bold text-foreground">
              {formatPHP(listing.price)}
            </span>
            {listing.is_negotiable && (
              <span className="text-xs text-muted-foreground">(nego)</span>
            )}
          </div>

          {/* Seller & location */}
          {showSeller && listing.seller && (
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <span className="font-medium text-foreground/70">
                  @{listing.seller.username}
                </span>
                {listing.seller.is_verified_seller && (
                  <Shield className="h-3 w-3 text-blue-500" />
                )}
                {listing.seller.rating_count > 0 && (
                  <span className="flex items-center gap-0.5 text-amber-500">
                    <Star className="h-3 w-3 fill-current" />
                    {listing.seller.rating_avg.toFixed(1)}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-0.5">
                <MapPin className="h-3 w-3" />
                <span className="truncate max-w-[80px]">{listing.location_province}</span>
              </div>
            </div>
          )}

          {/* Shipping badges */}
          <div className="flex items-center gap-1 mt-2 flex-wrap">
            {listing.free_shipping && (
              <Badge variant="success" className="text-[10px] px-1.5 py-0">
                Free Ship
              </Badge>
            )}
            {listing.allows_meetup && (
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 gap-0.5">
                <Handshake className="h-2.5 w-2.5" /> Meetup
              </Badge>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

// ---------------------------------------------------------------
// Skeleton loader
// ---------------------------------------------------------------
export function ListingCardSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <div className="aspect-[3/4] shimmer" />
      <div className="p-3 space-y-2">
        <div className="flex gap-1.5">
          <div className="h-4 w-14 rounded-full shimmer" />
          <div className="h-4 w-10 rounded-full shimmer" />
        </div>
        <div className="h-4 w-3/4 rounded shimmer" />
        <div className="h-3 w-1/2 rounded shimmer" />
        <div className="h-6 w-20 rounded shimmer" />
      </div>
    </div>
  );
}
