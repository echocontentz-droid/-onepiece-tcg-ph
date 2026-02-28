"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

interface SaveButtonProps {
  listingId: string;
  userId?: string;
  initialSaved: boolean;
}

export function SaveButton({ listingId, userId, initialSaved }: SaveButtonProps) {
  const [saved, setSaved] = useState(initialSaved);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSave = async () => {
    if (!userId) {
      router.push(`/login?redirect=/listings/${listingId}`);
      return;
    }
    setLoading(true);
    try {
      if (saved) {
        await supabase.from("watchlist").delete().eq("listing_id", listingId).eq("user_id", userId);
        setSaved(false);
        toast.success("Removed from watchlist");
      } else {
        await supabase.from("watchlist").insert({ listing_id: listingId, user_id: userId });
        setSaved(true);
        toast.success("Saved to watchlist");
      }
    } catch {
      toast.error("Failed to update watchlist");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      className="flex-1"
      onClick={handleSave}
      disabled={loading}
    >
      <Heart
        className={cn(
          "h-4 w-4 mr-1.5",
          saved ? "fill-primary text-primary" : "text-muted-foreground"
        )}
      />
      {saved ? "Saved" : "Save"}
    </Button>
  );
}
