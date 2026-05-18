"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Award, CheckCircle2, Circle, FileText } from "lucide-react";
import { useAuth } from "@/lib/hooks/useAuth";

const MODULES = [
  { slug: "novapay", label: "NovaPay", industry: "FinTech SaaS" },
  { slug: "medcore", label: "MedCore Health", industry: "Healthcare RCM" },
  { slug: "supplylink", label: "SupplyLink", industry: "Supply Chain" },
  { slug: "towernet", label: "TowerNet", industry: "Telecom" },
  { slug: "clearbank", label: "ClearBank", industry: "AML / Banking" },
  { slug: "oncocare", label: "OncoCare", industry: "Oncology Trials" },
] as const;

const TOTAL_EXERCISES = 10;

interface ModuleStatus {
  slug: string;
  label: string;
  industry: string;
  exercisesDone: number;
  briefingScore: number | null;
  briefingPassed: boolean;
  certId: string | null;
}

function readModuleStatus(slug: string): Omit<ModuleStatus, "label" | "industry"> {
  let exercisesDone = 0;
  let briefingScore: number | null = null;
  let briefingPassed = false;
  let certId: string | null = null;

  try {
    const progressRaw = localStorage.getItem(`atelier:${slug}:progress`);
    if (progressRaw) {
      const map = JSON.parse(progressRaw) as Record<string, boolean>;
      exercisesDone = Object.values(map).filter(Boolean).length;
    }
    const resultRaw = localStorage.getItem(`atelier:${slug}:result`);
    if (resultRaw) {
      const r = JSON.parse(resultRaw) as { overall_score?: number; passed?: boolean };
      briefingScore = typeof r.overall_score === "number" ? r.overall_score : null;
      briefingPassed = Boolean(r.passed);
    }
    const certRaw = localStorage.getItem(`atelier:${slug}:cert`);
    if (certRaw) {
      const c = JSON.parse(certRaw) as { certId?: string };
      certId = c.certId ?? null;
    }
  } catch {
    // localStorage may be unavailable in private-mode iframes — degrade silently.
  }

  return { slug, exercisesDone, briefingScore, briefingPassed, certId };
}

export default function ProgressPage() {
  const auth = useAuth();
  const [statuses, setStatuses] = useState<ModuleStatus[] | null>(null);

  useEffect(() => {
    const rows = MODULES.map((m) => ({
      label: m.label,
      industry: m.industry,
      ...readModuleStatus(m.slug),
    }));
    setStatuses(rows);
  }, []);

  if (auth.isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-20 text-sm text-[#64748b]">
        Loading…
      </div>
    );
  }

  if (!auth.isAuthenticated) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-20 text-center">
        <h1 className="text-2xl font-medium text-[#e2e8f0]">Sign in to view progress</h1>
        <p className="mt-2 text-sm text-[#64748b]">
          Your module progress and earned certificates are tied to your account.
        </p>
        <Link
          href="/auth/login?next=/account/progress"
          className="mt-6 inline-block bg-[#06d6a0] px-4 py-2 text-sm font-medium text-[#0a0f1a] transition hover:bg-[#06d6a0]/90"
        >
          Sign in
        </Link>
      </div>
    );
  }

  const totalCerts = statuses?.filter((s) => s.certId).length ?? 0;
  const totalCompleted = statuses?.filter((s) => s.exercisesDone === TOTAL_EXERCISES).length ?? 0;

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <header className="border-b border-[#1e293b] pb-6">
        <h1 className="text-2xl font-medium text-[#e2e8f0]">My progress</h1>
        <p className="mt-1 text-sm text-[#64748b]">
          {auth.profile?.full_name || auth.user?.email}
          {" · "}
          {totalCompleted} of {MODULES.length} modules fully complete
          {" · "}
          {totalCerts} certificate{totalCerts === 1 ? "" : "s"} earned
        </p>
      </header>

      <p className="mt-6 text-xs text-[#64748b]">
        Progress is currently stored locally in your browser. Clearing cookies or switching devices
        will reset what you see here.
      </p>

      <ul className="mt-6 space-y-4">
        {statuses === null
          ? MODULES.map((m) => (
              <li
                key={m.slug}
                className="border border-[#1e293b] bg-[#111827] p-6 text-sm text-[#64748b]"
              >
                Loading {m.label}…
              </li>
            ))
          : statuses.map((s) => <ModuleCard key={s.slug} status={s} />)}
      </ul>

    </div>
  );
}

