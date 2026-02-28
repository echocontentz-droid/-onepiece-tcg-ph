import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/marketplace/Navbar";
import { Footer } from "@/components/marketplace/Footer";
import { formatPHP, formatDate, timeAgo } from "@/lib/utils";
import { TRANSACTION_STATUS_DISPLAY } from "@/lib/constants";
import {
  Package, ShoppingBag, Star, TrendingUp, Shield,
  Plus, ChevronRight, Bell, Clock, CheckCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import Image from "next/image";

export const metadata = { title: "Dashboard | The Grandline Marketplace" };

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/login");

  // Fetch stats in parallel
  const [
    { count: activeListings },
    { count: pendingTransactions },
    { data: recentListings },
    { data: recentTransactions },
    { data: notifications },
  ] = await Promise.all([
    supabase.from("listings").select("id", { count: "exact", head: true }).eq("seller_id", user.id).eq("status", "active"),
    supabase.from("transactions").select("id", { count: "exact", head: true })
      .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
      .not("status", "in", '("completed","cancelled","refunded")'),
    supabase.from("listings")
      .select("*, images:listing_images(*)")
      .eq("seller_id", user.id)
      .order("created_at", { ascending: false })
      .limit(3),
    supabase.from("transactions")
      .select(`
        *,
        listing:listings(card_name, card_set, images:listing_images(*)),
        buyer:profiles!buyer_id(username, display_name),
        seller:profiles!seller_id(username, display_name)
      `)
      .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
      .order("updated_at", { ascending: false })
      .limit(5),
    supabase.from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const stats = [
    {
      label: "Active Listings",
      value: activeListings ?? 0,
      icon: Package,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      href: "/dashboard/listings",
    },
    {
      label: "Total Sales",
      value: profile.total_sales,
      icon: TrendingUp,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
      href: "/transactions",
    },
    {
      label: "Pending Orders",
      value: pendingTransactions ?? 0,
      icon: Clock,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
      href: "/transactions",
    },
    {
      label: "Rating",
      value: profile.rating_count > 0 ? `${profile.rating_avg.toFixed(1)}★` : "—",
      icon: Star,
      color: "text-yellow-500",
      bg: "bg-yellow-500/10",
      href: `/profile/${profile.username}#reviews`,
    },
  ];

  const unreadNotifications = notifications?.filter((n) => !n.is_read) ?? [];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar user={profile} />

      <main className="flex-1 mx-auto max-w-6xl w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Welcome back, {profile.display_name.split(" ")[0]}!
            </h1>
            <p className="text-muted-foreground mt-0.5">
              @{profile.username}
              {profile.is_verified_seller && (
                <span className="ml-2 inline-flex items-center gap-1 text-blue-500 text-sm">
                  <Shield className="h-3.5 w-3.5" /> Verified Seller
                </span>
              )}
            </p>
          </div>
          <Button asChild>
            <Link href="/listings/create">
              <Plus className="h-4 w-4" />
              New Listing
            </Link>
          </Button>
        </div>

        {/* Verification CTA */}
        {!profile.is_verified_seller && (
          <div className="rounded-xl border border-blue-500/30 bg-blue-500/5 p-4 mb-6 flex items-start gap-3">
            <Shield className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-foreground text-sm">Get Verified Seller Badge</p>
              <p className="text-xs text-muted-foreground">
                Verified sellers get more trust, better visibility, and higher conversion rates.
              </p>
            </div>
            <Button size="sm" variant="outline" asChild>
              <Link href="/verification">Apply Now</Link>
            </Button>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map(({ label, value, icon: Icon, color, bg, href }) => (
            <Link key={label} href={href}>
              <div className="rounded-xl border border-border bg-card p-4 hover:shadow-md transition-shadow">
                <div className={`h-8 w-8 rounded-lg ${bg} flex items-center justify-center mb-3`}>
                  <Icon className={`h-5 w-5 ${color}`} />
                </div>
                <div className="text-2xl font-bold text-foreground">{value}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
              </div>
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent listings */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl border border-border bg-card overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                <h2 className="font-semibold text-foreground flex items-center gap-2">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  My Listings
                </h2>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/dashboard/listings" className="flex items-center gap-1">
                    View all <ChevronRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>

              {recentListings?.length ? (
                <div className="divide-y divide-border">
                  {recentListings.map((listing) => {
                    const img = (listing.images as any[])?.find((i) => i.is_primary) ?? listing.images?.[0];
                    return (
                      <div key={listing.id} className="flex items-center gap-3 px-5 py-3">
                        <div className="h-12 w-10 rounded-lg overflow-hidden bg-muted shrink-0">
                          {img && (
                            <Image
                              src={img.url}
                              alt={listing.card_name}
                              width={40}
                              height={48}
                              className="object-cover h-full w-full"
                            />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-foreground truncate">
                            {listing.card_name}
                          </p>
                          <p className="text-xs text-muted-foreground">{listing.card_set}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-semibold text-sm">{formatPHP(listing.price)}</p>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full status-${listing.status}`}>
                            {listing.status}
                          </span>
                        </div>
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/listings/${listing.id}`}>
                            <ChevronRight className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="px-5 py-10 text-center">
                  <Package className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                  <p className="text-sm text-muted-foreground">No listings yet</p>
                  <Button className="mt-3" size="sm" asChild>
                    <Link href="/listings/create">Create your first listing</Link>
                  </Button>
                </div>
              )}
            </div>

            {/* Recent transactions */}
            <div className="rounded-2xl border border-border bg-card overflow-hidden mt-4">
              <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                <h2 className="font-semibold text-foreground flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                  Recent Transactions
                </h2>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/transactions" className="flex items-center gap-1">
                    View all <ChevronRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>

              {recentTransactions?.length ? (
                <div className="divide-y divide-border">
                  {recentTransactions.map((txn) => {
                    const isB = txn.buyer_id === user.id;
                    const statusInfo = TRANSACTION_STATUS_DISPLAY[txn.status];
                    return (
                      <Link key={txn.id} href={`/transactions/${txn.id}`} className="flex items-center gap-3 px-5 py-3 hover:bg-muted/30 transition-colors">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">
                            {(txn.listing as any)?.card_name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {isB ? "Buying from" : "Selling to"}{" "}
                            @{isB ? (txn.seller as any)?.username : (txn.buyer as any)?.username}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-semibold text-sm">{formatPHP(txn.total_amount)}</p>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full status-${txn.status}`}>
                            {statusInfo?.label ?? txn.status}
                          </span>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <div className="px-5 py-8 text-center text-sm text-muted-foreground">
                  No transactions yet
                </div>
              )}
            </div>
          </div>

          {/* Sidebar — Notifications */}
          <div>
            <div className="rounded-2xl border border-border bg-card overflow-hidden">
              <div className="flex items-center justify-between px-4 py-4 border-b border-border">
                <h2 className="font-semibold text-foreground flex items-center gap-2">
                  <Bell className="h-4 w-4 text-muted-foreground" />
                  Notifications
                </h2>
                {unreadNotifications.length > 0 && (
                  <Badge variant="default" className="text-[10px]">
                    {unreadNotifications.length} new
                  </Badge>
                )}
              </div>

              {notifications?.length ? (
                <div className="divide-y divide-border">
                  {notifications.map((notif) => (
                    <div key={notif.id} className={`px-4 py-3 ${!notif.is_read ? "bg-primary/5" : ""}`}>
                      {notif.link ? (
                        <Link href={notif.link} className="block">
                          <p className="text-sm font-medium text-foreground line-clamp-1">{notif.title}</p>
                          <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{notif.message}</p>
                          <p className="text-[10px] text-muted-foreground mt-1">{timeAgo(notif.created_at)}</p>
                        </Link>
                      ) : (
                        <>
                          <p className="text-sm font-medium text-foreground">{notif.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{notif.message}</p>
                          <p className="text-[10px] text-muted-foreground mt-1">{timeAgo(notif.created_at)}</p>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                  <Bell className="h-6 w-6 mx-auto mb-2 opacity-30" />
                  No notifications
                </div>
              )}
            </div>

            {/* Quick links */}
            <div className="rounded-2xl border border-border bg-card p-4 mt-4">
              <h2 className="font-semibold text-sm text-foreground mb-3">Quick Actions</h2>
              <div className="space-y-1.5">
                {[
                  { label: "My Listings", href: "/dashboard/listings", icon: Package },
                  { label: "Purchases", href: "/transactions?as=buyer", icon: ShoppingBag },
                  { label: "Sales", href: "/transactions?as=seller", icon: TrendingUp },
                  { label: "My Reviews", href: `/profile/${profile.username}#reviews`, icon: Star },
                  { label: "Get Verified", href: "/verification", icon: Shield },
                ].map(({ label, href, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                    <ChevronRight className="h-4 w-4 ml-auto" />
                  </Link>
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
