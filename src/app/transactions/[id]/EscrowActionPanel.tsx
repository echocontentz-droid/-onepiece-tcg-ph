"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, AlertTriangle, CheckCircle, Truck, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SHIPPING_METHODS } from "@/lib/constants";
import type { Transaction, ShippingMethod } from "@/types";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";

interface EscrowActionPanelProps {
  transaction: Transaction;
  isBuyer: boolean;
  isSeller: boolean;
}

export function EscrowActionPanel({ transaction: t, isBuyer, isSeller }: EscrowActionPanelProps) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [paymentRef, setPaymentRef] = useState("");
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [trackingNumber, setTrackingNumber] = useState("");
  const [selectedCourier, setSelectedCourier] = useState<ShippingMethod>(
    t.shipping_method ?? "lbc"
  );
  const [disputeReason, setDisputeReason] = useState("");
  const [showDispute, setShowDispute] = useState(false);

  const uploadProof = async (file: File, bucket: string, path: string) => {
    const { error } = await supabase.storage.from(bucket).upload(path, file);
    if (error) throw new Error("Failed to upload file");
    return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
  };

  // BUYER: Submit payment proof
  const handleSubmitPayment = async () => {
    if (!paymentRef.trim()) {
      toast.error("Please enter your GCash/Maya reference number");
      return;
    }
    if (!proofFile) {
      toast.error("Please upload your payment screenshot");
      return;
    }
    setLoading(true);
    try {
      const path = `${t.buyer_id}/${t.id}-proof.${proofFile.name.split(".").pop()}`;
      const proofUrl = await uploadProof(proofFile, "payment-proofs", path);

      const res = await fetch(`/api/escrow/initiate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transaction_id: t.id,
          payment_proof_url: proofUrl,
          payment_reference: paymentRef,
        }),
      });
      if (!res.ok) throw new Error("Failed to submit payment");
      toast.success("Payment proof submitted! Admin will verify shortly.");
      router.refresh();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // SELLER: Submit shipment
  const handleSubmitShipment = async () => {
    if (!trackingNumber.trim()) {
      toast.error("Please enter the tracking number");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/transactions/${t.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "ship",
          shipping_method: selectedCourier,
          tracking_number: trackingNumber,
        }),
      });
      if (!res.ok) throw new Error("Failed to update shipment");
      toast.success("Shipment details submitted!");
      router.refresh();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // BUYER: Confirm receipt
  const handleConfirmReceipt = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/transactions/${t.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "confirm_receipt" }),
      });
      if (!res.ok) throw new Error("Failed to confirm receipt");
      toast.success("Receipt confirmed! Funds released to seller. Please leave a review.");
      router.refresh();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // BUYER/SELLER: File dispute
  const handleFileDispute = async () => {
    if (!disputeReason.trim()) {
      toast.error("Please describe the issue");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/transactions/${t.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "dispute", dispute_reason: disputeReason }),
      });
      if (!res.ok) throw new Error("Failed to file dispute");
      toast.success("Dispute filed. Admin will contact both parties.");
      router.refresh();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
      setShowDispute(false);
    }
  };

  // ---------------------------------------------------------------
  // Render based on transaction status + user role
  // ---------------------------------------------------------------

  // Payment instructions for buyer
  if (t.status === "pending_payment" && isBuyer) {
    return (
      <div className="rounded-2xl border border-primary/30 bg-primary/5 p-5 space-y-4">
        <div className="flex items-start gap-3">
          <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
            <span className="text-sm font-bold text-primary">1</span>
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Send Payment to Escrow</h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              Send your payment to our escrow account using your selected payment method.
              <strong className="text-foreground"> Do NOT pay the seller directly.</strong>
            </p>
          </div>
        </div>

        {/* Payment details */}
        <div className="rounded-xl bg-background border border-border p-4 space-y-3">
          {t.payment_method === "gcash" || t.payment_method === "maya" ? (
            <div>
              <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">
                {t.payment_method === "gcash" ? "GCash" : "Maya"} Escrow Account
              </p>
              <p className="font-mono text-lg font-bold text-foreground">
                {t.payment_method === "gcash"
                  ? process.env.NEXT_PUBLIC_GCASH_NUMBER
                  : process.env.NEXT_PUBLIC_MAYA_NUMBER}
              </p>
              <p className="text-sm text-muted-foreground">
                Account Name:{" "}
                <strong className="text-foreground">
                  {t.payment_method === "gcash"
                    ? process.env.NEXT_PUBLIC_GCASH_NAME
                    : process.env.NEXT_PUBLIC_MAYA_NAME}
                </strong>
              </p>
              <div className="mt-2 p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg text-xs text-amber-700 dark:text-amber-400">
                ⚠️ Include reference: <strong>TXN-{t.id.slice(0, 8).toUpperCase()}</strong> in your note
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              For COD / Meetup, no advance payment needed. Bring exact cash to meetup.
            </p>
          )}
        </div>

        {/* Upload proof */}
        {t.payment_method !== "cod_meetup" && (
          <>
            <div className="space-y-2">
              <label className="text-sm font-medium">Reference Number</label>
              <Input
                placeholder="GCash/Maya reference number"
                value={paymentRef}
                onChange={(e) => setPaymentRef(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Payment Screenshot</label>
              <label className={`flex items-center gap-3 p-3 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${
                proofFile ? "border-emerald-500 bg-emerald-500/5" : "border-border hover:border-primary/50"
              }`}>
                <Upload className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm">
                  {proofFile ? proofFile.name : "Click to upload payment screenshot"}
                </span>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => setProofFile(e.target.files?.[0] ?? null)}
                />
              </label>
            </div>

            <Button className="w-full" loading={loading} onClick={handleSubmitPayment}>
              Submit Payment Proof
            </Button>
          </>
        )}
      </div>
    );
  }

  // Waiting for verification
  if (t.status === "payment_submitted") {
    return (
      <div className="rounded-2xl border border-blue-500/30 bg-blue-500/5 p-5">
        <div className="flex items-start gap-3">
          <div className="h-8 w-8 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0 animate-pulse">
            <span className="text-sm font-bold text-blue-500">⏳</span>
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Verifying Payment</h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              {isBuyer
                ? "Your payment is being verified by our admin team. This usually takes 1-4 hours during business hours."
                : "Buyer's payment is being verified. You'll be notified when it's confirmed."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Seller: ship the item
  if ((t.status === "in_escrow" || t.status === "payment_verified") && isSeller) {
    return (
      <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-5 space-y-4">
        <div className="flex items-start gap-3">
          <div className="h-8 w-8 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
            <CheckCircle className="h-5 w-5 text-emerald-500" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Payment Received — Ship Now!</h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              Buyer's payment has been verified and is held in escrow. Ship the card and enter tracking details below.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Courier</label>
            <select
              value={selectedCourier}
              onChange={(e) => setSelectedCourier(e.target.value as ShippingMethod)}
              className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {t.shipping_options?.map((method: string) => (
                <option key={method} value={method}>
                  {SHIPPING_METHODS[method as ShippingMethod]?.label ?? method}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Tracking Number *</label>
            <Input
              placeholder="Enter courier tracking number"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
            />
          </div>

          <Button className="w-full" loading={loading} onClick={handleSubmitShipment}>
            <Truck className="h-4 w-4 mr-2" />
            Submit Shipment Details
          </Button>
        </div>
      </div>
    );
  }

  // Buyer: confirm receipt
  if (t.status === "shipped" && isBuyer) {
    return (
      <div className="rounded-2xl border border-indigo-500/30 bg-indigo-500/5 p-5 space-y-4">
        <div className="flex items-start gap-3">
          <Truck className="h-6 w-6 text-indigo-500 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-foreground">Item Shipped!</h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              The seller has shipped your order. Once you receive it, confirm receipt to release payment to the seller.
            </p>
            {t.auto_confirm_at && (
              <p className="text-xs text-muted-foreground mt-1">
                Auto-confirms on {new Date(t.auto_confirm_at).toLocaleDateString("en-PH", { dateStyle: "long" })} if no action taken.
              </p>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <Button className="flex-1" loading={loading} onClick={handleConfirmReceipt}>
            <CheckCircle className="h-4 w-4 mr-2" />
            I Received My Order
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setShowDispute(true)}
          >
            <AlertTriangle className="h-4 w-4" />
          </Button>
        </div>

        {showDispute && (
          <div className="space-y-3 border-t border-border pt-3">
            <h4 className="text-sm font-semibold text-destructive flex items-center gap-1">
              <AlertTriangle className="h-4 w-4" />
              File a Dispute
            </h4>
            <textarea
              placeholder="Describe the problem (e.g. wrong card received, package damaged, item not received...)"
              rows={3}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              value={disputeReason}
              onChange={(e) => setDisputeReason(e.target.value)}
            />
            <div className="flex gap-2">
              <Button variant="destructive" loading={loading} onClick={handleFileDispute}>
                Submit Dispute
              </Button>
              <Button variant="ghost" onClick={() => setShowDispute(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Completed
  if (t.status === "completed") {
    return (
      <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-5">
        <div className="flex items-start gap-3">
          <CheckCircle className="h-6 w-6 text-emerald-500 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-foreground">Transaction Complete!</h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              {isBuyer
                ? "Funds have been released to the seller. Don't forget to leave a review!"
                : "Funds have been released to your account. Thank you for the smooth transaction!"}
            </p>
            <Button className="mt-3" size="sm" asChild>
              <a href={`/reviews/create?transaction=${t.id}`}>Leave a Review</a>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
