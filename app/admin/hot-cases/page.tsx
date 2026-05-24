import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabaseAdminClient } from "@/lib/supabase";
import { HotCasesTable, type HotCaseRow } from "./_HotCasesTable";

export const metadata: Metadata = {
  title: "Hot Cases · Admin · Atelier",
};

export const dynamic = "force-dynamic";

// Client-side guard would be redundant — the proxy/middleware enforces
// /admin/* → role==='admin' before this route renders. We re-verify here
// as defense in depth so a stale build or missing env var can't open
// the publish UI to a non-admin.
async function requireAdmin(): Promise<string> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) redirect("/");

  const store = await cookies();
  const sb = createServerClient(url, key, {
    cookies: { getAll: () => store.getAll(), setAll: () => {} },
  });
  const { data: userData } = await sb.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) redirect("/auth/login?next=/admin/hot-cases");

  const { data: profile } = await sb
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();
  if (profile?.role !== "admin") redirect("/");
  return userId;
}

async function loadAllHotCases(): Promise<HotCaseRow[]> {
  const admin = getSupabaseAdminClient();
  if (!admin) return [];
  const { data } = await admin
    .from("hot_cases")
    .select("slug, title, vertical, status, published_at, primary_dimension")
    .order("created_at", { ascending: false });
  return (data as HotCaseRow[] | null) ?? [];
}

export default async function AdminHotCasesPage() {
  await requireAdmin();
  const rows = await loadAllHotCases();

  return (
    <div className="mx-auto max-w-[1080px] px-6 py-10">
      <header>
        <div className="font-mono text-[11px] uppercase tracking-wider text-[#64748b]">
          Admin
        </div>
        <h1 className="mt-1 text-2xl font-medium text-[#e2e8f0]">Hot Cases</h1>
        <p className="mt-2 text-sm text-[#94a3b8]">
          Publish, unpublish, or restore Hot Cases. Publishing sets
          <code className="mx-1 font-mono text-[12px] text-[#06d6a0]">
            published_at = now()
          </code>
          and surfaces the case at{" "}
          <code className="font-mono text-[12px] text-[#06d6a0]">
            /hot-cases
          </code>
          .
        </p>
      </header>

      <section className="mt-8">
        <HotCasesTable initialRows={rows} />
      </section>
    </div>
  );
}
