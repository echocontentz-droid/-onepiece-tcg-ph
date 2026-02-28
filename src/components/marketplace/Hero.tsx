"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Shield, Zap, TrendingUp, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CARD_SETS } from "@/lib/constants";

const QUICK_SEARCHES = [
  "Monkey D. Luffy",
  "Roronoa Zoro",
  "Trafalgar Law",
  "Portgas D. Ace",
  "OP09 Secret Rare",
];

const STATS = [
  { label: "Active Listings", value: "2,400+", icon: TrendingUp },
  { label: "Verified Sellers", value: "180+", icon: Shield },
  { label: "Safe Transactions", value: "8,900+", icon: Zap },
  { label: "Avg. Seller Rating", value: "4.8★", icon: Star },
];

export function Hero() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/listings?search=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <section className="relative overflow-hidden py-16 sm:py-24 bg-background">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -bottom-20 right-1/4 h-72 w-72 rounded-full bg-op-gold/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-4xl px-4 sm:px-6 text-center">
        {/* Eyebrow */}
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/60 px-4 py-1.5 text-sm text-muted-foreground mb-6">
          <Shield className="h-3.5 w-3.5 text-primary" />
          Escrow-Protected Transactions · Philippines
        </div>

        {/* Headline */}
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl mb-4">
          Buy & Sell{" "}
          <span className="gradient-text">One Piece TCG</span>
          <br />
          Safely in the Philippines
        </h1>

        <p className="mx-auto max-w-2xl text-lg text-muted-foreground mb-8">
          The trusted marketplace for Filipino One Piece TCG players.
          Escrow-protected payments, seller verification, and real ratings — no more Facebook group scams.
        </p>

        {/* Search */}
        <form onSubmit={handleSearch} className="mx-auto max-w-lg flex gap-2 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search card name, e.g. Monkey D. Luffy..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full h-12 pl-10 pr-4 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
            />
          </div>
          <Button type="submit" size="lg" className="h-12 px-6 rounded-xl">
            Search
          </Button>
        </form>

        {/* Quick searches */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {QUICK_SEARCHES.map((term) => (
            <button
              key={term}
              onClick={() => router.push(`/listings?search=${encodeURIComponent(term)}`)}
              className="text-xs px-3 py-1.5 rounded-full border border-border bg-muted/40 text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors"
            >
              {term}
            </button>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 max-w-2xl mx-auto">
          {STATS.map(({ label, value, icon: Icon }) => (
            <div
              key={label}
              className="rounded-xl border border-border bg-card/60 p-4 text-center backdrop-blur-sm"
            >
              <div className="flex justify-center mb-2">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <div className="text-2xl font-bold text-foreground">{value}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------
// Featured Sets Strip
// ---------------------------------------------------------------
const FEATURED_SETS: Array<keyof typeof CARD_SETS> = [
  "OP09", "OP08", "OP07", "OP06", "PRB01", "EB01"
];

export function FeaturedSets() {
  const router = useRouter();

  return (
    <section className="bg-muted/30 border-y border-border py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-foreground">Browse by Set</h2>
          <Button variant="ghost" size="sm" onClick={() => router.push("/listings")}>
            View all
          </Button>
        </div>
        <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2">
          {FEATURED_SETS.map((set) => (
            <button
              key={set}
              onClick={() => router.push(`/listings?card_set=${set}`)}
              className="shrink-0 rounded-xl border border-border bg-card px-4 py-3 text-center hover:border-primary/50 hover:bg-primary/5 transition-all group"
            >
              <div className="text-lg font-bold text-primary group-hover:scale-110 transition-transform">
                {set}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5 max-w-[120px] line-clamp-1">
                {CARD_SETS[set].split(" — ")[1]}
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
