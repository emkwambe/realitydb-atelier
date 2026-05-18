import Link from "next/link";
import { ArrowRight, Database } from "lucide-react";
import { oncocareExercises } from "@/content/companies/oncocare/exercises";
import { ExerciseNavStatic } from "@/components/exercise/ExerciseNavStatic";

export default function OncoCarePage() {
  return (
    <div className="mx-auto max-w-[1280px] px-6 py-12 md:py-16">
      <section className="border border-[#1e293b] bg-[#111827] p-8 md:p-12">
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="font-mono text-xs uppercase tracking-wider text-[#64748b]">
              Module 06 · Available
            </div>
            <h1 className="mt-2 text-3xl font-medium text-[#e2e8f0] md:text-5xl">
              OncoCare Therapeutics
            </h1>
            <p className="mt-1 text-sm text-[#64748b]">
              Phase III Oncology Clinical Trial
            </p>

            <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
              <Stat label="Patients" value="2,400" />
              <Stat label="Sites" value="12 global" />
              <Stat label="Duration" value="18 months" />
              <Stat label="Drug" value="ONC-441" />
            </div>
          </div>

          <div className="md:max-w-sm">
            <div className="font-mono text-xs uppercase tracking-wider text-[#06d6a0]">
              Your role
            </div>
            <p className="mt-1 text-base font-medium text-[#e2e8f0]">
              VP of Clinical Operations
            </p>
            <p className="mt-3 text-sm leading-relaxed text-[#e2e8f0]/80">
              DSMB interim analysis flagged overall response rate at 49.8% —
              just below the FDA 50% threshold for accelerated approval.
              CMO needs the full investigation before the FDA advisory
              meeting in 6 weeks.
            </p>

            <div className="mt-4 flex items-center gap-2 font-mono text-[11px] text-[#64748b]">
              <Database className="size-3.5" />
              12 tables · 30,000 rows · PostgreSQL
            </div>

            <Link
              href="/companies/oncocare/exercise/1"
              className="mt-5 inline-flex items-center gap-2 bg-[#06d6a0] px-4 py-2.5 text-sm font-medium text-[#0a0f1a] transition hover:bg-[#06d6a0]/90"
            >
              Begin Module <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="mt-10">
        <div className="flex items-baseline justify-between">
          <h2 className="text-lg font-medium text-[#e2e8f0]">Exercises</h2>
          <span className="font-mono text-xs text-[#64748b]">
            {oncocareExercises.length} exercises · CMO recommendation memo
          </span>
        </div>
        <div className="mt-4 border border-[#1e293b] bg-[#111827]">
          <ExerciseNavStatic exercises={oncocareExercises} company="oncocare" />
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="font-mono text-[11px] uppercase tracking-wider text-[#64748b]">
        {label}
      </div>
      <div className="mt-0.5 text-lg font-medium text-[#e2e8f0]">{value}</div>
    </div>
  );
}
