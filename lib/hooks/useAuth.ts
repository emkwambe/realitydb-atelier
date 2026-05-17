"use client";

import { useAuthContext, type AuthState } from "@/lib/auth/AuthProvider";

/**
 * Returns the current auth state. Always returns a populated object; never
 * returns null. Consumers may still guard defensively:
 *
 *   const auth = useAuth();
 *   if (!auth) return null;
 *   const { user, role, isAuthenticated } = auth;
 *
 * The guard is harmless and matches the project's house style.
 */
export function useAuth(): AuthState {
  return useAuthContext();
}
