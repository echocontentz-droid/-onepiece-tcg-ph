import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "The Grandline Marketplace — One Piece TCG Philippines",
    template: "%s | The Grandline Marketplace",
  },
  description:
    "The trusted marketplace for One Piece Trading Card Game players in the Philippines. Buy and sell OP cards safely with escrow protection.",
  keywords: ["One Piece TCG", "trading card game", "Philippines", "buy sell cards", "OP cards", "marketplace", "Grandline"],
  authors: [{ name: "The Grandline Marketplace" }],
  openGraph: {
    type: "website",
    locale: "en_PH",
    title: "The Grandline Marketplace — One Piece TCG Philippines",
    description: "Buy and sell One Piece TCG cards safely with escrow protection.",
    siteName: "The Grandline Marketplace",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="antialiased min-h-screen bg-background font-sans">
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            className: "!bg-card !text-foreground !border !border-border",
            duration: 4000,
            success: { iconTheme: { primary: "#10b981", secondary: "#fff" } },
            error: { iconTheme: { primary: "#ef4444", secondary: "#fff" } },
          }}
        />
      </body>
    </html>
  );
}
