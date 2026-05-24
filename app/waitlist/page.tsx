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

/* ============================================================
   LEFT COLUMN — the depth of Atelier
   ============================================================ */

// NovaPay's 10-exercise module arc, surfaced in Step 03 so visitors see
// the structured investigation behind the briefing — not just the
// briefing. Hot Cases (3 exercises) are the free on-ramp; modules
// (10 exercises) are the full product.
const NOVAPAY_ARC: readonly string[] = [
  "Read the room — is the business growing?",
  "Where is revenue coming from?",
  "Is churn getting better or worse?",
  "Who is actually churning?",
  "LTV:CAC by segment",
  "Net Revenue Retention",
  "Revenue concentration risk",
  "Follow the complaints",
  "Confirm the cause",
  "Quantify the decision",
  "CEO Briefing — write the memo, cite your queries",
];

interface Dimension {
  n: string;
  name: string;
  skills: string[];
  company: string;
}

const DIMENSIONS: readonly Dimension[] = [
  {
    n: "01",
    name: "Financial Intelligence",
    skills: ["Revenue trends · Cohort decay", "Unit economics · LTV:CAC"],
    company: "NovaPay",
  },
  {
    n: "02",
    name: "Clinical Intelligence",
    skills: ["Trial outcomes · Protocol risk", "Regulatory thresholds · FDA signals"],
    company: "OncoCare",
  },
  {
    n: "03",
    name: "Operational Intelligence",
    skills: ["Supply chain efficiency", "COGS pressure · Delivery SLA"],
    company: "SupplyLink",
  },
  {
    n: "04",
    name: "Risk & Compliance Intelligence",
    skills: ["AML pattern detection", "Wire anomalies · Exposure gaps"],
    company: "ClearBank",
  },
  {
    n: "05",
    name: "Growth Intelligence",
    skills: ["Churn by region · ARPU trends", "Network investment ROI"],
    company: "TowerNet",
  },
  {
    n: "06",
    name: "Healthcare Systems Intelligence",
    skills: ["Net collection rate · Payer mix", "Readmission risk · Cost per case"],
    company: "MedCore",
  },
];

