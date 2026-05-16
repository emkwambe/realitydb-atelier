import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") || "/companies/novapay";
  const errorParam = requestUrl.searchParams.get("error");
  const errorDescription = requestUrl.searchParams.get("error_description");

  const origin = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || requestUrl.origin;

  if (errorParam) {
    const failUrl = new URL("/auth/login", origin);
    failUrl.searchParams.set("error", errorDescription || errorParam);
    return NextResponse.redirect(failUrl);
  }

  if (!code) {
    return NextResponse.redirect(new URL("/auth/login?error=missing_code", origin));
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    return NextResponse.redirect(new URL("/auth/login?error=not_configured", origin));
  }

  const response = NextResponse.redirect(new URL(next, origin));

  const sb = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const { error } = await sb.auth.exchangeCodeForSession(code);
  if (error) {
    const failUrl = new URL("/auth/login", origin);
    failUrl.searchParams.set("error", error.message);
    return NextResponse.redirect(failUrl);
  }

  return response;
}
