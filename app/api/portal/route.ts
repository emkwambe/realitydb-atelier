// POST /api/portal
// Returns { url } pointing at the Stripe Customer Portal so the user can
// manage their subscription, payment method, and invoices.

import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/auth/server";
import { createPortalSession } from "@/lib/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
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

  const { data: profile } = await sb
    .from("profiles")
    .select("stripe_customer_id")
    .eq("id", userData.user.id)
    .maybeSingle();

  const stripeCustomerId = (profile?.stripe_customer_id as string | null) ?? null;
  if (!stripeCustomerId) {
    return NextResponse.json(
      { error: "No billing account found. Make a purchase first." },
      { status: 400 }
    );
  }

  const origin =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
    new URL(request.url).origin;

  try {
    const portal = await createPortalSession({
      stripeCustomerId,
      returnUrl: `${origin}/account/billing`,
    });
    return NextResponse.json({ url: portal.url });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json(
      { error: `Could not create portal session: ${msg}` },
      { status: 500 }
    );
  }
}
