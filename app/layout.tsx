import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { cn } from "@/lib/utils";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "RealityDB Atelier — The business school that runs on live data",
  description:
    "Six synthetic companies. Real PostgreSQL databases. One CEO briefing that proves you understand the business.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://atelier.realitydb.dev"
  ),
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={cn("dark", inter.variable, jetbrainsMono.variable)}
      style={{ colorScheme: "dark" }}
      suppressHydrationWarning
    >
      <body
        className="min-h-screen bg-background text-foreground antialiased font-sans"
        style={{ backgroundColor: "#0a0f1a" }}
      >
        <div className="flex min-h-screen flex-col">
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}

function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-[#1e293b] bg-[#0a0f1a]/85 backdrop-blur supports-[backdrop-filter]:bg-[#0a0f1a]/70">
      <div className="mx-auto flex h-14 max-w-[1280px] items-center justify-between px-6">
        <Link
          href="/"
          className="font-mono text-[15px] tracking-tight text-[#06d6a0] hover:opacity-90"
        >
          RealityDB Atelier
        </Link>
        <nav className="flex items-center gap-6 text-sm text-[#e2e8f0]/80">
          <Link href="/companies/novapay" className="hover:text-[#e2e8f0]">
            Companies
          </Link>
          <Link href="/pricing" className="hover:text-[#e2e8f0]">
            Pricing
          </Link>
          <Link
            href="/auth/login"
            className="rounded-md border border-[#1e293b] px-3 py-1.5 text-[#e2e8f0] hover:border-[#06d6a0] hover:text-[#06d6a0]"
          >
            Sign In
          </Link>
        </nav>
      </div>
    </header>
  );
}

function SiteFooter() {
  return (
    <footer className="border-t border-[#1e293b] bg-[#0a0f1a]">
      <div className="mx-auto max-w-[1280px] px-6 py-8 text-center text-xs text-[#64748b]">
        Powered by RealityDB · Mpingo Systems LLC · Charlotte, NC
      </div>
    </footer>
  );
}
