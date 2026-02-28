// =============================================================
// Supabase Database Types (auto-generate with: supabase gen types typescript)
// This is a hand-crafted version — replace with generated types in production
// =============================================================

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          display_name: string;
          email: string;
          phone: string | null;
          avatar_url: string | null;
          bio: string | null;
          role: "user" | "seller" | "admin";
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
          preferred_payment: string[] | null;
          preferred_shipping: string[] | null;
          allow_meetup: boolean;
          gcash_number: string | null;
          maya_number: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["profiles"]["Row"], "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
      };
      listings: {
        Row: {
          id: string;
          seller_id: string;
          card_name: string;
          card_number: string | null;
          card_set: string;
          rarity: string;
          condition: string;
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
          shipping_options: string[];
          shipping_fee: number;
          free_shipping: boolean;
          status: string;
          view_count: number;
          save_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["listings"]["Row"], "id" | "created_at" | "updated_at" | "view_count" | "save_count">;
        Update: Partial<Database["public"]["Tables"]["listings"]["Insert"]>;
      };
      listing_images: {
        Row: {
          id: string;
          listing_id: string;
          url: string;
          storage_path: string;
          is_primary: boolean;
          display_order: number;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["listing_images"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["listing_images"]["Insert"]>;
      };
      transactions: {
        Row: {
          id: string;
          listing_id: string;
          buyer_id: string;
          seller_id: string;
          item_price: number;
          shipping_fee: number;
          platform_fee: number;
          total_amount: number;
          seller_payout: number;
          payment_method: string;
          shipping_method: string | null;
          meetup_location: string | null;
          status: string;
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
        };
        Insert: Omit<Database["public"]["Tables"]["transactions"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["transactions"]["Insert"]>;
      };
      escrow_records: {
        Row: {
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
        };
        Insert: Omit<Database["public"]["Tables"]["escrow_records"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["escrow_records"]["Insert"]>;
      };
      reviews: {
        Row: {
          id: string;
          transaction_id: string;
          reviewer_id: string;
          reviewee_id: string;
          rating: number;
          comment: string | null;
          is_seller_review: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["reviews"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["reviews"]["Insert"]>;
      };
      reports: {
        Row: {
          id: string;
          reporter_id: string;
          reported_user_id: string | null;
          reported_listing_id: string | null;
          reported_transaction_id: string | null;
          reason: string;
          description: string;
          evidence_urls: string[] | null;
          status: string;
          reviewed_by: string | null;
          reviewed_at: string | null;
          resolution: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["reports"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["reports"]["Insert"]>;
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          title: string;
          message: string;
          link: string | null;
          is_read: boolean;
          metadata: Record<string, unknown> | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["notifications"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["notifications"]["Insert"]>;
      };
      watchlist: {
        Row: {
          id: string;
          user_id: string;
          listing_id: string;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["watchlist"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["watchlist"]["Insert"]>;
      };
      seller_verifications: {
        Row: {
          id: string;
          user_id: string;
          status: string;
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
        };
        Insert: Omit<Database["public"]["Tables"]["seller_verifications"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["seller_verifications"]["Insert"]>;
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_admin: { Args: Record<string, never>; Returns: boolean };
    };
    Enums: Record<string, never>;
  };
}
