import Link from "next/link";
import { Check } from "lucide-react";

type Accent = "green" | "cyan" | "purple";

interface Tier {
  name: string;
  price: string;
  cadence: string;
  description: string;
  features: string[];
  ctaLabel: string;
  ctaHref: string;
  ctaIsContact: boolean;
  accent: Accent;
  highlighted?: boolean;
}

const ACCENT_HEX: Record<Accent, string> = {
  green: "#06d6a0",
  cyan: "#00f5d4",
  purple: "#a855f7",
};

const LEARNER_TIERS: Tier[] = [
  {
    name: "Module",
    price: "$499",
    cadence: "one-time",
    description: "One company, lifetime access. The full deliverable.",
    features: [
      "10 exercises + CEO briefing",
      "PGlite in-browser PostgreSQL",
      "Auto-graded briefing on a 5-axis rubric · feeds your rank",
      "Verifiable Business Acumen Certificate",
    ],
    ctaLabel: "Start NovaPay",
    ctaHref: "/companies/novapay",
    ctaIsContact: false,
    accent: "green",
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
    accent: "green",
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
    accent: "green",
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
    accent: "green",
  },
];

const INSTRUCTOR_TIERS: Tier[] = [
  {
    name: "Instructor Solo",
    price: "$299",
    cadence: "per month",
    description: "For one instructor running a small cohort.",
    features: [
      "Up to 3 cohorts · 30 students",
      "All six modules",
      "Custom questions (5 per module)",
      "CSV export",
    ],
    ctaLabel: "Start solo",
    ctaHref: "mailto:hello@realitydb.dev?subject=Atelier Instructor Solo",
    ctaIsContact: true,
    accent: "cyan",
  },
  {
    name: "Instructor Pro",
    price: "$799",
    cadence: "per month",
    description: "For program leads running multiple cohorts.",
    features: [
      "Unlimited cohorts & students",
      "Unlimited custom questions",
      "CSV export + PDF certificates",
      "Priority grading · class-discussion view",
    ],
    ctaLabel: "Start pro",
    ctaHref: "mailto:hello@realitydb.dev?subject=Atelier Instructor Pro",
    ctaIsContact: true,
    accent: "cyan",
    highlighted: true,
  },
  {
    name: "Enterprise / MBA",
    price: "$2,500",
    cadence: "per month",
    description: "For institutions and Fortune 500 L&D — SSO, LMS, SLA.",
    features: [
      "All Instructor Pro features",
      "SSO · LMS export (Canvas, Blackboard, Moodle)",
      "Dedicated onboarding · custom branding",
      "99.9% uptime SLA",
    ],
    ctaLabel: "Talk to sales",
    ctaHref: "mailto:hello@realitydb.dev?subject=Atelier Enterprise",
    ctaIsContact: true,
    accent: "purple",
  },
];

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-[1280px] px-6 py-16">
      <header className="mx-auto max-w-2xl text-center">
        <div className="inline-flex items-center gap-2 border border-[#1e293b] bg-[#111827] px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-[#64748b]">
          <span className="inline-block size-1.5 rounded-full bg-[#06d6a0]" />
          Auto-graded · ranked · signed credential — every tier
        </div>
        <h1 className="mt-5 text-3xl font-medium text-[#e2e8f0] md:text-5xl">
          The deliverable is the same
          <span className="text-[#a855f7]">.</span>
          <br />
          <span className="text-[#00f5d4]">The audience is the price.</span>
        </h1>
        <p className="mt-4 text-sm text-[#e2e8f0]/80 md:text-base">
          One module to prove the pattern. All six to staff the team. A semester
          license to run a program.
        </p>
      </header>

      <div className="mt-12">
        <SectionHeading
          accent="green"
          label="For learners and teams"
          subhead="Self-serve, lifetime access on modules · cohort dashboard on Team."
        />
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {LEARNER_TIERS.map((t) => (
            <TierCard key={t.name} tier={t} />
          ))}
        </div>
      </div>

      <div className="mt-16">
        <SectionHeading
          accent="cyan"
          label="For instructors and programs"
          subhead="Custom questions, cohort grading, exports. SSO and LMS at the Enterprise tier."
        />
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          {INSTRUCTOR_TIERS.map((t) => (
            <TierCard key={t.name} tier={t} />
          ))}
        </div>
      </div>

      <div className="mt-16 border-t border-[#1e293b] pt-10">
        <div className="mx-auto grid max-w-4xl grid-cols-1 gap-8 text-center text-sm md:grid-cols-3">
          <div>
            <div className="font-mono text-[11px] uppercase tracking-wider text-[#06d6a0]">
              Signed credential
            </div>
            <p className="mt-2 text-[#e2e8f0]/80">
              Every tier. Every learner. Public verification URL recruiters can
              read in three seconds.
            </p>
          </div>
          <div>
            <div className="font-mono text-[11px] uppercase tracking-wider text-[#00f5d4]">
              Real PostgreSQL
            </div>
            <p className="mt-2 text-[#e2e8f0]/80">
              Six modules with enforced narratives at 97–99/100 quality. No
              CSV. No sandbox tables. Real schemas.
            </p>
          </div>
          <div>
            <div className="font-mono text-[11px] uppercase tracking-wider text-[#a855f7]">
              Auto-graded and ranked
            </div>
            <p className="mt-2 text-[#e2e8f0]/80">
              5-axis rubric including epistemic honesty. Every score feeds your
              public Atelier rank. We grade judgement, not row-set matches.
            </p>
          </div>
        </div>
        <p className="mt-10 text-center text-xs text-[#64748b]">
          Pay by invoice, ACH, or wire today. Stripe self-checkout lands next.
          Talk to us:{" "}
          <a
            href="mailto:hello@realitydb.dev"
            className="text-[#06d6a0] hover:underline"
          >
            hello@realitydb.dev
          </a>
        </p>
      </div>
    </div>
  );
}

