import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/marketplace/Navbar";
import { Footer } from "@/components/marketplace/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ListingCard } from "@/components/listings/ListingCard";
import {
  Shield, Star, MapPin, Package, ShoppingBag,
  Flag, Calendar
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { formatDate, timeAgo, ratingLabel } from "@/lib/utils";
import type { Listing } from "@/types";

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  return { title: `@${username} | OP TCG PH` };
}

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const supabase = await createClient();

  const { data: profileUser } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username.toLowerCase())
    .single();

  if (!profileUser || profileUser.is_banned) notFound();

  const { data: { user } } = await supabase.auth.getUser();
  let viewerProfile = null;
  if (user) {
    const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
    viewerProfile = data;
  }

  // Fetch listings and reviews in parallel
  const [
    { data: listings },
    { data: reviews, count: reviewCount },
  ] = await Promise.all([
    supabase
      .from("listings")
      .select("*, seller:profiles!seller_id(*), images:listing_images(*)")
      .eq("seller_id", profileUser.id)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(8),
    supabase
      .from("reviews")
      .select(`
        *,
        reviewer:profiles!reviewer_id(username, display_name, avatar_url)
      `, { count: "exact" })
      .eq("reviewee_id", profileUser.id)
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const isSelf = user?.id === profileUser.id;

  const ratingDistribution = [5, 4, 3, 2, 1].map((star) => {
    const count = reviews?.filter((r) => r.rating === star).length ?? 0;
    const pct = reviewCount ? Math.round((count / reviewCount) * 100) : 0;
    return { star, count, pct };
  });

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar user={viewerProfile} />

      <main className="flex-1 mx-auto max-w-5xl w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile header */}
        <div className="rounded-2xl border border-border bg-card p-6 mb-6">
          <div className="flex items-start gap-5 flex-col sm:flex-row">
            {/* Avatar */}
            <div className="h-20 w-20 rounded-2xl overflow-hidden bg-primary/20 flex items-center justify-center shrink-0">
              {profileUser.avatar_url ? (
                <Image
                  src={profileUser.avatar_url}
                  alt={profileUser.display_name}
                  width={80}
                  height={80}
                  className="object-cover"
                />
              ) : (
                <span className="text-3xl font-bold text-primary">
                  {profileUser.display_name[0]}
                </span>
              )}
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h1 className="text-xl font-bold text-foreground">{profileUser.display_name}</h1>
                {profileUser.is_verified_seller && (
                  <Badge variant="verified" className="gap-1">
                    <Shield className="h-3 w-3" />
                    Verified Seller
                  </Badge>
                )}
                {profileUser.role === "admin" && (
                  <Badge className="bg-primary text-white">Admin</Badge>
                )}
              </div>
              <p className="text-muted-foreground">@{profileUser.username}</p>

              {profileUser.bio && (
                <p className="text-sm text-muted-foreground mt-2 max-w-lg">{profileUser.bio}</p>
              )}

              <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-muted-foreground">
                {(profileUser.province || profileUser.city) && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {[profileUser.city, profileUser.province].filter(Boolean).join(", ")}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Member since {formatDate(profileUser.member_since)}
                </span>
              </div>

              <div className="flex items-center gap-6 mt-4">
                <div className="text-center">
                  <div className="text-xl font-bold text-foreground">{profileUser.total_sales}</div>
                  <div className="text-xs text-muted-foreground">Sales</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-foreground">{profileUser.total_purchases}</div>
                  <div className="text-xs text-muted-foreground">Purchases</div>
                </div>
                {profileUser.rating_count > 0 && (
                  <div className="text-center">
                    <div className="text-xl font-bold text-foreground flex items-center gap-1">
                      <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
                      {profileUser.rating_avg.toFixed(1)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {profileUser.rating_count} reviews · {ratingLabel(profileUser.rating_avg)}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2 shrink-0">
              {isSelf ? (
                <Button variant="outline" size="sm" asChild>
                  <Link href="/settings">Edit Profile</Link>
                </Button>
              ) : (
                <>
                  {!isSelf && user && (
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/report?user=${profileUser.id}`}>
                        <Flag className="h-4 w-4 mr-1" />
                        Report
                      </Link>
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Listings */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-foreground flex items-center gap-2">
              <Package className="h-5 w-5 text-muted-foreground" />
              Active Listings ({listings?.length ?? 0})
            </h2>
          </div>

          {listings?.length ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {listings.map((listing) => (
                <ListingCard key={listing.id} listing={listing as unknown as Listing} showSeller={false} />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground text-sm">
              No active listings
            </div>
          )}
        </div>

        {/* Reviews */}
        <div id="reviews">
          <h2 className="font-semibold text-foreground flex items-center gap-2 mb-4">
            <Star className="h-5 w-5 text-amber-500" />
            Reviews ({reviewCount ?? 0})
          </h2>

          {reviews?.length ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Rating summary */}
              <div className="rounded-2xl border border-border bg-card p-6">
                <div className="text-center mb-4">
                  <div className="text-5xl font-extrabold text-foreground">
                    {profileUser.rating_avg.toFixed(1)}
                  </div>
                  <div className="flex justify-center mt-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${
                          i < Math.round(profileUser.rating_avg)
                            ? "text-amber-500 fill-amber-500"
                            : "text-muted-foreground"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {profileUser.rating_count} reviews
                  </p>
                </div>
                <div className="space-y-1.5">
                  {ratingDistribution.map(({ star, count, pct }) => (
                    <div key={star} className="flex items-center gap-2 text-xs">
                      <span className="w-4 text-right text-muted-foreground">{star}</span>
                      <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                      <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full bg-amber-500 rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="w-6 text-muted-foreground">{count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Review list */}
              <div className="lg:col-span-2 space-y-3">
                {reviews.map((review) => (
                  <div key={review.id} className="rounded-xl border border-border bg-card p-4">
                    <div className="flex items-start gap-3">
                      <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center text-sm font-bold shrink-0">
                        {(review as any).reviewer?.display_name?.[0] ?? "?"}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-sm">
                            @{(review as any).reviewer?.username}
                          </span>
                          <div className="flex">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`h-3.5 w-3.5 ${
                                  i < review.rating
                                    ? "text-amber-500 fill-amber-500"
                                    : "text-muted-foreground"
                                }`}
                              />
                            ))}
                          </div>
                          <Badge variant="outline" className="text-[10px]">
                            {review.is_seller_review ? "as Seller" : "as Buyer"}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {timeAgo(review.created_at)}
                          </span>
                        </div>
                        {review.comment && (
                          <p className="text-sm text-muted-foreground mt-1.5">{review.comment}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground text-sm">
              No reviews yet
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
