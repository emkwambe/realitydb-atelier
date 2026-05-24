import type { Metadata } from "next";
import Link from "next/link";
import { WaitlistForm } from "./_WaitlistForm";

export const metadata: Metadata = {
  title: "Join the waitlist · RealityDb Atelier",
  description:
    "The business school that runs on live data. First Hot Case drops June 16. No account required to attempt.",
};

export default function WaitlistPage() {
  return (
    <div className="min-h-screen bg-[#0a0f1e] text-[#e2e8f0]">
      <div className="md:grid md:min-h-screen md:grid-cols-[55fr_45fr]">
        <LeftColumn />
        <RightColumn />
      </div>
    </div>
  );
}

/* ---------- Left column ---------- */

function LeftColumn() {
  return (
    <section className="px-6 py-10 md:px-12 md:py-12">
      {/* Logo + tagline — hidden on mobile (right column carries the
          headline at the top of the form on small screens). */}
      <div className="hidden md:block">
        <Link
          href="/"
          className="font-mono text-sm tracking-tight hover:opacity-90"
        >
          <span className="text-[#06d6a0]">RealityDb</span>{" "}
          <span className="text-[#00f5d4]">Atelier</span>
        </Link>
        <p className="mt-2 text-sm text-[#94a3b8]">
          The business school that runs on live data.
        </p>
      </div>

      {/* Problem statement — no heading, lead prose. */}
      <p className="text-base leading-[1.7] text-[#94a3b8] md:mt-10">
        Most analytics training teaches you to run queries. None of it
        teaches you what to do with the answer. Atelier closes that gap.
      </p>

      <SectionHeading>How it works</SectionHeading>
      <ol className="mt-3 space-y-5">
        <Step
          n="01"
          title="A real database"
          body="50,000 rows of synthetic company data. Real PostgreSQL. No install. Industry-accurate schemas with citation trails."
        />
        <Step
          n="02"
          title="A business crisis"
          body="A CFO. A board meeting. 90 minutes. A metric that looks healthy on the surface — and something soft underneath. Your job is to find it."
        />
        <Step
          n="03"
          title="A CEO briefing"
          body="Write your analysis under time pressure. An AI grades your judgment on three axes: pattern detection, quantification, and recommendation specificity."
        />
      </ol>

      <SectionHeading>The credential</SectionHeading>
      <p className="mt-3 text-[15px] leading-relaxed text-[#e2e8f0]">
        The credential names the crisis you solved — not the course you
        finished. It is signed, publicly verifiable, and tied to a specific
        dataset and score.
      </p>

      <SectionHeading>The first Hot Case</SectionHeading>
      <article className="mt-3 border border-[#1e293b] bg-[#111827] p-5">
        <div className="font-mono text-[11px] uppercase tracking-wider text-[#64748b]">
          B2B SaaS · Financial Intelligence ·{" "}
          <span className="text-[#06d6a0]">Free</span>
        </div>
        <h3 className="mt-2 text-lg font-medium text-[#e2e8f0]">
          The Cohort Collapse
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-[#94a3b8]">
          NovaPay reports 6% MRR growth. The CFO sends one message before
          the board meeting:{" "}
          <span className="italic text-[#00f5d4]">
            &ldquo;Pull the cohort numbers first. Something feels soft.&rdquo;
          </span>{" "}
          You have 90 minutes.
        </p>
        <div className="mt-4 border-t border-[#1e293b] pt-3 font-mono text-[11px] uppercase tracking-wider text-[#64748b]">
          Available June 16 · ~30 minutes · No account required
        </div>
      </article>

      <SectionHeading>Who this is for</SectionHeading>
      <ul className="mt-3 space-y-2 text-sm leading-relaxed text-[#94a3b8]">
        <PersonaItem>
          Analysts moving into strategy or finance roles
        </PersonaItem>
        <PersonaItem>
          Data professionals who want to prove business judgment
        </PersonaItem>
        <PersonaItem>
          MBA students building a real analytical portfolio
        </PersonaItem>
      </ul>
    </section>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mt-10 text-[11px] font-medium uppercase tracking-[0.16em] text-[#06d6a0]">
      {children}
    </h2>
  );
}

function Step({ n, title, body }: { n: string; title: string; body: string }) {
  return (
    <li className="flex gap-3">
      <span className="shrink-0 font-mono text-[13px] font-bold text-[#06d6a0]">
        {n}
      </span>
      <div>
        <div className="text-sm font-medium text-[#e2e8f0]">{title}</div>
        <p className="mt-1 text-sm leading-relaxed text-[#94a3b8]">{body}</p>
      </div>
    </li>
  );
}

function PersonaItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-2">
      <span className="text-[#06d6a0]">—</span>
      <span>{children}</span>
    </li>
  );
}

/* ---------- Right column (sticky, vertically centered, the conversion panel) ---------- */

function RightColumn() {
  return (
    <aside
      className="border-t border-[#1e2d45] bg-[#0d1526] px-6 py-10 md:sticky md:top-0 md:flex md:h-screen md:items-center md:border-l md:border-t-0 md:px-12"
    >
      <div className="w-full max-w-[480px] md:mx-auto">
        <h1 className="text-3xl font-medium leading-tight text-[#e2e8f0] md:text-4xl">
          The business school that runs on{" "}
          <span className="text-[#00f5d4]">live data</span>
          <span className="text-[#a855f7]">.</span>
        </h1>

        <p className="mt-3 text-sm text-[#94a3b8]">
          The first Hot Case drops{" "}
          <span className="text-[#06d6a0]">June 16</span>. Free. No account
          required to attempt.
        </p>

        <blockquote className="mt-7 border-l-2 border-[#00f5d4] bg-[#111827] px-4 py-3 text-sm leading-relaxed text-[#e2e8f0]/90">
          NovaPay reports 6% MRR growth. The CFO sends one message before the
          board meeting:{" "}
          <span className="italic text-[#00f5d4]">
            &ldquo;Pull the cohort numbers first. Something feels soft.&rdquo;
          </span>{" "}
          You have 90 minutes.
        </blockquote>

        <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <ProofPoint
            figure={
              <>
                59 <span className="text-[#06d6a0]">→</span> 94
              </>
            }
            label="The score gap between a generic and an ideal briefing"
          />
          <ProofPoint
            figure="50,000"
            label="Rows of real PostgreSQL data in the first exercise"
          />
          <ProofPoint
            figure="60 sec"
            label="Time to receive your AI-graded score"
          />
        </div>

        <div className="mt-8">
          <WaitlistForm source="waitlist-page" />
        </div>

        <p className="mt-10 text-center text-xs text-[#64748b]">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-[#06d6a0] hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </aside>
  );
}

function ProofPoint({
  figure,
  label,
}: {
  figure: React.ReactNode;
  label: string;
}) {
  return (
    <div className="border-l-2 border-[#1e293b] pl-3">
      <div className="font-mono text-base font-medium text-[#e2e8f0]">
        {figure}
      </div>
      <p className="mt-1 text-[11px] leading-relaxed text-[#64748b]">{label}</p>
    </div>
  );
}
