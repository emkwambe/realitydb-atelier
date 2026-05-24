"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  getSupabaseBrowserClient,
  getSupabaseOtpClient,
  getSiteUrl,
  isSupabaseConfigured,
} from "@/lib/supabase";

// Treat a path as safe to navigate to post-signup. Reject anything starting
// with "//" or "http" so an attacker can't craft ?next=https://evil.com.
function safeNext(target: string): string {
  if (!target.startsWith("/") || target.startsWith("//")) return "/companies/novapay";
  return target;
}

type AccountType = "individual" | "university" | "corporate";

const ACCOUNT_TYPES: { value: AccountType; label: string; description: string }[] = [
  {
    value: "individual",
    label: "Individual professional",
    description: "Self-directed learning. Free tier includes NovaPay.",
  },
  {
    value: "university",
    label: "University student",
    description: "Joining as part of an MBA or analytics program.",
  },
  {
    value: "corporate",
    label: "Corporate team member",
    description: "Invited by your employer. Requires invite link.",
  },
];

function SignupInner() {
  const params = useSearchParams();
  // If signup was reached from a pricing CTA (e.g. /pricing → /checkout/start
  // bounces here when not signed in), preserve plan + billing through the
  // verification round-trip. The auth callback reads `next` and lands the
  // user on /checkout/start once their email is confirmed.
  const planParam = params.get("plan");
  const billingParam = params.get("billing");
  const explicitNext = params.get("next");
  const next = explicitNext
    ? explicitNext
    : planParam
      ? `/checkout/start?plan=${encodeURIComponent(planParam)}${billingParam ? `&billing=${encodeURIComponent(billingParam)}` : ""}`
      : "/companies/novapay";

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [accountType, setAccountType] = useState<AccountType>("individual");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const configured = isSupabaseConfigured();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!acceptedTerms) {
      setError("Please accept the terms to continue.");
      return;
    }
    if (accountType === "corporate") {
      setError("Corporate accounts are invite-only. Please use the link your employer sent.");
      return;
    }

    // Sign up via the implicit-flow OTP client (see lib/supabase.ts) so the
    // confirmation email link works when opened in a different browser than
    // the one that submitted the form. PKCE links require the verifier
    // cookie on the *original* browser and silently fail otherwise.
    const otpClient = getSupabaseOtpClient();
    if (!otpClient) {
      setError("Supabase is not configured.");
      return;
    }

    setLoading(true);
    const { data, error: signUpError } = await otpClient.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${getSiteUrl()}/auth/callback?next=${encodeURIComponent(next)}`,
        data: {
          full_name: fullName,
          account_type: accountType,
        },
      },
    });

    if (signUpError) {
      setLoading(false);
      setError(humanizeError(signUpError.message));
      return;
    }

    // If the Supabase project has email confirmation disabled, signUp() returns
    // an immediately-usable session. Drop the user straight into the app
    // (or onward to checkout) — making them sit on a "check your inbox"
    // screen when no email is coming is the loop we're fixing.
    //
    // The OTP client has persistSession=false, so the returned session is
    // not written anywhere automatically — transplant it onto the real
    // browser session client (which writes the sb-*-auth-token cookies the
    // middleware reads). If a session is NOT present, confirmation IS
    // required — show the verification message instead.
    if (data.session) {
      const sb = getSupabaseBrowserClient();
      if (sb) {
        await sb.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        });
      }
      // Hard navigation so the proxy reads the freshly-written
      // sb-*-auth-token cookies on the first request to the protected route.
      // router.push() can race the cookie write and bounce to /auth/login.
      window.location.href = safeNext(next);
      return;
    }

    setLoading(false);
    setMessage(
      planParam
        ? `Check your inbox at ${email} for a verification link. After you confirm, we'll send you to Stripe Checkout for the ${planParam} plan.`
        : `Check your inbox at ${email} for a verification link. Click it to activate your account.`
    );
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-7rem)] max-w-md items-center px-6 py-8">
      <div className="w-full border border-[#1e293b] bg-[#111827] p-8">
        <h1 className="text-xl font-medium text-[#e2e8f0]">Create account</h1>
        <p className="mt-1 text-sm text-[#64748b]">
          Free tier includes the NovaPay module.
        </p>

        {!configured && (
          <div className="mt-4 border border-[#f59e0b]/40 bg-[#f59e0b]/10 p-3 text-xs text-[#f59e0b]">
            Supabase not configured. Auth is in preview mode.
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block text-xs uppercase tracking-wider text-[#64748b]">
            Full name
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="mt-1 block w-full border border-[#1e293b] bg-[#1a2235] px-3 py-2 text-sm text-[#e2e8f0] outline-none focus:border-[#06d6a0]"
            />
          </label>
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
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full border border-[#1e293b] bg-[#1a2235] px-3 py-2 text-sm text-[#e2e8f0] outline-none focus:border-[#06d6a0]"
            />
            <span className="mt-1 block text-[10px] normal-case text-[#64748b]">
              At least 8 characters.
            </span>
          </label>

          <fieldset className="space-y-2 border border-[#1e293b] p-3">
            <legend className="px-1 text-[10px] uppercase tracking-wider text-[#64748b]">
              Account type
            </legend>
            {ACCOUNT_TYPES.map((opt) => (
              <label
                key={opt.value}
                className={`flex cursor-pointer items-start gap-3 border p-2 text-xs transition ${
                  accountType === opt.value
                    ? "border-[#06d6a0] bg-[#06d6a0]/5"
                    : "border-[#1e293b] hover:border-[#64748b]"
                }`}
              >
                <input
                  type="radio"
                  name="accountType"
                  value={opt.value}
                  checked={accountType === opt.value}
                  onChange={() => setAccountType(opt.value)}
                  className="mt-0.5 accent-[#06d6a0]"
                />
                <span>
                  <span className="block text-sm text-[#e2e8f0]">{opt.label}</span>
                  <span className="mt-0.5 block text-[#64748b]">{opt.description}</span>
                </span>
              </label>
            ))}
          </fieldset>

          <label className="flex items-start gap-2 text-xs text-[#64748b]">
            <input
              type="checkbox"
              required
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              className="mt-0.5 accent-[#06d6a0]"
            />
            <span>
              I agree to the{" "}
              <Link href="/legal/terms" className="text-[#06d6a0] hover:underline">
                terms of service
              </Link>{" "}
              and{" "}
              <Link href="/legal/privacy" className="text-[#06d6a0] hover:underline">
                privacy policy
              </Link>
              .
            </span>
          </label>

          {error && <p className="text-xs text-[#ef4444]">{error}</p>}
          {message && <p className="text-xs text-[#06d6a0]">{message}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#06d6a0] px-4 py-2 text-sm font-medium text-[#0a0f1a] transition hover:bg-[#06d6a0]/90 disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-[#64748b]">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-[#06d6a0] hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

function humanizeError(msg: string): string {
  if (/already registered/i.test(msg)) return "An account with this email already exists. Try signing in.";
  if (/password/i.test(msg) && /weak/i.test(msg)) return "Please choose a stronger password (8+ characters).";
  return msg;
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="px-6 py-12 text-sm text-[#64748b]">Loading…</div>}>
      <SignupInner />
    </Suspense>
  );
}
