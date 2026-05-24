"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import type { Role } from "@/lib/auth/types";

interface NavLink {
  href: string;
  label: string;
  badge?: string;
}

const HOT_CASES_LINK: NavLink = {
  href: "/hot-cases",
  label: "Hot Cases",
  badge: "FREE",
};

const NAV_BY_ROLE: Record<Role, NavLink[]> = {
  learner: [
    { href: "/companies/novapay", label: "Companies" },
    HOT_CASES_LINK,
    { href: "/pricing", label: "Pricing" },
    { href: "/account/progress", label: "My Progress" },
  ],
  instructor: [
    { href: "/companies/novapay", label: "Companies" },
    HOT_CASES_LINK,
    { href: "/cohorts", label: "My Cohorts" },
    { href: "/cohorts/progress", label: "Student Progress" },
  ],
  institution: [
    { href: "/companies/novapay", label: "Companies" },
    HOT_CASES_LINK,
    { href: "/cohorts", label: "Cohorts" },
    { href: "/admin/analytics", label: "Analytics" },
  ],
  admin: [
    { href: "/companies/novapay", label: "Companies" },
    HOT_CASES_LINK,
    { href: "/admin/users", label: "All Users" },
    { href: "/admin/submissions", label: "All Submissions" },
  ],
};

const PUBLIC_NAV: NavLink[] = [
  { href: "/companies/novapay", label: "Companies" },
  HOT_CASES_LINK,
  { href: "/pricing", label: "Pricing" },
];

export function SiteHeader() {
  const router = useRouter();
  const auth = useAuth();
  // The server can't see the browser's auth cookies during initial render,
  // so it always emits PUBLIC_NAV + the Sign In button. Defer the
  // auth-derived nav until after hydration to keep the first client paint
  // byte-identical to the server output — otherwise React throws a
  // hydration mismatch when the role-specific nav items differ in count.
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const { user, role, isAdmin, isLoading, signOut } = auth;
  const showAuthenticatedNav = mounted && user && role;
  const navLinks = showAuthenticatedNav ? NAV_BY_ROLE[role] : PUBLIC_NAV;
  // Admin link is additive — appended after the role nav for any admin
  // user. Gate on `mounted` for the same hydration reason as the rest of
  // the auth-derived nav.
  const showAdminLink = mounted && isAdmin;

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
            <Link
              key={link.href}
              href={link.href}
              className="inline-flex items-center gap-1.5 hover:text-[#e2e8f0]"
            >
              {link.label}
              {link.badge && (
                <span className="rounded-sm bg-[#00f5d4]/15 px-1.5 py-0.5 font-mono text-[9px] font-medium uppercase tracking-wider text-[#00f5d4]">
                  {link.badge}
                </span>
              )}
            </Link>
          ))}

          {showAdminLink && (
            <Link
              href="/admin/hot-cases"
              className="inline-flex items-center gap-1.5 hover:text-[#e2e8f0]"
            >
              Admin
            </Link>
          )}

          {!mounted || isLoading ? (
            <Link
              href="/auth/login"
              className="rounded-md border border-[#1e293b] px-3 py-1.5 text-[#e2e8f0] hover:border-[#06d6a0] hover:text-[#06d6a0]"
            >
              Sign In
            </Link>
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
