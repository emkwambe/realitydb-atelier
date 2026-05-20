import { Check } from "lucide-react";

export function AcademicSegment() {
  return (
    <section className="mt-24 md:mt-32">
      <div className="mx-auto max-w-2xl text-center">
        <div className="font-mono text-xs uppercase tracking-wider text-[#00f5d4]">
          Segment 3
        </div>
        <h2 className="mt-2 text-3xl font-medium text-[#e2e8f0] md:text-4xl">
          Academic
        </h2>
        <p className="mt-3 text-sm text-[#e2e8f0]/80">
          For institutions investing in student outcomes. Semester or annual
          commit. Institution pays; students access via campus accounts.
        </p>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <AcademicCard
          name="Program"
          tagline="One course. One semester. Up to 30 students."
          price="$4,999"
          unit="/semester"
          students="Up to 30 (hard cap)"
          campuses="1 campus"
          features={[
            "All modules",
            "Instructor dashboard (coming soon)",
            "Semester-based activation",
            "Course-linked pathways",
            "Student credentials",
          ]}
          subject="Atelier Program"
        />
        <AcademicCard
          name="Institution"
          tagline="One department or school. Up to 100 students."
          price="$9,999"
          unit="/semester"
          students="Up to 100 (hard cap)"
          campuses="1 campus"
          features={[
            "All Program features",
            "Custom questions (coming soon)",
            "CSV export + PDF certificates (coming soon)",
            "Class-discussion view (coming soon)",
          ]}
          subject="Atelier Institution"
          featured
        />
        <AcademicCard
          name="University License"
          tagline="Unlimited students. One campus."
          price="$14,999"
          unit="/semester"
          students="Unlimited"
          campuses="1 campus"
          features={[
            "All Institution features",
            "LMS integration (coming soon)",
            "SSO (coming soon)",
            "Dedicated onboarding",
            "Annual option: $24,999/year",
          ]}
          subject="Atelier University License"
        />
        <AcademicCard
          name="University System"
          tagline="Unlimited students. Unlimited campuses."
          price="Custom"
          unit="annual"
          students="Unlimited"
          campuses="Unlimited"
          features={[
            "All University License features",
            "Per-campus dashboards with system-wide rollup",
            "Federated SSO across campus identity providers",
            "Optional custom branding per campus",
          ]}
          subject="Atelier University System"
        />
      </div>
    </section>
  );
}

function AcademicCard({
  name,
  tagline,
  price,
  unit,
  students,
  campuses,
  features,
  subject,
  featured,
}: {
  name: string;
  tagline: string;
  price: string;
  unit: string;
  students: string;
  campuses: string;
  features: string[];
  subject: string;
  featured?: boolean;
}) {
  const accentColor = "#00f5d4";
  const mailto = `mailto:hello@realitydb.dev?subject=${encodeURIComponent(subject)}`;
  const ctaLabel = name === "University System" ? "Talk to sales" : "Contact us";
  return (
    <div
      className={`relative flex flex-col gap-4 border bg-[#111827] p-6 transition ${
        featured ? "border-[#00f5d4]/60" : "border-[#1e293b]"
      }`}
    >
      {featured && (
        <div className="absolute -top-3 left-6 inline-flex items-center bg-[#00f5d4] px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-[#0a0f1a]">
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
        <p className="mt-1 font-mono text-[11px] uppercase tracking-wider text-[#06d6a0]">
          {students}
        </p>
        <p className="font-mono text-[11px] uppercase tracking-wider text-[#64748b]">
          {campuses}
        </p>
      </div>
      <ul className="space-y-1.5">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-xs text-[#e2e8f0]/80">
            <Check className="mt-0.5 size-3.5 shrink-0 text-[#00f5d4]" />
            {f}
          </li>
        ))}
      </ul>
      <a
        href={mailto}
        className={`mt-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium transition ${
          featured
            ? "bg-[#00f5d4] text-[#0a0f1a] hover:bg-[#00f5d4]/90"
            : "border border-[#1e293b] text-[#e2e8f0] hover:border-[#00f5d4] hover:text-[#00f5d4]"
        }`}
      >
        {ctaLabel}
      </a>
    </div>
  );
}
