import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_PER_HOUR = 3;
const WINDOW_MS = 60 * 60 * 1000;

// Per-IP rate counter. In-memory is fine at this scale — the waitlist is a
// burst-traffic page and we just need to deflect obvious flooding. Survives
// only within a single Node process; restarts reset the counter, which is
// the right trade-off for spam protection at this volume.
const hits = new Map<string, number[]>();

function clientIp(request: Request): string {
  const fwd = request.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  const real = request.headers.get("x-real-ip");
  if (real) return real.trim();
  return "unknown";
}

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_PER_HOUR) {
    hits.set(ip, recent);
    return true;
  }
  recent.push(now);
  hits.set(ip, recent);
  return false;
}

interface Body {
  email?: string;
  source?: string;
  referrer?: string;
}

export async function POST(request: Request) {
  const ip = clientIp(request);
  if (rateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many requests. Try again in an hour." },
      { status: 429 }
    );
  }

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const email = (body.email ?? "").trim().toLowerCase();
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json(
      { error: "Please enter a valid email address." },
      { status: 400 }
    );
  }

  const source = body.source?.trim() || null;
  const referrer = body.referrer?.trim() || null;

  const admin = getSupabaseAdminClient();
  if (!admin) {
    // No Supabase configured — pretend success so local dev flow still
    // exercises the post-submit UI. Logged so the developer notices.
    console.warn("[waitlist] SUPABASE not configured — swallowing signup");
    return NextResponse.json({ success: true, duplicate: false, persisted: false });
  }

  const { error } = await admin
    .from("waitlist")
    .insert({ email, source, referrer });

  if (error) {
    // Postgres unique-violation = 23505. Treat duplicate as success — the
    // user is already on the list; showing an error would confuse them.
    if (error.code === "23505") {
      return NextResponse.json({ success: true, duplicate: true });
    }
    return NextResponse.json(
      { error: `Could not save signup: ${error.message}` },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, duplicate: false });
}
