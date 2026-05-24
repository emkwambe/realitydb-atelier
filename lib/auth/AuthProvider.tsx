"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import type { Profile, Role } from "@/lib/auth/types";

export interface AuthState {
  user: User | null;
  profile: Profile | null;
  role: Role | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
}

const DEFAULT_STATE: AuthState = {
  user: null,
  profile: null,
  role: null,
  isLoading: true,
  isAuthenticated: false,
  isAdmin: false,
  signOut: async () => {},
  refresh: async () => {},
};

const AuthContext = createContext<AuthState>(DEFAULT_STATE);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadProfile = useCallback(async (currentUser: User | null) => {
    if (!currentUser) {
      setProfile(null);
      return;
    }
    const sb = getSupabaseBrowserClient();
    if (!sb) return;
    const { data } = await sb
      .from("profiles")
      .select("id, email, full_name, role, institution, cohort_id, account_type, created_at")
      .eq("id", currentUser.id)
      .maybeSingle();
    if (data) {
      setProfile(data as Profile);
    } else {
      setProfile({
        id: currentUser.id,
        email: currentUser.email ?? "",
        full_name: (currentUser.user_metadata?.full_name as string) ?? null,
        role: "learner",
        institution: null,
        cohort_id: null,
        account_type: null,
        created_at: currentUser.created_at ?? new Date().toISOString(),
      });
    }
  }, []);

  const refresh = useCallback(async () => {
    const sb = getSupabaseBrowserClient();
    if (!sb) {
      setIsLoading(false);
      return;
    }
    const { data } = await sb.auth.getUser();
    setUser(data.user ?? null);
    await loadProfile(data.user ?? null);
    setIsLoading(false);
  }, [loadProfile]);

  useEffect(() => {
    let mounted = true;
    refresh();
    const sb = getSupabaseBrowserClient();
    if (!sb) return;
    const { data: sub } = sb.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      setUser(session?.user ?? null);
      loadProfile(session?.user ?? null);
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [refresh, loadProfile]);

  const signOut = useCallback(async () => {
    const sb = getSupabaseBrowserClient();
    if (!sb) return;
    await sb.auth.signOut();
    setUser(null);
    setProfile(null);
  }, []);

  const value: AuthState = {
    user,
    profile,
    role: profile?.role ?? null,
    isAuthenticated: !!user,
    isAdmin: profile?.role === "admin",
    isLoading,
    signOut,
    refresh,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext(): AuthState {
  return useContext(AuthContext);
}
