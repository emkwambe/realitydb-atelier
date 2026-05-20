// POST /api/checkout
// Body: { planKey: PlanKey, billingCycle: BillingCycle }
// Requires authenticated session. Returns { url } pointing at Stripe Checkout.

import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/auth/server";
import { getSupabaseAdminClient } from "@/lib/supabase";
import { createCheckoutSession, getStripeServerClient } from "@/lib/stripe";
import { findPlan, type BillingCycle, type PlanKey } from "@/lib/billing/plans";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface CheckoutRequest {
  planKey?: PlanKey;
  billingCycle?: BillingCycle;
}

export async function POST(request: Request) {
  let body: CheckoutRequest;
  try {
    body = (await request.json()) as CheckoutRequest;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const planKey = body.planKey;
  const billingCycle = body.billingCycle;
  if (!planKey || !billingCycle) {
    return NextResponse.json(
      { error: "planKey and billingCycle are required" },
      { status: 400 }
    );
  }
  const plan = findPlan(planKey, billingCycle);
  if (!plan) {
    return NextResponse.json(
      { error: `Unknown plan ${planKey}/${billingCycle}` },
      { status: 400 }
    );
  }

  // Auth via Supabase SSR client.
  const sb = await getSupabaseServerClient();
  if (!sb) {
    return NextResponse.json(
      { error: "Auth is not configured." },
      { status: 500 }
    );
  }
  const { data: userData, error: userError } = await sb.auth.getUser();
  if (userError || !userData.user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }
  const user = userData.user;

  // Look up existing stripe_customer_id from profiles.
  let stripeCustomerId: string | null = null;
  try {
    const { data: profile } = await sb
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", user.id)
      .maybeSingle();
    stripeCustomerId = (profile?.stripe_customer_id as string | null) ?? null;
  } catch {
    // Profile lookup failure isn't fatal — Stripe will create a customer.
  }

  // If we don't have a customer ID yet, create one server-side and persist it.
  // This means the webhook doesn't have to back-fill on every first payment,
  // and the customer survives even if the checkout is abandoned.
  if (!stripeCustomerId) {
    try {
      const stripe = getStripeServerClient();
      const customer = await stripe.customers.create({
        email: user.email ?? undefined,
        metadata: { user_id: user.id },
      });
      stripeCustomerId = customer.id;
      const admin = getSupabaseAdminClient();
      if (admin) {
        await admin
          .from("profiles")
          .update({ stripe_customer_id: stripeCustomerId })
          .eq("id", user.id);
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      return NextResponse.json(
        { error: `Could not create Stripe customer: ${msg}` },
        { status: 500 }
      );
    }
  }

  const origin = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "")
    ?? new URL(request.url).origin;

  try {
    const session = await createCheckoutSession({
      userId: user.id,
      email: user.email ?? "",
      planKey,
      billingCycle,
      stripeCustomerId,
      successUrl: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${origin}/checkout/cancel?plan=${encodeURIComponent(planKey)}&billing=${encodeURIComponent(billingCycle)}`,
    });
    return NextResponse.json({ url: session.url });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json(
      { error: `Could not create checkout session: ${msg}` },
      { status: 500 }
    );
  }
}
