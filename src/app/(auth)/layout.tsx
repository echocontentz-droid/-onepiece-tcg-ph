import Link from "next/link";
import { Shield } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex flex-col w-1/2 bg-op-navy-dark relative overflow-hidden">
        {/* Pattern overlay */}
        <div className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `radial-gradient(circle, white 1px, transparent 1px)`,
            backgroundSize: "30px 30px",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-op-red/30 via-transparent to-op-gold/20" />

        <div className="relative flex flex-col h-full p-12">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
              <span className="font-bold text-white">OP</span>
            </div>
            <span className="text-xl font-bold text-white">
              TCG <span className="text-op-gold">PH</span>
            </span>
          </Link>

          <div className="flex-1 flex flex-col justify-center">
            <h2 className="text-4xl font-extrabold text-white mb-4">
              Trade One Piece TCG<br />
              <span className="text-op-gold">with confidence.</span>
            </h2>
            <p className="text-white/70 text-lg mb-8">
              The Philippines' most trusted marketplace for One Piece Trading Card Game players.
            </p>

            <div className="space-y-4">
              {[
                { icon: "🔒", title: "Escrow Protection", desc: "Funds held safely until delivery confirmed" },
                { icon: "✅", title: "Verified Sellers", desc: "ID-verified sellers with transaction history" },
                { icon: "⭐", title: "Real Reviews", desc: "Honest ratings from real transactions only" },
                { icon: "🚚", title: "LBC & J&T Support", desc: "Integrated PH shipping options" },
              ].map(({ icon, title, desc }) => (
                <div key={title} className="flex items-start gap-3">
                  <span className="text-2xl">{icon}</span>
                  <div>
                    <p className="font-semibold text-white">{title}</p>
                    <p className="text-sm text-white/60">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p className="text-white/40 text-xs">
            © {new Date().getFullYear()} OP TCG PH. Philippines.
          </p>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex flex-1 flex-col items-center justify-center p-6 lg:p-12 bg-background">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <Link href="/" className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <span className="text-sm font-bold text-white">OP</span>
            </div>
            <span className="font-bold text-foreground">
              TCG <span className="text-primary">PH</span>
            </span>
          </Link>

          {children}
        </div>
      </div>
    </div>
  );
}
