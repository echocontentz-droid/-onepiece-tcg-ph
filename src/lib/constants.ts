// =============================================================
// One Piece TCG PH — App Constants
// =============================================================

import type {
  CardCondition, CardRarity, CardSet,
  ShippingMethod, PaymentMethod, ReportReason
} from "@/types";

export const APP_NAME = "OP TCG PH";
export const APP_DESCRIPTION = "The trusted marketplace for One Piece TCG in the Philippines";
export const PLATFORM_FEE_PERCENT = 0.03; // 3%
export const MIN_LISTING_IMAGES = 2;
export const MAX_LISTING_IMAGES = 8;
export const AUTO_CONFIRM_DAYS = 7; // days after shipped before auto-confirm

// ---------------------------------------------------------------
// Card Sets with Display Names
// ---------------------------------------------------------------
export const CARD_SETS: Record<CardSet, string> = {
  OP01: "OP01 — Romance Dawn",
  OP02: "OP02 — Paramount War",
  OP03: "OP03 — Pillars of Strength",
  OP04: "OP04 — Kingdoms of Intrigue",
  OP05: "OP05 — Awakening of the New Era",
  OP06: "OP06 — Wings of the Captain",
  OP07: "OP07 — 500 Years in the Future",
  OP08: "OP08 — Two Legends",
  OP09: "OP09 — The Four Emperors",
  ST01: "ST01 — Starter Deck (Straw Hat Crew)",
  ST02: "ST02 — Starter Deck (Worst Generation)",
  ST03: "ST03 — Starter Deck (The Seven Warlords)",
  ST04: "ST04 — Starter Deck (Animal Kingdom Pirates)",
  ST05: "ST05 — Starter Deck (Film Edition)",
  ST06: "ST06 — Starter Deck (Absolute Justice)",
  ST07: "ST07 — Starter Deck (Big Mom Pirates)",
  ST08: "ST08 — Starter Deck (Monkey D. Luffy)",
  ST09: "ST09 — Starter Deck (Yamato)",
  ST10: "ST10 — Starter Deck (OP-10 Ultra Deck Zoro & Sanji)",
  ST11: "ST11 — Starter Deck (Uta)",
  ST12: "ST12 — Starter Deck (Zoro & Sanji)",
  ST13: "ST13 — Starter Deck (The Three Captains)",
  ST14: "ST14 — Starter Deck (3D2Y)",
  ST15: "ST15 — Starter Deck (Red Purple Luffy)",
  ST16: "ST16 — Starter Deck (Green Black Law&Corazon)",
  ST17: "ST17 — Starter Deck (OP-17 Ultra Deck)",
  ST18: "ST18 — Starter Deck",
  ST19: "ST19 — Starter Deck",
  ST20: "ST20 — Starter Deck",
  ST21: "ST21 — Starter Deck",
  PRB01: "PRB01 — Premium Booster THE BEST",
  EB01: "EB01 — Memorial Collection",
  PROMO: "PROMO — Promo Cards",
};

// ---------------------------------------------------------------
// Card Conditions with Display Names and Colors
// ---------------------------------------------------------------
export const CARD_CONDITIONS: Record<CardCondition, { label: string; color: string; description: string }> = {
  mint: {
    label: "Mint (M)",
    color: "emerald",
    description: "Perfect condition. Never played. Pack fresh.",
  },
  near_mint: {
    label: "Near Mint (NM)",
    color: "green",
    description: "Near perfect. May have minor handling marks.",
  },
  lightly_played: {
    label: "Lightly Played (LP)",
    color: "yellow",
    description: "Minor wear. Slight edge scuffs or corner wear.",
  },
  moderately_played: {
    label: "Moderately Played (MP)",
    color: "orange",
    description: "Visible wear. Noticeable scuffs, creases, or border wear.",
  },
  heavily_played: {
    label: "Heavily Played (HP)",
    color: "red",
    description: "Heavy wear. Significant creases, tears, or marks.",
  },
  damaged: {
    label: "Damaged (D)",
    color: "gray",
    description: "Card is damaged. Major defects. Sleeve-only play.",
  },
};

// ---------------------------------------------------------------
// Card Rarities with Display Names and Colors
// ---------------------------------------------------------------
export const CARD_RARITIES: Record<CardRarity, { label: string; color: string }> = {
  common:        { label: "Common (C)",          color: "gray" },
  uncommon:      { label: "Uncommon (UC)",        color: "blue" },
  rare:          { label: "Rare (R)",             color: "purple" },
  super_rare:    { label: "Super Rare (SR)",      color: "amber" },
  secret_rare:   { label: "Secret Rare (SEC)",    color: "red" },
  leader:        { label: "Leader (L)",           color: "sky" },
  don:           { label: "DON Card",             color: "emerald" },
  promo:         { label: "Promo (P)",            color: "pink" },
  alternate_art: { label: "Alternate Art (AA)",   color: "violet" },
};

// ---------------------------------------------------------------
// Shipping Methods with Display Names
// ---------------------------------------------------------------
export const SHIPPING_METHODS: Record<ShippingMethod, { label: string; icon: string; description: string }> = {
  lbc:          { label: "LBC", icon: "📦", description: "LBC Express courier" },
  jt_express:   { label: "J&T Express", icon: "📦", description: "J&T Express courier" },
  flash_express: { label: "Flash Express", icon: "⚡", description: "Flash Express courier" },
  grab_padala:  { label: "Grab Padala", icon: "🛵", description: "Grab Padala same-day/scheduled" },
  lalamove:     { label: "Lalamove", icon: "🚐", description: "Lalamove same-day delivery" },
  meetup:       { label: "Meetup", icon: "🤝", description: "In-person meetup transaction" },
};

