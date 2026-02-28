import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const updateReportSchema = z.object({
  status: z.enum(["reviewing", "resolved", "dismissed"]),
  resolution: z.string().max(1000).optional(),
});

// PATCH /api/admin/reports/[id]
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = updateReportSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("reports")
    .update({
      status: parsed.data.status,
      resolution: parsed.data.resolution ?? null,
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("reporter_id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Notify reporter of resolution
  if (data) {
    await supabase.from("notifications").insert({
      user_id: data.reporter_id,
      type: "report_update",
      title: parsed.data.status === "resolved" ? "Your Report Was Resolved" : "Your Report Was Reviewed",
      message: parsed.data.resolution
        ? `Resolution: ${parsed.data.resolution}`
        : `Your report has been ${parsed.data.status}.`,
      link: null,
    });
  }

  // Log admin action
  await supabase.from("admin_actions").insert({
    admin_id: user.id,
    action: `report_${parsed.data.status}`,
    target_type: "report",
    target_id: id,
    details: { resolution: parsed.data.resolution },
  });

  return NextResponse.json({ success: true });
}
