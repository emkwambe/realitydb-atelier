import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { loadHotCase, toClientView } from "@/lib/hotCases";
import { getSupabaseAdminClient } from "@/lib/supabase";
import { HotCaseWorkbench, type GradeState } from "./_HotCaseWorkbench";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const c = await loadHotCase(slug);
  if (!c) return { title: "Hot Case not found · Atelier" };
  return {
    title: `${c.title} — Exercise · Atelier`,
    description: c.context,
  };
}

async function loadGradeState(slug: string): Promise<GradeState> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return { status: "anonymous" };

  let userId: string | null = null;
  try {
    const store = await cookies();
    const sb = createServerClient(url, key, {
      cookies: { getAll: () => store.getAll(), setAll: () => {} },
    });
    const { data } = await sb.auth.getUser();
    userId = data.user?.id ?? null;
  } catch {
    return { status: "anonymous" };
  }
  if (!userId) return { status: "anonymous" };

  const admin = getSupabaseAdminClient();
  if (!admin) return { status: "ungraded" };

  const { data, error } = await admin
    .from("hot_case_submissions")
    .select("id, score, axes, briefing_text, created_at")
    .eq("user_id", userId)
    .eq("hot_case_slug", slug)
    .not("score", "is", null)
    .order("created_at", { ascending: false })
    .limit(1);

  if (error || !data || data.length === 0) return { status: "ungraded" };
  const row = data[0] as {
    score: number;
    axes: { pattern?: number; quant?: number; rec?: number } | null;
    briefing_text: string | null;
  };
  const axes = row.axes ?? {};
  return {
    status: "unlocked",
    latest: {
      score: row.score,
      briefingText: row.briefing_text ?? "",
      axesLabel: `Pattern ${axes.pattern ?? 0}/33 · Quant ${axes.quant ?? 0}/33 · Rec ${axes.rec ?? 0}/34`,
    },
  };
}

export default async function HotCaseExercisePage({ params }: PageProps) {
  const { slug } = await params;
  const c = await loadHotCase(slug);
  if (!c) notFound();
  const hc = c!;
  const gradeState = await loadGradeState(slug);

  return <HotCaseWorkbench content={toClientView(hc)} gradeState={gradeState} />;
}
