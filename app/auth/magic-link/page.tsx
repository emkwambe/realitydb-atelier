"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { getSupabaseBrowserClient, getSiteUrl, isSupabaseConfigured } from "@/lib/supabase";
import { humanizeAuthError } from "@/lib/auth/errors";

function MagicLinkInner() {
  const params = useSearchParams();
  const next = params.get("next") || "/companies/novapay";

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const configured = isSupabaseConfigured();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const sb = getSupabaseBrowserClient();
    if (!sb) {
      setError("Supabase is not configured.");
      return;
    }
    setLoading(true);
    const { error: linkError } = await sb.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${getSiteUrl()}/auth/callback?next=${encodeURIComponent(next)}`,
        shouldCreateUser: false,
      },
    });
    setLoading(false);
    if (linkError) {
      setError(humanizeAuthError(linkError.message));
      return;
    }
    setSent(true);
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-7rem)] max-w-md items-center px-6">
      <div className="w-full border border-[#1e293b] bg-[#111827] p-8">
        <h1 className="text-xl font-medium text-[#e2e8f0]">Sign in with a magic link</h1>
        <p className="mt-1 text-sm text-[#64748b]">
          We&apos;ll email you a one-time link. No password needed.
        </p>

        {!configured && (
          <div className="mt-4 border border-[#f59e0b]/40 bg-[#f59e0b]/10 p-3 text-xs text-[#f59e0b]">
            Supabase not configured. Auth is in preview mode.
          </div>
        )}

        {sent ? (
          <div className="mt-6 border border-[#06d6a0]/40 bg-[#06d6a0]/5 p-4 text-sm text-[#e2e8f0]">
            <p className="font-medium text-[#06d6a0]">Check your inbox</p>
            <p className="mt-1 text-xs text-[#64748b]">
              We sent a sign-in link to <span className="text-[#e2e8f0]">{email}</span>. The link
              expires in 1 hour.
            </p>
            <button
              onClick={() => setSent(false)}
              className="mt-3 text-xs text-[#06d6a0] hover:underline"
            >
              Use a different email
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <label className="block text-xs uppercase tracking-wider text-[#64748b]">
              Email
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full border border-[#1e293b] bg-[#1a2235] px-3 py-2 text-sm text-[#e2e8f0] outline-none focus:border-[#06d6a0]"
              />
            </label>

            {error && <p className="text-xs text-[#ef4444]">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#06d6a0] px-4 py-2 text-sm font-medium text-[#0a0f1a] transition hover:bg-[#06d6a0]/90 disabled:opacity-50"
            >
              {loading ? "Sending..." : "Send link"}
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-xs text-[#64748b]">
          Prefer a password?{" "}
          <Link href="/auth/login" className="text-[#06d6a0] hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function MagicLinkPage() {
  return (
    <Suspense fallback={<div className="px-6 py-12 text-sm text-[#64748b]">Loading…</div>}>
      <MagicLinkInner />
    </Suspense>
  );
}
