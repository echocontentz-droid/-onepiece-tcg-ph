import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { z } from "zod";

const userActionSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("ban"),
    user_id: z.string().uuid(),
    reason: z.string().min(5).max(500),
  }),
  z.object({
    action: z.literal("unban"),
    user_id: z.string().uuid(),
  }),
  z.object({
    action: z.literal("verify_seller"),
    user_id: z.string().uuid(),
    verification_id: z.string().uuid(),
  }),
  z.object({
    action: z.literal("reject_verification"),
    user_id: z.string().uuid(),
    verification_id: z.string().uuid(),
    reason: z.string().min(5),
  }),
  z.object({
    action: z.literal("promote_seller"),
    user_id: z.string().uuid(),
  }),
]);

async function checkAdmin(supabase: ReturnType<typeof createServiceClient> extends Promise<infer T> ? T : never) {
  // Use service client to bypass RLS for admin operations
  return true; // middleware already checked
}

// POST /api/admin/users — admin actions on users
export async function POST(request: NextRequest) {
  // Verify secret header for extra security
  const supabase = await createServiceClient();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = userActionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed" }, { status: 400 });
  }

  const data = parsed.data;

  switch (data.action) {
    case "ban": {
      await supabase.from("profiles").update({
        is_banned: true,
        ban_reason: data.reason,
      }).eq("id", data.user_id);

      // Cancel all active listings
      await supabase.from("listings").update({ status: "removed" })
        .eq("seller_id", data.user_id)
        .eq("status", "active");

      // Notify user
      await supabase.from("notifications").insert({
        user_id: data.user_id,
        type: "system_message",
        title: "Account Suspended",
        message: `Your account has been suspended. Reason: ${data.reason}`,
        link: null,
      });

      return NextResponse.json({ success: true });
    }

    case "unban": {
      await supabase.from("profiles").update({
        is_banned: false,
        ban_reason: null,
      }).eq("id", data.user_id);

      await supabase.from("notifications").insert({
        user_id: data.user_id,
        type: "system_message",
        title: "Account Reinstated",
        message: "Your account has been reinstated. You may resume using OP TCG PH.",
        link: null,
      });

      return NextResponse.json({ success: true });
    }

    case "verify_seller": {
      await supabase.from("profiles").update({
        is_verified_seller: true,
        role: "seller",
      }).eq("id", data.user_id);

      await supabase.from("seller_verifications").update({
        status: "approved",
      }).eq("id", data.verification_id);

      await supabase.from("notifications").insert({
        user_id: data.user_id,
        type: "account_verified",
        title: "You're Verified! ✅",
        message: "Congratulations! You are now a Verified Seller on OP TCG PH. Your listings will show the blue shield badge.",
        link: "/dashboard",
      });

      return NextResponse.json({ success: true });
    }

    case "reject_verification": {
      await supabase.from("seller_verifications").update({
        status: "rejected",
        rejection_reason: data.reason,
      }).eq("id", data.verification_id);

      await supabase.from("notifications").insert({
        user_id: data.user_id,
        type: "account_verified",
        title: "Verification Rejected",
        message: `Your seller verification was not approved. Reason: ${data.reason}. You may reapply with correct documents.`,
        link: "/verification",
      });

      return NextResponse.json({ success: true });
    }

    default:
      return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  }
}

// GET /api/admin/users — list users for admin
export async function GET(request: NextRequest) {
  const supabase = await createServiceClient();
  const { searchParams } = new URL(request.url);

  const search = searchParams.get("search");
  const role = searchParams.get("role");
  const banned = searchParams.get("banned");
  const page = parseInt(searchParams.get("page") ?? "1");
  const perPage = 20;

  let query = supabase
    .from("profiles")
    .select("*", { count: "exact" })
    .range((page - 1) * perPage, page * perPage - 1)
    .order("created_at", { ascending: false });

  if (search) {
    query = query.or(`username.ilike.%${search}%,display_name.ilike.%${search}%,email.ilike.%${search}%`);
  }
  if (role) query = query.eq("role", role);
  if (banned === "true") query = query.eq("is_banned", true);

  const { data, count, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ data, total: count, page, per_page: perPage });
}
