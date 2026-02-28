-- =============================================================
-- One Piece TCG PH — Complete Database Schema
-- =============================================================
-- Run in Supabase SQL editor or via supabase db push

-- ---------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- for fuzzy text search

-- ---------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------
CREATE TYPE user_role AS ENUM ('user', 'seller', 'admin');

CREATE TYPE card_condition AS ENUM (
  'mint',
  'near_mint',
  'lightly_played',
  'moderately_played',
  'heavily_played',
  'damaged'
);

CREATE TYPE card_rarity AS ENUM (
  'common',
  'uncommon',
  'rare',
  'super_rare',
  'secret_rare',
  'leader',
  'don',
  'promo',
  'alternate_art'
);

CREATE TYPE card_set AS ENUM (
  'OP01', 'OP02', 'OP03', 'OP04', 'OP05', 'OP06', 'OP07', 'OP08', 'OP09',
  'ST01', 'ST02', 'ST03', 'ST04', 'ST05', 'ST06', 'ST07', 'ST08', 'ST09',
  'ST10', 'ST11', 'ST12', 'ST13', 'ST14', 'ST15', 'ST16', 'ST17', 'ST18',
  'ST19', 'ST20', 'ST21',
  'PRB01', 'EB01',
  'PROMO'
);

CREATE TYPE listing_status AS ENUM (
  'active',
  'reserved',
  'sold',
  'cancelled',
  'removed'
);

CREATE TYPE transaction_status AS ENUM (
  'pending_payment',
  'payment_submitted',
  'payment_verified',
  'in_escrow',
  'shipped',
  'delivered',
  'completed',
  'disputed',
  'refunded',
  'cancelled'
);

CREATE TYPE payment_method AS ENUM (
  'gcash',
  'maya',
  'bank_transfer',
  'cod_meetup'
);

CREATE TYPE shipping_method AS ENUM (
  'lbc',
  'jt_express',
  'flash_express',
  'grab_padala',
  'lalamove',
  'meetup'
);

CREATE TYPE report_reason AS ENUM (
  'scam',
  'fake_card',
  'non_delivery',
  'wrong_item',
  'harassment',
  'spam',
  'counterfeit',
  'other'
);

CREATE TYPE report_status AS ENUM (
  'pending',
  'reviewing',
  'resolved',
  'dismissed'
);

CREATE TYPE verification_status AS ENUM (
  'pending',
  'approved',
  'rejected'
);

CREATE TYPE notification_type AS ENUM (
  'new_offer',
  'offer_accepted',
  'payment_received',
  'payment_verified',
  'item_shipped',
  'item_delivered',
  'transaction_complete',
  'new_review',
  'report_update',
  'system_message',
  'account_verified'
);

-- ---------------------------------------------------------------
-- PROFILES
-- ---------------------------------------------------------------
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  bio TEXT,
  role user_role NOT NULL DEFAULT 'user',

  -- Location
  province TEXT,
  city TEXT,

  -- Trust & verification
  email_verified BOOLEAN NOT NULL DEFAULT false,
  phone_verified BOOLEAN NOT NULL DEFAULT false,
  is_verified_seller BOOLEAN NOT NULL DEFAULT false,
  is_banned BOOLEAN NOT NULL DEFAULT false,
  ban_reason TEXT,

  -- Stats (denormalized for performance)
  total_sales INTEGER NOT NULL DEFAULT 0,
  total_purchases INTEGER NOT NULL DEFAULT 0,
  rating_avg NUMERIC(3,2) NOT NULL DEFAULT 0.00,
  rating_count INTEGER NOT NULL DEFAULT 0,

  -- Social proof
  member_since TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_active_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Preferences
  preferred_payment payment_method[],
  preferred_shipping shipping_method[],
  allow_meetup BOOLEAN NOT NULL DEFAULT true,
  gcash_number TEXT,
  maya_number TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------
-- SELLER VERIFICATION REQUESTS
-- ---------------------------------------------------------------
CREATE TABLE seller_verifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status verification_status NOT NULL DEFAULT 'pending',

  -- Submitted documents
  id_photo_url TEXT NOT NULL,
  selfie_with_id_url TEXT NOT NULL,
  social_media_link TEXT,
  reason TEXT,

  -- Admin processing
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMPTZ,
  rejection_reason TEXT,
  admin_notes TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------
