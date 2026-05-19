import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CompanyCard, type CompanyCardProps } from "@/components/company/CompanyCard";

const COMPANIES: CompanyCardProps[] = [
  {
    slug: "novapay",
    name: "NovaPay",
    domain: "FinTech SaaS",
    teaser:
      "A Series B payments company. The lead investor flagged retention. Find out why.",
    available: true,
    tables: 13,
    rows: 50000,
  },
  {
    slug: "medcore",
    name: "MedCore Health",
    domain: "Healthcare",
    teaser:
      "A regional hospital system. Net collection rate dropped 4 points. Find out why.",
    available: true,
    tables: 12,
    rows: 50000,
  },
  {
    slug: "supplylink",
    name: "SupplyLink Operations",
    domain: "Supply Chain",
    teaser:
      "A manufacturer. COGS up 11 points. On-time delivery down 12 points. Find out why.",
    available: true,
    tables: 10,
    rows: 50000,
  },
  {
    slug: "towernet",
    name: "TowerNet Communications",
    domain: "Telecom",
    teaser:
      "A mobile operator. Churn jumped from 2.1% to 2.9% in one region. Find out why.",
    available: true,
    tables: 10,
    rows: 50000,
  },
  {
    slug: "clearbank",
    name: "ClearBank Financial",
    domain: "AML / Banking",
    teaser:
      "A regional bank. Internal audit flagged unusual wire activity. Find out why.",
    available: true,
    tables: 11,
    rows: 50000,
  },
  {
    slug: "oncocare",
    name: "OncoCare Therapeutics",
    domain: "Oncology",
    teaser:
      "A Phase III trial. Overall response rate: 49.8%. The FDA threshold is 50%. Find out why.",
    available: true,
    tables: 12,
    rows: 30000,
  },
];

