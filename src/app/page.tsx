import { Navbar } from "@/components/marketplace/Navbar";
import { Hero, FeaturedSets } from "@/components/marketplace/Hero";
import { Footer } from "@/components/marketplace/Footer";
import { ListingCard } from "@/components/listings/ListingCard";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { TrendingUp, Star } from "lucide-react";
import type { Listing } from "@/types";

// ---------------------------------------------------------------
// Static mock data for preview — replace with Supabase queries
// when you wire up a real project
// ---------------------------------------------------------------
const MOCK_LISTINGS: Listing[] = [
  {
    id: "1", seller_id: "s1", card_name: "Monkey D. Luffy",
    card_number: "OP01-120", card_set: "OP01", rarity: "secret_rare",
    condition: "near_mint", language: "English", is_foil: false, quantity: 1,
    title: "NM Luffy SEC OP01-120 English", description: null,
    price: 8500, is_negotiable: true, location_province: "Metro Manila",
    location_city: "Makati City", allows_meetup: true, meetup_details: "BGC or Makati",
    shipping_options: ["lbc", "jt_express"], shipping_fee: 120,
    free_shipping: false, status: "active", view_count: 243, save_count: 41,
    created_at: new Date(Date.now() - 2 * 3600000).toISOString(),
    updated_at: new Date().toISOString(),
    seller: { id: "s1", username: "luffyfan_ph", display_name: "Nico R.", email: "nico@example.com", phone: null, avatar_url: null, bio: null, role: "seller", province: "Metro Manila", city: "Makati", email_verified: true, phone_verified: true, is_verified_seller: true, is_banned: false, ban_reason: null, total_sales: 87, total_purchases: 12, rating_avg: 4.9, rating_count: 74, member_since: "2023-01-15T00:00:00Z", last_active_at: new Date().toISOString(), preferred_payment: ["gcash"], preferred_shipping: ["lbc"], allow_meetup: true, gcash_number: null, maya_number: null, created_at: "2023-01-15T00:00:00Z", updated_at: new Date().toISOString() },
    images: [{ id: "i1", listing_id: "1", url: "https://placehold.co/300x420/1D3461/E63946?text=Luffy+SEC", storage_path: "", is_primary: true, display_order: 0, created_at: "" }],
  },
  {
    id: "2", seller_id: "s2", card_name: "Roronoa Zoro",
    card_number: "OP01-001", card_set: "OP01", rarity: "leader",
    condition: "mint", language: "Japanese", is_foil: true, quantity: 1,
    title: "Mint JP Zoro Leader FOIL — pack fresh", description: null,
    price: 3200, is_negotiable: false, location_province: "Cebu",
    location_city: "Cebu City", allows_meetup: false, meetup_details: null,
    shipping_options: ["jt_express", "flash_express"], shipping_fee: 150,
    free_shipping: false, status: "active", view_count: 98, save_count: 18,
    created_at: new Date(Date.now() - 5 * 3600000).toISOString(),
    updated_at: new Date().toISOString(),
    seller: { id: "s2", username: "zorogoat", display_name: "Marco D.", email: "marco@example.com", phone: null, avatar_url: null, bio: null, role: "seller", province: "Cebu", city: "Cebu City", email_verified: true, phone_verified: false, is_verified_seller: true, is_banned: false, ban_reason: null, total_sales: 34, total_purchases: 6, rating_avg: 4.7, rating_count: 29, member_since: "2023-06-20T00:00:00Z", last_active_at: new Date().toISOString(), preferred_payment: ["gcash", "maya"], preferred_shipping: ["jt_express"], allow_meetup: false, gcash_number: null, maya_number: null, created_at: "2023-06-20T00:00:00Z", updated_at: new Date().toISOString() },
    images: [{ id: "i2", listing_id: "2", url: "https://placehold.co/300x420/1D3461/F4A261?text=Zoro+Foil", storage_path: "", is_primary: true, display_order: 0, created_at: "" }],
  },
  {
    id: "3", seller_id: "s3", card_name: "Trafalgar Law",
    card_number: "OP05-093", card_set: "OP05", rarity: "super_rare",
    condition: "lightly_played", language: "English", is_foil: false, quantity: 2,
    title: "LP Law SR OP05 — slight edge wear", description: null,
    price: 950, is_negotiable: true, location_province: "Metro Manila",
    location_city: "Quezon City", allows_meetup: true, meetup_details: "SM North EDSA",
    shipping_options: ["lbc"], shipping_fee: 100,
    free_shipping: false, status: "active", view_count: 67, save_count: 9,
    created_at: new Date(Date.now() - 24 * 3600000).toISOString(),
    updated_at: new Date().toISOString(),
    seller: { id: "s3", username: "lawkeeper_ph", display_name: "Ana S.", email: "ana@example.com", phone: null, avatar_url: null, bio: null, role: "user", province: "Metro Manila", city: "Quezon City", email_verified: true, phone_verified: false, is_verified_seller: false, is_banned: false, ban_reason: null, total_sales: 5, total_purchases: 22, rating_avg: 5.0, rating_count: 5, member_since: "2024-02-10T00:00:00Z", last_active_at: new Date().toISOString(), preferred_payment: null, preferred_shipping: null, allow_meetup: true, gcash_number: null, maya_number: null, created_at: "2024-02-10T00:00:00Z", updated_at: new Date().toISOString() },
    images: [{ id: "i3", listing_id: "3", url: "https://placehold.co/300x420/1D3461/A78BFA?text=Law+SR", storage_path: "", is_primary: true, display_order: 0, created_at: "" }],
  },
  {
    id: "4", seller_id: "s4", card_name: "Portgas D. Ace",
    card_number: "OP02-013", card_set: "OP02", rarity: "secret_rare",
    condition: "near_mint", language: "English", is_foil: false, quantity: 1,
    title: "NM Ace SEC OP02-013 English", description: null,
    price: 12000, is_negotiable: false, location_province: "Davao del Sur",
    location_city: "Davao City", allows_meetup: true, meetup_details: "SM Lanang",
    shipping_options: ["lbc", "jt_express"], shipping_fee: 180,
    free_shipping: false, status: "active", view_count: 412, save_count: 88,
    created_at: new Date(Date.now() - 10 * 3600000).toISOString(),
    updated_at: new Date().toISOString(),
    seller: { id: "s4", username: "ace_davao", display_name: "Ben T.", email: "ben@example.com", phone: null, avatar_url: null, bio: null, role: "seller", province: "Davao del Sur", city: "Davao City", email_verified: true, phone_verified: true, is_verified_seller: true, is_banned: false, ban_reason: null, total_sales: 156, total_purchases: 31, rating_avg: 4.8, rating_count: 140, member_since: "2022-11-01T00:00:00Z", last_active_at: new Date().toISOString(), preferred_payment: ["gcash", "maya"], preferred_shipping: ["lbc", "jt_express"], allow_meetup: true, gcash_number: null, maya_number: null, created_at: "2022-11-01T00:00:00Z", updated_at: new Date().toISOString() },
    images: [{ id: "i4", listing_id: "4", url: "https://placehold.co/300x420/1D3461/E63946?text=Ace+SEC", storage_path: "", is_primary: true, display_order: 0, created_at: "" }],
  },
  {
    id: "5", seller_id: "s5", card_name: "Boa Hancock",
    card_number: "OP04-031", card_set: "OP04", rarity: "super_rare",
    condition: "mint", language: "English", is_foil: true, quantity: 1,
    title: "Mint Hancock SR Parallel Foil OP04", description: null,
    price: 1800, is_negotiable: true, location_province: "Laguna",
    location_city: "Santa Rosa", allows_meetup: false, meetup_details: null,
    shipping_options: ["jt_express", "flash_express"], shipping_fee: 130,
    free_shipping: false, status: "active", view_count: 55, save_count: 14,
    created_at: new Date(Date.now() - 48 * 3600000).toISOString(),
    updated_at: new Date().toISOString(),
    seller: { id: "s5", username: "hancock_trader", display_name: "Rica M.", email: "rica@example.com", phone: null, avatar_url: null, bio: null, role: "user", province: "Laguna", city: "Santa Rosa", email_verified: true, phone_verified: false, is_verified_seller: false, is_banned: false, ban_reason: null, total_sales: 11, total_purchases: 8, rating_avg: 4.6, rating_count: 10, member_since: "2023-09-05T00:00:00Z", last_active_at: new Date().toISOString(), preferred_payment: null, preferred_shipping: null, allow_meetup: false, gcash_number: null, maya_number: null, created_at: "2023-09-05T00:00:00Z", updated_at: new Date().toISOString() },
    images: [{ id: "i5", listing_id: "5", url: "https://placehold.co/300x420/1D3461/F4A261?text=Hancock+SR", storage_path: "", is_primary: true, display_order: 0, created_at: "" }],
  },
  {
    id: "6", seller_id: "s1", card_name: "Shanks",
    card_number: "OP09-124", card_set: "OP09", rarity: "secret_rare",
    condition: "near_mint", language: "English", is_foil: false, quantity: 1,
    title: "NM Shanks SEC OP09 — brand new from box", description: null,
    price: 22000, is_negotiable: false, location_province: "Metro Manila",
    location_city: "Makati City", allows_meetup: true, meetup_details: "BGC area",
    shipping_options: ["lbc"], shipping_fee: 120,
    free_shipping: false, status: "active", view_count: 891, save_count: 203,
    created_at: new Date(Date.now() - 1 * 3600000).toISOString(),
    updated_at: new Date().toISOString(),
    seller: { id: "s1", username: "luffyfan_ph", display_name: "Nico R.", email: "nico@example.com", phone: null, avatar_url: null, bio: null, role: "seller", province: "Metro Manila", city: "Makati", email_verified: true, phone_verified: true, is_verified_seller: true, is_banned: false, ban_reason: null, total_sales: 87, total_purchases: 12, rating_avg: 4.9, rating_count: 74, member_since: "2023-01-15T00:00:00Z", last_active_at: new Date().toISOString(), preferred_payment: ["gcash"], preferred_shipping: ["lbc"], allow_meetup: true, gcash_number: null, maya_number: null, created_at: "2023-01-15T00:00:00Z", updated_at: new Date().toISOString() },
    images: [{ id: "i6", listing_id: "6", url: "https://placehold.co/300x420/E63946/ffffff?text=Shanks+SEC", storage_path: "", is_primary: true, display_order: 0, created_at: "" }],
  },
  {
    id: "7", seller_id: "s3", card_name: "Nami",
    card_number: "OP07-085", card_set: "OP07", rarity: "rare",
    condition: "near_mint", language: "English", is_foil: false, quantity: 4,
    title: "NM Nami R OP07 x4 copies", description: null,
    price: 280, is_negotiable: true, location_province: "Metro Manila",
    location_city: "Quezon City", allows_meetup: true, meetup_details: null,
    shipping_options: ["lbc", "grab_padala"], shipping_fee: 90,
    free_shipping: false, status: "active", view_count: 23, save_count: 2,
    created_at: new Date(Date.now() - 72 * 3600000).toISOString(),
    updated_at: new Date().toISOString(),
    seller: { id: "s3", username: "lawkeeper_ph", display_name: "Ana S.", email: "ana@example.com", phone: null, avatar_url: null, bio: null, role: "user", province: "Metro Manila", city: "Quezon City", email_verified: true, phone_verified: false, is_verified_seller: false, is_banned: false, ban_reason: null, total_sales: 5, total_purchases: 22, rating_avg: 5.0, rating_count: 5, member_since: "2024-02-10T00:00:00Z", last_active_at: new Date().toISOString(), preferred_payment: null, preferred_shipping: null, allow_meetup: true, gcash_number: null, maya_number: null, created_at: "2024-02-10T00:00:00Z", updated_at: new Date().toISOString() },
    images: [{ id: "i7", listing_id: "7", url: "https://placehold.co/300x420/1D3461/34D399?text=Nami+R", storage_path: "", is_primary: true, display_order: 0, created_at: "" }],
  },
  {
    id: "8", seller_id: "s4", card_name: "Dracule Mihawk",
    card_number: "OP09-018", card_set: "OP09", rarity: "secret_rare",
    condition: "mint", language: "English", is_foil: false, quantity: 1,
    title: "Mint Mihawk SEC OP09 — sealed in card saver", description: null,
    price: 18500, is_negotiable: false, location_province: "Davao del Sur",
    location_city: "Davao City", allows_meetup: true, meetup_details: "SM Lanang",
    shipping_options: ["lbc", "jt_express"], shipping_fee: 180,
    free_shipping: false, status: "active", view_count: 334, save_count: 71,
    created_at: new Date(Date.now() - 3 * 3600000).toISOString(),
    updated_at: new Date().toISOString(),
    seller: { id: "s4", username: "ace_davao", display_name: "Ben T.", email: "ben@example.com", phone: null, avatar_url: null, bio: null, role: "seller", province: "Davao del Sur", city: "Davao City", email_verified: true, phone_verified: true, is_verified_seller: true, is_banned: false, ban_reason: null, total_sales: 156, total_purchases: 31, rating_avg: 4.8, rating_count: 140, member_since: "2022-11-01T00:00:00Z", last_active_at: new Date().toISOString(), preferred_payment: ["gcash", "maya"], preferred_shipping: ["lbc", "jt_express"], allow_meetup: true, gcash_number: null, maya_number: null, created_at: "2022-11-01T00:00:00Z", updated_at: new Date().toISOString() },
    images: [{ id: "i8", listing_id: "8", url: "https://placehold.co/300x420/1D3461/FBBF24?text=Mihawk+SEC", storage_path: "", is_primary: true, display_order: 0, created_at: "" }],
  },
];

