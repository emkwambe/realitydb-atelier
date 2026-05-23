import type { Metadata } from "next";
import Link from "next/link";
import { CompanyCard, type CompanyCardProps } from "@/components/company/CompanyCard";

export const metadata: Metadata = {
  title: "Modules · Atelier",
  description:
    "Six company modules: NovaPay, MedCore Health, SupplyLink Operations, TowerNet Communications, ClearBank Financial, OncoCare Therapeutics. Each is a synthetic company in crisis. Each ends with a graded CEO briefing.",
};

// Symptom-only teasers — match the landing page exactly so a learner who lands
// here from a search engine sees the same framing as the marketing surface.
// Do not name the hidden crisis. "Find out why." is the call.
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

export default function CompaniesIndexPage() {
  return (
    <div className="mx-auto max-w-[1280px] px-6 py-12 md:py-16">
      <header className="mx-auto max-w-3xl text-center">
        <div className="font-mono text-xs uppercase tracking-wider text-[#64748b]">
          Modules
        </div>
        <h1 className="mt-2 text-3xl font-medium tracking-tight text-[#e2e8f0] md:text-5xl">
          Six companies.{" "}
          <span className="text-[#00f5d4]">Six crises hiding in the data.</span>
        </h1>
        <p className="mt-4 text-sm text-[#e2e8f0]/80 md:text-base">
          Each module is a synthetic company in crisis — real PostgreSQL,
          10 exercises, one graded CEO briefing. Beginner exercises are
          free; sign in to track progress and earn the credential.
        </p>
      </header>

      <section className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {COMPANIES.map((c) => (
          <CompanyCard key={c.slug} {...c} />
        ))}
      </section>

      <section className="mt-16 border-t border-[#1e293b] pt-10 text-center">
        <p className="text-sm text-[#64748b]">
          New here? Try a free{" "}
          <Link href="/hot-cases" className="text-[#00f5d4] hover:underline">
            Hot Case
          </Link>{" "}
          first — 30 minutes, no account required.
        </p>
      </section>
    </div>
  );
}
