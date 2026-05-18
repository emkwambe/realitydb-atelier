import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CompanyCard, type CompanyCardProps } from "@/components/company/CompanyCard";

const COMPANIES: CompanyCardProps[] = [
  {
    slug: "novapay",
    name: "NovaPay",
    domain: "FinTech SaaS",
    teaser: "A Series B payments company with a retention problem.",
    available: true,
    tables: 13,
    rows: 50000,
  },
  {
    slug: "medcore",
    name: "MedCore Health",
    domain: "Healthcare",
    teaser: "A hospital where one payer is quietly denying everything.",
    available: true,
    tables: 12,
    rows: 50000,
  },
  {
    slug: "supplylink",
    name: "SupplyLink Operations",
    domain: "Supply Chain",
    teaser: "A manufacturer whose on-time rate quietly collapsed at one supplier.",
    available: true,
    tables: 10,
    rows: 50000,
  },
  {
    slug: "towernet",
    name: "TowerNet Communications",
    domain: "Telecom",
    teaser: "A telco where one tower cluster is quietly driving the churn spike.",
    available: true,
    tables: 10,
    rows: 50000,
  },
  {
    slug: "clearbank",
    name: "ClearBank Financial",
    domain: "AML / Banking",
    teaser: "A regional bank with a structuring pattern hiding in plain sight.",
    available: true,
    tables: 11,
    rows: 50000,
  },
  {
    slug: "oncocare",
    name: "OncoCare",
    domain: "Oncology",
    teaser: "A clinical trial where something is underperforming.",
    available: false,
    tables: 20,
    rows: 50000,
  },
];

export default function HomePage() {
  return (
    <div className="mx-auto max-w-[1280px] px-6 py-16 md:py-24">
      <section className="mx-auto max-w-3xl text-center">
        <h1 className="text-4xl font-medium tracking-tight text-[#e2e8f0] md:text-6xl">
          Don&apos;t read about the business.
          <br />
          <span className="text-[#06d6a0]">Interrogate it.</span>
        </h1>
        <p className="mt-6 text-base text-[#e2e8f0]/80 md:text-lg">
          Six synthetic companies. Real PostgreSQL databases.
          <br />
          One CEO briefing that proves you understand the business.
        </p>
        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/companies/novapay"
            className="inline-flex items-center gap-2 rounded-md bg-[#06d6a0] px-5 py-3 text-sm font-medium text-[#0a0f1a] transition hover:bg-[#06d6a0]/90"
          >
            Start with NovaPay
            <ArrowRight className="size-4" />
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
          title="Query the database"
          body="Real PostgreSQL via PGlite. No setup. No account needed to explore."
        />
        <ValueProp
          title="Discover the story"
          body="The insight is in the data — not in a case document. You find it. Or you miss it."
        />
        <ValueProp
          title="Brief the CEO"
          body="Write the memo. Cite your queries. Earn the credential."
        />
      </section>
    </div>
  );
}

function ValueProp({ title, body }: { title: string; body: string }) {
  return (
    <div className="border-l-2 border-[#06d6a0] pl-5">
      <div className="text-sm font-medium text-[#e2e8f0]">{title}</div>
      <p className="mt-2 text-sm leading-relaxed text-[#64748b]">{body}</p>
    </div>
  );
}
