import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const submitPaymentSchema = z.object({
  transaction_id: z.string().uuid(),
  payment_proof_url: z.string().url(),
  payment_reference: z.string().min(1).max(100),
});

// POST /api/escrow/initiate — buyer submits payment proof
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

  const parsed = submitPaymentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed" }, { status: 400 });
  }

  const { transaction_id, payment_proof_url, payment_reference } = parsed.data;

  // Verify transaction belongs to buyer
  const { data: txn } = await supabase
    .from("transactions")
    .select("buyer_id, seller_id, status, listing_id")
    .eq("id", transaction_id)
    .single();

  if (!txn) return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
  if (txn.buyer_id !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (txn.status !== "pending_payment") {
    return NextResponse.json({ error: "Transaction is not awaiting payment" }, { status: 400 });
  }

  // Update escrow record
  await supabase
    .from("escrow_records")
    .update({
      payment_proof_url,
      payment_reference,
      payment_submitted_at: new Date().toISOString(),
    })
    .eq("transaction_id", transaction_id);

  // Update transaction status
  await supabase
    .from("transactions")
    .update({ status: "payment_submitted" })
    .eq("id", transaction_id);

  // Notify admin (via a system notification to all admins)
  // In production, this would send an email/Slack alert
  const { data: admins } = await supabase
    .from("profiles")
    .select("id")
    .eq("role", "admin");

  if (admins?.length) {
    await supabase.from("notifications").insert(
      admins.map((admin) => ({
        user_id: admin.id,
        type: "payment_received",
        title: "New Payment to Verify",
        message: `Transaction ${transaction_id.slice(0, 8)} — buyer submitted payment proof. Please verify.`,
        link: `/admin/transactions/${transaction_id}`,
        metadata: { transaction_id, payment_reference },
      }))
    );
  }

  // Also notify seller
  await supabase.from("notifications").insert({
    user_id: txn.seller_id,
    type: "payment_received",
    title: "Buyer Submitted Payment",
    message: "Buyer has submitted payment proof. Awaiting admin verification.",
    link: `/transactions/${transaction_id}`,
  });

  return NextResponse.json({ success: true });
}