function SectionHeading({
  accent,
  label,
  subhead,
}: {
  accent: Accent;
  label: string;
  subhead: string;
}) {
  const accentColor = ACCENT_HEX[accent];
  return (
    <div className="border-l-2 pl-4" style={{ borderColor: accentColor }}>
      <div
        className="font-mono text-[11px] uppercase tracking-wider"
        style={{ color: accentColor }}
      >
        {label}
      </div>
      <p className="mt-1 text-sm text-[#64748b]">{subhead}</p>
    </div>
  );
}

function TierCard({ tier }: { tier: Tier }) {
  const accentColor = ACCENT_HEX[tier.accent];
  const highlighted = tier.highlighted;
  return (
    <div
      className="flex flex-col border p-6"
      style={{
        borderColor: highlighted ? `${accentColor}80` : "#1e293b",
        backgroundColor: highlighted ? `${accentColor}0d` : "#111827",
      }}
    >
      <h2
        className="text-sm font-medium uppercase tracking-wider"
        style={{ color: highlighted ? accentColor : "#64748b" }}
      >
        {tier.name}
      </h2>
      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-3xl font-medium text-[#e2e8f0]">{tier.price}</span>
        <span className="text-xs text-[#64748b]">{tier.cadence}</span>
      </div>
      <p className="mt-2 text-xs text-[#64748b]">{tier.description}</p>

      <ul className="mt-5 flex-1 space-y-2 text-sm text-[#e2e8f0]/80">
        {tier.features.map((f) => (
          <li key={f} className="flex items-start gap-2">
            <Check
              className="mt-0.5 size-4 shrink-0"
              style={{ color: accentColor }}
            />
            <span>{f}</span>
          </li>
        ))}
      </ul>

      <CtaButton tier={tier} accentColor={accentColor} />
    </div>
  );
}

function CtaButton({
  tier,
  accentColor,
}: {
  tier: Tier;
  accentColor: string;
}) {
  const filledStyle: React.CSSProperties = {
    backgroundColor: accentColor,
    color: "#0a0f1a",
  };
  const outlineStyle: React.CSSProperties = {
    borderColor: "#1e293b",
    color: "#e2e8f0",
  };
  const className = tier.highlighted
    ? "mt-6 block w-full px-4 py-2 text-center text-sm font-medium transition hover:opacity-90"
    : "mt-6 block w-full border px-4 py-2 text-center text-sm transition hover:opacity-80";
  const style = tier.highlighted ? filledStyle : outlineStyle;

  if (tier.ctaIsContact) {
    return (
      <a href={tier.ctaHref} className={className} style={style}>
        {tier.ctaLabel}
      </a>
    );
  }
  return (
    <Link href={tier.ctaHref} className={className} style={style}>
      {tier.ctaLabel}
    </Link>
  );
}
