"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Listing, ListingFilters } from "@/types";

interface UseListingsReturn {
  listings: Listing[];
  loading: boolean;
  error: string | null;
  total: number;
  page: number;
  totalPages: number;
  setPage: (page: number) => void;
  refresh: () => void;
}

export function useListings(filters: ListingFilters = {}): UseListingsReturn {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(filters.page ?? 1);
  const [refreshKey, setRefreshKey] = useState(0);

  const perPage = filters.per_page ?? 24;
  const totalPages = Math.ceil(total / perPage);

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.search) params.set("search", filters.search);
    if (filters.card_set) params.set("card_set", filters.card_set);
    if (filters.rarity) params.set("rarity", filters.rarity);
    if (filters.condition) params.set("condition", filters.condition);
    if (filters.min_price) params.set("min_price", String(filters.min_price));
    if (filters.max_price) params.set("max_price", String(filters.max_price));
    if (filters.province) params.set("province", filters.province);
    if (filters.allows_meetup) params.set("allows_meetup", "true");
    if (filters.is_negotiable) params.set("is_negotiable", "true");
    if (filters.is_foil) params.set("is_foil", "true");
    if (filters.sort_by) params.set("sort_by", filters.sort_by);
    params.set("page", String(page));
    params.set("per_page", String(perPage));

    setLoading(true);
    fetch(`/api/listings?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        setListings(data.data ?? []);
        setTotal(data.total ?? 0);
        setError(null);
      })
      .catch(() => setError("Failed to load listings"))
      .finally(() => setLoading(false));
  }, [JSON.stringify(filters), page, refreshKey]);

  return { listings, loading, error, total, page, totalPages, setPage, refresh };
}

// Hook for real-time listing updates
export function useRealtimeListing(listingId: string) {
  const [listing, setListing] = useState<Listing | null>(null);
  const supabase = createClient();

  useEffect(() => {
    // Initial fetch
    supabase
      .from("listings")
      .select("*, seller:profiles!seller_id(*), images:listing_images(*)")
      .eq("id", listingId)
      .single()
      .then(({ data }) => setListing(data as unknown as Listing));

    // Subscribe to changes
    const channel = supabase
      .channel(`listing:${listingId}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "listings", filter: `id=eq.${listingId}` },
        (payload) => setListing((prev) => ({ ...prev, ...payload.new } as Listing))
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [listingId]);

  return listing;
}
