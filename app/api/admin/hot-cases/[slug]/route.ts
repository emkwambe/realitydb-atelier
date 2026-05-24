import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabaseAdminClient } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Action = "publish" | "unpublish" | "restore";

interface Body {
  action?: Action;
}

interface UpdateShape {
  status: "draft" | "published" | "archived";
  published_at: string | null;
}

const UPDATE_BY_ACTION: Record<Action, UpdateShape> = {
  publish: { status: "published", published_at: new Date().toISOString() },
  unpublish: { status: "draft", published_at: null },
  restore: { status: "draft", published_at: null },
};

async function isAdminCaller(): Promise<boolean> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return false;
  try {
    const store = await cookies();
    const sb = createServerClient(url, key, {
      cookies: { getAll: () => store.getAll(), setAll: () => {} },
    });
    const { data: userData } = await sb.auth.getUser();
    const userId = userData.user?.id;
    if (!userId) return false;
    const { data: profile } = await sb
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .maybeSingle();
    return profile?.role === "admin";
  } catch {
    return false;
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  // The proxy already protects /admin/* server routes, but API routes are
  // public unless we verify here. Service-role writes never happen for
  // non-admin callers.
  if (!(await isAdminCaller())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const action = body.action;
  if (action !== "publish" && action !== "unpublish" && action !== "restore") {
    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  }

  const admin = getSupabaseAdminClient();
  if (!admin) {
    return NextResponse.json(
      { error: "Service-role client not configured" },
      { status: 500 }
    );
  }

  const update = UPDATE_BY_ACTION[action];
  const { data, error } = await admin
    .from("hot_cases")
    .update(update)
    .eq("slug", slug)
    .select("slug, title, vertical, status, published_at, primary_dimension")
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: error?.message ?? "Hot Case not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true, hotCase: data });
}
