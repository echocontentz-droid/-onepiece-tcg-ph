import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import { PLATFORM_FEE_PERCENT } from "@/lib/constants";

const createTransactionSchema = z.object({
  listing_id: z.string().uuid(),
  payment_method: z.enum(["gcash", "maya", "bank_transfer", "cod_meetup"]),
  shipping_method: z.enum(["lbc", "jt_express", "flash_express", "grab_padala", "lalamove", "meetup"]).optional(),
  meetup_location: z.string().max(300).optional(),
});

// GET /api/transactions — get user's transactions
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const as = searchParams.get("as"); // 'buyer' | 'seller'
  const status = searchParams.get("status");
  const page = parseInt(searchParams.get("page") ?? "1");
  const perPage = 20;
  const from = (page - 1) * perPage;

  let query = supabase
    .from("transactions")
    .select(`
      *,
      listing:listings(id, card_name, card_set, price, images:listing_images(*)),
      buyer:profiles!buyer_id(id, username, display_name, avatar_url),
      seller:profiles!seller_id(id, username, display_name, avatar_url)
    `, { count: "exact" })
    .range(from, from + perPage - 1)
    .order("updated_at", { ascending: false });

  if (as === "buyer") {
    query = query.eq("buyer_id", user.id);
  } else if (as === "seller") {
    query = query.eq("seller_id", user.id);
  } else {
    query = query.or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`);
  }

  if (status) query = query.eq("status", status);

  const { data, count, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ data, total: count, page, per_page: perPage });
}

// POST /api/transactions — create transaction (initiate purchase)
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Check banned
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_banned")
    .eq("id", user.id)
    .single();

  if (profile?.is_banned) {
    return NextResponse.json({ error: "Account suspended" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = createTransactionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
  }

  const { listing_id, payment_method, shipping_method, meetup_location } = parsed.data;

  // Fetch listing
  const { data: listing } = await supabase
    .from("listings")
    .select("*")
    .eq("id", listing_id)
    .eq("status", "active")
    .single();

  if (!listing) {
    return NextResponse.json({ error: "Listing not found or no longer active" }, { status: 404 });
  }

  // Cannot buy own listing
  if (listing.seller_id === user.id) {
    return NextResponse.json({ error: "You cannot buy your own listing" }, { status: 400 });
  }

  // Validate shipping method
  if (shipping_method && shipping_method !== "meetup") {
    if (!listing.shipping_options.includes(shipping_method)) {
      return NextResponse.json({ error: "Invalid shipping method for this listing" }, { status: 400 });
    }
  }

  if (shipping_method === "meetup" && !listing.allows_meetup) {
    return NextResponse.json({ error: "Seller does not allow meetup" }, { status: 400 });
  }

  // Check no existing active transaction for this listing
  const { data: existingTxn } = await supabase
    .from("transactions")
    .select("id")
    .eq("listing_id", listing_id)
    .not("status", "in", '("cancelled","refunded")')
    .single();

  if (existingTxn) {
    return NextResponse.json(
      { error: "This listing already has an active transaction" },
      { status: 409 }
    );
  }

  // Calculate amounts
  const shippingFee = shipping_method === "meetup" ? 0 : listing.shipping_fee;
  const platformFee = Math.ceil(listing.price * PLATFORM_FEE_PERCENT * 100) / 100;
  const totalAmount = listing.price + shippingFee;
  const sellerPayout = listing.price - platformFee + shippingFee;

  // Create transaction
  const { data: transaction, error: txnError } = await supabase
    .from("transactions")
    .insert({
      listing_id,
      buyer_id: user.id,
      seller_id: listing.seller_id,
      item_price: listing.price,
      shipping_fee: shippingFee,
      platform_fee: platformFee,
      total_amount: totalAmount,
      seller_payout: sellerPayout,
      payment_method,
      shipping_method: shipping_method ?? null,
      meetup_location: meetup_location ?? null,
      status: "pending_payment",
    })
    .select("id")
    .single();

  if (txnError) {
    return NextResponse.json({ error: txnError.message }, { status: 500 });
  }

  // Create empty escrow record
  await supabase.from("escrow_records").insert({ transaction_id: transaction.id });

  // Reserve listing
  await supabase
    .from("listings")
    .update({ status: "reserved" })
    .eq("id", listing_id);

  // Notify seller
  await supabase.from("notifications").insert({
    user_id: listing.seller_id,
    type: "new_offer",
    title: "New Purchase Order",
    message: `Someone wants to buy your ${listing.card_name}. Check your transactions.`,
    link: `/transactions/${transaction.id}`,
  });

  return NextResponse.json({ id: transaction.id }, { status: 201 });
}