-- LISTINGS
-- ---------------------------------------------------------------
CREATE TABLE listings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Card details
  card_name TEXT NOT NULL,
  card_number TEXT,                    -- e.g. "OP01-001"
  card_set card_set NOT NULL,
  rarity card_rarity NOT NULL,
  condition card_condition NOT NULL,
  language TEXT NOT NULL DEFAULT 'English',
  is_foil BOOLEAN NOT NULL DEFAULT false,
  quantity INTEGER NOT NULL DEFAULT 1,

  -- Listing details
  title TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL,
  is_negotiable BOOLEAN NOT NULL DEFAULT false,

  -- Location & shipping
  location_province TEXT NOT NULL,
  location_city TEXT NOT NULL,
  allows_meetup BOOLEAN NOT NULL DEFAULT false,
  meetup_details TEXT,
  shipping_options shipping_method[] NOT NULL DEFAULT '{}',
  shipping_fee NUMERIC(10,2) NOT NULL DEFAULT 0,
  free_shipping BOOLEAN NOT NULL DEFAULT false,

  -- Status
  status listing_status NOT NULL DEFAULT 'active',

  -- Stats
  view_count INTEGER NOT NULL DEFAULT 0,
  save_count INTEGER NOT NULL DEFAULT 0,

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Search vector
  search_vector TSVECTOR
);

-- ---------------------------------------------------------------
-- LISTING IMAGES
-- ---------------------------------------------------------------
CREATE TABLE listing_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------
-- WATCHLIST / SAVED LISTINGS
-- ---------------------------------------------------------------
CREATE TABLE watchlist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, listing_id)
);

-- ---------------------------------------------------------------
-- TRANSACTIONS
-- ---------------------------------------------------------------
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID NOT NULL REFERENCES listings(id),
  buyer_id UUID NOT NULL REFERENCES profiles(id),
  seller_id UUID NOT NULL REFERENCES profiles(id),

  -- Amounts
  item_price NUMERIC(10,2) NOT NULL,
  shipping_fee NUMERIC(10,2) NOT NULL DEFAULT 0,
  platform_fee NUMERIC(10,2) NOT NULL DEFAULT 0,
  total_amount NUMERIC(10,2) NOT NULL,
  seller_payout NUMERIC(10,2) NOT NULL,

  -- Payment & shipping
  payment_method payment_method NOT NULL,
  shipping_method shipping_method,
  meetup_location TEXT,

  -- Status
  status transaction_status NOT NULL DEFAULT 'pending_payment',

  -- Cancellation
  cancelled_by UUID REFERENCES profiles(id),
  cancellation_reason TEXT,
  cancelled_at TIMESTAMPTZ,

  -- Auto-confirm deadline (7 days after shipped)
  auto_confirm_at TIMESTAMPTZ,

  -- Dispute info
  disputed_by UUID REFERENCES profiles(id),
  dispute_reason TEXT,
  disputed_at TIMESTAMPTZ,
  dispute_resolved_at TIMESTAMPTZ,
  dispute_resolution TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------
-- ESCROW RECORDS (payment proof tracking)
-- ---------------------------------------------------------------
CREATE TABLE escrow_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,

  -- Payment proof
  payment_proof_url TEXT,
  payment_reference TEXT,           -- GCash/Maya reference number
  payment_submitted_at TIMESTAMPTZ,

  -- Verification
  verified_by UUID REFERENCES profiles(id),  -- admin who verified
  verified_at TIMESTAMPTZ,
  verification_notes TEXT,

  -- Release
  released_by UUID REFERENCES profiles(id),  -- admin who released funds
  released_at TIMESTAMPTZ,
  release_notes TEXT,
  seller_payout_reference TEXT,      -- reference for payout to seller

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------
-- SHIPMENT DETAILS
-- ---------------------------------------------------------------
CREATE TABLE shipment_details (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  shipping_method shipping_method NOT NULL,
  tracking_number TEXT,
  tracking_url TEXT,
  courier_receipt_url TEXT,
  shipped_at TIMESTAMPTZ,
  estimated_delivery TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------
-- REVIEWS
-- ---------------------------------------------------------------
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transaction_id UUID NOT NULL REFERENCES transactions(id),
  reviewer_id UUID NOT NULL REFERENCES profiles(id),
  reviewee_id UUID NOT NULL REFERENCES profiles(id),
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  is_seller_review BOOLEAN NOT NULL,  -- true = buyer reviewing seller
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(transaction_id, reviewer_id)
);

