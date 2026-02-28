// =============================================================
// One Piece TCG PH — TypeScript Types
// =============================================================

// ---------------------------------------------------------------
// Enums (mirror database enums)
// ---------------------------------------------------------------
export type UserRole = "user" | "seller" | "admin";

export type CardCondition =
  | "mint"
  | "near_mint"
  | "lightly_played"
  | "moderately_played"
  | "heavily_played"
  | "damaged";

export type CardRarity =
  | "common"
  | "uncommon"
  | "rare"
  | "super_rare"
  | "secret_rare"
  | "leader"
  | "don"
  | "promo"
  | "alternate_art";

export type CardSet =
  | "OP01" | "OP02" | "OP03" | "OP04" | "OP05"
  | "OP06" | "OP07" | "OP08" | "OP09"
  | "ST01" | "ST02" | "ST03" | "ST04" | "ST05"
  | "ST06" | "ST07" | "ST08" | "ST09" | "ST10"
  | "ST11" | "ST12" | "ST13" | "ST14" | "ST15"
  | "ST16" | "ST17" | "ST18" | "ST19" | "ST20" | "ST21"
  | "PRB01" | "EB01" | "PROMO";

export type ListingStatus = "active" | "reserved" | "sold" | "cancelled" | "removed";

export type TransactionStatus =
  | "pending_payment"
  | "payment_submitted"
  | "payment_verified"
  | "in_escrow"
  | "shipped"
  | "delivered"
  | "completed"
  | "disputed"
  | "refunded"
  | "cancelled";

export type PaymentMethod = "gcash" | "maya" | "bank_transfer" | "cod_meetup";

export type ShippingMethod =
  | "lbc"
  | "jt_express"
  | "flash_express"
  | "grab_padala"
  | "lalamove"
  | "meetup";

export type ReportReason =
  | "scam"
  | "fake_card"
  | "non_delivery"
  | "wrong_item"
  | "harassment"
  | "spam"
  | "counterfeit"
  | "other";

export type ReportStatus = "pending" | "reviewing" | "resolved" | "dismissed";

export type VerificationStatus = "pending" | "approved" | "rejected";

export type NotificationType =
  | "new_offer"
  | "offer_accepted"
  | "payment_received"
  | "payment_verified"
  | "item_shipped"
  | "item_delivered"
  | "transaction_complete"
  | "new_review"
  | "report_update"
  | "system_message"
  | "account_verified";

// ---------------------------------------------------------------
// Database Models
// ---------------------------------------------------------------
export interface Profile {
  id: string;
  username: string;
  display_name: string;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  bio: string | null;
  role: UserRole;
  province: string | null;
  city: string | null;
  email_verified: boolean;
  phone_verified: boolean;
  is_verified_seller: boolean;
  is_banned: boolean;
  ban_reason: string | null;
  total_sales: number;
  total_purchases: number;
  rating_avg: number;
  rating_count: number;
  member_since: string;
  last_active_at: string;
  preferred_payment: PaymentMethod[] | null;
  preferred_shipping: ShippingMethod[] | null;
  allow_meetup: boolean;
  gcash_number: string | null;
  maya_number: string | null;
  created_at: string;
  updated_at: string;
}

export interface ListingImage {
  id: string;
  listing_id: string;
  url: string;
  storage_path: string;
  is_primary: boolean;
  display_order: number;
  created_at: string;
}

export interface Listing {
  id: string;
  seller_id: string;
  card_name: string;
  card_number: string | null;
  card_set: CardSet;
  rarity: CardRarity;
  condition: CardCondition;
  language: string;
  is_foil: boolean;
  quantity: number;
  title: string;
  description: string | null;
  price: number;
  is_negotiable: boolean;
  location_province: string;
  location_city: string;
  allows_meetup: boolean;
  meetup_details: string | null;
  shipping_options: ShippingMethod[];
  shipping_fee: number;
  free_shipping: boolean;
  status: ListingStatus;
  view_count: number;
  save_count: number;
  created_at: string;
  updated_at: string;
  // Relations
  seller?: Profile;
  images?: ListingImage[];
  is_saved?: boolean; // client-side computed
}

export interface Transaction {
  id: string;
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  item_price: number;
  shipping_fee: number;
  platform_fee: number;
  total_amount: number;
  seller_payout: number;
  payment_method: PaymentMethod;
  shipping_method: ShippingMethod | null;
  meetup_location: string | null;
  status: TransactionStatus;
  cancelled_by: string | null;
  cancellation_reason: string | null;
  cancelled_at: string | null;
  auto_confirm_at: string | null;
  disputed_by: string | null;
  dispute_reason: string | null;
  disputed_at: string | null;
  dispute_resolved_at: string | null;
  dispute_resolution: string | null;
  created_at: string;
  updated_at: string;
  // Relations
  listing?: Listing;
  buyer?: Profile;
  seller?: Profile;
  escrow_record?: EscrowRecord;
  shipment?: ShipmentDetails;
}

