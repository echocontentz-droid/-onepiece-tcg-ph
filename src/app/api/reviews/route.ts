import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const createReviewSchema = z.object({
  transaction_id: z.string().uuid(),
  reviewee_id: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional(),
  is_seller_review: z.boolean(),
});

// GET /api/reviews?user_id=... — get reviews for a user
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("user_id");
  const page = parseInt(searchParams.get("page") ?? "1");
  const perPage = 10;

  if (!userId) return NextResponse.json({ error: "user_id required" }, { status: 400 });

  const { data, count, error } = await supabase
    .from("reviews")
    .select(`
      *,
      reviewer:profiles!reviewer_id(username, display_name, avatar_url),
      transaction:transactions(listing_id)
    `, { count: "exact" })
    .eq("reviewee_id", userId)
    .order("created_at", { ascending: false })
    .range((page - 1) * perPage, page * perPage - 1);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data, total: count, page, per_page: perPage });
}

// POST /api/reviews — create a review
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = createReviewSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
  }

  const { transaction_id, reviewee_id, rating, comment, is_seller_review } = parsed.data;

  // Verify transaction is completed and user is a party
  const { data: txn } = await supabase
    .from("transactions")
    .select("buyer_id, seller_id, status")
    .eq("id", transaction_id)
    .eq("status", "completed")
    .single();

  if (!txn) {
    return NextResponse.json({ error: "Transaction not found or not completed" }, { status: 404 });
  }

  const isBuyer = txn.buyer_id === user.id;
  const isSeller = txn.seller_id === user.id;

  if (!isBuyer && !isSeller) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Check they haven't already reviewed
  const { data: existingReview } = await supabase
    .from("reviews")
    .select("id")
    .eq("transaction_id", transaction_id)
    .eq("reviewer_id", user.id)
    .single();

  if (existingReview) {
    return NextResponse.json({ error: "You have already reviewed this transaction" }, { status: 409 });
  }

  // Validate reviewee is the other party
  const expectedReviewee = isBuyer ? txn.seller_id : txn.buyer_id;
  if (reviewee_id !== expectedReviewee) {
    return NextResponse.json({ error: "Invalid reviewee" }, { status: 400 });
  }

  const { data: review, error: reviewError } = await supabase
    .from("reviews")
    .insert({
      transaction_id,
      reviewer_id: user.id,
      reviewee_id,
      rating,
      comment: comment ?? null,
      is_seller_review,
    })
    .select()
    .single();

  if (reviewError) return NextResponse.json({ error: reviewError.message }, { status: 500 });

  // Notify reviewee
  await supabase.from("notifications").insert({
    user_id: reviewee_id,
    type: "new_review",
    title: `New ${rating}★ Review`,
    message: comment ? `"${comment.slice(0, 80)}..."` : "You received a new review.",
    link: `/profile/${reviewee_id}#reviews`,
  });

  return NextResponse.json(review, { status: 201 });
}
