"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import {
  Search, Bell, Plus, User, LogOut, Settings,
  LayoutDashboard, Shield, Menu, X, ChevronDown,
  Package, Heart
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn, initials } from "@/lib/utils";
import type { Profile } from "@/types";

interface NavbarProps {
  user?: Profile | null;
}

export function Navbar({ user }: NavbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/listings?search=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleSignOut = () => {
    router.push("/");
    router.refresh();
  };

  const navLinks = [
    { href: "/listings", label: "Browse Cards" },
    { href: "/listings?rarity=secret_rare", label: "Secret Rares" },
    { href: "/listings?card_set=OP09", label: "Latest Set" },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center gap-4">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <span className="text-sm font-bold text-white">OP</span>
            </div>
            <span className="hidden font-bold text-foreground sm:block">
              TCG <span className="text-primary">PH</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  pathname === link.href
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1 max-w-md mx-auto hidden sm:block">
            <Input
              type="search"
              placeholder="Search card name, set..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              icon={<Search className="h-4 w-4" />}
              className="h-9 bg-muted border-none"
            />
          </form>

          {/* Right side */}
          <div className="flex items-center gap-2 ml-auto">
            {user ? (
              <>
                {/* Sell button */}
                <Button
                  asChild
                  size="sm"
                  className="hidden sm:inline-flex"
                >
                  <Link href="/listings/create">
                    <Plus className="h-4 w-4" />
                    Sell
                  </Link>
                </Button>

                {/* Notifications */}
                <Button variant="ghost" size="icon" asChild>
                  <Link href="/dashboard/notifications">
                    <Bell className="h-5 w-5" />
                  </Link>
                </Button>

                {/* User menu */}
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-muted transition-colors"
                  >
                    <div className="h-8 w-8 rounded-full overflow-hidden bg-primary/20 flex items-center justify-center">
                      {user.avatar_url ? (
                        <Image
                          src={user.avatar_url}
                          alt={user.display_name}
                          width={32}
                          height={32}
                          className="object-cover"
                        />
                      ) : (
                        <span className="text-xs font-bold text-primary">
                          {initials(user.display_name)}
                        </span>
                      )}
                    </div>
                    <div className="hidden md:block text-left">
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-medium">{user.display_name}</span>
                        {user.is_verified_seller && (
                          <Shield className="h-3.5 w-3.5 text-blue-500" />
                        )}
                      </div>
                    </div>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </button>

                  {userMenuOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setUserMenuOpen(false)}
                      />
                      <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-border bg-card shadow-xl z-20 overflow-hidden">
                        <div className="px-4 py-3 border-b border-border">
                          <p className="text-sm font-medium">{user.display_name}</p>
                          <p className="text-xs text-muted-foreground">@{user.username}</p>
                        </div>
                        <div className="py-1">
                          <DropdownLink href="/dashboard" icon={<LayoutDashboard className="h-4 w-4" />} onClick={() => setUserMenuOpen(false)}>
                            Dashboard
                          </DropdownLink>
                          <DropdownLink href={`/profile/${user.username}`} icon={<User className="h-4 w-4" />} onClick={() => setUserMenuOpen(false)}>
                            My Profile
                          </DropdownLink>
                          <DropdownLink href="/dashboard/listings" icon={<Package className="h-4 w-4" />} onClick={() => setUserMenuOpen(false)}>
                            My Listings
                          </DropdownLink>
                          <DropdownLink href="/dashboard/watchlist" icon={<Heart className="h-4 w-4" />} onClick={() => setUserMenuOpen(false)}>
                            Watchlist
                          </DropdownLink>
                          <DropdownLink href="/settings" icon={<Settings className="h-4 w-4" />} onClick={() => setUserMenuOpen(false)}>
                            Settings
                          </DropdownLink>
                          {user.role === "admin" && (
                            <DropdownLink href="/admin" icon={<Shield className="h-4 w-4 text-primary" />} onClick={() => setUserMenuOpen(false)}>
                              <span className="text-primary font-medium">Admin Panel</span>
                            </DropdownLink>
                          )}
                        </div>
                        <div className="border-t border-border py-1">
                          <button
                            onClick={() => { setUserMenuOpen(false); handleSignOut(); }}
                            className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                          >
                            <LogOut className="h-4 w-4" />
                            Sign Out
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/login">Sign In</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/register">Join Free</Link>
                </Button>
              </div>
            )}

            {/* Mobile menu toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile search */}
        <div className="pb-3 sm:hidden">
          <form onSubmit={handleSearch}>
            <Input
              type="search"
              placeholder="Search cards..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              icon={<Search className="h-4 w-4" />}
              className="h-9 bg-muted border-none"
            />
          </form>
        </div>
      </div>

      {/* Mobile nav */}
      {menuOpen && (
        <div className="lg:hidden border-t border-border bg-background px-4 py-3 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted"
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          {user && (
            <Link
              href="/listings/create"
              className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-primary"
              onClick={() => setMenuOpen(false)}
            >
              <Plus className="h-4 w-4" />
              Sell a Card
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}

function DropdownLink({
  href,
  icon,
  children,
  onClick,
}: {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors"
    >
      <span className="text-muted-foreground">{icon}</span>
      {children}
    </Link>
  );
}
