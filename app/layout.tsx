import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { AuthProvider } from "@/lib/auth/AuthProvider";

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
    "Six synthetic companies. Real PostgreSQL databases. One CEO briefing — auto-graded and ranked.",
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
        <AuthProvider>
          <div className="flex min-h-screen flex-col">
            <SiteHeader />
            <main className="flex-1">{children}</main>
            <SiteFooter />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}

function SiteFooter() {
  return (
    <footer className="border-t border-[#1e293b] bg-[#0a0f1a]">
      <div className="mx-auto max-w-[1280px] px-6 py-8 text-center text-xs text-[#64748b]">
        Powered by <span className="text-[#06d6a0]">RealityDB</span> ·{" "}
        <span className="text-[#00f5d4]">Mpingo Systems LLC</span> · Charlotte, NC
      </div>
    </footer>
  );
}