function LeftColumn() {
  return (
    <section className="px-6 py-10 md:px-12 md:py-12">
      {/* A. Logo + tagline — hidden on mobile (right column carries the
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

      {/* B. Problem statement */}
      <p className="text-base leading-[1.7] text-[#94a3b8] md:mt-10">
        Most analytics training teaches you to run queries. None of it
        teaches you what to do with the answer. Atelier closes that gap.
      </p>

      {/* C. How it works */}
      <SectionHeading>How it works</SectionHeading>
      <ol className="mt-3 space-y-5">
        <Step
          n="01"
          title="A real database"
          body={
            <>
              <p>
                50,000 rows of synthetic company data. Real PostgreSQL. No
                install. Industry-accurate schemas with citation trails.
              </p>
              <p className="mt-3">
                Six companies across six verticals — each with a full
                operational history:
              </p>
              <ul className="mt-2 space-y-1.5">
                <Company name="NovaPay" vertical="B2B SaaS payments platform" />
                <Company name="MedCore Health" vertical="Regional hospital system" />
                <Company name="SupplyLink Operations" vertical="Manufacturing supply chain" />
                <Company name="TowerNet Communications" vertical="Mobile network operator" />
                <Company name="ClearBank Financial" vertical="Regional bank, AML compliance" />
                <Company name="OncoCare Therapeutics" vertical="Phase III oncology trial" />
              </ul>
              <p className="mt-3 text-[12px] italic text-[#475569]">
                More companies added quarterly.
              </p>
            </>
          }
        />
        <Step
          n="02"
          title="A business crisis"
          body="A CFO. A board meeting. 90 minutes. A metric that looks healthy on the surface — and something soft underneath. Your job is to find it."
        />
        <Step
          n="03"
          title="A structured investigation"
          body={
            <>
              <p>
                Each module is 10 exercises built as a complete business
                investigation — from reading the surface metrics to finding
                the root cause to quantifying the decision.
              </p>
              <p className="mt-3 text-[13px] text-[#94a3b8]">
                The arc for NovaPay (B2B SaaS):
              </p>
              <ol className="mt-2 space-y-1 text-[12px] leading-relaxed text-[#64748b]">
                {NOVAPAY_ARC.map((step) => (
                  <li key={step} className="flex gap-2">
                    <span className="shrink-0 text-[#06d6a0]">→</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
              <p className="mt-3 text-[12px] italic text-[#475569]">
                Every module ends with a graded CEO briefing. The credential
                lands when you earn it.
              </p>
            </>
          }
        />
      </ol>

      {/* D. The curriculum */}
      <SectionHeading>The curriculum</SectionHeading>
      <p className="mt-3 text-[15px] leading-relaxed text-[#e2e8f0]">
        Six dimensions of business acumen. One for each company. Each
        dimension builds a specific type of judgment.
      </p>
      <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {DIMENSIONS.map((d) => (
          <DimensionCard key={d.n} dim={d} />
        ))}
      </div>
      <p className="mt-3 text-center text-[12px] italic text-[#475569]">
        Each module is independent. Start with any vertical.
      </p>

      {/* E. The credential */}
      <SectionHeading>The credential</SectionHeading>
      <p className="mt-3 text-[15px] leading-relaxed text-[#e2e8f0]">
        Every completed module produces a signed, publicly verifiable
        credential. The credential records:
      </p>
      <ul className="mt-3 space-y-1.5 text-sm text-[#94a3b8]">
        <CredentialItem>The crisis you identified</CredentialItem>
        <CredentialItem>The dataset and schema you worked with</CredentialItem>
        <CredentialItem>Your score across three axes of judgment</CredentialItem>
      </ul>
      <p className="mt-4 text-[13px] leading-relaxed text-[#94a3b8]">
        Atelier Rank tracks your performance across all modules and Hot
        Cases — weighted by score and volume, not just completion. Your
        profile shows where you are strong and where to go next.
      </p>

      {/* F. The first Hot Case */}
      <SectionHeading>The first Hot Case</SectionHeading>
      <p className="mt-3 text-[13px] text-[#64748b]">
        Hot Cases are weekly 30-minute exercises — the free on-ramp to the
        full modules. No account required.
      </p>
      <article className="mt-3 border border-[#1e293b] bg-[#111827] p-5">
        <div className="font-mono text-[11px] uppercase tracking-wider text-[#64748b]">
          B2B SaaS · Financial Intelligence ·{" "}
          <span className="text-[#a855f7]">Free</span>
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

      {/* G. Built for three audiences */}
      <SectionHeading>Built for three audiences</SectionHeading>
      <div className="mt-4 space-y-3">
        <AudienceCard
          accent="#06d6a0"
          title="Individual professionals"
          body="Analysts, finance professionals, and MBA students building verifiable business acumen. Self-serve Stripe checkout. Cancel anytime."
          pricing="From $32.50/month · Module or All-Access"
        />
        <AudienceCard
          accent="#a855f7"
          title="Corporate L&D teams"
          body="Invest in analyst capability at scale. Cohort dashboards, progress tracking, and team reports. Under the $10K procurement threshold — one person can sign."
          pricing="From $9,999/year · 10 seats"
        />
        <AudienceCard
          accent="#f59e0b"
          title="Universities and MBA programs"
          body="Embed business acumen into analytics and finance curricula. Semester licensing, instructor dashboards, LMS integration, and student credentials."
          pricing="From $4,999/semester · Up to 30 students"
        />
      </div>
      <p className="mt-3 text-center text-[12px] italic text-[#475569]">
        The credential is the same in every tier — signed, verifiable, named
        to the crisis solved.
      </p>
    </section>
  );
}

/* ---------- Left-column subcomponents ---------- */

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mt-10 text-[11px] font-medium uppercase tracking-[0.16em] text-[#06d6a0]">
      {children}
    </h2>
  );
}

function Step({
  n,
  title,
  body,
}: {
  n: string;
  title: string;
  body: React.ReactNode;
}) {
  return (
    <li className="flex gap-3">
      <span className="shrink-0 font-mono text-[13px] font-bold text-[#06d6a0]">
        {n}
      </span>
      <div>
        <div className="text-sm font-medium text-[#e2e8f0]">{title}</div>
        {typeof body === "string" ? (
          <p className="mt-1 text-sm leading-relaxed text-[#94a3b8]">{body}</p>
        ) : (
          <div className="mt-1 text-sm leading-relaxed text-[#94a3b8]">
            {body}
          </div>
        )}
      </div>
    </li>
  );
}

function Company({ name, vertical }: { name: string; vertical: string }) {
  return (
    <li className="flex gap-2 text-[13px] text-[#94a3b8]">
      <span className="text-[#475569]">·</span>
      <span>
        <span className="font-semibold text-[#e2e8f0]">{name}</span>
        <span className="text-[#475569]"> — </span>
        {vertical}
      </span>
    </li>
  );
}

function DimensionCard({ dim }: { dim: Dimension }) {
  return (
    <div className="rounded-md border border-[#1e2d45] bg-[#0d1526] px-4 py-3 transition hover:border-[#06d6a0]">
      <div className="flex items-baseline justify-between gap-3">
        <div className="font-mono text-[11px] text-[#06d6a0]">{dim.n}</div>
        <div className="font-mono text-[11px] text-[#475569]">
          {dim.company}
        </div>
      </div>
      <div className="mt-1 text-[14px] font-semibold text-[#e2e8f0]">
        {dim.name}
      </div>
      <ul className="mt-2 space-y-0.5 text-[12px] leading-relaxed text-[#94a3b8]">
        {dim.skills.map((s) => (
          <li key={s}>{s}</li>
        ))}
      </ul>
    </div>
  );
}

function CredentialItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-2">
      <span className="text-[#06d6a0]">·</span>
      <span>{children}</span>
    </li>
  );
}

function AudienceCard({
  accent,
  title,
  body,
  pricing,
}: {
  accent: string;
  title: string;
  body: string;
  pricing: string;
}) {
  return (
    <div
      className="rounded-r-md bg-[#0d1526] px-5 py-4"
      style={{ borderLeft: `3px solid ${accent}` }}
    >
      <div className="text-[13px] font-semibold text-[#e2e8f0]">{title}</div>
      <p className="mt-1.5 text-[13px] leading-relaxed text-[#94a3b8]">{body}</p>
      <p className="mt-2 text-[12px] text-[#64748b]">{pricing}</p>
    </div>
  );
}

/* ============================================================
   RIGHT COLUMN — the conversion panel (untouched copy/form)
   ============================================================ */

function RightColumn() {
  return (
    <aside className="border-t border-[#1e2d45] bg-[#0d1526] px-6 py-10 md:sticky md:top-0 md:flex md:h-screen md:items-center md:border-l md:border-t-0 md:px-12">
      <div className="w-full max-w-[480px] md:mx-auto">
        <h1 className="text-3xl font-medium leading-tight text-[#e2e8f0] md:text-4xl">
          The business school that runs on{" "}
          <span className="text-[#00f5d4]">live data</span>
          <span className="text-[#a855f7]">.</span>
        </h1>

        <p className="mt-3 text-sm text-[#94a3b8]">
          The first Hot Case drops{" "}
          <span className="text-[#06d6a0]">June 16</span>.{" "}
          <span className="text-[#a855f7]">Free.</span> No account required to
          attempt.
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
