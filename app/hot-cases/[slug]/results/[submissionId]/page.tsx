import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Award, ArrowRight, CheckCircle2 } from "lucide-react";
import { loadHotCase } from "@/lib/hotCases";
import { getSupabaseAdminClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string; submissionId: string }>;
}

interface SubmissionRow {
  id: string;
  hot_case_slug: string;
  score: number | null;
  axes: { pattern: number; quant: number; rec: number; feedback?: Record<string, string> } | null;
  briefing_text: string | null;
  created_at: string;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const c = await loadHotCase(slug);
  return {
    title: c ? `${c.title} — Results · Atelier` : "Results · Atelier",
  };
}

export default async function HotCaseResultsPage({ params }: PageProps) {
  const { slug, submissionId } = await params;
  const c = await loadHotCase(slug);
  if (!c) notFound();
  const hc = c!;

  const admin = getSupabaseAdminClient();
  if (!admin) notFound();

  // Service-role read so anon submitters (no auth.uid) can still see their
  // own result. The submission id is the access secret — it's a UUID, not
  // guessable. RLS denies anon SELECT on this table, so this is the only
  // safe path.
  const { data, error } = await admin
    .from("hot_case_submissions")
    .select("id, hot_case_slug, score, axes, briefing_text, created_at")
    .eq("id", submissionId)
    .maybeSingle();

  if (error || !data || data.hot_case_slug !== slug) notFound();
  const sub = data as SubmissionRow;
  const score = sub.score ?? 0;
  const axes = sub.axes ?? { pattern: 0, quant: 0, rec: 0 };
  const feedback = (sub.axes && (sub.axes as { feedback?: Record<string, string> }).feedback) ?? {};

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <header>
        <div className="font-mono text-xs uppercase tracking-wider text-[#00f5d4]">
          Hot Case · {hc.vertical} · Free
        </div>
        <h1 className="mt-2 text-3xl font-medium text-[#e2e8f0]">
          {hc.title} — your score
        </h1>
        <p className="mt-2 text-xs text-[#64748b]">
          Submitted {new Date(sub.created_at).toLocaleString()} · ID{" "}
          <span className="font-mono">{sub.id.slice(0, 8)}</span>
        </p>
      </header>

      <section className="mt-8 flex items-center gap-6 border border-[#00f5d4]/40 bg-[#00f5d4]/5 p-6">
        <div className="flex size-16 items-center justify-center border border-[#00f5d4] text-[#00f5d4]">
          <CheckCircle2 className="size-8" />
        </div>
        <div>
          <div className="font-mono text-[11px] uppercase tracking-wider text-[#64748b]">
            Total score
          </div>
          <div className="font-mono text-5xl font-medium text-[#e2e8f0]">
            {score}
            <span className="text-xl text-[#64748b]">/100</span>
          </div>
        </div>
      </section>

      <section className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
        <AxisCard
          color="#00f5d4"
          label="Pattern detection"
          score={axes.pattern}
          max={33}
          feedback={feedback.pattern}
        />
        <AxisCard
          color="#06d6a0"
          label="Quantification"
          score={axes.quant}
          max={33}
          feedback={feedback.quant}
        />
        <AxisCard
          color="#a855f7"
          label="Recommendation"
          score={axes.rec}
          max={34}
          feedback={feedback.rec}
        />
      </section>

      <section className="mt-12 border border-[#1e293b] bg-[#111827] p-6">
        <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-[#06d6a0]">
          <Award className="size-3.5" /> Share your score
        </div>
        <p className="mt-2 text-sm text-[#e2e8f0]/90">
          Your Hot Case score is private by default. Create an account to add
          it to your Atelier Rank profile and make it shareable with a public
          verification URL.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/auth/signup?source=hot-case-result"
            className="inline-flex items-center gap-2 bg-[#00f5d4] px-4 py-2 text-sm font-medium text-[#0a0f1a] transition hover:opacity-90"
          >
            Create account
            <ArrowRight className="size-3.5" />
          </Link>
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 border border-[#06d6a0]/60 px-4 py-2 text-sm font-medium text-[#06d6a0] transition hover:bg-[#06d6a0]/10"
          >
            Unlock full modules
          </Link>
        </div>
      </section>

      {sub.briefing_text && (
        <section className="mt-12">
          <details className="border border-[#1e293b] bg-[#111827] p-5">
            <summary className="cursor-pointer font-mono text-xs uppercase tracking-wider text-[#64748b]">
              Show submitted briefing
            </summary>
            <pre className="mt-3 whitespace-pre-wrap text-sm text-[#e2e8f0]/90">
              {sub.briefing_text}
            </pre>
          </details>
        </section>
      )}
    </div>
  );
}

function AxisCard({
  color,
  label,
  score,
  max,
  feedback,
}: {
  color: string;
  label: string;
  score: number;
  max: number;
  feedback?: string;
}) {
  const pct = max > 0 ? (score / max) * 100 : 0;
  return (
    <div className="border border-[#1e293b] bg-[#111827] p-5">
      <div
        className="font-mono text-[11px] uppercase tracking-wider"
        style={{ color }}
      >
        {label}
      </div>
      <div className="mt-1 font-mono text-2xl text-[#e2e8f0]">
        {score}
        <span className="text-sm text-[#64748b]">/{max}</span>
      </div>
      <div className="mt-3 h-1 w-full bg-[#1e293b]">
        <div
          className="h-1"
          style={{ width: `${Math.max(0, Math.min(100, pct))}%`, backgroundColor: color }}
        />
      </div>
      {feedback && (
        <p className="mt-3 text-xs leading-relaxed text-[#e2e8f0]/80">{feedback}</p>
      )}
    </div>
  );
}
