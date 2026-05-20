"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

function CheckoutStartInner() {
  const params = useSearchParams();
  const router = useRouter();
  const planKey = params.get("plan");
  const billingCycle = params.get("billing") ?? "annual";

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!planKey) {
      setError("No plan selected. Pick a plan from the pricing page.");
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ planKey, billingCycle }),
        });
        if (res.status === 401) {
          if (cancelled) return;
          // Not signed in — preserve the plan and bounce through signup.
          router.push(
            `/auth/signup?plan=${encodeURIComponent(planKey)}&billing=${encodeURIComponent(billingCycle)}`
          );
          return;
        }
        if (!res.ok) {
          const body = await res.text();
          throw new Error(body || `Checkout failed (${res.status})`);
        }
        const data = (await res.json()) as { url?: string };
        if (cancelled) return;
        if (!data.url) {
          throw new Error("Stripe returned no checkout URL.");
        }
        window.location.href = data.url;
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : String(e));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [planKey, billingCycle, router]);

  return (
    <div className="mx-auto flex min-h-[calc(100vh-7rem)] max-w-md flex-col items-center justify-center px-6 py-16 text-center">
      {error ? (
        <div className="border border-[#ef4444]/40 bg-[#ef4444]/5 p-6">
          <h1 className="text-lg font-medium text-[#ef4444]">Could not start checkout</h1>
          <p className="mt-2 text-sm text-[#e2e8f0]/80">{error}</p>
          <Link
            href="/pricing"
            className="mt-4 inline-block text-xs text-[#06d6a0] hover:underline"
          >
            Back to pricing
          </Link>
        </div>
      ) : (
        <>
          <Loader2 className="size-6 animate-spin text-[#06d6a0]" />
          <p className="mt-4 font-mono text-sm text-[#e2e8f0]">
            Redirecting to Stripe Checkout…
          </p>
          <p className="mt-2 text-xs text-[#64748b]">
            Plan: <span className="text-[#06d6a0]">{planKey ?? "—"}</span> · Billing:{" "}
            <span className="text-[#00f5d4]">{billingCycle}</span>
          </p>
        </>
      )}
    </div>
  );
}

export default function CheckoutStartPage() {
  return (
    <Suspense fallback={<div className="px-6 py-12 text-sm text-[#64748b]">Loading…</div>}>
      <CheckoutStartInner />
    </Suspense>
  );
}
