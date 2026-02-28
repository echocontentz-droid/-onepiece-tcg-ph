import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/marketplace/Navbar";
import { Footer } from "@/components/marketplace/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Shield, Star, MapPin, Package, ChevronLeft,
  Heart, Flag, Truck, Handshake, Clock, Eye
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { formatPHP, timeAgo, formatDate } from "@/lib/utils";
import {
  CARD_CONDITIONS, CARD_RARITIES, CARD_SETS,
  SHIPPING_METHODS, PAYMENT_METHODS
} from "@/lib/constants";
import type { Listing } from "@/types";
import { BuyNowButton } from "./BuyNowButton";
import { SaveButton } from "./SaveButton";
import { ImageGallery } from "./ImageGallery";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: listing } = await supabase
    .from("listings")
    .select("card_name, title, price")
    .eq("id", id)
    .single();

  if (!listing) return { title: "Listing Not Found" };

  return {
    title: `${listing.card_name} — ${formatPHP(listing.price)} | The Grandline Marketplace`,
    description: listing.title,
  };
}

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch listing with full relations
  const { data: listing } = await supabase
    .from("listings")
    .select(`
      *,
      seller:profiles!seller_id(
        id, username, display_name, avatar_url,
        is_verified_seller, rating_avg, rating_count,
        total_sales, total_purchases, member_since,
        province, city, bio,
        preferred_payment, preferred_shipping, allow_meetup
      ),
      images:listing_images(*)
    `)
    .eq("id", id)
    .single();

  if (!listing) notFound();

  // Increment view count (fire and forget)
  supabase.from("listings").update({ view_count: listing.view_count + 1 }).eq("id", id).then(() => {});

  let profile = null;
  let isSaved = false;
  if (user) {
    const [profileRes, savedRes] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).single(),
      supabase.from("watchlist").select("id").eq("user_id", user.id).eq("listing_id", id).single(),
    ]);
    profile = profileRes.data;
    isSaved = !!savedRes.data;
  }

  // Fetch seller reviews (last 3)
  const { data: reviews } = await supabase
    .from("reviews")
    .select(`
      *,
      reviewer:profiles!reviewer_id(username, display_name, avatar_url)
    `)
    .eq("reviewee_id", listing.seller_id)
    .order("created_at", { ascending: false })
    .limit(3);

  const l = listing as unknown as Listing;
  const images = l.images ?? [];
  const condition = CARD_CONDITIONS[l.condition];
  const rarity = CARD_RARITIES[l.rarity];
  const cardSet = CARD_SETS[l.card_set];
  const isSeller = user?.id === l.seller_id;
  const isActive = l.status === "active";

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar user={profile} />

      <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link href="/listings" className="hover:text-foreground flex items-center gap-1">
            <ChevronLeft className="h-4 w-4" />
            Back to listings
          </Link>
          <span>·</span>
          <span>{l.card_set}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left — Images */}
          <div className="lg:col-span-3">
            <ImageGallery images={images} cardName={l.card_name} />
          </div>

          {/* Right — Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Status */}
            {l.status !== "active" && (
              <div className="rounded-xl border border-border bg-muted/50 p-3 text-center text-sm font-medium uppercase tracking-wider text-muted-foreground">
                {l.status === "sold" ? "This card has been sold" : `Listing ${l.status}`}
              </div>
            )}

            {/* Card info */}
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <Badge className={`badge-${l.rarity} border-0`}>
                  {rarity.label}
                </Badge>
                <Badge variant="outline" className="font-mono text-xs">
                  {l.card_set}
                  {l.card_number && ` · ${l.card_number}`}
                </Badge>
                {l.is_foil && (
                  <Badge className="bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white border-0">
                    FOIL ✨
                  </Badge>
                )}
              </div>

              <h1 className="text-2xl font-bold text-foreground">{l.card_name}</h1>
              <p className="text-muted-foreground mt-1">{l.title}</p>

              {/* Price */}
              <div className="flex items-baseline gap-2 mt-4">
                <span className="text-3xl font-extrabold text-foreground">
                  {formatPHP(l.price)}
                </span>
                {l.is_negotiable && (
                  <span className="text-sm text-muted-foreground">(Open to offers)</span>
                )}
              </div>
            </div>

            {/* Card details grid */}
            <div className="rounded-xl border border-border bg-card divide-y divide-border">
              {[
                {
                  label: "Condition",
                  value: (
                    <span className={`badge-${l.condition} inline-block px-2 py-0.5 rounded text-xs font-semibold`}>
                      {condition.label}
                    </span>
                  ),
                },
                { label: "Language", value: l.language },
                { label: "Set", value: cardSet.split(" — ")[0] + " " + (cardSet.split(" — ")[1] ?? "") },
                { label: "Quantity", value: `${l.quantity} available` },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between px-4 py-3 text-sm">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="font-medium text-foreground">{value}</span>
                </div>
              ))}
            </div>

            {/* Shipping & Location */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">Shipping & Location</h3>
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">
                  {l.location_city}, {l.location_province}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {l.shipping_options.map((method) => (
                  <Badge key={method} variant="outline" className="text-xs gap-1">
                    <Truck className="h-3 w-3" />
                    {SHIPPING_METHODS[method as keyof typeof SHIPPING_METHODS]?.label ?? method}
                  </Badge>
                ))}
                {l.allows_meetup && (
                  <Badge variant="outline" className="text-xs gap-1">
                    <Handshake className="h-3 w-3" />
                    Meetup OK
                  </Badge>
                )}
              </div>
              {l.free_shipping && (
                <Badge variant="success" className="text-xs">Free Shipping</Badge>
              )}
              {l.shipping_fee > 0 && !l.free_shipping && (
                <p className="text-sm text-muted-foreground">
                  Shipping fee: <span className="font-medium text-foreground">{formatPHP(l.shipping_fee)}</span>
                </p>
              )}
            </div>

            {/* Action buttons */}
            {!isSeller && (
              <div className="space-y-3">
                {isActive && user ? (
                  <BuyNowButton listing={l} userId={user.id} />
                ) : isActive && !user ? (
                  <Button className="w-full" size="lg" asChild>
                    <Link href={`/login?redirect=/listings/${id}`}>
                      Sign in to Buy
                    </Link>
                  </Button>
                ) : null}

                <div className="flex gap-2">
                  <SaveButton listingId={id} userId={user?.id} initialSaved={isSaved} />
                  <Button variant="outline" size="sm" className="flex-1" asChild>
                    <Link href={`/report?listing=${id}`}>
                      <Flag className="h-4 w-4 mr-1" />
                      Report
                    </Link>
                  </Button>
                </div>
              </div>
            )}

            {isSeller && (
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" asChild>
                  <Link href={`/dashboard/listings/${id}/edit`}>Edit Listing</Link>
                </Button>
              </div>
            )}

            {/* Escrow notice */}
            {isActive && (
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 text-sm">
                <div className="flex items-start gap-2">
                  <Shield className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-emerald-500 mb-0.5">Escrow Protected</p>
                    <p className="text-muted-foreground text-xs">
                      Your payment is held safely in escrow until you confirm receipt. Never pay the seller directly.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Stats */}
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Eye className="h-3.5 w-3.5" />
                {l.view_count} views
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                Listed {timeAgo(l.created_at)}
              </span>
            </div>
          </div>
        </div>

        {/* Description */}
        {l.description && (
          <div className="mt-8 rounded-xl border border-border bg-card p-6">
            <h2 className="font-semibold text-foreground mb-3">Description</h2>
            <p className="text-sm text-muted-foreground whitespace-pre-line">{l.description}</p>
          </div>
        )}

        {/* Seller profile */}
        {l.seller && (
          <div className="mt-8 rounded-xl border border-border bg-card p-6">
            <h2 className="font-semibold text-foreground mb-4">Seller</h2>
            <div className="flex items-start gap-4">
              <div className="h-14 w-14 rounded-full bg-primary/20 flex items-center justify-center shrink-0 overflow-hidden">
                {l.seller.avatar_url ? (
                  <Image
                    src={l.seller.avatar_url}
                    alt={l.seller.display_name}
                    width={56}
                    height={56}
                    className="object-cover"
                  />
                ) : (
                  <span className="font-bold text-primary text-lg">
                    {l.seller.display_name[0]}
                  </span>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <Link
                    href={`/profile/${l.seller.username}`}
                    className="font-semibold text-foreground hover:text-primary transition-colors"
                  >
                    {l.seller.display_name}
                  </Link>
                  {l.seller.is_verified_seller && (
                    <Badge variant="verified" className="gap-1 text-xs">
                      <Shield className="h-3 w-3" />
                      Verified
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">@{l.seller.username}</p>

                <div className="flex items-center gap-4 mt-2 text-sm">
                  {l.seller.rating_count > 0 && (
                    <span className="flex items-center gap-1 text-amber-500">
                      <Star className="h-4 w-4 fill-current" />
                      <span className="font-semibold">{l.seller.rating_avg.toFixed(1)}</span>
                      <span className="text-muted-foreground">({l.seller.rating_count} reviews)</span>
                    </span>
                  )}
                  <span className="text-muted-foreground">
                    {l.seller.total_sales} sales
                  </span>
                  <span className="text-muted-foreground">
                    Member since {formatDate(l.seller.member_since)}
                  </span>
                </div>
              </div>

              <Button variant="outline" size="sm" asChild>
                <Link href={`/profile/${l.seller.username}`}>View Profile</Link>
              </Button>
            </div>

            {/* Recent reviews */}
            {reviews && reviews.length > 0 && (
              <div className="mt-6 space-y-3 border-t border-border pt-4">
                <h3 className="text-sm font-semibold text-foreground">Recent Reviews</h3>
                {reviews.map((review) => (
                  <div key={review.id} className="flex items-start gap-3">
                    <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center text-xs font-bold shrink-0">
                      {(review as any).reviewer?.display_name?.[0] ?? "?"}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium">
                          {(review as any).reviewer?.username}
                        </span>
                        <div className="flex">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3 w-3 ${
                                i < review.rating
                                  ? "text-amber-500 fill-amber-500"
                                  : "text-muted-foreground"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {timeAgo(review.created_at)}
                        </span>
                      </div>
                      {review.comment && (
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                          {review.comment}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
                <Button variant="ghost" size="sm" asChild className="text-xs">
                  <Link href={`/profile/${l.seller?.username}#reviews`}>
                    View all reviews
                  </Link>
                </Button>
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