-- ---------------------------------------------------------------
-- REPORTS
-- ---------------------------------------------------------------
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id UUID NOT NULL REFERENCES profiles(id),
  reported_user_id UUID REFERENCES profiles(id),
  reported_listing_id UUID REFERENCES listings(id),
  reported_transaction_id UUID REFERENCES transactions(id),

  reason report_reason NOT NULL,
  description TEXT NOT NULL,
  evidence_urls TEXT[],

  status report_status NOT NULL DEFAULT 'pending',

  -- Admin resolution
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMPTZ,
  resolution TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------
-- NOTIFICATIONS
-- ---------------------------------------------------------------
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------
-- ADMIN AUDIT LOG
-- ---------------------------------------------------------------
CREATE TABLE admin_actions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID NOT NULL REFERENCES profiles(id),
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,   -- 'user', 'listing', 'transaction', 'report'
  target_id UUID NOT NULL,
  details JSONB,
  ip_address INET,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------
-- RATE LIMIT TRACKING (for fraud prevention)
-- ---------------------------------------------------------------
CREATE TABLE rate_limit_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  ip_address INET,
  action TEXT NOT NULL,   -- 'create_listing', 'send_report', etc.
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------
-- INDEXES
-- ---------------------------------------------------------------

-- Listings: most common queries
CREATE INDEX idx_listings_seller_id ON listings(seller_id);
CREATE INDEX idx_listings_status ON listings(status);
CREATE INDEX idx_listings_card_set ON listings(card_set);
CREATE INDEX idx_listings_rarity ON listings(rarity);
CREATE INDEX idx_listings_condition ON listings(condition);
CREATE INDEX idx_listings_price ON listings(price);
CREATE INDEX idx_listings_province ON listings(location_province);
CREATE INDEX idx_listings_created_at ON listings(created_at DESC);
CREATE INDEX idx_listings_search_vector ON listings USING GIN(search_vector);

-- GIN index for fuzzy search on card name
CREATE INDEX idx_listings_card_name_trgm ON listings USING GIN(card_name gin_trgm_ops);

-- Transactions
CREATE INDEX idx_transactions_buyer_id ON transactions(buyer_id);
CREATE INDEX idx_transactions_seller_id ON transactions(seller_id);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_listing_id ON transactions(listing_id);

-- Reviews
CREATE INDEX idx_reviews_reviewee_id ON reviews(reviewee_id);
CREATE INDEX idx_reviews_transaction_id ON reviews(transaction_id);

-- Notifications
CREATE INDEX idx_notifications_user_id_unread ON notifications(user_id, is_read) WHERE is_read = false;

-- Reports
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_reports_reported_user ON reports(reported_user_id);

-- Watchlist
CREATE INDEX idx_watchlist_user_id ON watchlist(user_id);
CREATE INDEX idx_watchlist_listing_id ON watchlist(listing_id);

