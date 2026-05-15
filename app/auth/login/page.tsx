"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const configured = isSupabaseConfigured();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const sb = getSupabaseBrowserClient();
    if (!sb) {
      setError("Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.");
      return;
    }
    setLoading(true);
    const { error } = await sb.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.push("/companies/novapay");
  }

  async function handleGoogle() {
    const sb = getSupabaseBrowserClient();
    if (!sb) {
      setError("Supabase is not configured.");
      return;
    }
    await sb.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-7rem)] max-w-md items-center px-6">
      <div className="w-full border border-[#1e293b] bg-[#111827] p-8">
        <h1 className="text-xl font-medium text-[#e2e8f0]">Sign in</h1>
        <p className="mt-1 text-sm text-[#64748b]">
          Access your modules, progress and certificates.
        </p>

        {!configured && (
          <div className="mt-4 border border-[#f59e0b]/40 bg-[#f59e0b]/10 p-3 text-xs text-[#f59e0b]">
            Supabase not configured. Auth is in preview mode.
          </div>
        )}

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
          <label className="block text-xs uppercase tracking-wider text-[#64748b]">
            Password
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full border border-[#1e293b] bg-[#1a2235] px-3 py-2 text-sm text-[#e2e8f0] outline-none focus:border-[#06d6a0]"
            />
          </label>

          {error && <p className="text-xs text-[#ef4444]">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#06d6a0] px-4 py-2 text-sm font-medium text-[#0a0f1a] transition hover:bg-[#06d6a0]/90 disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <button
          onClick={handleGoogle}
          className="mt-3 w-full border border-[#1e293b] bg-transparent px-4 py-2 text-sm text-[#e2e8f0] hover:border-[#06d6a0] hover:text-[#06d6a0]"
        >
          Sign in with Google
        </button>

        <p className="mt-6 text-center text-xs text-[#64748b]">
          No account?{" "}
          <Link href="/auth/signup" className="text-[#06d6a0] hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
