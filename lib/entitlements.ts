// Module access policy. Phase 1: paywall disabled — always returns true.
// Phase 2 (when ENABLE_PAYWALL=true): NovaPay is the permanent free module
// (beginner + intermediate free for any signed-in user); everything else —
// NovaPay advanced, every CEO briefing, and all exercises in the other five
// modules — requires a Module (scoped by module_slug) or All-Access subscription.

import { getSupabaseAdminClient } from "@/lib/supabase";

// NovaPay is the permanent free module. No module selection, no DB column — the
// free module is hardcoded here.
const FREE_MODULE_SLUG = "novapay";

export type ExerciseDifficulty = "beginner" | "intermediate" | "advanced";

export interface AccessReason {
  allowed: boolean;
  reason:
    | "paywall_disabled"
    | "free_tier"
    | "owns_module"
    | "owns_allaccess"
    | "team_seat"
    | "academic_seat"
    | "not_signed_in"
    | "no_entitlement";
}

/**
 * Decides whether a user may access a specific exercise. Server-only.
 *
 * Phase 1 contract: always returns { allowed: true, reason: 'paywall_disabled' }.
 * The whole catalog stays open while we collect signal on conversion and
 * grading throughput. Stripe is wired so payment data starts accumulating
 * before any gate flips.
 *
 * Phase 2 contract (ENABLE_PAYWALL=true): NovaPay beginner + intermediate are
 * free for any signed-in user. NovaPay advanced + every CEO briefing, plus all
 * exercises in the other five modules, require a Module subscription (scoped to
 * that module via module_slug) or All-Access.
 */
export async function canAccess(
  userId: string | null,
  moduleSlug: string,
  exerciseDifficulty: ExerciseDifficulty
): Promise<AccessReason> {
  const paywallEnabled = process.env.ENABLE_PAYWALL === "true";

  // Phase 1 short-circuit. This is the active branch today.
  if (!paywallEnabled) {
    return { allowed: true, reason: "paywall_disabled" };
  }

  // ---- Phase 2 logic below ----
  // Free preview: NovaPay (the permanent free module) gives beginner AND
  // intermediate exercises free to any signed-in user. NovaPay advanced and the
  // CEO briefing require a subscription, and every other module is fully gated
  // (intro page visible, but no exercise without a subscription).
  if (
    moduleSlug === FREE_MODULE_SLUG &&
    (exerciseDifficulty === "beginner" || exerciseDifficulty === "intermediate")
  ) {
    return { allowed: true, reason: "free_tier" };
  }

  if (!userId) {
    return { allowed: false, reason: "not_signed_in" };
  }

  const admin = getSupabaseAdminClient();
  if (!admin) {
    // Fail CLOSED for paid (non-beginner) content: if we cannot verify
    // entitlements we must not hand out access. Beginner exercises already
    // returned free_tier above, so this only denies premium content.
    return { allowed: false, reason: "no_entitlement" };
  }

  // 1. All-Access subscription (any status that grants access) and 2. Module
  // subscription scoped to the requested module via module_slug.
  const { data: subs } = await admin
    .from("subscriptions")
    .select("product, status, module_slug")
    .eq("user_id", userId)
    .in("status", ["active", "trialing", "past_due"]);

  if (subs && subs.length > 0) {
    const hasAllAccess = subs.some((s) =>
      String(s.product).toLowerCase().includes("all-access")
    );
    if (hasAllAccess) return { allowed: true, reason: "owns_allaccess" };

    // Module subscription — grants access to exactly the one module the learner
    // bought. module_slug is captured at checkout and persisted by the webhook.
    const hasModuleForSlug = subs.some(
      (s) =>
        String(s.product).toLowerCase().includes("module") &&
        s.module_slug === moduleSlug
    );
    if (hasModuleForSlug) return { allowed: true, reason: "owns_module" };
  }

  // 2. Cohort / org seat (corporate or academic) — Phase 2 will check
  // organization_members and cohorts here. Placeholder for now.
  // 3. Hot Cases are routed through /hot-cases/ and never call this function.

  return { allowed: false, reason: "no_entitlement" };
}

/**
 * Convenience accessor for paywall state. Read by UI components that need to
 * decide whether to show "Upgrade to continue" CTAs even when access happens
 * to be granted (e.g., during a free trial window).
 */
export function paywallActive(): boolean {
  return process.env.ENABLE_PAYWALL === "true";
}
