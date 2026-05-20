import type { Metadata } from "next";
import { IndividualSegment } from "./_IndividualSegment";
import { CorporateSegment } from "./_CorporateSegment";
import { AcademicSegment } from "./_AcademicSegment";

export const metadata: Metadata = {
  title: "Pricing · Atelier",
  description:
    "Atelier pricing — Individual (Module $39/mo or All-Access $179/mo), Corporate (Team, Corporate Pro, Enterprise), Academic (Program, Institution, University License, University System).",
};

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-[1280px] px-6 py-16 md:py-24">
      <header className="mx-auto max-w-3xl text-center">
        <div className="font-mono text-xs uppercase tracking-wider text-[#64748b]">
          Pricing
        </div>
        <h1 className="mt-3 text-3xl font-medium tracking-tight text-[#e2e8f0] md:text-5xl">
          One platform.{" "}
          <span className="text-[#00f5d4]">Three ways to buy it.</span>
        </h1>
        <p className="mt-4 text-sm text-[#e2e8f0]/80 md:text-base">
          Atelier develops business acumen through live data. Individuals
          subscribe directly. Organizations and institutions buy by cohort
          or by campus. The credential is the same in every tier — signed,
          publicly verifiable, named to the crisis you solved.
        </p>
      </header>

      <IndividualSegment />
      <CorporateSegment />
      <AcademicSegment />

      <section className="mt-24 border-t border-[#1e293b] pt-12 md:mt-32">
        <h2 className="text-center text-sm font-medium uppercase tracking-wider text-[#64748b]">
          What every tier includes
        </h2>
        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="border-l-2 border-[#06d6a0] pl-5">
            <div className="font-mono text-[11px] uppercase tracking-wider text-[#06d6a0]">
              Signed credential
            </div>
            <p className="mt-2 text-sm text-[#e2e8f0]/80">
              Every tier, every learner. Public verification URL names the
              crisis solved, not the course finished.
            </p>
          </div>
          <div className="border-l-2 border-[#00f5d4] pl-5">
            <div className="font-mono text-[11px] uppercase tracking-wider text-[#00f5d4]">
              Real PostgreSQL
            </div>
            <p className="mt-2 text-sm text-[#e2e8f0]/80">
              Synthetic companies at 97–99/100 data quality with citation
              trails to primary industry sources. No setup, no sample CSVs.
            </p>
          </div>
          <div className="border-l-2 border-[#06d6a0] pl-5">
            <div className="font-mono text-[11px] uppercase tracking-wider text-[#06d6a0]">
              Business acumen graded
            </div>
            <p className="mt-2 text-sm text-[#e2e8f0]/80">
              5-axis rubric including epistemic honesty. We grade judgment,
              not row-set matches.
            </p>
          </div>
        </div>

        <p className="mt-12 text-center text-xs text-[#64748b]">
          Individual tiers: Stripe self-checkout, live now. Corporate and
          Academic: pay by invoice, ACH, or wire.{" "}
          <a
            href="mailto:hello@realitydb.dev"
            className="text-[#06d6a0] hover:underline"
          >
            hello@realitydb.dev
          </a>
        </p>
      </section>
    </div>
  );
}
