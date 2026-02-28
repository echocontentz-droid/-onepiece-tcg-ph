import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/marketplace/Navbar";
import { Footer } from "@/components/marketplace/Footer";
import { SearchFilters } from "@/components/listings/SearchFilters";
import { ListingCard, ListingCardSkeleton } from "@/components/listings/ListingCard";
import { Button } from "@/components/ui/button";
import type { Listing } from "@/types";
import Link from "next/link";
import { Plus, SlidersHorizontal } from "lucide-react";

interface SearchParams {
  search?: string;
  card_set?: string;
  rarity?: string;
  condition?: string;
  min_price?: string;
  max_price?: string;
  province?: string;
  shipping_method?: string;
  allows_meetup?: string;
  is_negotiable?: string;
  is_foil?: string;
  seller_verified?: string;
  sort_by?: string;
  page?: string;
}

async function ListingResults({ searchParams }: { searchParams: SearchParams }) {
  const supabase = await createClient();

  const page = parseInt(searchParams.page ?? "1");
  const perPage = 24;
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  let query = supabase
    .from("listings")
    .select(
      `
      *,
      seller:profiles!seller_id(
        id, username, display_name, avatar_url,
        is_verified_seller, rating_avg, rating_count
      ),
      images:listing_images(*)
      `,
      { count: "exact" }
    )
    .eq("status", "active")
    .range(from, to);

  // Apply filters
  if (searchParams.search) {
    query = query.textSearch("search_vector", searchParams.search, {
      type: "websearch",
      config: "english",
    });
  }
  if (searchParams.card_set) query = query.eq("card_set", searchParams.card_set);
  if (searchParams.rarity) query = query.eq("rarity", searchParams.rarity);
  if (searchParams.condition) query = query.eq("condition", searchParams.condition);
  if (searchParams.min_price) query = query.gte("price", parseFloat(searchParams.min_price));
  if (searchParams.max_price) query = query.lte("price", parseFloat(searchParams.max_price));
  if (searchParams.province) query = query.eq("location_province", searchParams.province);
  if (searchParams.allows_meetup === "true") query = query.eq("allows_meetup", true);
  if (searchParams.is_negotiable === "true") query = query.eq("is_negotiable", true);
  if (searchParams.is_foil === "true") query = query.eq("is_foil", true);
  if (searchParams.seller_verified === "true") {
    query = query.eq("seller.is_verified_seller", true);
  }

  // Sort
  const sortBy = searchParams.sort_by ?? "newest";
  if (sortBy === "price_asc") query = query.order("price", { ascending: true });
  else if (sortBy === "price_desc") query = query.order("price", { ascending: false });
  else if (sortBy === "oldest") query = query.order("created_at", { ascending: true });
  else if (sortBy === "popular") query = query.order("view_count", { ascending: false });
  else query = query.order("created_at", { ascending: false });

  const { data: listings, count } = await query;

  const totalPages = Math.ceil((count ?? 0) / perPage);
  const hasSearch = Object.keys(searchParams).some(
    (k) => k !== "page" && k !== "sort_by"
  );

  if (!listings?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="text-5xl mb-4">🃏</div>
        <h3 className="text-lg font-semibold text-foreground mb-2">No listings found</h3>
        <p className="text-muted-foreground text-sm mb-6 max-w-sm">
          {hasSearch
            ? "Try adjusting your filters or search terms"
            : "Be the first to list a card!"}
        </p>
        <Button asChild>
          <Link href="/listings/create">
            <Plus className="h-4 w-4 mr-2" />
            List a Card
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{count?.toLocaleString()}</span> listings found
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
        {listings.map((listing) => (
          <ListingCard key={listing.id} listing={listing as unknown as Listing} />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-10">
          {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
            const p = i + 1;
            const isActive = p === page;
            const params = new URLSearchParams(searchParams as Record<string, string>);
            params.set("page", String(p));
            return (
              <Link
                key={p}
                href={`/listings?${params.toString()}`}
                className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "border border-border hover:bg-muted text-muted-foreground"
                }`}
              >
                {p}
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}

export default async function ListingsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let profile = null;
  if (user) {
    const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
    profile = data;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar user={profile} />
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {params.search ? `Results for "${params.search}"` : "Browse Cards"}
              </h1>
              {params.card_set && (
                <p className="text-muted-foreground text-sm mt-0.5">Set: {params.card_set}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <SearchFilters className="hidden" />
              <Button asChild size="sm">
                <Link href="/listings/create">
                  <Plus className="h-4 w-4" />
                  Sell
                </Link>
              </Button>
            </div>
          </div>

          <div className="flex gap-6">
            {/* Sidebar filters */}
            <aside className="hidden lg:block w-64 shrink-0">
              <SearchFilters />
            </aside>

            {/* Listings grid */}
            <div className="flex-1 min-w-0">
              {/* Mobile filter button */}
              <div className="flex items-center gap-2 mb-4 lg:hidden">
                <SearchFilters />
              </div>

              <Suspense
                fallback={
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {Array.from({ length: 12 }).map((_, i) => (
                      <ListingCardSkeleton key={i} />
                    ))}
                  </div>
                }
              >
                <ListingResults searchParams={params} />
              </Suspense>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
