"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";

type BillingCycle = "monthly" | "annual";

export function IndividualSegment() {
  const [cycle, setCycle] = useState<BillingCycle>("annual");

  return (
    <section className="mt-20 md:mt-28">
      <SegmentHeader
        eyebrow="Segment 1"
        title="Individual"
        accent="cyan"
        blurb="For professionals investing in themselves. Self-serve Stripe checkout. Cancel anytime."
      />

      <div className="mx-auto mt-8 inline-flex w-full justify-center">
        <div className="inline-flex items-center border border-[#1e293b] bg-[#111827] p-1 font-mono text-[11px] uppercase tracking-wider">
          <button
            onClick={() => setCycle("monthly")}
            className={`px-4 py-1.5 transition ${
              cycle === "monthly"
                ? "bg-[#1a2235] text-[#e2e8f0]"
                : "text-[#64748b] hover:text-[#e2e8f0]"
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setCycle("annual")}
            className={`px-4 py-1.5 transition ${
              cycle === "annual"
                ? "bg-[#1a2235] text-[#06d6a0]"
                : "text-[#64748b] hover:text-[#e2e8f0]"
            }`}
          >
            Annual <span className="ml-1.5 text-[10px] text-[#00f5d4]">— 2 months free</span>
          </button>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
        <TierCard
          name="Module"
          tagline="One module. Permanent access. The on-ramp."
          price={cycle === "annual" ? "$390" : "$39"}
          unit={cycle === "annual" ? "/year" : "/month"}
          subnote={cycle === "annual" ? "Equivalent to $32.50/mo" : "or $390/year (save $78)"}
          features={[
            "One module of your choosing — permanent",
            "All Hot Cases in that vertical",
            "Atelier Rank updates as you progress",
            "Co-Pilot access (coming soon)",
            "Limited Boardroom: 1 simulation/week (coming soon)",
          ]}
          ctaLabel="Subscribe"
          planKey="module"
          billing={cycle}
          accent="cyan"
        />
        <TierCard
          name="All-Access"
          tagline="Every module, every Hot Case, every dimension."
          price={cycle === "annual" ? "$1,790" : "$179"}
          unit={cycle === "annual" ? "/year" : "/month"}
          subnote={cycle === "annual" ? "Equivalent to $149.16/mo" : "or $1,790/year (save $358)"}
          features={[
            "All six modules",
            "All Hot Cases",
            "Full Boardroom — unlimited (coming soon)",
            "Full Atelier Rank profile",
            "Priority grading",
          ]}
          ctaLabel="Subscribe"
          planKey="allaccess"
          billing={cycle}
          accent="green"
          featured
        />
      </div>
    </section>
  );
}

interface TierCardProps {
  name: string;
  tagline: string;
  price: string;
  unit: string;
  subnote?: string;
  features: string[];
  ctaLabel: string;
  planKey: "module" | "allaccess";
  billing: BillingCycle;
  accent: "cyan" | "green";
  featured?: boolean;
}

function TierCard({
  name,
  tagline,
  price,
  unit,
  subnote,
  features,
  ctaLabel,
  planKey,
  billing,
  accent,
  featured,
}: TierCardProps) {
  const accentColor = accent === "cyan" ? "#00f5d4" : "#06d6a0";
  const href = `/checkout/start?plan=${planKey}&billing=${billing}`;
  return (
    <div
      className={`relative flex flex-col gap-4 border bg-[#111827] p-6 transition ${
        featured ? "border-[#06d6a0]/60" : "border-[#1e293b] hover:border-[#1e293b]"
      }`}
    >
      {featured && (
        <div className="absolute -top-3 left-6 inline-flex items-center bg-[#06d6a0] px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-[#0a0f1a]">
          Most popular
        </div>
      )}
      <div>
        <div className="font-mono text-[11px] uppercase tracking-wider" style={{ color: accentColor }}>
          {name}
        </div>
        <p className="mt-1 text-sm text-[#e2e8f0]">{tagline}</p>
      </div>
      <div>
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-medium text-[#e2e8f0]">{price}</span>
          <span className="text-sm text-[#64748b]">{unit}</span>
        </div>
        {subnote && <p className="mt-1 text-[11px] text-[#64748b]">{subnote}</p>}
      </div>
      <ul className="space-y-1.5">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-xs text-[#e2e8f0]/80">
            <Check className="mt-0.5 size-3.5 shrink-0" style={{ color: accentColor }} />
            {f}
          </li>
        ))}
      </ul>
      <Link
        href={href}
        className={`mt-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium transition ${
          featured
            ? "bg-[#06d6a0] text-[#0a0f1a] hover:bg-[#06d6a0]/90"
            : "border border-[#1e293b] text-[#e2e8f0] hover:border-[#06d6a0] hover:text-[#06d6a0]"
        }`}
      >
        {ctaLabel}
        <ArrowRight className="size-4" />
      </Link>
    </div>
  );
}

// Shared header — lives here for now since both segments import it from elsewhere.
function SegmentHeader({
  eyebrow,
  title,
  accent,
  blurb,
}: {
  eyebrow: string;
  title: string;
  accent: "cyan" | "green";
  blurb: string;
}) {
  const c = accent === "cyan" ? "#00f5d4" : "#06d6a0";
  return (
    <div className="mx-auto max-w-2xl text-center">
      <div className="font-mono text-xs uppercase tracking-wider" style={{ color: c }}>
        {eyebrow}
      </div>
      <h2 className="mt-2 text-3xl font-medium text-[#e2e8f0] md:text-4xl">{title}</h2>
      <p className="mt-3 text-sm text-[#e2e8f0]/80">{blurb}</p>
    </div>
  );
}
