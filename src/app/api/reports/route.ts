import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const createReportSchema = z.object({
  reported_user_id: z.string().uuid().optional(),
  reported_listing_id: z.string().uuid().optional(),
  reported_transaction_id: z.string().uuid().optional(),
  reason: z.enum(["scam", "fake_card", "non_delivery", "wrong_item", "harassment", "spam", "counterfeit", "other"]),
  description: z.string().min(20, "Please provide at least 20 characters").max(2000),
  evidence_urls: z.array(z.string().url()).max(5).optional(),
}).refine(
  (data) => data.reported_user_id || data.reported_listing_id || data.reported_transaction_id,
  { message: "Must report at least one entity (user, listing, or transaction)" }
);

// POST /api/reports — file a report
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Rate limit: max 5 reports per 24h
  const oneDayAgo = new Date(Date.now() - 86400000).toISOString();
  const { count } = await supabase
    .from("reports")
    .select("id", { count: "exact", head: true })
    .eq("reporter_id", user.id)
    .gte("created_at", oneDayAgo);

  if ((count ?? 0) >= 5) {
    return NextResponse.json(
      { error: "Report limit reached. Maximum 5 reports per 24 hours." },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = createReportSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
  }

  // Prevent self-reporting
  if (parsed.data.reported_user_id === user.id) {
    return NextResponse.json({ error: "You cannot report yourself" }, { status: 400 });
  }

  const { data: report, error } = await supabase
    .from("reports")
    .insert({
      reporter_id: user.id,
      ...parsed.data,
      status: "pending",
    })
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Alert admins
  const { data: admins } = await supabase
    .from("profiles")
    .select("id")
    .eq("role", "admin");

  if (admins?.length) {
    await supabase.from("notifications").insert(
      admins.map((admin) => ({
        user_id: admin.id,
        type: "report_update",
        title: `New Report: ${parsed.data.reason}`,
        message: parsed.data.description.slice(0, 100),
        link: `/admin/reports/${report.id}`,
      }))
    );
  }

  return NextResponse.json({ id: report.id }, { status: 201 });
}