export default function HomePage() {
  return (
    <div className="mx-auto max-w-[1280px] px-6 py-16 md:py-24">
      <section className="mx-auto max-w-3xl text-center">
        <div className="inline-flex items-center gap-2 border border-[#1e293b] bg-[#111827] px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-[#64748b]">
          <span className="inline-block size-1.5 rounded-full bg-[#06d6a0]" />
          Six modules live · New module weekly · Auto-graded and ranked
        </div>
        <h1 className="mt-6 text-4xl font-medium tracking-tight text-[#e2e8f0] md:text-6xl">
          Don&apos;t read about the business.
          <br />
          <span className="text-[#00f5d4]">Interrogate its dynamics in data</span>
          <span className="text-[#a855f7]">.</span>
        </h1>
        <p className="mt-6 text-base text-[#e2e8f0] md:text-lg">
          A growing catalog of synthetic companies in real PostgreSQL. One CEO
          briefing that proves you understood the business —{" "}
          <span className="text-[#00f5d4]">not just the queries</span>.
        </p>
        <p className="mt-3 text-sm text-[#64748b]">
          The credential names the crisis you solved, not the course you finished.
        </p>
        <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/companies/novapay"
            className="inline-flex items-center gap-2 bg-[#06d6a0] px-5 py-3 text-sm font-medium text-[#0a0f1a] transition hover:bg-[#06d6a0]/90"
          >
            Start with NovaPay
            <ArrowRight className="size-4" />
          </Link>
          <Link
            href="#built-for"
            className="inline-flex items-center gap-2 border border-[#a855f7]/60 px-5 py-3 text-sm font-medium text-[#a855f7] transition hover:bg-[#a855f7]/10"
          >
            Built for your team
          </Link>
          <Link
            href="/pricing"
            className="text-sm text-[#64748b] hover:text-[#e2e8f0]"
          >
            View pricing →
          </Link>
        </div>
      </section>

      <section className="mt-20 md:mt-28">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {COMPANIES.map((c) => (
            <CompanyCard key={c.slug} {...c} />
          ))}
        </div>
      </section>

      <section className="mt-20 grid grid-cols-1 gap-10 md:mt-28 md:grid-cols-3 md:gap-6">
        <ValueProp
          number="01"
          accent="green"
          title="Query the database"
          body="Real PostgreSQL via PGlite. No setup. No account needed to explore."
        />
        <ValueProp
          number="02"
          accent="cyan"
          title="Discover the story"
          body="The insight is in the data — not in a case document. You find it. Or you miss it."
        />
        <ValueProp
          number="03"
          accent="purple"
          title="Brief the CEO"
          body="Write the memo. Cite your queries. Earn the credential."
        />
      </section>

      <section className="mt-24 border-y border-[#1e293b] py-12 md:mt-32">
        <div className="grid grid-cols-1 gap-10 text-center md:grid-cols-3 md:gap-6">
          <ProofStat
            figure="$3.1B"
            accent="purple"
            caption="TD Bank's 2024 AML penalty — attributed by the OCC to inadequate training, not missing technology."
            sourceUrl="https://bankingjournal.aba.com/2024/11/td-bank-agrees-to-pay-3-1-billion-to-resolve-aml-allegations/"
            sourceLabel="ABA Banking Journal · 2024"
          />
          <ProofStat
            figure="11%"
            accent="cyan"
            caption="of employees feel fully confident working with data, even though 85% of executives call it critical."
            sourceUrl="https://www.datacamp.com/blog/introducing-the-state-of-data-and-ai-literacy-report-2025"
            sourceLabel="DataCamp State of Data & AI Literacy · 2025"
          />
          <ProofStat
            figure="48%"
            accent="green"
            caption="of business decisions in 2022 were made with data — down from 50% in 2021. The line is going the wrong way."
            sourceUrl="https://www.forrester.com/blogs/want-to-improve-employees-insights-driven-decision-making-data-literacy-programs-alone-wont-help/"
            sourceLabel="Forrester · 2022"
          />
        </div>
      </section>

      <section id="built-for" className="mt-24 md:mt-32">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-medium tracking-tight text-[#e2e8f0] md:text-4xl">
            Built for the people who decide{" "}
            <span className="text-[#a855f7]">what to do next</span>
            <span className="text-[#a855f7]">.</span>
          </h2>
          <p className="mt-3 text-sm text-[#64748b]">
            Six modules. Three audiences. One deliverable: a CEO briefing graded against a 5-axis rubric.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-3">
          <PersonaCard
            accent="green"
            label="L&D & Analytics Leaders"
            headline="Stop paying for course completions. Pay for graded briefings."
            body="One ten-seat cohort. Four to six hours per learner. Six graded CEO briefings per analyst. The deliverable lives on a server your CFO can audit."
            ctaLabel="See team pricing"
            ctaHref="/pricing"
            stat="$9,999 per cohort · under the $10K procurement threshold"
          />
          <PersonaCard
            accent="cyan"
            label="Compliance & Clinical Ops"
            headline="Investigation, not click-through."
            body="ClearBank buries a three-account structuring pattern in 18 months of synthetic transactions. OncoCare hides one underdosing trial site below the FDA threshold. Both grade epistemic honesty as hard as accuracy."
            ctaLabel="Open ClearBank"
            ctaHref="/companies/clearbank"
            stat="$15M FinCEN exposure embedded · OncoCare ORR shifts 49.8% → 54.1% when SITE-07 is excluded"
          />
          <PersonaCard
            accent="purple"
            label="MBA Programs"
            headline="What AACSB Digital Agility looks like when it isn't a slide."
            body="Six industry verticals. Unlimited students. Every credential names the specific crisis the graduate solved, with a verification URL a recruiter can read in three seconds."
            ctaLabel="MBA semester license"
            ctaHref="/pricing"
            stat="$14,999 / semester · ≈ $250 per student in a 60-person cohort"
          />
        </div>
      </section>

      <section className="mt-24 border border-[#1e293b] bg-[#111827] p-8 md:mt-32 md:p-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-10">
          <div className="md:col-span-2">
            <div className="font-mono text-xs uppercase tracking-wider text-[#00f5d4]">
              The reframe
            </div>
            <h3 className="mt-2 text-2xl font-medium text-[#e2e8f0] md:text-3xl">
              &ldquo;Your analysts can read a dashboard. After this, they can{" "}
              <span className="text-[#00f5d4]">interrogate the database</span>{" "}
              behind it and{" "}
              <span className="text-[#a855f7]">brief the CEO</span>.&rdquo;
            </h3>
            <p className="mt-4 max-w-2xl text-sm text-[#64748b]">
              DataCamp grades whether your SQL returned the right rows. Coursera grades
              whether your peers liked your essay. Atelier grades whether you would be
              hired as the analyst who saved the company. The credential names the
              crisis, not the course.
            </p>
          </div>
          <div className="flex flex-col justify-end gap-3 border-l border-[#1e293b] pl-8">
            <Link
              href="/companies/novapay"
              className="bg-[#06d6a0] px-4 py-2 text-center text-sm font-medium text-[#0a0f1a] transition hover:bg-[#06d6a0]/90"
            >
              Try NovaPay free
            </Link>
            <Link
              href="/pricing"
              className="border border-[#a855f7]/60 px-4 py-2 text-center text-sm font-medium text-[#a855f7] transition hover:bg-[#a855f7]/10"
            >
              See pricing
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

const ACCENT_HEX: Record<"cyan" | "green" | "purple", string> = {
  cyan: "#00f5d4",
  green: "#06d6a0",
  purple: "#a855f7",
};

function ValueProp({
  number,
  accent,
  title,
  body,
}: {
  number: string;
  accent: "cyan" | "green" | "purple";
  title: string;
  body: string;
}) {
  const accentColor = ACCENT_HEX[accent];
  return (
    <div className="border-l-2 pl-5" style={{ borderColor: accentColor }}>
      <div
        className="font-mono text-xs uppercase tracking-wider"
        style={{ color: accentColor }}
      >
        {number}
      </div>
      <div className="mt-1 text-sm font-medium text-[#e2e8f0]">{title}</div>
      <p className="mt-2 text-sm leading-relaxed text-[#64748b]">{body}</p>
    </div>
  );
}

function ProofStat({
  figure,
  accent,
  caption,
  sourceUrl,
  sourceLabel,
}: {
  figure: string;
  accent: "cyan" | "green" | "purple";
  caption: string;
  sourceUrl: string;
  sourceLabel: string;
}) {
  const accentColor = ACCENT_HEX[accent];
  return (
    <div className="px-2">
      <div
        className="font-mono text-4xl font-medium md:text-5xl"
        style={{ color: accentColor }}
      >
        {figure}
      </div>
      <p className="mt-3 text-sm leading-relaxed text-[#e2e8f0]/80">{caption}</p>
      <a
        href={sourceUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2 inline-block text-[11px] uppercase tracking-wider text-[#64748b] underline-offset-2 hover:text-[#e2e8f0] hover:underline"
      >
        {sourceLabel}
      </a>
    </div>
  );
}

function PersonaCard({
  accent,
  label,
  headline,
  body,
  ctaLabel,
  ctaHref,
  stat,
}: {
  accent: "cyan" | "green" | "purple";
  label: string;
  headline: string;
  body: string;
  ctaLabel: string;
  ctaHref: string;
  stat: string;
}) {
  const accentColor = ACCENT_HEX[accent];
  return (
    <div className="flex flex-col border border-[#1e293b] bg-[#111827] p-6">
      <div
        className="font-mono text-[11px] uppercase tracking-wider"
        style={{ color: accentColor }}
      >
        {label}
      </div>
      <h3 className="mt-3 text-lg font-medium text-[#e2e8f0]">{headline}</h3>
      <p className="mt-3 text-sm leading-relaxed text-[#64748b]">{body}</p>
      <div className="mt-4 border-t border-[#1e293b] pt-3 text-xs text-[#e2e8f0]/80">
        {stat}
      </div>
      <Link
        href={ctaHref}
        className="mt-5 inline-flex items-center gap-2 self-start border px-3 py-1.5 text-xs uppercase tracking-wider transition"
        style={{
          borderColor: `${accentColor}55`,
          color: accentColor,
        }}
      >
        {ctaLabel}
        <ArrowRight className="size-3" />
      </Link>
    </div>
  );
}
