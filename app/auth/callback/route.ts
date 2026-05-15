import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Supabase OAuth callback handler. Exchanges the code for a session and redirects
// the user to /companies/novapay.
export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") || "/companies/novapay";

  if (code) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (url && key) {
      const sb = createClient(url, key);
      await sb.auth.exchangeCodeForSession(code);
    }
  }

  return NextResponse.redirect(new URL(next, requestUrl.origin));
}
