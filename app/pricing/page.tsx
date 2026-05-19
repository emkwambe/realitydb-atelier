import Link from "next/link";
import { Check } from "lucide-react";

type Accent = "green" | "cyan" | "purple";

interface Tier {
  name: string;
  persona: string;
  price: string;
  cadence: string;
  description: string;
  features: string[];
  ctaLabel: string;
  ctaHref: string;
  ctaIsContact: boolean;
  ctaNote?: string;
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
    persona: "For one learner",
    price: "$499",
    cadence: "one-time",
    description: "Pick one company. Lifetime access to that module.",
    features: [
      "10 exercises + CEO briefing",
      "PGlite in-browser PostgreSQL",
      "Auto-graded briefing · feeds your rank",
      "Signed Business Acumen Certificate",
    ],
    ctaLabel: "Try NovaPay free",
    ctaHref: "/companies/novapay",
    ctaIsContact: false,
    accent: "green",
  },
  {
    name: "All-Access",
    persona: "For career builders",
    price: "$1,499",
    cadence: "one-time",
    description:
      "Every module — current and future. New module added at least weekly.",
    features: [
      "All current + future modules",
      "Lifetime updates · new module ≥ weekly",
      "One signed credential per module solved",
      "Priority email support",
    ],
    ctaLabel: "Create account",
    ctaHref: "/auth/signup?plan=all-access",
    ctaIsContact: false,
    accent: "green",
    highlighted: true,
  },
  {
    name: "Team",
    persona: "For L&D · cohort leads",
    price: "$9,999",
    cadence: "10 seats · 1 year",
    description: "One module, team training. Cohort progress dashboard.",
    features: [
      "10 student seats · admin invites",
      "Cohort progress dashboard",
      "Deadlines + nudges",
      "Cohort report at end of term",
    ],
    ctaLabel: "Create team account",
    ctaHref: "/auth/signup?plan=team",
    ctaIsContact: false,
    accent: "green",
  },
  {
    name: "MBA License",
    persona: "For MBA programs",
    price: "$14,999",
    cadence: "per semester",
    description:
      "All current and future modules, unlimited students, program-wide.",
    features: [
      "All current + future modules",
      "Unlimited student seats",
      "Instructor dashboard",
      "LMS integration available",
    ],
    ctaLabel: "Create program account",
    ctaHref: "/auth/signup?plan=mba",
    ctaIsContact: false,
    accent: "green",
  },
];

const INSTRUCTOR_TIERS: Tier[] = [
  {
    name: "Instructor Solo",
    persona: "For solo instructors",
    price: "$299",
    cadence: "per month",
    description: "One instructor, small cohort, full module catalog.",
    features: [
      "Up to 3 cohorts · 30 students",
      "All current + future modules",
      "Custom questions (5 per module)",
      "CSV export",
    ],
    ctaLabel: "Start solo",
    ctaHref: "/auth/signup?plan=instructor-solo",
    ctaIsContact: false,
    accent: "cyan",
  },
  {
    name: "Instructor Pro",
    persona: "For program leads",
    price: "$799",
    cadence: "per month",
    description: "Multiple cohorts, unlimited students, no question limits.",
    features: [
      "Unlimited cohorts & students",
      "Unlimited custom questions",
      "CSV export + PDF certificates",
      "Priority grading · class-discussion view",
    ],
    ctaLabel: "Start pro",
    ctaHref: "/auth/signup?plan=instructor-pro",
    ctaIsContact: false,
    accent: "cyan",
    highlighted: true,
  },
  {
    name: "Enterprise",
    persona: "For institutions · F500",
    price: "$2,500",
    cadence: "per month",
    description: "SSO, LMS, dedicated onboarding, contract terms.",
    features: [
      "All Instructor Pro features",
      "SSO · LMS export (Canvas, Blackboard, Moodle)",
      "Dedicated onboarding · custom branding",
      "99.9% uptime SLA",
    ],
    ctaLabel: "Book a scoping call",
    ctaHref: "mailto:hello@realitydb.dev?subject=Atelier Enterprise",
    ctaIsContact: true,
    ctaNote:
      "SSO setup, LMS integration spec, and contract terms need a short call. No pitch deck.",
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
          Six modules live. New module added at least weekly. Create an account
          to start any tier — no sales call needed unless you need SSO or a
          contract.
        </p>
      </header>

      <div className="mt-12">
        <SectionHeading
          accent="green"
          label="For learners and teams"
          subhead="Self-serve account · lifetime access on modules · cohort dashboard on Team."
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
          subhead="Self-serve subscriptions · custom questions · cohort grading. SSO + LMS at Enterprise."
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
              Real PostgreSQL · weekly drop
            </div>
            <p className="mt-2 text-[#e2e8f0]/80">
              Six modules live with enforced narratives at 97–99/100 quality.
              New module added at least every week.
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
          Create an account in 30 seconds. Stripe self-checkout lands next; pay
          by invoice, ACH, or wire in the meantime.{" "}
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
        borderTop: highlighted ? undefined : `2px solid ${accentColor}66`,
      }}
    >
      <div
        className="font-mono text-[10px] uppercase tracking-wider"
        style={{ color: accentColor }}
      >
        {tier.persona}
      </div>
      <h2
        className="mt-1 text-sm font-medium uppercase tracking-wider"
        style={{ color: highlighted ? accentColor : "#e2e8f0" }}
      >
        {tier.name}
      </h2>
      <div className="mt-3 flex flex-wrap items-baseline gap-x-2 gap-y-1">
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
      {tier.ctaNote && (
        <p className="mt-2 text-[10px] leading-snug text-[#64748b]">
          {tier.ctaNote}
        </p>
      )}
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
  const purpleOutlineStyle: React.CSSProperties = {
    borderColor: `${accentColor}99`,
    color: accentColor,
  };
  const outlineStyle: React.CSSProperties = {
    borderColor: "#1e293b",
    color: "#e2e8f0",
  };
  const className = tier.highlighted
    ? "mt-6 block w-full px-4 py-2 text-center text-sm font-medium transition hover:opacity-90"
    : "mt-6 block w-full border px-4 py-2 text-center text-sm transition hover:opacity-80";
  // Enterprise CTA carries the accent outline even when not highlighted,
  // because purple identifies this card and a neutral CTA undersells it.
  const style = tier.highlighted
    ? filledStyle
    : tier.accent === "purple"
      ? purpleOutlineStyle
      : outlineStyle;

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
