"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import type { Role } from "@/lib/auth/types";

interface NavLink {
  href: string;
  label: string;
}

const NAV_BY_ROLE: Record<Role, NavLink[]> = {
  learner: [
    { href: "/companies/novapay", label: "Companies" },
    { href: "/pricing", label: "Pricing" },
    { href: "/account/progress", label: "My Progress" },
  ],
  instructor: [
    { href: "/companies/novapay", label: "Companies" },
    { href: "/cohorts", label: "My Cohorts" },
    { href: "/cohorts/progress", label: "Student Progress" },
  ],
  institution: [
    { href: "/companies/novapay", label: "Companies" },
    { href: "/cohorts", label: "Cohorts" },
    { href: "/admin/analytics", label: "Analytics" },
  ],
  admin: [
    { href: "/companies/novapay", label: "Companies" },
    { href: "/admin/users", label: "All Users" },
    { href: "/admin/submissions", label: "All Submissions" },
  ],
};

const PUBLIC_NAV: NavLink[] = [
  { href: "/companies/novapay", label: "Companies" },
  { href: "/pricing", label: "Pricing" },
];

export function SiteHeader() {
  const router = useRouter();
  const auth = useAuth();
  if (!auth) return null;
  const { user, role, isLoading, signOut } = auth;

  const navLinks = user && role ? NAV_BY_ROLE[role] : PUBLIC_NAV;

  async function handleSignOut() {
    await signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-40 border-b border-[#1e293b] bg-[#0a0f1a]/85 backdrop-blur supports-[backdrop-filter]:bg-[#0a0f1a]/70">
      <div className="mx-auto flex h-14 max-w-[1280px] items-center justify-between px-6">
        <Link
          href="/"
          className="font-mono text-[15px] tracking-tight hover:opacity-90"
        >
          <span className="text-[#06d6a0]">RealityDb</span>{" "}
          <span className="text-[#00f5d4]">Atelier</span>
        </Link>
        <nav className="flex items-center gap-6 text-sm text-[#e2e8f0]/80">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-[#e2e8f0]">
              {link.label}
            </Link>
          ))}

          {isLoading ? (
            <span className="text-xs text-[#64748b]">…</span>
          ) : user ? (
            <button
              onClick={handleSignOut}
              className="rounded-md border border-[#1e293b] px-3 py-1.5 text-[#e2e8f0] hover:border-[#06d6a0] hover:text-[#06d6a0]"
            >
              Sign Out
            </button>
          ) : (
            <Link
              href="/auth/login"
              className="rounded-md border border-[#1e293b] px-3 py-1.5 text-[#e2e8f0] hover:border-[#06d6a0] hover:text-[#06d6a0]"
            >
              Sign In
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
