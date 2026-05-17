"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { getSupabaseBrowserClient, getSiteUrl, isSupabaseConfigured } from "@/lib/supabase";

type Mode = "password" | "magic-link";

function LoginInner() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/companies/novapay";
  const errorParam = params.get("error");

  const [mode, setMode] = useState<Mode>("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(errorParam ? "Sign-in failed. Please try again." : null);
  const [message, setMessage] = useState<string | null>(null);
  const configured = isSupabaseConfigured();

  async function handlePassword(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    const sb = getSupabaseBrowserClient();
    if (!sb) {
      setError("Supabase is not configured.");
      return;
    }
    setLoading(true);
    const { error: signInError } = await sb.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (signInError) {
      setError(humanizeAuthError(signInError.message));
      return;
    }
    window.location.href = next;
  }

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
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
    setMessage("Check your inbox — we just sent you a sign-in link.");
  }

  async function handleGoogle() {
    setError(null);
    const sb = getSupabaseBrowserClient();
    if (!sb) {
      setError("Supabase is not configured.");
      return;
    }
    await sb.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${getSiteUrl()}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-7rem)] max-w-md items-center px-6">
      <div className="w-full border border-[#1e293b] bg-[#111827] p-8">
        <h1 className="text-xl font-medium text-[#e2e8f0]">Sign in</h1>
        <p className="mt-1 text-sm text-[#64748b]">
          Access your modules, progress, and certificates.
        </p>

        {!configured && (
          <div className="mt-4 border border-[#f59e0b]/40 bg-[#f59e0b]/10 p-3 text-xs text-[#f59e0b]">
            Supabase not configured. Auth is in preview mode.
          </div>
        )}

        <div className="mt-6 flex border border-[#1e293b]">
          <button
            type="button"
            onClick={() => {
              setMode("password");
              setMessage(null);
              setError(null);
            }}
            className={`flex-1 px-3 py-2 text-xs uppercase tracking-wider transition ${
              mode === "password"
                ? "bg-[#1a2235] text-[#06d6a0]"
                : "text-[#64748b] hover:text-[#e2e8f0]"
            }`}
          >
            Password
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("magic-link");
              setMessage(null);
              setError(null);
            }}
            className={`flex-1 border-l border-[#1e293b] px-3 py-2 text-xs uppercase tracking-wider transition ${
              mode === "magic-link"
                ? "bg-[#1a2235] text-[#06d6a0]"
                : "text-[#64748b] hover:text-[#e2e8f0]"
            }`}
          >
            Magic link
          </button>
        </div>

        {mode === "password" ? (
          <form onSubmit={handlePassword} className="mt-6 space-y-4">
            <Field label="Email" type="email" value={email} onChange={setEmail} />
            <Field label="Password" type="password" value={password} onChange={setPassword} />
            <SubmitButton loading={loading} label="Sign in" />
          </form>
        ) : (
          <form onSubmit={handleMagicLink} className="mt-6 space-y-4">
            <Field label="Email" type="email" value={email} onChange={setEmail} />
            <SubmitButton loading={loading} label="Send magic link" />
          </form>
        )}

        {error && <p className="mt-4 text-xs text-[#ef4444]">{error}</p>}
        {message && <p className="mt-4 text-xs text-[#06d6a0]">{message}</p>}

        <div className="my-6 flex items-center gap-3 text-[10px] uppercase tracking-wider text-[#64748b]">
          <div className="h-px flex-1 bg-[#1e293b]" />
          or
          <div className="h-px flex-1 bg-[#1e293b]" />
        </div>

        <button
          onClick={handleGoogle}
          className="w-full border border-[#1e293b] bg-transparent px-4 py-2 text-sm text-[#e2e8f0] transition hover:border-[#06d6a0] hover:text-[#06d6a0]"
        >
          Continue with Google
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

function Field({
  label,
  type,
  value,
  onChange,
}: {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block text-xs uppercase tracking-wider text-[#64748b]">
      {label}
      <input
        type={type}
        required
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 block w-full border border-[#1e293b] bg-[#1a2235] px-3 py-2 text-sm text-[#e2e8f0] outline-none focus:border-[#06d6a0]"
      />
    </label>
  );
}

function SubmitButton({ loading, label }: { loading: boolean; label: string }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="w-full bg-[#06d6a0] px-4 py-2 text-sm font-medium text-[#0a0f1a] transition hover:bg-[#06d6a0]/90 disabled:opacity-50"
    >
      {loading ? "Working..." : label}
    </button>
  );
}

function humanizeAuthError(msg: string): string {
  if (/invalid login credentials/i.test(msg)) return "Incorrect email or password.";
  if (/email not confirmed/i.test(msg)) return "Please confirm your email — check your inbox.";
  if (/rate.?limit/i.test(msg)) return "Too many attempts. Please wait a moment and try again.";
  if (/user not found/i.test(msg)) return "No account with that email. Create one first.";
  return msg;
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="px-6 py-12 text-sm text-[#64748b]">Loading…</div>}>
      <LoginInner />
    </Suspense>
  );
}