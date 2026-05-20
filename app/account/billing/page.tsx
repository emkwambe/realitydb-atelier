import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser, getSupabaseServerClient } from "@/lib/auth/server";
import { ManageBillingButton } from "./_ManageBillingButton";

export const dynamic = "force-dynamic";

interface SubscriptionRow {
  product: string;
  status: string;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean | null;
  updated_at: string;
}

interface PurchaseRow {
  product: string;
  status: string;
  amount_cents: number;
  currency: string;
  created_at: string;
}

export default async function BillingPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/auth/login?next=/account/billing");
  }

  const sb = await getSupabaseServerClient();
  let subscriptions: SubscriptionRow[] = [];
  let purchases: PurchaseRow[] = [];
  let stripeCustomerId: string | null = null;
  let hasCustomer = false;

  if (sb) {
    const { data: profile } = await sb
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", user!.id)
      .maybeSingle();
    stripeCustomerId = (profile?.stripe_customer_id as string | null) ?? null;
    hasCustomer = Boolean(stripeCustomerId);

    const { data: subs } = await sb
      .from("subscriptions")
      .select("product, status, current_period_start, current_period_end, cancel_at_period_end, updated_at")
      .eq("user_id", user!.id)
      .order("updated_at", { ascending: false });
    subscriptions = (subs as SubscriptionRow[] | null) ?? [];

    const { data: pur } = await sb
      .from("purchases")
      .select("product, status, amount_cents, currency, created_at")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false })
      .limit(10);
    purchases = (pur as PurchaseRow[] | null) ?? [];
  }

  const activeSub = subscriptions.find((s) =>
    ["active", "trialing", "past_due"].includes(s.status)
  );

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <header>
        <div className="font-mono text-xs uppercase tracking-wider text-[#64748b]">
          Account
        </div>
        <h1 className="mt-2 text-3xl font-medium text-[#e2e8f0]">Billing</h1>
        <p className="mt-2 text-sm text-[#64748b]">
          Your current Atelier subscription and recent payments.
        </p>
      </header>

      <section className="mt-8 border border-[#1e293b] bg-[#111827] p-6">
        <h2 className="text-sm font-medium uppercase tracking-wider text-[#64748b]">
          Current tier
        </h2>
        {activeSub ? (
          <div className="mt-3">
            <p className="text-lg text-[#e2e8f0]">{activeSub.product}</p>
            <p className="mt-1 text-xs text-[#64748b]">
              Status:{" "}
              <span
                className={
                  activeSub.status === "active"
                    ? "text-[#06d6a0]"
                    : activeSub.status === "past_due"
                      ? "text-[#ef4444]"
                      : "text-[#f59e0b]"
                }
              >
                {activeSub.status}
              </span>
              {activeSub.current_period_end && (
                <>
                  {" · "}
                  {activeSub.cancel_at_period_end ? "Ends" : "Renews"}{" "}
                  {new Date(activeSub.current_period_end).toLocaleDateString()}
                </>
              )}
            </p>
          </div>
        ) : (
          <div className="mt-3">
            <p className="text-sm text-[#e2e8f0]/80">
              No active subscription. Pick a tier on the pricing page to get started.
            </p>
            <Link
              href="/pricing"
              className="mt-3 inline-flex items-center gap-2 bg-[#06d6a0] px-4 py-2 text-sm font-medium text-[#0a0f1a] transition hover:bg-[#06d6a0]/90"
            >
              View pricing
            </Link>
          </div>
        )}
        {hasCustomer && (
          <div className="mt-4 border-t border-[#1e293b] pt-4">
            <ManageBillingButton />
            <p className="mt-2 text-[11px] text-[#64748b]">
              Opens the Stripe Customer Portal — change payment method, cancel,
              or download invoices.
            </p>
          </div>
        )}
      </section>

      {purchases.length > 0 && (
        <section className="mt-8">
          <h2 className="text-sm font-medium uppercase tracking-wider text-[#64748b]">
            Recent payments
          </h2>
          <div className="mt-3 border border-[#1e293b]">
            <table className="data-grid w-full font-mono text-[12px]">
              <thead className="bg-[#1a2235] text-[10px] uppercase tracking-wider text-[#64748b]">
                <tr>
                  <th className="px-3 py-2 text-left font-medium">Date</th>
                  <th className="px-3 py-2 text-left font-medium">Product</th>
                  <th className="px-3 py-2 text-right font-medium">Amount</th>
                  <th className="px-3 py-2 text-left font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {purchases.map((p) => (
                  <tr key={`${p.created_at}-${p.product}`} className="border-t border-[#1e293b]/60">
                    <td className="px-3 py-2 text-[#e2e8f0]/80">
                      {new Date(p.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-3 py-2 text-[#e2e8f0]">{p.product}</td>
                    <td className="px-3 py-2 text-right text-[#e2e8f0]">
                      ${(p.amount_cents / 100).toFixed(2)} {p.currency.toUpperCase()}
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className={
                          p.status === "paid"
                            ? "text-[#06d6a0]"
                            : p.status === "refunded"
                              ? "text-[#f59e0b]"
                              : "text-[#64748b]"
                        }
                      >
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
