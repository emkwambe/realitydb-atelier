"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Loader2 } from "lucide-react";

interface BillingSnapshot {
  user_id: string;
  latest_purchase: { product: string; status: string; created_at: string } | null;
  active_subscription: { product: string; status: string; current_period_end: string | null } | null;
}

function CheckoutSuccessInner() {
  const params = useSearchParams();
  const sessionId = params.get("session_id");
  const [state, setState] = useState<"polling" | "confirmed" | "timeout">("polling");
  const [snapshot, setSnapshot] = useState<BillingSnapshot | null>(null);

  useEffect(() => {
    // Poll for up to 5 seconds (10 × 500ms) so the success page reflects the
    // webhook landing. If the webhook is slow we show a soft fallback that
    // still lets the user proceed.
    let cancelled = false;
    let attempts = 0;
    const MAX = 10;

    async function poll() {
      attempts++;
      try {
        const res = await fetch("/api/me/billing", { cache: "no-store" });
        if (!res.ok) throw new Error(`${res.status}`);
        const data = (await res.json()) as BillingSnapshot;
        if (cancelled) return;
        const hasSub = !!data.active_subscription;
        const hasPurchase = !!data.latest_purchase;
        if (hasSub || hasPurchase) {
          setSnapshot(data);
          setState("confirmed");
          return;
        }
      } catch {
        // ignore; we'll retry
      }
      if (attempts >= MAX) {
        setState("timeout");
        return;
      }
      setTimeout(poll, 500);
    }
    poll();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="mx-auto flex min-h-[calc(100vh-7rem)] max-w-md flex-col items-center justify-center px-6 py-16 text-center">
      <div className="flex size-12 items-center justify-center border border-[#06d6a0] text-[#06d6a0]">
        <CheckCircle2 className="size-6" />
      </div>
      <h1 className="mt-4 text-2xl font-medium text-[#e2e8f0]">
        Payment confirmed.
      </h1>
      <p className="mt-2 text-sm text-[#e2e8f0]/80">
        Your access is active. The credential lands in your profile after your
        first graded briefing.
      </p>

      {state === "polling" && (
        <p className="mt-6 inline-flex items-center gap-2 text-xs text-[#64748b]">
          <Loader2 className="size-3.5 animate-spin" />
          Confirming your subscription…
        </p>
      )}
      {state === "confirmed" && snapshot && (
        <div className="mt-6 w-full border border-[#1e293b] bg-[#111827] p-4 text-left text-xs">
          {snapshot.active_subscription && (
            <p className="text-[#e2e8f0]">
              <span className="font-mono text-[#06d6a0]">Active:</span>{" "}
              {snapshot.active_subscription.product}
            </p>
          )}
          {snapshot.latest_purchase && (
            <p className="mt-1 text-[#e2e8f0]">
              <span className="font-mono text-[#00f5d4]">Receipt:</span>{" "}
              {snapshot.latest_purchase.product}
            </p>
          )}
        </div>
      )}
      {state === "timeout" && (
        <p className="mt-6 text-xs text-[#64748b]">
          Your payment was received. The dashboard may take a moment to update.
          You can begin using Atelier now.
        </p>
      )}

      <div className="mt-8 flex gap-3">
        <Link
          href="/companies"
          className="inline-flex items-center gap-2 bg-[#06d6a0] px-4 py-2 text-sm font-medium text-[#0a0f1a] transition hover:bg-[#06d6a0]/90"
        >
          Start a module
        </Link>
        <Link
          href="/account/billing"
          className="inline-flex items-center gap-2 border border-[#1e293b] px-4 py-2 text-sm text-[#e2e8f0] transition hover:border-[#06d6a0] hover:text-[#06d6a0]"
        >
          View billing
        </Link>
      </div>

      {sessionId && (
        <p className="mt-6 font-mono text-[10px] text-[#64748b]">
          Session: {sessionId.slice(0, 28)}…
        </p>
      )}
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="px-6 py-12 text-sm text-[#64748b]">Loading…</div>}>
      <CheckoutSuccessInner />
    </Suspense>
  );
}
