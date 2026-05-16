import { NextResponse, type NextRequest } from "next/server";

// Routes that require an authenticated Supabase session.
// /verify/* is intentionally public so employers can validate certificates without an account.
const PROTECTED_PREFIXES = ["/companies"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Always allow auth endpoints and assets.
  if (
    pathname.startsWith("/auth") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/data") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  const requiresAuth = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  if (!requiresAuth) return NextResponse.next();

  // Detect any Supabase auth cookie. Supabase v2 uses sb-<project>-auth-token.
  const hasSession = request.cookies
    .getAll()
    .some((c) => /^sb-[^=]+-auth-token/.test(c.name));

  // If Supabase isn't configured at all (no env), allow through so the public
  // preview build still works. Production deployments must set the env vars.
  const supabaseConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
  if (!supabaseConfigured) return NextResponse.next();

  if (!hasSession) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
