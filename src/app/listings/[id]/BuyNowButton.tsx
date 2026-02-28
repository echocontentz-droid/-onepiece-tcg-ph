"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingCart, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPHP, calculateTotal } from "@/lib/utils";
import { PAYMENT_METHODS, SHIPPING_METHODS } from "@/lib/constants";
import type { Listing, PaymentMethod, ShippingMethod } from "@/types";
import toast from "react-hot-toast";

interface BuyNowButtonProps {
  listing: Listing;
  userId: string;
}

export function BuyNowButton({ listing, userId }: BuyNowButtonProps) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>("gcash");
  const [selectedShipping, setSelectedShipping] = useState<ShippingMethod | null>(
    listing.shipping_options[0] ?? null
  );
  const [meetupLocation, setMeetupLocation] = useState("");
  const [loading, setLoading] = useState(false);

  const effectiveShippingFee = selectedShipping === "meetup" ? 0 : listing.shipping_fee;
  const { platformFee, total, sellerPayout } = calculateTotal(listing.price, effectiveShippingFee);

  const handleBuy = async () => {
    if (!selectedShipping) {
      toast.error("Please select a shipping method");
      return;
    }
    if (selectedShipping === "meetup" && !meetupLocation.trim()) {
      toast.error("Please enter a meetup location");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listing_id: listing.id,
          payment_method: selectedPayment,
          shipping_method: selectedShipping,
          meetup_location: selectedShipping === "meetup" ? meetupLocation : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to create transaction");

      toast.success("Order created! Please complete payment.");
      setModalOpen(false);
      router.push(`/transactions/${data.id}`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button size="lg" className="w-full" onClick={() => setModalOpen(true)}>
        <ShoppingCart className="h-5 w-5" />
        Buy Now — {formatPHP(listing.price)}
      </Button>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="fixed inset-0 bg-black/60" onClick={() => setModalOpen(false)} />
          <div className="relative z-10 w-full max-w-md rounded-t-2xl sm:rounded-2xl bg-background border border-border shadow-xl mx-0 sm:mx-4">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="font-semibold text-foreground">Confirm Purchase</h2>
              <button onClick={() => setModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
              {/* Item summary */}
              <div className="rounded-xl border border-border bg-muted/30 p-4">
                <p className="font-semibold text-foreground text-sm">{listing.card_name}</p>
                <p className="text-xs text-muted-foreground">{listing.title}</p>
              </div>

              {/* Payment Method */}
              <div>
                <h3 className="text-sm font-semibold mb-2">Payment Method</h3>
                <div className="grid grid-cols-2 gap-2">
                  {(["gcash", "maya", "bank_transfer", "cod_meetup"] as PaymentMethod[]).map((method) => {
                    const { label, icon, description } = PAYMENT_METHODS[method];
                    return (
                      <button
                        key={method}
                        onClick={() => setSelectedPayment(method)}
                        className={`flex items-start gap-2 p-3 rounded-xl border text-left text-sm transition-all ${
                          selectedPayment === method
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <span className="text-lg">{icon}</span>
                        <div>
                          <p className="font-medium">{label}</p>
                          <p className="text-xs text-muted-foreground">{description}</p>
                        </div>
                        {selectedPayment === method && (
                          <Check className="h-4 w-4 text-primary ml-auto shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Shipping Method */}
              <div>
                <h3 className="text-sm font-semibold mb-2">Shipping Method</h3>
                <div className="space-y-2">
                  {listing.shipping_options.map((method) => {
                    const { label, icon } = SHIPPING_METHODS[method] ?? { label: method, icon: "📦" };
                    return (
                      <button
                        key={method}
                        onClick={() => setSelectedShipping(method as ShippingMethod)}
                        className={`flex items-center justify-between w-full p-3 rounded-xl border text-sm transition-all ${
                          selectedShipping === method
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <span>{icon} {label}</span>
                        {selectedShipping === method && <Check className="h-4 w-4 text-primary" />}
                      </button>
                    );
                  })}
                  {listing.allows_meetup && !listing.shipping_options.includes("meetup") && (
                    <button
                      onClick={() => setSelectedShipping("meetup")}
                      className={`flex items-center justify-between w-full p-3 rounded-xl border text-sm transition-all ${
                        selectedShipping === "meetup"
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <span>🤝 Meetup</span>
                      {selectedShipping === "meetup" && <Check className="h-4 w-4 text-primary" />}
                    </button>
                  )}
                </div>
              </div>

              {/* Meetup location */}
              {selectedShipping === "meetup" && (
                <div>
                  <h3 className="text-sm font-semibold mb-2">Meetup Details</h3>
                  <input
                    type="text"
                    placeholder="e.g. SM Megamall, Mandaluyong"
                    value={meetupLocation}
                    onChange={(e) => setMeetupLocation(e.target.value)}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  {listing.meetup_details && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Seller suggestion: {listing.meetup_details}
                    </p>
                  )}
                </div>
              )}

              {/* Price breakdown */}
              <div className="rounded-xl border border-border divide-y divide-border">
                <div className="flex justify-between px-4 py-2.5 text-sm">
                  <span className="text-muted-foreground">Card price</span>
                  <span>{formatPHP(listing.price)}</span>
                </div>
                <div className="flex justify-between px-4 py-2.5 text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>{selectedShipping === "meetup" ? "Free" : formatPHP(effectiveShippingFee)}</span>
                </div>
                <div className="flex justify-between px-4 py-2.5 text-sm">
                  <span className="text-muted-foreground">Platform fee (3%)</span>
                  <span>{formatPHP(platformFee)}</span>
                </div>
                <div className="flex justify-between px-4 py-3 text-sm font-bold">
                  <span>Total</span>
                  <span className="text-primary">{formatPHP(total)}</span>
                </div>
              </div>

              <p className="text-xs text-muted-foreground text-center">
                Payment goes to OP TCG PH escrow — released to seller only after you confirm receipt.
              </p>
            </div>

            <div className="p-4 border-t border-border">
              <Button className="w-full" size="lg" loading={loading} onClick={handleBuy}>
                Confirm & Continue to Payment
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
