"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, CheckCircle, XCircle, ExternalLink, Star, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { timeAgo } from "@/lib/utils";
import Image from "next/image";
import toast from "react-hot-toast";

interface Verification {
  id: string;
  user_id: string;
  id_photo_url: string;
  selfie_with_id_url: string;
  social_media_link: string | null;
  reason: string | null;
  created_at: string;
  user?: {
    username: string;
    display_name: string;
    email: string;
    rating_count: number;
    total_sales: number;
  };
}

export function AdminVerificationsTable({ verifications }: { verifications: Verification[] }) {
  const router = useRouter();
  const [processing, setProcessing] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectForm, setShowRejectForm] = useState<string | null>(null);

  const handleApprove = async (v: Verification) => {
    setProcessing(v.id);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "verify_seller",
          user_id: v.user_id,
          verification_id: v.id,
        }),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success(`@${v.user?.username} is now a Verified Seller!`);
      router.refresh();
    } catch {
      toast.error("Failed to approve verification");
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (v: Verification) => {
    if (!rejectionReason.trim()) {
      toast.error("Please enter a rejection reason");
      return;
    }
    setProcessing(v.id);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reject_verification",
          user_id: v.user_id,
          verification_id: v.id,
          reason: rejectionReason,
        }),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success("Verification rejected");
      setShowRejectForm(null);
      setRejectionReason("");
      router.refresh();
    } catch {
      toast.error("Failed to reject verification");
    } finally {
      setProcessing(null);
    }
  };

  if (!verifications.length) {
    return (
      <div className="px-5 py-8 text-center text-sm text-muted-foreground">
        No pending verifications
      </div>
    );
  }

  return (
    <div className="divide-y divide-border">
      {verifications.map((v) => (
        <div key={v.id} className="px-5 py-4 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-semibold text-sm">{v.user?.display_name}</p>
              <p className="text-xs text-muted-foreground">@{v.user?.username} · {v.user?.email}</p>
              <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                <span className="flex items-center gap-0.5">
                  <ShoppingBag className="h-3 w-3" />
                  {v.user?.total_sales} sales
                </span>
                <span className="flex items-center gap-0.5">
                  <Star className="h-3 w-3" />
                  {v.user?.rating_count} reviews
                </span>
                <span>{timeAgo(v.created_at)}</span>
              </div>
            </div>
            <div className="flex gap-1">
              <Button
                size="sm"
                className="h-7 text-xs"
                loading={processing === v.id}
                onClick={() => handleApprove(v)}
              >
                <CheckCircle className="h-3 w-3 mr-1" />
                Approve
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs text-destructive border-destructive/30"
                onClick={() => setShowRejectForm(v.id)}
              >
                <XCircle className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {/* Documents */}
          <div className="flex gap-2">
            <a
              href={v.id_photo_url}
              target="_blank"
              rel="noreferrer"
              className="relative h-24 w-20 rounded-lg overflow-hidden border border-border hover:opacity-80 transition-opacity"
            >
              <Image src={v.id_photo_url} alt="ID Photo" fill className="object-cover" />
              <div className="absolute bottom-0 inset-x-0 bg-black/60 text-[9px] text-white text-center py-0.5">
                ID Photo
              </div>
            </a>
            <a
              href={v.selfie_with_id_url}
              target="_blank"
              rel="noreferrer"
              className="relative h-24 w-20 rounded-lg overflow-hidden border border-border hover:opacity-80 transition-opacity"
            >
              <Image src={v.selfie_with_id_url} alt="Selfie with ID" fill className="object-cover" />
              <div className="absolute bottom-0 inset-x-0 bg-black/60 text-[9px] text-white text-center py-0.5">
                Selfie + ID
              </div>
            </a>
            <div className="flex-1 text-xs space-y-1">
              {v.social_media_link && (
                <a
                  href={v.social_media_link}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-primary hover:underline"
                >
                  <ExternalLink className="h-3 w-3" />
                  Social Media Profile
                </a>
              )}
              {v.reason && (
                <p className="text-muted-foreground line-clamp-3">{v.reason}</p>
              )}
            </div>
          </div>

          {/* Reject form */}
          {showRejectForm === v.id && (
            <div className="space-y-2 border-t border-border pt-2">
              <textarea
                placeholder="Reason for rejection..."
                rows={2}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="destructive"
                  className="h-7 text-xs"
                  loading={processing === v.id}
                  onClick={() => handleReject(v)}
                >
                  Confirm Reject
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 text-xs"
                  onClick={() => setShowRejectForm(null)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
