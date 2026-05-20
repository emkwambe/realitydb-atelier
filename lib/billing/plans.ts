// Single source of truth for plan keys, billing cycles, and Stripe price IDs.
// Server-only resolution of price IDs from env vars; UI never sees them.

export type PlanKey =
  | "module"
  | "allaccess"
  | "team"
  | "corporate_pro"
  | "program"
  | "institution"
  | "university_semester"
  | "university_annual";

export type BillingCycle = "monthly" | "annual" | "semester";

export interface PlanDescriptor {
  key: PlanKey;
  cycle: BillingCycle;
  product: string;        // human-readable label stored in purchases.product / subscriptions.product
  envVar: string;         // env var name that holds the Stripe price ID
  mode: "subscription";   // all plans are recurring in Phase 1
  segment: "individual" | "corporate" | "academic";
}

// The canonical plan × cycle matrix. Adding a plan? Add a row here.
export const PLANS: PlanDescriptor[] = [
  {
    key: "module",
    cycle: "monthly",
    product: "Atelier Module (monthly)",
    envVar: "STRIPE_PRICE_MODULE_MONTHLY",
    mode: "subscription",
    segment: "individual",
  },
  {
    key: "module",
    cycle: "annual",
    product: "Atelier Module (annual)",
    envVar: "STRIPE_PRICE_MODULE_ANNUAL",
    mode: "subscription",
    segment: "individual",
  },
  {
    key: "allaccess",
    cycle: "monthly",
    product: "Atelier All-Access (monthly)",
    envVar: "STRIPE_PRICE_ALLACCESS_MONTHLY",
    mode: "subscription",
    segment: "individual",
  },
  {
    key: "allaccess",
    cycle: "annual",
    product: "Atelier All-Access (annual)",
    envVar: "STRIPE_PRICE_ALLACCESS_ANNUAL",
    mode: "subscription",
    segment: "individual",
  },
  {
    key: "team",
    cycle: "annual",
    product: "Atelier Team (10 seats, annual)",
    envVar: "STRIPE_PRICE_TEAM",
    mode: "subscription",
    segment: "corporate",
  },
  {
    key: "corporate_pro",
    cycle: "annual",
    product: "Atelier Corporate Pro (50 seats, annual)",
    envVar: "STRIPE_PRICE_CORPORATE_PRO",
    mode: "subscription",
    segment: "corporate",
  },
  {
    key: "program",
    cycle: "semester",
    product: "Atelier Program (30 students, semester)",
    envVar: "STRIPE_PRICE_PROGRAM_SEMESTER",
    mode: "subscription",
    segment: "academic",
  },
  {
    key: "institution",
    cycle: "semester",
    product: "Atelier Institution (100 students, semester)",
    envVar: "STRIPE_PRICE_INSTITUTION_SEMESTER",
    mode: "subscription",
    segment: "academic",
  },
  {
    key: "university_semester",
    cycle: "semester",
    product: "Atelier University License (semester)",
    envVar: "STRIPE_PRICE_UNIVERSITY_SEMESTER",
    mode: "subscription",
    segment: "academic",
  },
  {
    key: "university_annual",
    cycle: "annual",
    product: "Atelier University License (annual)",
    envVar: "STRIPE_PRICE_UNIVERSITY_ANNUAL",
    mode: "subscription",
    segment: "academic",
  },
];

export function findPlan(key: PlanKey, cycle: BillingCycle): PlanDescriptor | null {
  return PLANS.find((p) => p.key === key && p.cycle === cycle) ?? null;
}

// SERVER-ONLY. Reads from process.env. Throws if the env var is missing so the
// caller can return a clear 5xx instead of a silent Stripe error.
export function priceIdForPlan(key: PlanKey, cycle: BillingCycle): string {
  const plan = findPlan(key, cycle);
  if (!plan) {
    throw new Error(`No plan registered for ${key}/${cycle}`);
  }
  const priceId = process.env[plan.envVar];
  if (!priceId) {
    throw new Error(
      `${plan.envVar} is not set. Configure it in .env.local and Vercel.`
    );
  }
  return priceId;
}
