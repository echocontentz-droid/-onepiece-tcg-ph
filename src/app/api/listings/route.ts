import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createListingSchema } from "@/lib/validations/listing";
import { z } from "zod";

// GET /api/listings — list listings with filters
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);

  const page = parseInt(searchParams.get("page") ?? "1");
  const perPage = Math.min(parseInt(searchParams.get("per_page") ?? "24"), 100);
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  let query = supabase
    .from("listings")
    .select(`
      *,
      seller:profiles!seller_id(
        id, username, display_name, avatar_url,
        is_verified_seller, rating_avg, rating_count
      ),
      images:listing_images(*)
    `, { count: "exact" })
    .eq("status", "active")
    .range(from, to);

  const search = searchParams.get("search");
  if (search) {
    query = query.textSearch("search_vector", search, { type: "websearch" });
  }

  const filters: Record<string, string | null> = {
    card_set: searchParams.get("card_set"),
    rarity: searchParams.get("rarity"),
    condition: searchParams.get("condition"),
    location_province: searchParams.get("province"),
  };

  for (const [column, value] of Object.entries(filters)) {
    if (value) query = query.eq(column, value);
  }

  const minPrice = searchParams.get("min_price");
  const maxPrice = searchParams.get("max_price");
  if (minPrice) query = query.gte("price", parseFloat(minPrice));
  if (maxPrice) query = query.lte("price", parseFloat(maxPrice));
  if (searchParams.get("allows_meetup") === "true") query = query.eq("allows_meetup", true);
  if (searchParams.get("is_negotiable") === "true") query = query.eq("is_negotiable", true);
  if (searchParams.get("is_foil") === "true") query = query.eq("is_foil", true);

  const sortBy = searchParams.get("sort_by") ?? "newest";
  if (sortBy === "price_asc") query = query.order("price", { ascending: true });
  else if (sortBy === "price_desc") query = query.order("price", { ascending: false });
  else if (sortBy === "popular") query = query.order("view_count", { ascending: false });
  else query = query.order("created_at", { ascending: false });

  const { data, count, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    data,
    total: count ?? 0,
    page,
    per_page: perPage,
    total_pages: Math.ceil((count ?? 0) / perPage),
  });
}

// POST /api/listings — create a new listing
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check if banned
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_banned")
    .eq("id", user.id)
    .single();

  if (profile?.is_banned) {
    return NextResponse.json({ error: "Account suspended" }, { status: 403 });
  }

  // Rate limiting: max 10 active listings per 24h
  const oneDayAgo = new Date(Date.now() - 86400000).toISOString();
  const { count: recentCount } = await supabase
    .from("listings")
    .select("id", { count: "exact", head: true })
    .eq("seller_id", user.id)
    .gte("created_at", oneDayAgo);

  if ((recentCount ?? 0) >= 30) {
    return NextResponse.json(
      { error: "Listing limit reached. Maximum 30 listings per 24 hours." },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = createListingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const data = parsed.data;

  // Create listing
  const { data: listing, error: listingError } = await supabase
    .from("listings")
    .insert({
      seller_id: user.id,
      card_name: data.card_name,
      card_number: data.card_number ?? null,
      card_set: data.card_set,
      rarity: data.rarity,
      condition: data.condition,
      language: data.language ?? "English",
      is_foil: data.is_foil ?? false,
      quantity: data.quantity ?? 1,
      title: data.title,
      description: data.description ?? null,
      price: data.price,
      is_negotiable: data.is_negotiable ?? false,
      location_province: data.location_province,
      location_city: data.location_city,
      allows_meetup: data.allows_meetup ?? false,
      meetup_details: data.meetup_details ?? null,
      shipping_options: data.shipping_options,
      shipping_fee: data.shipping_fee ?? 0,
      free_shipping: data.free_shipping ?? false,
    })
    .select("id")
    .single();

  if (listingError) {
    return NextResponse.json({ error: listingError.message }, { status: 500 });
  }

  // Create listing images
  if (data.image_paths.length > 0) {
    const images = data.image_paths.map((path, i) => ({
      listing_id: listing.id,
      url: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/listing-images/${path}`,
      storage_path: path,
      is_primary: i === 0,
      display_order: i,
    }));

    const { error: imgError } = await supabase.from("listing_images").insert(images);
    if (imgError) {
      console.error("Failed to save images:", imgError.message);
    }
  }

  return NextResponse.json({ id: listing.id }, { status: 201 });
}
