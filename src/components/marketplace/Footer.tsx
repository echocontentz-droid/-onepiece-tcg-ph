import Link from "next/link";
import { Shield, Heart } from "lucide-react";

const LINKS = {
  Marketplace: [
    { label: "Browse Cards", href: "/listings" },
    { label: "Sell a Card", href: "/listings/create" },
    { label: "Latest Set (OP09)", href: "/listings?card_set=OP09" },
    { label: "Secret Rares", href: "/listings?rarity=secret_rare" },
  ],
  Support: [
    { label: "How Escrow Works", href: "/how-it-works" },
    { label: "Buyer Protection", href: "/buyer-protection" },
    { label: "Become Verified", href: "/verification" },
    { label: "Report a Scam", href: "/report" },
  ],
  Legal: [
    { label: "Terms of Service", href: "/terms" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Cookie Policy", href: "/cookies" },
    { label: "Acceptable Use", href: "/acceptable-use" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-border bg-background mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <span className="text-sm font-bold text-white">GL</span>
              </div>
              <span className="font-bold text-foreground">
                Grandline <span className="text-primary">Market</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground mb-4">
              The trusted marketplace for One Piece TCG players in the Philippines.
              Safe. Transparent. Community-driven.
            </p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Shield className="h-3.5 w-3.5 text-primary" />
              <span>Escrow-protected transactions</span>
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(LINKS).map(([section, links]) => (
            <div key={section}>
              <h3 className="text-sm font-semibold text-foreground mb-3">{section}</h3>
              <ul className="space-y-2">
                {links.map(({ label, href }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 border-t border-border pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} The Grandline Marketplace. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            Made with <Heart className="h-3 w-3 text-primary fill-primary" /> by Filipino players, for Filipino players.
          </p>
        </div>
      </div>
    </footer>
  );
}
