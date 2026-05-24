"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SiteHeader } from "@/components/layout/SiteHeader";

// Routes that render without nav chrome — full-bleed conversion
// pages. Matched by exact path or as a prefix (e.g. /waitlist plus
// any future /waitlist/thanks). Keep the list short; chrome is the
// default everywhere else.
const STANDALONE_PREFIXES: readonly string[] = ["/waitlist"];

function isStandalone(pathname: string | null): boolean {
  if (!pathname) return false;
  return STANDALONE_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
}

export function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (isStandalone(pathname)) {
    return <main className="min-h-screen">{children}</main>;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}

function SiteFooter() {
  return (
    <footer className="border-t border-[#1e293b] bg-[#0a0f1a]">
      <div className="mx-auto max-w-[1280px] px-6 py-8 text-center text-xs text-[#64748b]">
        Powered by <span className="text-[#06d6a0]">RealityDb</span> ·{" "}
        <span className="text-[#00f5d4]">Mpingo Systems LLC</span> · Raleigh, NC
        {" · "}
        <Link href="/legal/privacy" className="hover:text-[#06d6a0]">
          Privacy Policy
        </Link>
        {" · "}
        <Link href="/legal/terms" className="hover:text-[#06d6a0]">
          Terms of Service
        </Link>
      </div>
    </footer>
  );
}
