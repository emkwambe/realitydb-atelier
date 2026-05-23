import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { loadHotCase } from "@/lib/hotCases";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const c = await loadHotCase(slug);
  if (!c) return { title: "Hot Case not found · Atelier" };
  return {
    title: `${c.title} · Hot Case · Atelier`,
    description: c.context,
  };
}

export default async function HotCaseDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const c = await loadHotCase(slug);
  if (!c) notFound();
  // notFound throws; the assertion below tells TS the rest of the function
  // runs with c definitely non-null.
  const hc = c!;

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <Link
        href="/hot-cases"
        className="font-mono text-xs uppercase tracking-wider text-[#64748b] hover:text-[#00f5d4]"
      >
        ← All Hot Cases
      </Link>

      <div className="mt-6 inline-flex items-center gap-2 border border-[#1e293b] bg-[#111827] px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-[#00f5d4]">
        <span className="inline-block size-1.5 rounded-full bg-[#00f5d4]" />
        Free · No account required
      </div>

      <h1 className="mt-4 text-3xl font-medium text-[#e2e8f0] md:text-5xl">
        {hc.title}
      </h1>
      <p className="mt-2 font-mono text-xs uppercase tracking-wider text-[#64748b]">
        {hc.vertical} · {hc.primary_dimension}
      </p>

      <section className="mt-8 border-l-2 border-[#00f5d4] pl-5">
        <div className="font-mono text-[11px] uppercase tracking-wider text-[#00f5d4]">
          The situation
        </div>
        <p className="mt-2 text-base leading-relaxed text-[#e2e8f0]/90">
          {hc.context}
        </p>
      </section>

      <section className="mt-10 border border-[#1e293b] bg-[#111827] p-6 md:p-8">
        <div className="font-mono text-xs uppercase tracking-wider text-[#64748b]">
          What you&apos;ll do
        </div>
        <ul className="mt-3 space-y-2 text-sm text-[#e2e8f0]/90">
          {hc.exercises.map((ex) => (
            <li key={ex.id} className="flex items-start gap-3">
              <span className="font-mono text-[11px] text-[#06d6a0]">
                {String(ex.id).padStart(2, "0")}
              </span>
              <span>
                <span className="text-[#e2e8f0]">{ex.title}</span> — {ex.question}
              </span>
            </li>
          ))}
          <li className="flex items-start gap-3">
            <span className="font-mono text-[11px] text-[#00f5d4]">→</span>
            <span>
              <span className="text-[#e2e8f0]">Brief the CFO</span> — write a four-bullet
              briefing. Graded on three axes in 60 seconds by Claude.
            </span>
          </li>
        </ul>
      </section>

      <div className="mt-10 flex flex-wrap items-center gap-4">
        <Link
          href={`/hot-cases/${hc.slug}/exercise`}
          className="inline-flex items-center gap-2 bg-[#00f5d4] px-5 py-3 text-sm font-medium text-[#0a0f1a] transition hover:opacity-90"
        >
          Start the exercise
          <ArrowRight className="size-4" />
        </Link>
        <p className="text-xs text-[#64748b]">
          ~30 minutes · No account required to attempt · Email captured at
          submission only
        </p>
      </div>
    </div>
  );
}
