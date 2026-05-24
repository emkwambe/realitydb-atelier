import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { AppChrome } from "@/components/layout/AppChrome";
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
  title: "RealityDb Atelier — The business school that runs on live data",
  description:
    "Live synthetic companies. Real PostgreSQL databases. One CEO briefing — auto-graded and ranked.",
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
          <AppChrome>{children}</AppChrome>
        </AuthProvider>
      </body>
    </html>
  );
}
