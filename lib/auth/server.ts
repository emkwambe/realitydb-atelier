import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Profile, Role } from "./types";

export async function getSupabaseServerClient(): Promise<SupabaseClient | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;

  const cookieStore = await cookies();

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Components cannot set cookies; the proxy will refresh.
        }
      },
    },
  });
}

export async function getCurrentUser() {
  const sb = await getSupabaseServerClient();
  if (!sb) return null;
  const { data } = await sb.auth.getUser();
  return data.user ?? null;
}

export async function getCurrentProfile(): Promise<Profile | null> {
  const sb = await getSupabaseServerClient();
  if (!sb) return null;
  const { data: userData } = await sb.auth.getUser();
  const user = userData.user;
  if (!user) return null;

  const { data: profile, error } = await sb
    .from("profiles")
    .select("id, email, full_name, role, institution, cohort_id, account_type, created_at")
    .eq("id", user.id)
    .maybeSingle();

  if (error || !profile) {
    return {
      id: user.id,
      email: user.email ?? "",
      full_name: (user.user_metadata?.full_name as string) ?? null,
      role: "learner" as Role,
      institution: null,
      cohort_id: null,
      account_type: null,
      created_at: user.created_at ?? new Date().toISOString(),
    };
  }
  return profile as Profile;
}
