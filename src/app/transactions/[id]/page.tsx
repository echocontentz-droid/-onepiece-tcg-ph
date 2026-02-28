import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/marketplace/Navbar";
import { Footer } from "@/components/marketplace/Footer";
import { Badge } from "@/components/ui/badge";
import { formatPHP, formatDateTime, timeAgo } from "@/lib/utils";
import { TRANSACTION_STATUS_DISPLAY, PAYMENT_METHODS, SHIPPING_METHODS } from "@/lib/constants";
import { Shield, Package, Truck, CheckCircle, AlertTriangle, Clock } from "lucide-react";
import type { Transaction } from "@/types";
import { EscrowActionPanel } from "./EscrowActionPanel";
import Image from "next/image";
import Link from "next/link";

export const metadata = { title: "Transaction Details | The Grandline Marketplace" };

export default async function TransactionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/login?redirect=/transactions/${id}`);

  const { data: transaction } = await supabase
    .from("transactions")
    .select(`
      *,
      listing:listings(*,
        images:listing_images(*)
      ),
      buyer:profiles!buyer_id(id, username, display_name, avatar_url, gcash_number, maya_number),
      seller:profiles!seller_id(id, username, display_name, avatar_url, gcash_number, maya_number),
      escrow_record:escrow_records(*),
      shipment:shipment_details(*)
    `)
    .eq("id", id)
    .single();

  if (!transaction) notFound();

  const t = transaction as unknown as Transaction;
  const isBuyer = user.id === t.buyer_id;
  const isSeller = user.id === t.seller_id;
  const isParty = isBuyer || isSeller;

  if (!isParty) {
    // Check if admin
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    if (profile?.role !== "admin") redirect("/dashboard");
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();

  const statusInfo = TRANSACTION_STATUS_DISPLAY[t.status];
  const primaryImage = t.listing?.images?.find((i: any) => i.is_primary) ?? t.listing?.images?.[0];

  const steps = [
    { key: "pending_payment", label: "Order Placed", icon: Clock },
    { key: "in_escrow", label: "Payment Verified", icon: Shield },
    { key: "shipped", label: "Shipped", icon: Truck },
    { key: "completed", label: "Completed", icon: CheckCircle },
  ];

  const stepOrder = ["pending_payment", "payment_submitted", "payment_verified", "in_escrow", "shipped", "delivered", "completed"];
  const currentStep = stepOrder.indexOf(t.status);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar user={profile} />

      <main className="flex-1 mx-auto max-w-3xl w-full px-4 sm:px-6 py-8">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-xl font-bold text-foreground">Transaction Details</h1>
            <span className={`status-${t.status} px-3 py-1 rounded-full text-xs font-semibold`}>
              {statusInfo?.label ?? t.status}
            </span>
          </div>
          <p className="text-xs text-muted-foreground font-mono">ID: {t.id}</p>
          <p className="text-xs text-muted-foreground">Created {timeAgo(t.created_at)}</p>
        </div>

        {/* Progress tracker */}
        {!["disputed", "refunded", "cancelled"].includes(t.status) && (
          <div className="rounded-2xl border border-border bg-card p-4 mb-6">
            <div className="flex items-center justify-between relative">
              <div className="absolute left-0 right-0 top-4 h-0.5 bg-border mx-8" />
              {steps.map(({ key, label, icon: Icon }, i) => {
                const stepIdx = stepOrder.indexOf(key);
                const done = currentStep >= stepIdx;
                return (
                  <div key={key} className="flex flex-col items-center gap-2 relative z-10">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center border-2 transition-all ${
                      done
                        ? "bg-primary border-primary text-white"
                        : "bg-background border-border text-muted-foreground"
                    }`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className={`text-[10px] font-medium text-center max-w-[60px] leading-tight ${
                      done ? "text-foreground" : "text-muted-foreground"
                    }`}>
                      {label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Dispute / cancelled notice */}
        {t.status === "disputed" && (
          <div className="flex items-start gap-3 p-4 mb-6 rounded-xl bg-destructive/10 border border-destructive/30">
            <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-destructive text-sm">Dispute Filed</p>
              <p className="text-xs text-muted-foreground mt-0.5">{t.dispute_reason}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4">
          {/* Card info */}
          <div className="rounded-2xl border border-border bg-card p-4 flex gap-4">
            <div className="h-20 w-16 rounded-lg overflow-hidden bg-muted shrink-0">
              {primaryImage && (
                <Image
                  src={(primaryImage as any).url}
                  alt={t.listing?.card_name ?? "Card"}
                  width={64}
                  height={80}
                  className="object-cover h-full w-full"
                />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <Link
                href={`/listings/${t.listing_id}`}
                className="font-semibold text-foreground hover:text-primary line-clamp-1"
              >
                {t.listing?.card_name}
              </Link>
              <p className="text-sm text-muted-foreground line-clamp-1">{t.listing?.title}</p>
              <div className="flex items-center gap-3 mt-2 text-sm">
                <span className="font-bold text-foreground">{formatPHP(t.item_price)}</span>
                <span className="text-muted-foreground font-mono text-xs">{t.listing?.card_set}</span>
              </div>
            </div>
          </div>

          {/* Payment breakdown */}
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <div className="px-4 py-3 border-b border-border">
              <h2 className="font-semibold text-sm text-foreground">Payment Breakdown</h2>
            </div>
            <div className="divide-y divide-border">
              {[
                { label: "Card Price", value: formatPHP(t.item_price) },
                { label: "Shipping", value: t.shipping_fee > 0 ? formatPHP(t.shipping_fee) : "Free" },
                { label: "Platform Fee (3%)", value: formatPHP(t.platform_fee) },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between px-4 py-2.5 text-sm">
                  <span className="text-muted-foreground">{label}</span>
                  <span>{value}</span>
                </div>
              ))}
              <div className="flex justify-between px-4 py-3 font-bold">
                <span>Total Paid by Buyer</span>
                <span className="text-primary">{formatPHP(t.total_amount)}</span>
              </div>
              {isSeller && (
                <div className="flex justify-between px-4 py-2.5 text-sm bg-emerald-500/5">
                  <span className="text-muted-foreground">Your Payout</span>
                  <span className="font-semibold text-emerald-500">{formatPHP(t.seller_payout)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Payment details */}
          <div className="rounded-2xl border border-border bg-card p-4">
            <h2 className="font-semibold text-sm text-foreground mb-3">Payment & Shipping</h2>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-muted-foreground text-xs mb-0.5">Payment Method</p>
                <p className="font-medium">
                  {PAYMENT_METHODS[t.payment_method]?.label ?? t.payment_method}
                </p>
              </div>
              {t.shipping_method && (
                <div>
                  <p className="text-muted-foreground text-xs mb-0.5">Shipping</p>
                  <p className="font-medium">
                    {SHIPPING_METHODS[t.shipping_method]?.label ?? t.shipping_method}
                  </p>
                </div>
              )}
              {t.meetup_location && (
                <div className="col-span-2">
                  <p className="text-muted-foreground text-xs mb-0.5">Meetup Location</p>
                  <p className="font-medium">{t.meetup_location}</p>
                </div>
              )}
            </div>
          </div>

          {/* Parties */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { role: "Buyer", person: t.buyer, isCurrentUser: isBuyer },
              { role: "Seller", person: t.seller, isCurrentUser: isSeller },
            ].map(({ role, person, isCurrentUser }) => (
              <div key={role} className="rounded-xl border border-border bg-card p-3">
                <p className="text-xs text-muted-foreground mb-2">{role}</p>
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                    {person?.display_name?.[0] ?? "?"}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{person?.display_name}</p>
                    <p className="text-xs text-muted-foreground">@{person?.username}</p>
                  </div>
                </div>
                {isCurrentUser && <Badge variant="outline" className="mt-2 text-[10px]">You</Badge>}
              </div>
            ))}
          </div>

          {/* Action panel — the main escrow flow */}
          <EscrowActionPanel
            transaction={t}
            isBuyer={isBuyer}
            isSeller={isSeller}
          />

          {/* Shipment tracking */}
          {t.shipment && (
            <div className="rounded-2xl border border-border bg-card p-4">
              <h2 className="font-semibold text-sm text-foreground mb-3 flex items-center gap-2">
                <Truck className="h-4 w-4" />
                Shipment Info
              </h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Courier</span>
                  <span>{SHIPPING_METHODS[(t.shipment as any).shipping_method]?.label}</span>
                </div>
                {(t.shipment as any).tracking_number && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tracking #</span>
                    <span className="font-mono font-medium">{(t.shipment as any).tracking_number}</span>
                  </div>
                )}
                {(t.shipment as any).shipped_at && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipped</span>
                    <span>{formatDateTime((t.shipment as any).shipped_at)}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
