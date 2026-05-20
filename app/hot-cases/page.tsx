import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hot Cases · Atelier",
  description:
    "A free 30-minute business acumen exercise every Monday. Auto-graded on a 3-axis rubric. Free forever, never paywalled.",
};

export default function HotCasesIndexPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <div className="inline-flex items-center gap-2 border border-[#1e293b] bg-[#111827] px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-[#64748b]">
        <span className="inline-block size-1.5 rounded-full bg-[#00f5d4]" />
        Launching soon
      </div>
      <h1 className="mt-5 text-3xl font-medium text-[#e2e8f0] md:text-5xl">
        Hot Cases<span className="text-[#a855f7]">.</span>
        <br />
        <span className="text-[#00f5d4]">A free 30-minute case every Monday.</span>
      </h1>
      <p className="mt-6 text-base text-[#e2e8f0]/80 md:text-lg">
        One pattern. One schema. Two SQL exercises. A four-bullet CEO briefing.
        Auto-graded on a three-axis rubric. Your score lands in your public
        Atelier Rank. Free forever — never paywalled.
      </p>

      <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="border-l-2 border-[#00f5d4] pl-4">
          <div className="font-mono text-[11px] uppercase tracking-wider text-[#00f5d4]">
            Every Monday
          </div>
          <p className="mt-2 text-sm text-[#e2e8f0]/80">
            A new Hot Case lands at 8am ET. Synthesised by RealityDB.
            Always free.
          </p>
        </div>
        <div className="border-l-2 border-[#06d6a0] pl-4">
          <div className="font-mono text-[11px] uppercase tracking-wider text-[#06d6a0]">
            30 minutes
          </div>
          <p className="mt-2 text-sm text-[#e2e8f0]/80">
            Read-in, two exercises, a four-bullet briefing. Sized for a
            Sunday evening or a Monday lunch break.
          </p>
        </div>
        <div className="border-l-2 border-[#a855f7] pl-4">
          <div className="font-mono text-[11px] uppercase tracking-wider text-[#a855f7]">
            Auto-graded · ranked
          </div>
          <p className="mt-2 text-sm text-[#e2e8f0]/80">
            Three-axis rubric: pattern detection, quantification, recommendation
            specificity. Your score feeds your public Atelier Rank.
          </p>
        </div>
      </div>

      <div className="mt-12 border border-[#1e293b] bg-[#111827] p-6 md:p-8">
        <div className="font-mono text-xs uppercase tracking-wider text-[#64748b]">
          Hot Case 001 — preview
        </div>
        <h2 className="mt-2 text-xl font-medium text-[#e2e8f0]">
          The Cohort Collapse
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-[#e2e8f0]/80">
          A B2B SaaS reports 6% MRR growth. Best quarter in two years. The CEO
          wants four talking points for the board. The CFO writes back: pull the
          cohort numbers first. Something feels soft.
        </p>
        <p className="mt-3 text-xs text-[#64748b]">
          The teachable insight: total MRR growth without cohort decomposition
          is a lie of omission. Ships in the first publish window.
        </p>
      </div>

      <p className="mt-12 text-center text-sm text-[#64748b]">
        Want to be notified when Hot Case 001 publishes?
      </p>
      <div className="mt-4 flex justify-center gap-3">
        <Link
          href="/auth/signup?source=hot-cases"
          className="inline-flex items-center gap-2 bg-[#00f5d4] px-5 py-3 text-sm font-medium text-[#0a0f1a] transition hover:opacity-90"
        >
          Create an account
        </Link>
        <Link
          href="/companies/novapay"
          className="inline-flex items-center gap-2 border border-[#06d6a0]/60 px-5 py-3 text-sm font-medium text-[#06d6a0] transition hover:bg-[#06d6a0]/10"
        >
          See a full module
        </Link>
      </div>
    </div>
  );
}