-- ---------------------------------------------------------------
-- FULL TEXT SEARCH — update search vector on insert/update
-- ---------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_listing_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := to_tsvector('english',
    COALESCE(NEW.card_name, '') || ' ' ||
    COALESCE(NEW.title, '') || ' ' ||
    COALESCE(NEW.description, '') || ' ' ||
    COALESCE(NEW.card_number, '') || ' ' ||
    COALESCE(NEW.card_set::text, '') || ' ' ||
    COALESCE(NEW.location_province, '') || ' ' ||
    COALESCE(NEW.location_city, '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_listing_search_vector
  BEFORE INSERT OR UPDATE ON listings
  FOR EACH ROW EXECUTE FUNCTION update_listing_search_vector();

-- ---------------------------------------------------------------
-- AUTO updated_at TRIGGER
-- ---------------------------------------------------------------
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trigger_listings_updated_at
  BEFORE UPDATE ON listings
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trigger_transactions_updated_at
  BEFORE UPDATE ON transactions
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trigger_escrow_updated_at
  BEFORE UPDATE ON escrow_records
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trigger_reviews_updated_at
  BEFORE UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trigger_reports_updated_at
  BEFORE UPDATE ON reports
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ---------------------------------------------------------------
-- FUNCTION: update seller rating after new review
-- ---------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_profile_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles
  SET
    rating_avg = (
      SELECT ROUND(AVG(rating)::numeric, 2)
      FROM reviews
      WHERE reviewee_id = NEW.reviewee_id
    ),
    rating_count = (
      SELECT COUNT(*) FROM reviews WHERE reviewee_id = NEW.reviewee_id
    )
  WHERE id = NEW.reviewee_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_profile_rating
  AFTER INSERT OR UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_profile_rating();

-- ---------------------------------------------------------------
-- FUNCTION: auto-create profile on new auth user
-- ---------------------------------------------------------------
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  base_username TEXT;
  final_username TEXT;
  counter INTEGER := 0;
BEGIN
  base_username := LOWER(SPLIT_PART(NEW.email, '@', 1));
  -- Remove non-alphanumeric chars, keep underscores
  base_username := REGEXP_REPLACE(base_username, '[^a-z0-9_]', '', 'g');
  -- Ensure minimum length
  IF LENGTH(base_username) < 3 THEN
    base_username := base_username || 'user';
  END IF;

  final_username := base_username;

  -- Handle collisions
  WHILE EXISTS (SELECT 1 FROM profiles WHERE username = final_username) LOOP
    counter := counter + 1;
    final_username := base_username || counter::text;
  END LOOP;

  INSERT INTO profiles (id, username, display_name, email, email_verified)
  VALUES (
    NEW.id,
    final_username,
    COALESCE(NEW.raw_user_meta_data->>'full_name', final_username),
    NEW.email,
    NEW.email_confirmed_at IS NOT NULL
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ---------------------------------------------------------------
-- FUNCTION: update listing stats on sold transaction
-- ---------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_seller_stats_on_complete()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    -- Increment seller's total_sales
    UPDATE profiles SET total_sales = total_sales + 1 WHERE id = NEW.seller_id;
    -- Increment buyer's total_purchases
    UPDATE profiles SET total_purchases = total_purchases + 1 WHERE id = NEW.buyer_id;
    -- Mark listing as sold
    UPDATE listings SET status = 'sold' WHERE id = NEW.listing_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_seller_stats
  AFTER UPDATE ON transactions
  FOR EACH ROW EXECUTE FUNCTION update_seller_stats_on_complete();

-- ---------------------------------------------------------------
-- ROW LEVEL SECURITY
-- ---------------------------------------------------------------
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE listing_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE watchlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE escrow_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipment_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE seller_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_actions ENABLE ROW LEVEL SECURITY;

-- Helper function to check admin role
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ------------------- PROFILES policies -------------------
-- Public can view non-banned profiles
CREATE POLICY "profiles_public_read"
  ON profiles FOR SELECT
  USING (is_banned = false OR auth.uid() = id OR is_admin());

-- Users can update their own profile
CREATE POLICY "profiles_own_update"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    -- Prevent self-promoting to admin
    AND role != 'admin'
  );

-- Admins can update any profile
CREATE POLICY "profiles_admin_update"
  ON profiles FOR UPDATE
  USING (is_admin());

-- ------------------- LISTINGS policies -------------------
-- Anyone can read active listings
CREATE POLICY "listings_public_read"
  ON listings FOR SELECT
  USING (status = 'active' OR seller_id = auth.uid() OR is_admin());

-- Authenticated users can create listings
CREATE POLICY "listings_create"
  ON listings FOR INSERT
  WITH CHECK (auth.uid() = seller_id AND auth.role() = 'authenticated');

-- Sellers can update their own listings
CREATE POLICY "listings_seller_update"
  ON listings FOR UPDATE
  USING (auth.uid() = seller_id)
  WITH CHECK (auth.uid() = seller_id);

-- Admins can update any listing
CREATE POLICY "listings_admin_update"
  ON listings FOR UPDATE
  USING (is_admin());

-- ------------------- LISTING IMAGES policies -------------------
CREATE POLICY "listing_images_public_read"
  ON listing_images FOR SELECT USING (true);

CREATE POLICY "listing_images_seller_insert"
  ON listing_images FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM listings
      WHERE id = listing_id AND seller_id = auth.uid()
    )
  );

CREATE POLICY "listing_images_seller_delete"
  ON listing_images FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM listings
      WHERE id = listing_id AND seller_id = auth.uid()
    )
  );

-- ------------------- WATCHLIST policies -------------------
CREATE POLICY "watchlist_own_read"
  ON watchlist FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "watchlist_own_insert"
  ON watchlist FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "watchlist_own_delete"
  ON watchlist FOR DELETE USING (user_id = auth.uid());

