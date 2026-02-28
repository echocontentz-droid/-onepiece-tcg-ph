"use client";

import { useState, useCallback } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { SlidersHorizontal, X, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  CARD_SETS, CARD_CONDITIONS, CARD_RARITIES,
  SHIPPING_METHODS, PH_PROVINCES
} from "@/lib/constants";
import type { CardSet, CardRarity, CardCondition, ShippingMethod } from "@/types";

interface SearchFiltersProps {
  className?: string;
}

type SortOption = "newest" | "oldest" | "price_asc" | "price_desc" | "popular";

const SORT_OPTIONS: Record<SortOption, string> = {
  newest: "Newest First",
  price_asc: "Price: Low to High",
  price_desc: "Price: High to Low",
  popular: "Most Popular",
  oldest: "Oldest First",
};

export function SearchFilters({ className }: SearchFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    set: true,
    rarity: true,
    condition: true,
    price: true,
    location: false,
    shipping: false,
  });

  // Read current filters from URL
  const currentSet = searchParams.get("card_set") as CardSet | null;
  const currentRarity = searchParams.get("rarity") as CardRarity | null;
  const currentCondition = searchParams.get("condition") as CardCondition | null;
  const currentMinPrice = searchParams.get("min_price") ?? "";
  const currentMaxPrice = searchParams.get("max_price") ?? "";
  const currentProvince = searchParams.get("province") ?? "";
  const currentShipping = searchParams.get("shipping_method") as ShippingMethod | null;
  const currentSort = (searchParams.get("sort_by") ?? "newest") as SortOption;
  const currentMeetup = searchParams.get("allows_meetup") === "true";
  const currentNego = searchParams.get("is_negotiable") === "true";
  const currentFoil = searchParams.get("is_foil") === "true";
  const currentVerified = searchParams.get("seller_verified") === "true";

  const updateFilter = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === null || value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
      params.delete("page"); // reset pagination
      router.push(`${pathname}?${params.toString()}`);
    },
    [pathname, router, searchParams]
  );

  const clearAll = () => {
    const params = new URLSearchParams();
    const search = searchParams.get("search");
    if (search) params.set("search", search);
    router.push(`${pathname}?${params.toString()}`);
  };

  const activeFilterCount = [
    currentSet, currentRarity, currentCondition,
    currentMinPrice, currentMaxPrice, currentProvince,
    currentShipping, currentMeetup, currentNego, currentFoil, currentVerified
  ].filter(Boolean).length;

  const FilterContent = () => (
    <div className="space-y-1">
      {/* Sort */}
      <FilterSection label="Sort By" value={true}>
        <select
          value={currentSort}
          onChange={(e) => updateFilter("sort_by", e.target.value)}
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          {Object.entries(SORT_OPTIONS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </FilterSection>

      {/* Card Set */}
      <FilterSection
        label="Card Set"
        value={expandedSections.set}
        onToggle={() => setExpandedSections((s) => ({ ...s, set: !s.set }))}
      >
        <div className="space-y-1 max-h-48 overflow-y-auto">
          {Object.entries(CARD_SETS).map(([set, name]) => (
            <FilterCheckbox
              key={set}
              label={name.split(" — ")[0] + (name.includes("—") ? ` — ${name.split(" — ")[1]}` : "")}
              checked={currentSet === set}
              onChange={() => updateFilter("card_set", currentSet === set ? null : set)}
            />
          ))}
        </div>
      </FilterSection>

      {/* Rarity */}
      <FilterSection
        label="Rarity"
        value={expandedSections.rarity}
        onToggle={() => setExpandedSections((s) => ({ ...s, rarity: !s.rarity }))}
      >
        <div className="space-y-1">
          {Object.entries(CARD_RARITIES).map(([rarity, { label }]) => (
            <FilterCheckbox
              key={rarity}
              label={label}
              checked={currentRarity === rarity}
              onChange={() => updateFilter("rarity", currentRarity === rarity ? null : rarity)}
            />
          ))}
        </div>
      </FilterSection>

      {/* Condition */}
      <FilterSection
        label="Condition"
        value={expandedSections.condition}
        onToggle={() => setExpandedSections((s) => ({ ...s, condition: !s.condition }))}
      >
        <div className="space-y-1">
          {Object.entries(CARD_CONDITIONS).map(([condition, { label }]) => (
            <FilterCheckbox
              key={condition}
              label={label}
              checked={currentCondition === condition}
              onChange={() => updateFilter("condition", currentCondition === condition ? null : condition)}
            />
          ))}
        </div>
      </FilterSection>

      {/* Price Range */}
      <FilterSection
        label="Price Range (PHP)"
        value={expandedSections.price}
        onToggle={() => setExpandedSections((s) => ({ ...s, price: !s.price }))}
      >
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Min"
            defaultValue={currentMinPrice}
            onBlur={(e) => updateFilter("min_price", e.target.value || null)}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <input
            type="number"
            placeholder="Max"
            defaultValue={currentMaxPrice}
            onBlur={(e) => updateFilter("max_price", e.target.value || null)}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        {/* Quick price ranges */}
        <div className="flex flex-wrap gap-1.5 mt-2">
          {[
            { label: "Under ₱500", min: "", max: "500" },
            { label: "₱500-2k", min: "500", max: "2000" },
            { label: "₱2k-5k", min: "2000", max: "5000" },
            { label: "₱5k+", min: "5000", max: "" },
          ].map(({ label, min, max }) => (
            <button
              key={label}
              onClick={() => {
                const params = new URLSearchParams(searchParams.toString());
                min ? params.set("min_price", min) : params.delete("min_price");
                max ? params.set("max_price", max) : params.delete("max_price");
                params.delete("page");
                router.push(`${pathname}?${params.toString()}`);
              }}
              className="text-xs px-2 py-1 rounded-full border border-border hover:border-primary/50 hover:bg-primary/5 transition-colors"
            >
              {label}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Location */}
      <FilterSection
        label="Location"
        value={expandedSections.location}
        onToggle={() => setExpandedSections((s) => ({ ...s, location: !s.location }))}
      >
        <select
          value={currentProvince}
          onChange={(e) => updateFilter("province", e.target.value || null)}
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">All Provinces</option>
          {PH_PROVINCES.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </FilterSection>

      {/* Shipping */}
      <FilterSection
        label="Shipping"
        value={expandedSections.shipping}
        onToggle={() => setExpandedSections((s) => ({ ...s, shipping: !s.shipping }))}
      >
        <div className="space-y-1">
          {Object.entries(SHIPPING_METHODS).map(([method, { label, icon }]) => (
            <FilterCheckbox
              key={method}
              label={`${icon} ${label}`}
              checked={currentShipping === method}
              onChange={() => updateFilter("shipping_method", currentShipping === method ? null : method)}
            />
          ))}
        </div>
      </FilterSection>

      {/* Toggles */}
      <div className="border-t border-border pt-3 space-y-2">
        <FilterToggle
          label="Meetup Available"
          checked={currentMeetup}
          onChange={() => updateFilter("allows_meetup", currentMeetup ? null : "true")}
        />
        <FilterToggle
          label="Negotiable Price"
          checked={currentNego}
          onChange={() => updateFilter("is_negotiable", currentNego ? null : "true")}
        />
        <FilterToggle
          label="Foil Cards Only"
          checked={currentFoil}
          onChange={() => updateFilter("is_foil", currentFoil ? null : "true")}
        />
        <FilterToggle
          label="Verified Sellers Only"
          checked={currentVerified}
          onChange={() => updateFilter("seller_verified", currentVerified ? null : "true")}
        />
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile filter button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setMobileOpen(true)}
        className="lg:hidden flex items-center gap-2"
      >
        <SlidersHorizontal className="h-4 w-4" />
        Filters
        {activeFilterCount > 0 && (
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
            {activeFilterCount}
          </span>
        )}
      </Button>

      {/* Mobile filter drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <div className="fixed bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto rounded-t-2xl bg-background border-t border-border p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">Filters</h2>
              <div className="flex items-center gap-2">
                {activeFilterCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearAll}>Clear all</Button>
                )}
                <Button variant="ghost" size="icon" onClick={() => setMobileOpen(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>
            <FilterContent />
            <div className="pt-4 pb-safe">
              <Button className="w-full" onClick={() => setMobileOpen(false)}>
                Show Results
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className={cn("hidden lg:block", className)}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-foreground">Filters</h2>
          {activeFilterCount > 0 && (
            <Button variant="ghost" size="sm" onClick={clearAll} className="text-xs">
              Clear all ({activeFilterCount})
            </Button>
          )}
        </div>
        <FilterContent />
      </div>
    </>
  );
}

// ---------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------
function FilterSection({
  label, value, onToggle, children,
}: {
  label: string;
  value: boolean;
  onToggle?: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-border py-3">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between text-sm font-medium mb-2"
      >
        {label}
        {onToggle && (value ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />)}
      </button>
      {value && children}
    </div>
  );
}

function FilterCheckbox({
  label, checked, onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer hover:text-foreground text-sm text-muted-foreground py-0.5">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 rounded border-border accent-primary"
      />
      <span className={checked ? "text-foreground font-medium" : ""}>{label}</span>
    </label>
  );
}

function FilterToggle({
  label, checked, onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex items-center justify-between cursor-pointer text-sm">
      <span className={checked ? "text-foreground font-medium" : "text-muted-foreground"}>
        {label}
      </span>
      <div
        onClick={onChange}
        className={cn(
          "relative inline-flex h-5 w-9 items-center rounded-full transition-colors",
          checked ? "bg-primary" : "bg-muted"
        )}
      >
        <span
          className={cn(
            "inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform",
            checked ? "translate-x-4" : "translate-x-0.5"
          )}
        />
      </div>
    </label>
  );
}
