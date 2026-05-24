import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabaseAdminClient } from "@/lib/supabase";
import { WaitlistTable, type WaitlistRow } from "./_WaitlistTable";

export const metadata: Metadata = {
  title: "Waitlist · Admin · Atelier",
};

export const dynamic = "force-dynamic";

// Same defense-in-depth pattern as /admin/hot-cases — the proxy already
// restricts /admin/* but we re-verify the role here in case env/build
// drift removes that protection.
async function requireAdmin(): Promise<void> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) redirect("/");

  const store = await cookies();
  const sb = createServerClient(url, key, {
    cookies: { getAll: () => store.getAll(), setAll: () => {} },
  });
  const { data: userData } = await sb.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) redirect("/auth/login?next=/admin/waitlist");

  const { data: profile } = await sb
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();
  if (profile?.role !== "admin") redirect("/");
}

async function loadWaitlist(): Promise<WaitlistRow[]> {
  const admin = getSupabaseAdminClient();
  if (!admin) return [];
  const { data } = await admin
    .from("waitlist")
    .select("id, email, source, referrer, created_at")
    .order("created_at", { ascending: false });
  return (data as WaitlistRow[] | null) ?? [];
}

export default async function AdminWaitlistPage() {
  await requireAdmin();
  const rows = await loadWaitlist();

  return (
    <div className="mx-auto max-w-[1080px] px-6 py-10">
      <header>
        <div className="font-mono text-[11px] uppercase tracking-wider text-[#64748b]">
          Admin
        </div>
        <h1 className="mt-1 text-2xl font-medium text-[#e2e8f0]">Waitlist</h1>
        <p className="mt-2 text-sm text-[#94a3b8]">
          Everyone who signed up at{" "}
          <code className="font-mono text-[12px] text-[#06d6a0]">/waitlist</code>
          . Export the CSV and upload it to Resend for the launch blast.
        </p>
      </header>

      <section className="mt-8">
        <WaitlistTable rows={rows} />
      </section>
    </div>
  );
}