export interface EscrowRecord {
  id: string;
  transaction_id: string;
  payment_proof_url: string | null;
  payment_reference: string | null;
  payment_submitted_at: string | null;
  verified_by: string | null;
  verified_at: string | null;
  verification_notes: string | null;
  released_by: string | null;
  released_at: string | null;
  release_notes: string | null;
  seller_payout_reference: string | null;
  created_at: string;
  updated_at: string;
}

export interface ShipmentDetails {
  id: string;
  transaction_id: string;
  shipping_method: ShippingMethod;
  tracking_number: string | null;
  tracking_url: string | null;
  courier_receipt_url: string | null;
  shipped_at: string | null;
  estimated_delivery: string | null;
  delivered_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  transaction_id: string;
  reviewer_id: string;
  reviewee_id: string;
  rating: number;
  comment: string | null;
  is_seller_review: boolean;
  created_at: string;
  updated_at: string;
  // Relations
  reviewer?: Profile;
  reviewee?: Profile;
}

export interface Report {
  id: string;
  reporter_id: string;
  reported_user_id: string | null;
  reported_listing_id: string | null;
  reported_transaction_id: string | null;
  reason: ReportReason;
  description: string;
  evidence_urls: string[] | null;
  status: ReportStatus;
  reviewed_by: string | null;
  reviewed_at: string | null;
  resolution: string | null;
  created_at: string;
  updated_at: string;
  // Relations
  reporter?: Profile;
  reported_user?: Profile;
  reported_listing?: Listing;
}

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  link: string | null;
  is_read: boolean;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface SellerVerification {
  id: string;
  user_id: string;
  status: VerificationStatus;
  id_photo_url: string;
  selfie_with_id_url: string;
  social_media_link: string | null;
  reason: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  rejection_reason: string | null;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

// ---------------------------------------------------------------
// API Request / Response Shapes
// ---------------------------------------------------------------
export interface ListingFilters {
  search?: string;
  card_set?: CardSet;
  rarity?: CardRarity;
  condition?: CardCondition;
  min_price?: number;
  max_price?: number;
  province?: string;
  shipping_method?: ShippingMethod;
  allows_meetup?: boolean;
  is_negotiable?: boolean;
  is_foil?: boolean;
  seller_verified?: boolean;
  sort_by?: "price_asc" | "price_desc" | "newest" | "oldest" | "popular";
  page?: number;
  per_page?: number;
}

export interface CreateListingInput {
  card_name: string;
  card_number?: string;
  card_set: CardSet;
  rarity: CardRarity;
  condition: CardCondition;
  language?: string;
  is_foil?: boolean;
  quantity?: number;
  title: string;
  description?: string;
  price: number;
  is_negotiable?: boolean;
  location_province: string;
  location_city: string;
  allows_meetup?: boolean;
  meetup_details?: string;
  shipping_options: ShippingMethod[];
  shipping_fee?: number;
  free_shipping?: boolean;
  image_paths: string[]; // storage paths after upload
}

export interface CreateTransactionInput {
  listing_id: string;
  payment_method: PaymentMethod;
  shipping_method?: ShippingMethod;
  meetup_location?: string;
}

export interface SubmitPaymentProofInput {
  transaction_id: string;
  payment_proof_path: string;
  payment_reference: string;
}

export interface SubmitShipmentInput {
  transaction_id: string;
  shipping_method: ShippingMethod;
  tracking_number: string;
  courier_receipt_path?: string;
}

export interface CreateReviewInput {
  transaction_id: string;
  reviewee_id: string;
  rating: number;
  comment?: string;
  is_seller_review: boolean;
}

export interface CreateReportInput {
  reported_user_id?: string;
  reported_listing_id?: string;
  reported_transaction_id?: string;
  reason: ReportReason;
  description: string;
  evidence_urls?: string[];
}

// ---------------------------------------------------------------
// Pagination
// ---------------------------------------------------------------
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

// ---------------------------------------------------------------
// Admin Dashboard Stats
// ---------------------------------------------------------------
export interface AdminStats {
  total_users: number;
  total_listings: number;
  total_transactions: number;
  total_revenue: number;
  pending_verifications: number;
  pending_reports: number;
  active_disputes: number;
  new_users_this_week: number;
  transactions_this_week: number;
}

// ---------------------------------------------------------------
// UI State Types
// ---------------------------------------------------------------
export interface AuthUser {
  id: string;
  email: string;
  profile: Profile;
}

export interface SearchState {
  query: string;
  filters: ListingFilters;
}
