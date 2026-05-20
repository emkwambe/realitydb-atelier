// Module access policy. Phase 1: paywall disabled — always returns true.
// Phase 2 (when ENABLE_PAYWALL=true): reads from purchases + subscriptions
// to decide whether the learner can access intermediate/advanced exercises.

import { getSupabaseAdminClient } from "@/lib/supabase";

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
 * Phase 2 contract (ENABLE_PAYWALL=true): beginner exercises are always free;
 * intermediate and advanced require an Individual Module/All-Access purchase,
 * a corporate seat, or an academic seat that covers the module slug.
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
  // Beginner exercises stay free forever — they're the on-ramp and a
  // discovery surface for prospective subscribers.
  if (exerciseDifficulty === "beginner") {
    return { allowed: true, reason: "free_tier" };
  }

  if (!userId) {
    return { allowed: false, reason: "not_signed_in" };
  }

  const admin = getSupabaseAdminClient();
  if (!admin) {
    // If admin client isn't available we fail open to keep students unblocked.
    // Log and alert in real deployment.
    return { allowed: true, reason: "paywall_disabled" };
  }

  // 1. All-Access subscription (any status that grants access)
  const { data: subs } = await admin
    .from("subscriptions")
    .select("product, status")
    .eq("user_id", userId)
    .in("status", ["active", "trialing", "past_due"]);

  if (subs && subs.length > 0) {
    const hasAllAccess = subs.some((s) =>
      String(s.product).toLowerCase().includes("all-access")
    );
    if (hasAllAccess) return { allowed: true, reason: "owns_allaccess" };

    // Module subscription — covers the one module the learner chose.
    // We store the chosen module slug on subscriptions.metadata in Phase 2.
    const hasModule = subs.some((s) =>
      String(s.product).toLowerCase().includes("module")
    );
    if (hasModule) {
      // TODO Phase 2: read module_slug from subscriptions.metadata and verify
      // it matches moduleSlug. For now any "Module" sub grants access.
      void moduleSlug;
      return { allowed: true, reason: "owns_module" };
    }
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
