import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import { addDays } from "date-fns";
import { AUTO_CONFIRM_DAYS } from "@/lib/constants";

const actionSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("cancel"),
    cancellation_reason: z.string().min(5).max(300),
  }),
  z.object({
    action: z.literal("ship"),
    shipping_method: z.string(),
    tracking_number: z.string().min(1),
    courier_receipt_url: z.string().url().optional(),
  }),
  z.object({
    action: z.literal("confirm_receipt"),
  }),
  z.object({
    action: z.literal("dispute"),
    dispute_reason: z.string().min(10).max(1000),
  }),
]);

// GET /api/transactions/[id]
export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: txn } = await supabase
    .from("transactions")
    .select(`
      *,
      listing:listings(*),
      buyer:profiles!buyer_id(*),
      seller:profiles!seller_id(*),
      escrow_record:escrow_records(*),
      shipment:shipment_details(*)
    `)
    .eq("id", id)
    .single();

  if (!txn) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Only parties or admin can view
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  const isParty = txn.buyer_id === user.id || txn.seller_id === user.id;
  if (!isParty && profile?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json(txn);
}

// PATCH /api/transactions/[id] — state transitions
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: txn } = await supabase
    .from("transactions")
    .select("*, listing:listings(seller_id, card_name)")
    .eq("id", id)
    .single();

  if (!txn) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const isBuyer = txn.buyer_id === user.id;
  const isSeller = txn.seller_id === user.id;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  const isAdmin = profile?.role === "admin";

  if (!isBuyer && !isSeller && !isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = actionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid action", details: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;

  switch (data.action) {
    // ---------------------------------------------------------------
    case "cancel": {
      if (!isBuyer && !isSeller && !isAdmin) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      const cancellableStatuses = ["pending_payment", "payment_submitted"];
      if (!cancellableStatuses.includes(txn.status)) {
        return NextResponse.json(
          { error: "Transaction cannot be cancelled at this stage" },
          { status: 400 }
        );
      }

      await supabase.from("transactions").update({
        status: "cancelled",
        cancelled_by: user.id,
        cancellation_reason: data.cancellation_reason,
        cancelled_at: new Date().toISOString(),
      }).eq("id", id);

      // Reactivate listing
      await supabase.from("listings")
        .update({ status: "active" })
        .eq("id", txn.listing_id);

      // Notify the other party
      const notifyUserId = isBuyer ? txn.seller_id : txn.buyer_id;
      await supabase.from("notifications").insert({
        user_id: notifyUserId,
        type: "system_message",
        title: "Transaction Cancelled",
        message: `Transaction for ${(txn.listing as any)?.card_name} was cancelled.`,
        link: `/transactions/${id}`,
      });

      return NextResponse.json({ success: true });
    }

    // ---------------------------------------------------------------
    case "ship": {
      if (!isSeller) {
        return NextResponse.json({ error: "Only the seller can mark as shipped" }, { status: 403 });
      }
      if (!["in_escrow", "payment_verified"].includes(txn.status)) {
        return NextResponse.json(
          { error: "Payment must be verified before shipping" },
          { status: 400 }
        );
      }

      const autoConfirmAt = addDays(new Date(), AUTO_CONFIRM_DAYS).toISOString();

      await Promise.all([
        supabase.from("transactions").update({
          status: "shipped",
          auto_confirm_at: autoConfirmAt,
        }).eq("id", id),
        supabase.from("shipment_details").insert({
          transaction_id: id,
          shipping_method: data.shipping_method,
          tracking_number: data.tracking_number,
          courier_receipt_url: data.courier_receipt_url ?? null,
          shipped_at: new Date().toISOString(),
        }),
      ]);

      // Notify buyer
      await supabase.from("notifications").insert({
        user_id: txn.buyer_id,
        type: "item_shipped",
        title: "Your order has been shipped!",
        message: `Tracking: ${data.tracking_number} via ${data.shipping_method}`,
        link: `/transactions/${id}`,
      });

      return NextResponse.json({ success: true });
    }

    // ---------------------------------------------------------------
    case "confirm_receipt": {
      if (!isBuyer) {
        return NextResponse.json({ error: "Only the buyer can confirm receipt" }, { status: 403 });
      }
      if (!["shipped", "delivered"].includes(txn.status)) {
        return NextResponse.json({ error: "Item must be shipped before confirming" }, { status: 400 });
      }

      await supabase.from("transactions").update({ status: "completed" }).eq("id", id);

      // Notify seller — funds released
      await supabase.from("notifications").insert({
        user_id: txn.seller_id,
        type: "transaction_complete",
        title: "Payment Released! 🎉",
        message: `Buyer confirmed receipt of ${(txn.listing as any)?.card_name}. Funds will be released to your account.`,
        link: `/transactions/${id}`,
      });

      // Notify buyer to review
      await supabase.from("notifications").insert({
        user_id: txn.buyer_id,
        type: "transaction_complete",
        title: "Transaction Complete!",
        message: "Please leave a review for the seller.",
        link: `/reviews/create?transaction=${id}`,
      });

      return NextResponse.json({ success: true });
    }

    // ---------------------------------------------------------------
    case "dispute": {
      if (!isBuyer && !isSeller) {
        return NextResponse.json({ error: "Only transaction parties can file a dispute" }, { status: 403 });
      }
      const disputeAllowed = ["shipped", "delivered", "payment_verified", "in_escrow"];
      if (!disputeAllowed.includes(txn.status)) {
        return NextResponse.json(
          { error: "Disputes can only be filed after payment is verified" },
          { status: 400 }
        );
      }

      await supabase.from("transactions").update({
        status: "disputed",
        disputed_by: user.id,
        dispute_reason: data.dispute_reason,
        disputed_at: new Date().toISOString(),
      }).eq("id", id);

      // Notify the other party
      const notifyUserId = isBuyer ? txn.seller_id : txn.buyer_id;
      await supabase.from("notifications").insert({
        user_id: notifyUserId,
        type: "system_message",
        title: "Dispute Filed",
        message: `A dispute has been filed for your transaction. Our admin team will review.`,
        link: `/transactions/${id}`,
      });

      // Also create a report automatically
      await supabase.from("reports").insert({
        reporter_id: user.id,
        reported_user_id: notifyUserId,
        reported_transaction_id: id,
        reason: "other",
        description: `Dispute: ${data.dispute_reason}`,
        status: "reviewing",
      });

      return NextResponse.json({ success: true });
    }

    default:
      return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  }
}
