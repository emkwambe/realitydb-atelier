"use client";

import { useState } from "react";
import { ArrowRight, CheckCircle2, Loader2 } from "lucide-react";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface Props {
  source: string;
}

export function WaitlistForm({ source }: Props) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">(
    "idle"
  );
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const trimmed = email.trim().toLowerCase();
    if (!EMAIL_RE.test(trimmed)) {
      setError("Please enter a valid email address.");
      return;
    }
    setStatus("submitting");
    try {
      const referrer = typeof document !== "undefined" ? document.referrer : "";
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed, source, referrer }),
      });
      // Per spec: duplicate-email responses come back 200 with
      // duplicate=true and should land in the success state too.
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Signup failed (${res.status})`);
      }
      setStatus("success");
    } catch (e) {
      setStatus("error");
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  if (status === "success") {
    return (
      <div className="border border-[#06d6a0]/40 bg-[#06d6a0]/5 p-5 text-center">
        <CheckCircle2 className="mx-auto size-7 text-[#06d6a0]" />
        <p className="mt-3 text-base font-medium text-[#e2e8f0]">
          You are on the list.
        </p>
        <p className="mt-1 text-sm text-[#94a3b8]">
          We will send you the link on{" "}
          <span className="text-[#06d6a0]">June 16</span>.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          autoComplete="email"
          className="flex-1 border border-[#1e293b] bg-[#111827] px-3 py-2.5 text-sm text-[#e2e8f0] outline-none transition focus:border-[#06d6a0]"
        />
        <button
          type="submit"
          disabled={status === "submitting"}
          className="inline-flex items-center justify-center gap-2 bg-[#06d6a0] px-4 py-2.5 text-sm font-medium text-[#0a0f1a] transition hover:bg-[#06d6a0]/90 disabled:opacity-50"
        >
          {status === "submitting" ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <>
              Get early access
              <ArrowRight className="size-4" />
            </>
          )}
        </button>
      </div>
      <p className="mt-2 text-[11px] text-[#64748b]">
        No spam. One email on launch day.
      </p>
      {error && (
        <p className="mt-3 border border-[#ef4444]/40 bg-[#ef4444]/10 px-3 py-2 text-xs text-[#ef4444]">
          {error}
        </p>
      )}
    </form>
  );
}