-- ------------------- TRANSACTIONS policies -------------------
-- Buyer and seller can read their transactions; admins can read all
CREATE POLICY "transactions_parties_read"
  ON transactions FOR SELECT
  USING (buyer_id = auth.uid() OR seller_id = auth.uid() OR is_admin());

-- Buyers initiate transactions
CREATE POLICY "transactions_buyer_create"
  ON transactions FOR INSERT
  WITH CHECK (auth.uid() = buyer_id);

-- Parties can update their transactions; admins can always
CREATE POLICY "transactions_parties_update"
  ON transactions FOR UPDATE
  USING (buyer_id = auth.uid() OR seller_id = auth.uid() OR is_admin());

-- ------------------- ESCROW RECORDS policies -------------------
CREATE POLICY "escrow_parties_read"
  ON escrow_records FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM transactions t
      WHERE t.id = transaction_id
        AND (t.buyer_id = auth.uid() OR t.seller_id = auth.uid())
    ) OR is_admin()
  );

CREATE POLICY "escrow_buyer_insert"
  ON escrow_records FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM transactions t
      WHERE t.id = transaction_id AND t.buyer_id = auth.uid()
    )
  );

CREATE POLICY "escrow_admin_update"
  ON escrow_records FOR UPDATE USING (is_admin());

-- ------------------- SHIPMENT DETAILS policies -------------------
CREATE POLICY "shipment_parties_read"
  ON shipment_details FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM transactions t
      WHERE t.id = transaction_id
        AND (t.buyer_id = auth.uid() OR t.seller_id = auth.uid())
    ) OR is_admin()
  );

CREATE POLICY "shipment_seller_insert"
  ON shipment_details FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM transactions t
      WHERE t.id = transaction_id AND t.seller_id = auth.uid()
    )
  );

CREATE POLICY "shipment_seller_update"
  ON shipment_details FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM transactions t
      WHERE t.id = transaction_id AND t.seller_id = auth.uid()
    ) OR is_admin()
  );

-- ------------------- REVIEWS policies -------------------
CREATE POLICY "reviews_public_read"
  ON reviews FOR SELECT USING (true);

CREATE POLICY "reviews_create"
  ON reviews FOR INSERT
  WITH CHECK (
    auth.uid() = reviewer_id
    AND EXISTS (
      SELECT 1 FROM transactions t
      WHERE t.id = transaction_id
        AND t.status = 'completed'
        AND (t.buyer_id = auth.uid() OR t.seller_id = auth.uid())
    )
  );

-- ------------------- REPORTS policies -------------------
CREATE POLICY "reports_reporter_read"
  ON reports FOR SELECT
  USING (reporter_id = auth.uid() OR is_admin());

CREATE POLICY "reports_create"
  ON reports FOR INSERT
  WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "reports_admin_update"
  ON reports FOR UPDATE USING (is_admin());

-- ------------------- NOTIFICATIONS policies -------------------
CREATE POLICY "notifications_own_read"
  ON notifications FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "notifications_own_update"
  ON notifications FOR UPDATE USING (user_id = auth.uid());

-- ------------------- SELLER VERIFICATIONS policies -------------------
CREATE POLICY "verification_own_read"
  ON seller_verifications FOR SELECT
  USING (user_id = auth.uid() OR is_admin());

CREATE POLICY "verification_create"
  ON seller_verifications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "verification_admin_update"
  ON seller_verifications FOR UPDATE USING (is_admin());

-- ------------------- ADMIN ACTIONS policies -------------------
CREATE POLICY "admin_actions_admin_only"
  ON admin_actions FOR ALL USING (is_admin());

-- ---------------------------------------------------------------
-- STORAGE BUCKETS (run in Supabase dashboard or via API)
-- ---------------------------------------------------------------
-- INSERT INTO storage.buckets (id, name, public) VALUES
--   ('listing-images', 'listing-images', true),
--   ('payment-proofs', 'payment-proofs', false),
--   ('verification-docs', 'verification-docs', false),
--   ('avatars', 'avatars', true);

-- ---------------------------------------------------------------
-- SEED: Create default admin (replace with your actual admin user id after signup)
-- ---------------------------------------------------------------
-- UPDATE profiles SET role = 'admin' WHERE email = 'admin@yourdomain.com';
