"use client";

import { useAuthContext, type AuthState } from "@/lib/auth/AuthProvider";

// Stable safe default returned when the AuthProvider context resolves to
// null/undefined for any reason (Server Component static render, a stale
// build output, or — historically — a stray browser-extension content script
// reading from the wrong window). Allocating once at module scope keeps
// referential equality stable across calls so React doesn't see "changed"
// auth state on every render of a guarded component.
const SAFE_DEFAULT: AuthState = {
  user: null,
  profile: null,
  role: null,
  isLoading: true,
  isAuthenticated: false,
  signOut: async () => {},
  refresh: async () => {},
};

/**
 * Returns the current auth state. ALWAYS returns a populated object, even if
 * the React context happens to resolve as null. Consumers may still guard
 * defensively — that pattern is now redundant but harmless:
 *
 *   const auth = useAuth();
 *   if (!auth) return null;            // dead branch — never null
 *   const { isAuthenticated } = auth;  // safe to destructure
 *
 * Why: a destructure of `isAuthenticated` from `null` used to crash with
 * "Cannot destructure property 'isAuthenticated' of 'object null' as it is
 * null". This wrapper makes that impossible regardless of context state.
 */
export function useAuth(): AuthState {
  const ctx = useAuthContext();
  return ctx ?? SAFE_DEFAULT;
}
