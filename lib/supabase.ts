import { createBrowserClient } from "@supabase/ssr";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let browserClient: SupabaseClient | null = null;

export function getSupabaseBrowserClient(): SupabaseClient | null {
  if (browserClient) return browserClient;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  // Cookie options are scoped to the current host (no explicit domain) so the
  // browser writes the auth token to atelier.realitydb.dev in production and
  // localhost in dev — both readable by the matching server-side proxy.
  browserClient = createBrowserClient(url, key, {
    cookieOptions: {
      path: "/",
      sameSite: "lax",
    },
  });
  return browserClient;
}

// Vanilla Supabase client pinned to the implicit OAuth flow, used only for
// email-link operations (signInWithOtp, signUp). Why a separate client:
// @supabase/ssr's createBrowserClient does not reliably forward the
// `flowType: 'implicit'` option through to its underlying GoTrue client —
// so signInWithOtp on the browser client keeps generating PKCE links whose
// code verifiers are stored on the *sending* browser. When the user opens
// the link in another browser the verifier is missing and the exchange
// fails with "PKCE code verifier not found in storage". The implicit flow
// embeds the credential directly in the URL fragment, so it works
// cross-browser. `persistSession: false` keeps this client from clobbering
// the real session cookies — we use it strictly to send the email.
export function getSupabaseOtpClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: {
      flowType: "implicit",
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export function getSupabaseAdminClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;
  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function getSiteUrl(): string {
  // On the client, always use the current origin. PKCE auth flows store the
  // code verifier in a cookie scoped to the page's host; the /auth/callback
  // route must run on that same host or the verifier is invisible and the
  // exchange fails with "PKCE code verifier not found in storage". This
  // matters in particular for Vercel: the app is reachable on both the
  // realitydb-atelier.vercel.app preview alias and the atelier.realitydb.dev
  // custom domain, and users must finish auth on the host they started on.
  if (typeof window !== "undefined") return window.location.origin;
  // On the server, fall back to the configured site URL.
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL;
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  return "https://atelier.realitydb.dev";
}
