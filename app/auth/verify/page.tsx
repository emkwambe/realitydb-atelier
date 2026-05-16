"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { getSupabaseBrowserClient, getSiteUrl } from "@/lib/supabase";

function VerifyInner() {
  const params = useSearchParams();
  const email = params.get("email") || "";
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function resend() {
    if (!email) {
      setError("Missing email — please sign up again.");
      setStatus("error");
      return;
    }
    setStatus("sending");
    setError(null);
    const sb = getSupabaseBrowserClient();
    if (!sb) {
      setError("Supabase is not configured.");
      setStatus("error");
      return;
    }
    const { error: resendError } = await sb.auth.resend({
      type: "signup",
      email,
      options: { emailRedirectTo: `${getSiteUrl()}/auth/callback` },
    });
    if (resendError) {
      setError(resendError.message);
      setStatus("error");
    } else {
      setStatus("sent");
    }
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-7rem)] max-w-md items-center px-6">
      <div className="w-full border border-[#1e293b] bg-[#111827] p-8 text-center">
        <h1 className="text-xl font-medium text-[#e2e8f0]">Check your email</h1>
        <p className="mt-3 text-sm text-[#64748b]">
          We sent a verification link to{" "}
          <span className="text-[#e2e8f0]">{email || "your inbox"}</span>. Click it to activate your
          account.
        </p>

        <div className="mt-6 border border-[#1e293b] bg-[#1a2235] p-4 text-left text-xs text-[#64748b]">
          <p className="text-[#e2e8f0]">Didn&apos;t receive it?</p>
          <ul className="mt-2 list-disc space-y-1 pl-4">
            <li>Check your spam folder.</li>
            <li>Make sure the email is spelled correctly.</li>
            <li>Click resend below.</li>
          </ul>
        </div>

        <button
          onClick={resend}
          disabled={status === "sending"}
          className="mt-4 w-full border border-[#1e293b] px-4 py-2 text-sm text-[#e2e8f0] transition hover:border-[#06d6a0] hover:text-[#06d6a0] disabled:opacity-50"
        >
          {status === "sending" ? "Resending..." : "Resend verification email"}
        </button>

        {status === "sent" && (
          <p className="mt-3 text-xs text-[#06d6a0]">Sent — check your inbox again.</p>
        )}
        {error && <p className="mt-3 text-xs text-[#ef4444]">{error}</p>}

        <p className="mt-6 text-xs text-[#64748b]">
          <Link href="/auth/login" className="text-[#06d6a0] hover:underline">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<div className="px-6 py-12 text-sm text-[#64748b]">Loading…</div>}>
      <VerifyInner />
    </Suspense>
  );
}
