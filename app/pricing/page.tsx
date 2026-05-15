import Link from "next/link";
import { Check } from "lucide-react";

interface Tier {
  name: string;
  price: string;
  cadence: string;
  description: string;
  features: string[];
  ctaLabel: string;
  ctaHref: string;
  ctaIsContact: boolean;
  highlighted?: boolean;
}

const TIERS: Tier[] = [
  {
    name: "Module",
    price: "$499",
    cadence: "one-time",
    description: "One company, lifetime access. The full deliverable.",
    features: [
      "10 exercises + CEO briefing",
      "PGlite in-browser PostgreSQL",
      "Auto-graded SQL + LLM-graded memo",
      "Verifiable Business Acumen Certificate",
    ],
    ctaLabel: "Start NovaPay",
    ctaHref: "/companies/novapay",
    ctaIsContact: false,
  },
  {
    name: "All-Access",
    price: "$1,499",
    cadence: "one-time",
    description: "All six companies as they ship.",
    features: [
      "Every module (NovaPay → OncoCare)",
      "Lifetime updates",
      "Six certificates",
      "Priority email support",
    ],
    ctaLabel: "Get all-access",
    ctaHref: "/auth/signup",
    ctaIsContact: false,
    highlighted: true,
  },
  {
    name: "Team",
    price: "$9,999",
    cadence: "10 seats · 1 year",
    description: "One company, team training. Cohort progress dashboard.",
    features: [
      "10 student seats",
      "Cohort progress dashboard",
      "Admin invites & deadlines",
      "Cohort report at end of term",
    ],
    ctaLabel: "Contact us",
    ctaHref: "mailto:hello@realitydb.dev?subject=Atelier Team",
    ctaIsContact: true,
  },
  {
    name: "MBA License",
    price: "$14,999",
    cadence: "per semester",
    description: "All companies, unlimited students, program-wide.",
    features: [
      "All six modules",
      "Unlimited student seats",
      "Instructor dashboard",
      "LMS integration available",
    ],
    ctaLabel: "Contact us",
    ctaHref: "mailto:hello@realitydb.dev?subject=Atelier MBA License",
    ctaIsContact: true,
  },
];

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-[1280px] px-6 py-16">
      <header className="mx-auto max-w-2xl text-center">
        <h1 className="text-3xl font-medium text-[#e2e8f0] md:text-4xl">
          Choose how you learn.
        </h1>
        <p className="mt-3 text-sm text-[#64748b]">
          One module, all six, or program-wide. Stripe checkout wires up in v2.
        </p>
      </header>

      <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {TIERS.map((t) => (
          <div
            key={t.name}
            className={`flex flex-col border p-6 ${
              t.highlighted
                ? "border-[#06d6a0]/50 bg-[#06d6a0]/5"
                : "border-[#1e293b] bg-[#111827]"
            }`}
          >
            <h2 className="text-sm font-medium uppercase tracking-wider text-[#64748b]">
              {t.name}
            </h2>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-medium text-[#e2e8f0]">
                {t.price}
              </span>
              <span className="text-xs text-[#64748b]">{t.cadence}</span>
            </div>
            <p className="mt-2 text-xs text-[#64748b]">{t.description}</p>

            <ul className="mt-5 flex-1 space-y-2 text-sm text-[#e2e8f0]/80">
              {t.features.map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <Check className="mt-0.5 size-4 shrink-0 text-[#06d6a0]" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            <CtaButton tier={t} />
          </div>
        ))}
      </div>

      <p className="mt-10 text-center text-[11px] text-[#64748b]">
        All tiers include the Business Acumen Certificate. Stripe checkout
        coming in v2.
      </p>
    </div>
  );
}

function CtaButton({ tier }: { tier: Tier }) {
  const className = tier.highlighted
    ? "mt-6 block w-full bg-[#06d6a0] px-4 py-2 text-center text-sm font-medium text-[#0a0f1a] hover:bg-[#06d6a0]/90"
    : "mt-6 block w-full border border-[#1e293b] px-4 py-2 text-center text-sm text-[#e2e8f0] hover:border-[#06d6a0] hover:text-[#06d6a0]";

  if (tier.ctaIsContact) {
    return (
      <a href={tier.ctaHref} className={className}>
        {tier.ctaLabel}
      </a>
    );
  }
  return (
    <Link href={tier.ctaHref} className={className}>
      {tier.ctaLabel}
    </Link>
  );
}
