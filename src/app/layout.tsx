import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cardhaus",
  description: "A home for trading card collectors.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
