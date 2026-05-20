import { Check } from "lucide-react";

export function CorporateSegment() {
  return (
    <section className="mt-24 md:mt-32">
      <div className="mx-auto max-w-2xl text-center">
        <div className="font-mono text-xs uppercase tracking-wider text-[#06d6a0]">
          Segment 2
        </div>
        <h2 className="mt-2 text-3xl font-medium text-[#e2e8f0] md:text-4xl">
          Corporate
        </h2>
        <p className="mt-3 text-sm text-[#e2e8f0]/80">
          For organizations investing in their workforce. Annual commit only.
          Organization pays; employees access via managed seats.
        </p>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
        <CorporateCard
          name="Team"
          tagline="Under the $10K procurement threshold — one person can sign."
          price="$9,999"
          unit="/year"
          seats="10 seats (hard cap)"
          features={[
            "One module",
            "Cohort progress dashboard (coming soon)",
            "Admin invites and deadlines",
            "Cohort report at end of term",
          ]}
          ctaLabel="Contact us"
          subject="Atelier Team"
        />
        <CorporateCard
          name="Corporate Pro"
          tagline="Full catalog for the entire department."
          price="$24,999"
          unit="/year"
          seats="Up to 50 seats (hard cap)"
          features={[
            "All modules",
            "Cohort dashboard (coming soon)",
            "Custom questions (coming soon)",
            "CSV export (coming soon)",
            "Manager analytics view (coming soon)",
          ]}
          ctaLabel="Contact us"
          subject="Atelier Corporate Pro"
          featured
        />
        <CorporateCard
          name="Enterprise"
          tagline="Workforce capability infrastructure at scale."
          price="Custom"
          unit=""
          seats="51–500+ seats"
          features={[
            "All Corporate Pro features",
            "SSO + LMS integration (Canvas, Blackboard, Moodle)",
            "Dedicated onboarding",
            "Custom branding",
            "99.9% uptime SLA",
            "Workforce capability heatmaps (coming soon)",
          ]}
          ctaLabel="Talk to sales"
          subject="Atelier Enterprise"
        />
      </div>
    </section>
  );
}

function CorporateCard({
  name,
  tagline,
  price,
  unit,
  seats,
  features,
  ctaLabel,
  subject,
  featured,
}: {
  name: string;
  tagline: string;
  price: string;
  unit: string;
  seats: string;
  features: string[];
  ctaLabel: string;
  subject: string;
  featured?: boolean;
}) {
  const accentColor = "#06d6a0";
  const mailto = `mailto:hello@realitydb.dev?subject=${encodeURIComponent(subject)}`;
  return (
    <div
      className={`relative flex flex-col gap-4 border bg-[#111827] p-6 transition ${
        featured ? "border-[#06d6a0]/60" : "border-[#1e293b]"
      }`}
    >
      {featured && (
        <div className="absolute -top-3 left-6 inline-flex items-center bg-[#06d6a0] px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-[#0a0f1a]">
          Most common
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
        <p className="mt-1 font-mono text-[11px] uppercase tracking-wider text-[#00f5d4]">
          {seats}
        </p>
      </div>
      <ul className="space-y-1.5">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-xs text-[#e2e8f0]/80">
            <Check className="mt-0.5 size-3.5 shrink-0 text-[#06d6a0]" />
            {f}
          </li>
        ))}
      </ul>
      <a
        href={mailto}
        className={`mt-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium transition ${
          featured
            ? "bg-[#06d6a0] text-[#0a0f1a] hover:bg-[#06d6a0]/90"
            : "border border-[#1e293b] text-[#e2e8f0] hover:border-[#06d6a0] hover:text-[#06d6a0]"
        }`}
      >
        {ctaLabel}
      </a>
    </div>
  );
}
