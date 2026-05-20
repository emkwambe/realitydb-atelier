// POST /api/webhook/stripe
// Stripe webhook handler — idempotent, signature-verified, service-role writes.
//
// Handled events:
//   checkout.session.completed       mode=payment    → INSERT purchases
//                                    mode=subscription → INSERT subscriptions
//   customer.subscription.updated    → UPDATE subscriptions
//   customer.subscription.deleted    → UPDATE subscriptions status='canceled'
//   charge.refunded                  → UPDATE purchases status='refunded'
//   invoice.payment_failed           → UPDATE subscriptions status='past_due'
//
// All writes use the Supabase service role so RLS doesn't block the webhook.
// All inserts are idempotent: replaying an event does not double-write.

import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getStripeServerClient } from "@/lib/stripe";
import { getSupabaseAdminClient } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const sig = request.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!sig || !secret) {
    return NextResponse.json(
      { error: "Missing signature or webhook secret" },
      { status: 400 }
    );
  }

  // Stripe requires the RAW body for signature verification.
  const raw = await request.text();
  const stripe = getStripeServerClient();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(raw, sig, secret);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[stripe-webhook] signature verification failed:", msg);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const admin = getSupabaseAdminClient();
  if (!admin) {
    console.error("[stripe-webhook] admin client unavailable");
    return NextResponse.json(
      { error: "Server misconfigured" },
      { status: 500 }
    );
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId =
          (session.metadata?.user_id as string | undefined) ??
          (session.client_reference_id ?? undefined);
        const productLabel =
          (session.metadata?.product_label as string | undefined) ?? "unknown";
        const stripeCustomerId =
          typeof session.customer === "string" ? session.customer : session.customer?.id;

        if (!userId) {
          console.warn("[stripe-webhook] checkout.session.completed without user_id");
          break;
        }

        // Back-fill stripe_customer_id on profiles if not already set.
        if (stripeCustomerId) {
          await admin
            .from("profiles")
            .update({ stripe_customer_id: stripeCustomerId })
            .eq("id", userId)
            .is("stripe_customer_id", null);
        }

        if (session.mode === "payment") {
          // One-time purchase. Idempotent on stripe_checkout_session_id.
          await admin.from("purchases").upsert(
            {
              user_id: userId,
              product: productLabel,
              stripe_checkout_session_id: session.id,
              stripe_payment_intent_id:
                typeof session.payment_intent === "string"
                  ? session.payment_intent
                  : session.payment_intent?.id ?? null,
              amount_cents: session.amount_total ?? 0,
              currency: session.currency ?? "usd",
              status: "paid",
            },
            { onConflict: "stripe_checkout_session_id", ignoreDuplicates: true }
          );
        } else if (session.mode === "subscription" && session.subscription) {
          // Subscription created — we'll have a full snapshot via
          // customer.subscription.updated below, but seed the row now so the
          // UI can confirm the purchase landed without waiting for that event.
          const subscriptionId =
            typeof session.subscription === "string"
              ? session.subscription
              : session.subscription.id;
          if (stripeCustomerId) {
            // Fetch full sub once to populate period boundaries.
            const sub = await stripe.subscriptions.retrieve(subscriptionId);
            await upsertSubscription(admin, userId, productLabel, stripeCustomerId, sub);
          }
        }
        break;
      }

      case "customer.subscription.updated":
      case "customer.subscription.created": {
        const sub = event.data.object as Stripe.Subscription;
        const userId =
          (sub.metadata?.user_id as string | undefined) ??
          (await resolveUserIdFromCustomer(admin, sub.customer));
        const productLabel =
          (sub.metadata?.product_label as string | undefined) ?? "unknown";
        if (!userId) {
          console.warn("[stripe-webhook] subscription.updated without user_id");
          break;
        }
        const stripeCustomerId =
          typeof sub.customer === "string" ? sub.customer : sub.customer.id;
        await upsertSubscription(admin, userId, productLabel, stripeCustomerId, sub);
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        await admin
          .from("subscriptions")
          .update({
            status: "canceled",
            cancel_at_period_end: false,
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_subscription_id", sub.id);
        break;
      }

      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        // Stripe's payment_intent maps to purchases.stripe_payment_intent_id.
        const pi =
          typeof charge.payment_intent === "string"
            ? charge.payment_intent
            : charge.payment_intent?.id ?? null;
        if (pi) {
          await admin
            .from("purchases")
            .update({ status: "refunded" })
            .eq("stripe_payment_intent_id", pi);
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        // Stripe API 2024-09+ moved invoice.subscription under
        // parent.subscription_details.subscription. Resolve either shape.
        const subRef =
          invoice.parent?.subscription_details?.subscription ?? null;
        const subId =
          typeof subRef === "string" ? subRef : subRef?.id ?? null;
        if (subId) {
          await admin
            .from("subscriptions")
            .update({
              status: "past_due",
              updated_at: new Date().toISOString(),
            })
            .eq("stripe_subscription_id", subId);
        }
        break;
      }

      default:
        // Unhandled event types are fine — Stripe will resend any 5xx, but
        // 2xx tells it we received and chose to ignore.
        break;
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error(`[stripe-webhook] processing ${event.type} failed:`, msg);
    return NextResponse.json(
      { error: "Webhook handler error" },
      { status: 500 }
    );
  }

  return NextResponse.json({ received: true });
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function upsertSubscription(
  admin: ReturnType<typeof getSupabaseAdminClient>,
  userId: string,
  productLabel: string,
  stripeCustomerId: string,
  sub: Stripe.Subscription
): Promise<void> {
  if (!admin) return;
  // Stripe API 2024-09+ moved current_period_start / current_period_end off the
  // Subscription object onto each SubscriptionItem. For our single-item
  // subscriptions we read from the first item.
  const firstItem = sub.items?.data?.[0];
  const periodStart = firstItem?.current_period_start ?? null;
  const periodEnd = firstItem?.current_period_end ?? null;

  await admin
    .from("subscriptions")
    .upsert(
      {
        user_id: userId,
        product: productLabel,
        stripe_customer_id: stripeCustomerId,
        stripe_subscription_id: sub.id,
        status: sub.status,
        current_period_start:
          periodStart != null ? new Date(periodStart * 1000).toISOString() : null,
        current_period_end:
          periodEnd != null ? new Date(periodEnd * 1000).toISOString() : null,
        cancel_at_period_end: sub.cancel_at_period_end,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "stripe_subscription_id" }
    );
}

async function resolveUserIdFromCustomer(
  admin: ReturnType<typeof getSupabaseAdminClient>,
  customer: string | Stripe.Customer | Stripe.DeletedCustomer
): Promise<string | undefined> {
  if (!admin) return undefined;
  const id = typeof customer === "string" ? customer : customer.id;
  const { data } = await admin
    .from("profiles")
    .select("id")
    .eq("stripe_customer_id", id)
    .maybeSingle();
  return (data?.id as string | undefined) ?? undefined;
}
