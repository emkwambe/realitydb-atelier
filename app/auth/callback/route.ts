// Supabase auth callback.
//
// Supports BOTH Supabase email-link flows so magic links work even when the
// recipient opens the link in a different browser than the one that requested it:
//
//   1. PKCE flow (?code=…)
//        Used when the link is opened in the same browser session that called
//        signInWithOtp(). Exchange the code for a session.
//        This is the modern default for password-resets and most magic-link flows.
//
//   2. Token-hash flow (?token_hash=…&type=…)
//        Used by Supabase as the implicit fallback when the email client cannot
//        preserve PKCE state — e.g., the user opens the link on a different
//        device or in a different browser than the one that requested it.
//        Verify with verifyOtp({ token_hash, type }).
//
// If neither parameter set is present, send the user back to login with an error.

import { NextResponse, type NextRequest } from "next/server";
import {
  createServerClient,
  type CookieOptions,
} from "@supabase/ssr";
import type { EmailOtpType } from "@supabase/supabase-js";

// Supabase ships these literal types but doesn't export a runtime guard. We
// accept only the values Supabase actually sends in confirmation links.
const VALID_OTP_TYPES: ReadonlySet<EmailOtpType> = new Set<EmailOtpType>([
  "signup",
  "invite",
  "magiclink",
  "recovery",
  "email_change",
  "email",
]);

function asOtpType(value: string | null): EmailOtpType | null {
  if (!value) return null;
  return (VALID_OTP_TYPES as Set<string>).has(value)
    ? (value as EmailOtpType)
    : null;
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const tokenHash = requestUrl.searchParams.get("token_hash");
  const typeParam = requestUrl.searchParams.get("type");
  const next = requestUrl.searchParams.get("next") || "/companies/novapay";
  const errorParam = requestUrl.searchParams.get("error");
  const errorDescription = requestUrl.searchParams.get("error_description");

  const origin =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || requestUrl.origin;

  if (errorParam) {
    const failUrl = new URL("/auth/login", origin);
    failUrl.searchParams.set("error", errorDescription || errorParam);
    return NextResponse.redirect(failUrl);
  }

  if (!code && !(tokenHash && typeParam)) {
    return NextResponse.redirect(
      new URL("/auth/login?error=missing_code", origin)
    );
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    return NextResponse.redirect(
      new URL("/auth/login?error=not_configured", origin)
    );
  }

  // Pre-build the success redirect. Cookies set during code exchange must
  // attach to THIS response object — not a fresh one — so the browser
  // receives the session cookie alongside the Location header.
  const response = NextResponse.redirect(new URL(next, origin));

  const sb = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(
        cookiesToSet: { name: string; value: string; options: CookieOptions }[]
      ) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  // PKCE flow first — this is the modern default.
  if (code) {
    const { error } = await sb.auth.exchangeCodeForSession(code);
    if (error) {
      // If PKCE fails AND the link also carries a token_hash, fall through
      // to the token_hash branch below instead of giving up. Supabase
      // sometimes sends both for compatibility.
      if (!(tokenHash && typeParam)) {
        const failUrl = new URL("/auth/login", origin);
        failUrl.searchParams.set("error", error.message);
        return NextResponse.redirect(failUrl);
      }
    } else {
      return response;
    }
  }

  // Token-hash fallback — used when the email is opened in a different
  // browser than the one that started the flow.
  if (tokenHash && typeParam) {
    const otpType = asOtpType(typeParam);
    if (!otpType) {
      const failUrl = new URL("/auth/login", origin);
      failUrl.searchParams.set("error", `Unsupported confirmation type: ${typeParam}`);
      return NextResponse.redirect(failUrl);
    }
    const { error } = await sb.auth.verifyOtp({
      token_hash: tokenHash,
      type: otpType,
    });
    if (error) {
      const failUrl = new URL("/auth/login", origin);
      failUrl.searchParams.set("error", error.message);
      return NextResponse.redirect(failUrl);
    }
    return response;
  }

  // Shouldn't be reachable — both branches above either return success or
  // explicit failure — but route it through the login error path to be safe.
  return NextResponse.redirect(
    new URL("/auth/login?error=unhandled_callback", origin)
  );
}
