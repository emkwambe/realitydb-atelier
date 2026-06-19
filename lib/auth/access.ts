// Server-only entitlement helpers — the single source of truth for gating
// content routes, API routes, and dataset downloads. Do NOT import from client
// components: every function calls getCurrentUser(), which reads next/headers
// cookies() and only runs on the server.
//
// This wraps lib/entitlements.canAccess() so the 6 company route trees (and the
// grading + dataset APIs) don't each re-implement userId resolution, upgrade
// links, or HTTP status mapping.

import { getCurrentUser } from "@/lib/auth/server";
import {
  canAccess,
  paywallActive,
  type AccessReason,
  type ExerciseDifficulty,
} from "@/lib/entitlements";

export type { AccessReason, ExerciseDifficulty };
export { paywallActive };

/** Resolves the signed-in user's id, or null when anonymous. */
export async function resolveUserId(): Promise<string | null> {
  const user = await getCurrentUser();
  return user?.id ?? null;
}

/** Convenience: resolve the viewer and check one exercise in one call. */
export async function canAccessExercise(
  slug: string,
  difficulty: ExerciseDifficulty
): Promise<AccessReason> {
  const userId = await resolveUserId();
  return canAccess(userId, slug, difficulty);
}

/**
 * Per-difficulty access map for a company — used by list/intro pages to render
 * lock badges. Resolves the viewer once and checks all three tiers.
 */
export async function companyAccessMap(
  slug: string
): Promise<Record<ExerciseDifficulty, AccessReason>> {
  const userId = await resolveUserId();
  const [beginner, intermediate, advanced] = await Promise.all([
    canAccess(userId, slug, "beginner"),
    canAccess(userId, slug, "intermediate"),
    canAccess(userId, slug, "advanced"),
  ]);
  return { beginner, intermediate, advanced };
}

export interface GateResult {
  allowed: boolean;
  reason: AccessReason["reason"];
  /** Where to send a denied user. Only present when allowed === false. */
  upgradeHref?: string;
}

/**
 * Server-component guard. Returns either { allowed: true } or a denial with the
 * place to send the user (login vs pricing). Render an upgrade screen on denial.
 */
export async function gateOrUpgrade(
  slug: string,
  difficulty: ExerciseDifficulty
): Promise<GateResult> {
  const access = await canAccessExercise(slug, difficulty);
  if (access.allowed) return { allowed: true, reason: access.reason };
  return {
    allowed: false,
    reason: access.reason,
    upgradeHref: buildUpgradeHref(slug, access.reason),
  };
}

export type ApiGate =
  | { allowed: true; userId: string | null }
  | { allowed: false; status: 401 | 403; reason: AccessReason["reason"] };

/**
 * Route-handler guard (grading API, dataset API). Maps a denial to an HTTP
 * status: 401 when not signed in, 403 when signed in but unentitled.
 */
export async function gateApi(
  slug: string,
  difficulty: ExerciseDifficulty
): Promise<ApiGate> {
  const userId = await resolveUserId();
  const access = await canAccess(userId, slug, difficulty);
  if (access.allowed) return { allowed: true, userId };
  const status: 401 | 403 =
    access.reason === "not_signed_in" || !userId ? 401 : 403;
  return { allowed: false, status, reason: access.reason };
}

/**
 * Dataset variant → required tier. baseline is open (anonymous Hot Cases and
 * free beginner exercises load it); every other variant (scenario-a/b and the
 * comparison JSON) is premium and requires an advanced-tier entitlement.
 */
export function datasetTier(variant: string): "public" | "advanced" {
  return variant === "baseline" ? "public" : "advanced";
}

/**
 * Dataset-download guard used by the dataset route. Public variants resolve to
 * allowed without an entitlement check; premium variants run the advanced gate.
 */
export async function gateDataset(
  slug: string,
  variant: string
): Promise<ApiGate> {
  if (datasetTier(variant) === "public") {
    return { allowed: true, userId: null };
  }
  return gateApi(slug, "advanced");
}

function buildUpgradeHref(
  slug: string,
  reason: AccessReason["reason"]
): string {
  if (reason === "not_signed_in") {
    return `/auth/login?next=${encodeURIComponent(`/companies/${slug}`)}`;
  }
  // Deep-link straight to checkout for THIS module so the correct module_slug is
  // captured (avoids a wrong default on a generic pricing page). All-Access
  // remains reachable from the top-nav /pricing link.
  return `/checkout/start?plan=module&billing=annual&module=${encodeURIComponent(
    slug
  )}`;
}
