import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const verifyPaymentSchema = z.object({
  transaction_id: z.string().uuid(),
  action: z.enum(["approve", "reject"]),
  notes: z.string().max(500).optional(),
});

// POST /api/escrow/verify — admin verifies or rejects payment proof
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Admin only
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden — admin only" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = verifyPaymentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed" }, { status: 400 });
  }

  const { transaction_id, action, notes } = parsed.data;

  const { data: txn } = await supabase
    .from("transactions")
    .select("buyer_id, seller_id, status, listing_id, listing:listings(card_name)")
    .eq("id", transaction_id)
    .single();

  if (!txn) return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
  if (txn.status !== "payment_submitted") {
    return NextResponse.json({ error: "Transaction is not awaiting verification" }, { status: 400 });
  }

  if (action === "approve") {
    // Approve: mark in_escrow
    await supabase.from("transactions")
      .update({ status: "in_escrow" })
      .eq("id", transaction_id);

    await supabase.from("escrow_records")
      .update({
        verified_by: user.id,
        verified_at: new Date().toISOString(),
        verification_notes: notes ?? null,
      })
      .eq("transaction_id", transaction_id);

    // Log admin action
    await supabase.from("admin_actions").insert({
      admin_id: user.id,
      action: "payment_verified",
      target_type: "transaction",
      target_id: transaction_id,
      details: { notes },
    });

    // Notify both parties
    await supabase.from("notifications").insert([
      {
        user_id: txn.buyer_id,
        type: "payment_verified",
        title: "Payment Verified! ✅",
        message: "Your payment has been verified and is now held in escrow. The seller will ship your item soon.",
        link: `/transactions/${transaction_id}`,
      },
      {
        user_id: txn.seller_id,
        type: "payment_verified",
        title: "Payment Verified — Ship Now!",
        message: `Buyer's payment for ${(txn.listing as any)?.card_name} has been verified. Please ship the item.`,
        link: `/transactions/${transaction_id}`,
      },
    ]);

  } else {
    // Reject: revert to pending_payment
    await supabase.from("transactions")
      .update({ status: "pending_payment" })
      .eq("id", transaction_id);

    await supabase.from("escrow_records")
      .update({
        payment_proof_url: null,
        payment_reference: null,
        payment_submitted_at: null,
        verification_notes: `Rejected: ${notes ?? "Payment could not be verified"}`,
      })
      .eq("transaction_id", transaction_id);

    // Notify buyer
    await supabase.from("notifications").insert({
      user_id: txn.buyer_id,
      type: "system_message",
      title: "Payment Proof Rejected",
      message: `Your payment proof could not be verified. Reason: ${notes ?? "Payment not found"}. Please try again.`,
      link: `/transactions/${transaction_id}`,
    });
  }

  return NextResponse.json({ success: true });
}
