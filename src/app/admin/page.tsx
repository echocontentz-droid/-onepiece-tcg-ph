import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/marketplace/Navbar";
import { Footer } from "@/components/marketplace/Footer";
import { formatPHP, formatDate, timeAgo } from "@/lib/utils";
import {
  Users, Package, ShoppingBag, Shield, Flag,
  AlertTriangle, TrendingUp, CheckCircle, XCircle,
  Eye, BarChart3
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { AdminReportsTable } from "./AdminReportsTable";
import { AdminVerificationsTable } from "./AdminVerificationsTable";
import { AdminStatsChart } from "./AdminStatsChart";

export const metadata = { title: "Admin Dashboard | The Grandline Marketplace" };

export default async function AdminDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  if (profile?.role !== "admin") redirect("/");

  // Fetch all admin stats
  const [
    { count: totalUsers },
    { count: totalListings },
    { count: totalTransactions },
    { count: pendingReports },
    { count: pendingVerifications },
    { count: activeDisputes },
    { data: recentTransactions },
    { data: recentReports },
    { data: pendingVerificationsList },
    { data: recentUsers },
  ] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("listings").select("id", { count: "exact", head: true }),
    supabase.from("transactions").select("id", { count: "exact", head: true }),
    supabase.from("reports").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("seller_verifications").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("transactions").select("id", { count: "exact", head: true }).eq("status", "disputed"),
    supabase.from("transactions")
      .select("*, buyer:profiles!buyer_id(username), seller:profiles!seller_id(username), listing:listings(card_name)")
      .order("updated_at", { ascending: false })
      .limit(10),
    supabase.from("reports")
      .select("*, reporter:profiles!reporter_id(username, display_name), reported_user:profiles!reported_user_id(username)")
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(10),
    supabase.from("seller_verifications")
      .select("*, user:profiles!user_id(username, display_name, email, rating_count, total_sales)")
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase.from("profiles")
      .select("id, username, display_name, email, created_at, is_banned, role")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  // Revenue from completed transactions
  const { data: revenueData } = await supabase
    .from("transactions")
    .select("platform_fee")
    .eq("status", "completed");

  const totalRevenue = revenueData?.reduce((sum, t) => sum + t.platform_fee, 0) ?? 0;

  const stats = [
    { label: "Total Users", value: totalUsers?.toLocaleString() ?? "0", icon: Users, color: "blue", trend: "+12%" },
    { label: "Active Listings", value: totalListings?.toLocaleString() ?? "0", icon: Package, color: "purple", trend: "+8%" },
    { label: "Transactions", value: totalTransactions?.toLocaleString() ?? "0", icon: ShoppingBag, color: "emerald", trend: "+24%" },
    { label: "Platform Revenue", value: formatPHP(totalRevenue), icon: TrendingUp, color: "amber", trend: "+18%" },
    { label: "Pending Reports", value: pendingReports ?? 0, icon: Flag, color: "red", urgent: (pendingReports ?? 0) > 0 },
    { label: "Pending Verifications", value: pendingVerifications ?? 0, icon: Shield, color: "blue", urgent: (pendingVerifications ?? 0) > 0 },
    { label: "Active Disputes", value: activeDisputes ?? 0, icon: AlertTriangle, color: "orange", urgent: (activeDisputes ?? 0) > 0 },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar user={profile} />

      <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <BarChart3 className="h-6 w-6 text-primary" />
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              The Grandline Marketplace Control Panel
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/users">Manage Users</Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/transactions">All Transactions</Link>
            </Button>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
          {stats.map(({ label, value, icon: Icon, color, trend, urgent }) => (
            <div
              key={label}
              className={`rounded-xl border ${urgent ? "border-red-500/30 bg-red-500/5" : "border-border bg-card"} p-4`}
            >
              <div className="flex items-center justify-between mb-2">
                <Icon className={`h-5 w-5 text-${color}-500`} />
                {trend && (
                  <span className="text-xs text-emerald-500 font-medium">{trend}</span>
                )}
                {urgent && (
                  <span className="flex h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                )}
              </div>
              <div className="text-2xl font-bold text-foreground">{value}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Pending verifications */}
            {(pendingVerifications ?? 0) > 0 && (
              <div className="rounded-2xl border border-blue-500/30 bg-card overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                  <h2 className="font-semibold flex items-center gap-2">
                    <Shield className="h-4 w-4 text-blue-500" />
                    Pending Seller Verifications
                    <Badge variant="info">{pendingVerifications}</Badge>
                  </h2>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/admin/verifications">View all</Link>
                  </Button>
                </div>
                <AdminVerificationsTable verifications={pendingVerificationsList ?? []} />
              </div>
            )}

            {/* Recent reports */}
            {(pendingReports ?? 0) > 0 && (
              <div className="rounded-2xl border border-red-500/30 bg-card overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                  <h2 className="font-semibold flex items-center gap-2">
                    <Flag className="h-4 w-4 text-red-500" />
                    Pending Reports
                    <Badge variant="destructive">{pendingReports}</Badge>
                  </h2>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/admin/reports">View all</Link>
                  </Button>
                </div>
                <AdminReportsTable reports={recentReports ?? []} />
              </div>
            )}

            {/* Recent transactions */}
            <div className="rounded-2xl border border-border bg-card overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                <h2 className="font-semibold flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                  Recent Transactions
                </h2>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/admin/transactions">View all</Link>
                </Button>
              </div>
              <div className="divide-y divide-border">
                {recentTransactions?.map((txn) => (
                  <div key={txn.id} className="flex items-center gap-3 px-5 py-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {(txn.listing as any)?.card_name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        @{(txn.buyer as any)?.username} → @{(txn.seller as any)?.username}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-semibold">{formatPHP(txn.total_amount)}</p>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full status-${txn.status}`}>
                        {txn.status}
                      </span>
                    </div>
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/admin/transactions/${txn.id}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right sidebar */}
          <div className="space-y-4">
            {/* Quick actions */}
            <div className="rounded-2xl border border-border bg-card p-4">
              <h2 className="font-semibold text-sm mb-3">Quick Actions</h2>
              <div className="space-y-2">
                {[
                  { label: "Verify Payments", href: "/admin/escrow", icon: Shield, badge: pendingReports },
                  { label: "Review Reports", href: "/admin/reports", icon: Flag, badge: pendingReports },
                  { label: "Manage Users", href: "/admin/users", icon: Users },
                  { label: "All Listings", href: "/admin/listings", icon: Package },
                  { label: "Dispute Center", href: "/admin/disputes", icon: AlertTriangle, badge: activeDisputes },
                ].map(({ label, href, icon: Icon, badge }) => (
                  <Link
                    key={href}
                    href={href}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                    {badge ? (
                      <Badge variant="destructive" className="ml-auto text-[10px]">{badge}</Badge>
                    ) : null}
                  </Link>
                ))}
              </div>
            </div>

            {/* Recent new users */}
            <div className="rounded-2xl border border-border bg-card overflow-hidden">
              <div className="px-4 py-3 border-b border-border">
                <h2 className="font-semibold text-sm">New Users</h2>
              </div>
              <div className="divide-y divide-border">
                {recentUsers?.map((u) => (
                  <div key={u.id} className="flex items-center gap-2 px-4 py-2.5">
                    <div className="h-7 w-7 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                      {u.display_name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{u.display_name}</p>
                      <p className="text-[10px] text-muted-foreground">@{u.username}</p>
                    </div>
                    <div className="text-right shrink-0">
                      {u.is_banned && <Badge variant="destructive" className="text-[10px]">Banned</Badge>}
                      {u.role === "admin" && <Badge className="text-[10px]">Admin</Badge>}
                      <p className="text-[10px] text-muted-foreground">{timeAgo(u.created_at)}</p>
                    </div>
                    <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
                      <Link href={`/admin/users/${u.id}`}>
                        <Eye className="h-3.5 w-3.5" />
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