const SECRET_RARES = MOCK_LISTINGS.filter((l) => l.rarity === "secret_rare");

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar user={null} />
      <main className="flex-1">
        <Hero />
        <FeaturedSets />

        {/* Latest listings */}
        <section className="py-10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Latest Listings
                </h2>
                <p className="text-sm text-muted-foreground mt-0.5">Fresh cards from verified sellers</p>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/listings">View all</Link>
              </Button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {MOCK_LISTINGS.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          </div>
        </section>

        {/* Secret Rares */}
        <section className="py-10 bg-muted/30 border-y border-border">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                  <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
                  Secret Rares
                </h2>
                <p className="text-sm text-muted-foreground mt-0.5">The most sought-after cards</p>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/listings?rarity=secret_rare">View all SECs</Link>
              </Button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {SECRET_RARES.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          </div>
        </section>

        {/* Why us */}
        <section className="py-16 bg-background">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 text-center">
            <h2 className="text-3xl font-bold mb-3">Why use OP TCG PH?</h2>
            <p className="text-muted-foreground mb-12 max-w-xl mx-auto">
              Stop risking your money in unprotected Facebook deals.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                { icon: "🔒", title: "Escrow Protection", desc: "We hold your payment until you confirm receipt. Seller only gets paid when you're satisfied." },
                { icon: "✅", title: "Verified Sellers", desc: "Sellers submit government ID for manual verification. Look for the blue shield badge." },
                { icon: "⭐", title: "Honest Ratings", desc: "Reviews are only allowed after completed transactions — no fake reviews possible." },
                { icon: "📦", title: "LBC & J&T Built-in", desc: "Choose LBC, J&T Express, Flash Express, or meetup directly on the listing." },
                { icon: "💙", title: "GCash & Maya", desc: "Pay via GCash or Maya. Funds go to our escrow account — never directly to sellers." },
                { icon: "⚖️", title: "Dispute Resolution", desc: "Received the wrong card? File a dispute. Our team reviews evidence and makes the call." },
              ].map(({ icon, title, desc }) => (
                <div key={title} className="rounded-2xl border border-border bg-card p-6 text-left">
                  <div className="text-3xl mb-3">{icon}</div>
                  <h3 className="font-semibold text-foreground mb-2">{title}</h3>
                  <p className="text-sm text-muted-foreground">{desc}</p>
                </div>
              ))}
            </div>
            <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
              <Button size="lg" asChild>
                <Link href="/register">Get Started Free</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/listings">Browse Cards</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
