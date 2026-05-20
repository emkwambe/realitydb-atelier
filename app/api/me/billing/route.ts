// GET /api/me/billing
// Returns the current user's billing snapshot: most recent purchase + active
// subscription. Polled by /checkout/success to confirm the webhook landed.

import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/auth/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const sb = await getSupabaseServerClient();
  if (!sb) {
    return NextResponse.json(
      { error: "Auth is not configured." },
      { status: 500 }
    );
  }
  const { data: userData, error } = await sb.auth.getUser();
  if (error || !userData.user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }
  const userId = userData.user.id;

  // Most recent purchase (one-time payments)
  const { data: purchases } = await sb
    .from("purchases")
    .select("product, status, amount_cents, currency, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1);

  // Active or recently active subscription
  const { data: subs } = await sb
    .from("subscriptions")
    .select("product, status, current_period_end, cancel_at_period_end")
    .eq("user_id", userId)
    .in("status", ["active", "trialing", "past_due"])
    .order("updated_at", { ascending: false })
    .limit(1);

  return NextResponse.json({
    user_id: userId,
    latest_purchase: purchases?.[0] ?? null,
    active_subscription: subs?.[0] ?? null,
  });
}