function ModuleCard({ status }: { status: ModuleStatus }) {
  const { slug, label, industry, exercisesDone, briefingScore, briefingPassed, certId } = status;
  const moduleHref = `/companies/${slug}`;
  const briefingHref = `${moduleHref}/briefing`;
  const resultsHref = `${moduleHref}/results`;
  const certHref = certId ? `/verify/${certId}` : null;

  const stageLabel = certId
    ? "Certified"
    : briefingScore !== null
      ? briefingPassed
        ? "Briefing passed"
        : "Briefing scored"
      : exercisesDone === TOTAL_EXERCISES
        ? "Ready for briefing"
        : exercisesDone > 0
          ? "In progress"
          : "Not started";

  const stageTone = certId
    ? "text-[#06d6a0]"
    : briefingScore !== null
      ? briefingPassed
        ? "text-[#06d6a0]"
        : "text-[#f59e0b]"
      : exercisesDone > 0
        ? "text-[#e2e8f0]"
        : "text-[#64748b]";

  return (
    <li className="border border-[#1e293b] bg-[#111827] p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <h3 className="text-lg font-medium text-[#e2e8f0]">{label}</h3>
          <p className="text-xs uppercase tracking-wider text-[#64748b]">{industry}</p>
        </div>
        <span className={`text-xs uppercase tracking-wider ${stageTone}`}>{stageLabel}</span>
      </div>

      <dl className="mt-4 grid grid-cols-3 gap-4 border-t border-[#1e293b] pt-4 text-sm">
        <div>
          <dt className="text-[10px] uppercase tracking-wider text-[#64748b]">Exercises</dt>
          <dd className="mt-1 text-[#e2e8f0]">
            {exercisesDone}/{TOTAL_EXERCISES}
          </dd>
        </div>
        <div>
          <dt className="text-[10px] uppercase tracking-wider text-[#64748b]">Briefing score</dt>
          <dd className="mt-1 text-[#e2e8f0]">
            {briefingScore !== null ? `${briefingScore}/100` : "—"}
          </dd>
        </div>
        <div>
          <dt className="text-[10px] uppercase tracking-wider text-[#64748b]">Certificate</dt>
          <dd className="mt-1 font-mono text-xs text-[#e2e8f0]">
            {certId ? certId : "—"}
          </dd>
        </div>
      </dl>

      <div className="mt-5 flex flex-wrap gap-3">
        <Link
          href={moduleHref}
          className="inline-flex items-center gap-2 border border-[#1e293b] px-3 py-1.5 text-xs uppercase tracking-wider text-[#e2e8f0] transition hover:border-[#06d6a0] hover:text-[#06d6a0]"
        >
          {exercisesDone > 0 ? (
            <>
              <Circle className="h-3 w-3" /> Continue exercises
            </>
          ) : (
            <>
              <Circle className="h-3 w-3" /> Start module
            </>
          )}
        </Link>
        {exercisesDone === TOTAL_EXERCISES && (
          <Link
            href={briefingHref}
            className="inline-flex items-center gap-2 border border-[#1e293b] px-3 py-1.5 text-xs uppercase tracking-wider text-[#e2e8f0] transition hover:border-[#06d6a0] hover:text-[#06d6a0]"
          >
            <FileText className="h-3 w-3" /> Briefing
          </Link>
        )}
        {briefingScore !== null && (
          <Link
            href={resultsHref}
            className="inline-flex items-center gap-2 border border-[#1e293b] px-3 py-1.5 text-xs uppercase tracking-wider text-[#e2e8f0] transition hover:border-[#06d6a0] hover:text-[#06d6a0]"
          >
            <CheckCircle2 className="h-3 w-3" /> View results
          </Link>
        )}
        {certHref && (
          <Link
            href={certHref}
            className="inline-flex items-center gap-2 border border-[#06d6a0]/40 bg-[#06d6a0]/5 px-3 py-1.5 text-xs uppercase tracking-wider text-[#06d6a0] transition hover:border-[#06d6a0]"
          >
            <Award className="h-3 w-3" /> Certificate
          </Link>
        )}
      </div>
    </li>
  );
}
