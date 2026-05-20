// Server-only Stripe client + helpers. Never import from client components.
// All checkout/portal session creation goes through here.

import Stripe from "stripe";
import {
  findPlan,
  priceIdForPlan,
  type BillingCycle,
  type PlanKey,
} from "@/lib/billing/plans";

let _client: Stripe | null = null;

export function getStripeServerClient(): Stripe {
  if (_client) return _client;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is not set. Configure it in .env.local and Vercel.");
  }
  _client = new Stripe(key, {
    // Pin the API version to the SDK's typed default. This SDK ships
    // 2026-04-22.dahlia. Bump deliberately when the SDK upgrades and
    // re-test webhook payloads against the new shape.
    apiVersion: "2026-04-22.dahlia",
    typescript: true,
  });
  return _client;
}

interface CreateCheckoutSessionArgs {
  userId: string;
  email: string;
  planKey: PlanKey;
  billingCycle: BillingCycle;
  stripeCustomerId?: string | null;
  successUrl: string;
  cancelUrl: string;
}

/**
 * Creates a Stripe Checkout Session for the given plan + cycle.
 * If the user already has a stripeCustomerId, we attach the new subscription
 * to it. Otherwise Stripe creates the Customer on the fly and the webhook
 * back-fills it into profiles.
 */
export async function createCheckoutSession({
  userId,
  email,
  planKey,
  billingCycle,
  stripeCustomerId,
  successUrl,
  cancelUrl,
}: CreateCheckoutSessionArgs): Promise<{ id: string; url: string }> {
  const plan = findPlan(planKey, billingCycle);
  if (!plan) {
    throw new Error(`Unknown plan ${planKey}/${billingCycle}`);
  }
  const priceId = priceIdForPlan(planKey, billingCycle);

  const stripe = getStripeServerClient();
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: successUrl,
    cancel_url: cancelUrl,
    // If we have a Stripe Customer already, attach. Otherwise create on the fly
    // with the user's email so we can match it back via metadata in the webhook.
    ...(stripeCustomerId
      ? { customer: stripeCustomerId }
      : { customer_email: email, customer_creation: "always" as const }),
    // Stripe Tax handles regional VAT/sales tax automatically when enabled
    // in the dashboard.
    automatic_tax: { enabled: true },
    allow_promotion_codes: true,
    // The most reliable way to map a Stripe event back to our user. Stripe
    // preserves these on the resulting Customer and Subscription objects too.
    client_reference_id: userId,
    metadata: {
      user_id: userId,
      plan_key: plan.key,
      billing_cycle: plan.cycle,
      product_label: plan.product,
      segment: plan.segment,
    },
    subscription_data: {
      metadata: {
        user_id: userId,
        plan_key: plan.key,
        billing_cycle: plan.cycle,
        product_label: plan.product,
        segment: plan.segment,
      },
    },
  });

  if (!session.url) {
    throw new Error("Stripe returned a checkout session without a URL.");
  }
  return { id: session.id, url: session.url };
}

interface CreatePortalSessionArgs {
  stripeCustomerId: string;
  returnUrl: string;
}

export async function createPortalSession({
  stripeCustomerId,
  returnUrl,
}: CreatePortalSessionArgs): Promise<{ url: string }> {
  const stripe = getStripeServerClient();
  const session = await stripe.billingPortal.sessions.create({
    customer: stripeCustomerId,
    return_url: returnUrl,
  });
  return { url: session.url };
}

// Convenience re-exports so callers don't have to import from two places.
export { priceIdForPlan, findPlan } from "@/lib/billing/plans";
export type { PlanKey, BillingCycle } from "@/lib/billing/plans";
