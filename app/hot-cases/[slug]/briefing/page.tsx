import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { loadHotCase, toClientView } from "@/lib/hotCases";
import { BriefingForm } from "./_BriefingForm";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const c = await loadHotCase(slug);
  if (!c) return { title: "Hot Case not found · Atelier" };
  return {
    title: `${c.title} — Briefing · Atelier`,
    description: c.briefing_prompt,
  };
}

export default async function HotCaseBriefingPage({ params }: PageProps) {
  const { slug } = await params;
  const c = await loadHotCase(slug);
  if (!c) notFound();
  const hc = c!;

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <header>
        <div className="font-mono text-xs uppercase tracking-wider text-[#00f5d4]">
          Hot Case · {hc.vertical} · Free
        </div>
        <h1 className="mt-2 text-3xl font-medium text-[#e2e8f0]">
          {hc.title} — your briefing
        </h1>
        <p className="mt-3 text-sm text-[#e2e8f0]/80">{hc.briefing_prompt}</p>
      </header>

      <section className="mt-8 border border-[#1e293b] bg-[#111827] p-5">
        <div className="font-mono text-[11px] uppercase tracking-wider text-[#64748b]">
          3-axis rubric · 100 points
        </div>
        <ul className="mt-3 space-y-3 text-xs leading-relaxed text-[#e2e8f0]/90">
          <li>
            <span className="font-mono text-[#00f5d4]">01 Pattern detection /33</span>
            <p className="mt-0.5 text-[#64748b]">{hc.grading_rubric.pattern_detection}</p>
          </li>
          <li>
            <span className="font-mono text-[#06d6a0]">02 Quantification /33</span>
            <p className="mt-0.5 text-[#64748b]">{hc.grading_rubric.quantification}</p>
          </li>
          <li>
            <span className="font-mono text-[#a855f7]">03 Recommendation specificity /34</span>
            <p className="mt-0.5 text-[#64748b]">{hc.grading_rubric.recommendation_specificity}</p>
          </li>
        </ul>
      </section>

      <BriefingForm content={toClientView(hc)} />
    </div>
  );
}