// ---------------------------------------------------------------
// Payment Methods
// ---------------------------------------------------------------
export const PAYMENT_METHODS: Record<PaymentMethod, { label: string; icon: string; description: string; color: string }> = {
  gcash:        { label: "GCash", icon: "💙", description: "GCash mobile wallet", color: "blue" },
  maya:         { label: "Maya", icon: "💚", description: "Maya (PayMaya) mobile wallet", color: "green" },
  bank_transfer:{ label: "Bank Transfer", icon: "🏦", description: "Online bank transfer", color: "slate" },
  cod_meetup:   { label: "COD / Meetup", icon: "🤝", description: "Cash on delivery or meetup", color: "amber" },
};

// ---------------------------------------------------------------
// Philippine Provinces / Regions
// ---------------------------------------------------------------
export const PH_PROVINCES = [
  // NCR
  "Metro Manila",
  // Luzon
  "Abra", "Apayao", "Benguet", "Ifugao", "Kalinga", "Mountain Province",
  "Ilocos Norte", "Ilocos Sur", "La Union", "Pangasinan",
  "Batanes", "Cagayan", "Isabela", "Nueva Vizcaya", "Quirino",
  "Aurora", "Bataan", "Bulacan", "Nueva Ecija", "Pampanga", "Tarlac", "Zambales",
  "Batangas", "Cavite", "Laguna", "Quezon", "Rizal",
  "Marinduque", "Occidental Mindoro", "Oriental Mindoro", "Palawan", "Romblon",
  "Albay", "Camarines Norte", "Camarines Sur", "Catanduanes", "Masbate", "Sorsogon",
  // Visayas
  "Aklan", "Antique", "Capiz", "Guimaras", "Iloilo", "Negros Occidental",
  "Bohol", "Cebu", "Negros Oriental", "Siquijor",
  "Biliran", "Eastern Samar", "Leyte", "Northern Samar", "Samar", "Southern Leyte",
  // Mindanao
  "Bukidnon", "Camiguin", "Lanao del Norte", "Misamis Occidental", "Misamis Oriental",
  "Compostela Valley", "Davao del Norte", "Davao del Sur", "Davao Occidental", "Davao Oriental",
  "Cotabato", "Sarangani", "South Cotabato", "Sultan Kudarat",
  "Agusan del Norte", "Agusan del Sur", "Dinagat Islands", "Surigao del Norte", "Surigao del Sur",
  "Basilan", "Lanao del Sur", "Maguindanao", "Sulu", "Tawi-Tawi",
  "Zamboanga del Norte", "Zamboanga del Sur", "Zamboanga Sibugay",
].sort();

// ---------------------------------------------------------------
// Report Reasons
// ---------------------------------------------------------------
export const REPORT_REASONS: Record<ReportReason, { label: string; description: string }> = {
  scam:          { label: "Scam", description: "Seller/buyer is attempting to scam" },
  fake_card:     { label: "Fake/Proxy Card", description: "Selling fake or proxy cards as genuine" },
  non_delivery:  { label: "Non-Delivery", description: "Paid but item was not delivered" },
  wrong_item:    { label: "Wrong Item", description: "Received wrong or different item" },
  harassment:    { label: "Harassment", description: "User is being abusive or harassing" },
  spam:          { label: "Spam", description: "Spam listings or messages" },
  counterfeit:   { label: "Counterfeit", description: "Counterfeit currency or payment" },
  other:         { label: "Other", description: "Other reason not listed above" },
};

// ---------------------------------------------------------------
// Transaction Status Display
// ---------------------------------------------------------------
export const TRANSACTION_STATUS_DISPLAY: Record<
  string,
  { label: string; color: string; description: string }
> = {
  pending_payment: {
    label: "Pending Payment",
    color: "yellow",
    description: "Waiting for buyer to send payment",
  },
  payment_submitted: {
    label: "Payment Submitted",
    color: "blue",
    description: "Buyer submitted payment proof — awaiting admin verification",
  },
  payment_verified: {
    label: "Payment Verified",
    color: "cyan",
    description: "Payment confirmed. Awaiting seller to ship.",
  },
  in_escrow: {
    label: "In Escrow",
    color: "purple",
    description: "Funds held in escrow. Seller should ship now.",
  },
  shipped: {
    label: "Shipped",
    color: "indigo",
    description: "Item has been shipped. Awaiting delivery.",
  },
  delivered: {
    label: "Delivered",
    color: "teal",
    description: "Item delivered. Awaiting buyer confirmation.",
  },
  completed: {
    label: "Completed",
    color: "green",
    description: "Transaction completed successfully.",
  },
  disputed: {
    label: "Disputed",
    color: "red",
    description: "Transaction under dispute review.",
  },
  refunded: {
    label: "Refunded",
    color: "orange",
    description: "Payment refunded to buyer.",
  },
  cancelled: {
    label: "Cancelled",
    color: "gray",
    description: "Transaction was cancelled.",
  },
};
