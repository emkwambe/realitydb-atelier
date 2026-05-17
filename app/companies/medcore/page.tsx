import Link from "next/link";
import { ArrowRight, Database } from "lucide-react";
import { medcoreExercises } from "@/content/companies/medcore/exercises";
import { ExerciseNavStatic } from "@/components/exercise/ExerciseNavStatic";

export default function MedCorePage() {
  return (
    <div className="mx-auto max-w-[1280px] px-6 py-12 md:py-16">
      <section className="border border-[#1e293b] bg-[#111827] p-8 md:p-12">
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="font-mono text-xs uppercase tracking-wider text-[#64748b]">
              Module 02 · Available
            </div>
            <h1 className="mt-2 text-3xl font-medium text-[#e2e8f0] md:text-5xl">
              MedCore Health
            </h1>
            <p className="mt-1 text-sm text-[#64748b]">
              Hospital Revenue Cycle
            </p>

            <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
              <Stat label="System" value="Regional" />
              <Stat label="Providers" value="125" />
              <Stat label="Net revenue" value="$48M" />
              <Stat label="Claims/yr" value="5,300" />
            </div>
          </div>

          <div className="md:max-w-sm">
            <div className="font-mono text-xs uppercase tracking-wider text-[#06d6a0]">
              Your role
            </div>
            <p className="mt-1 text-base font-medium text-[#e2e8f0]">
              Revenue Cycle Director
            </p>
            <p className="mt-3 text-sm leading-relaxed text-[#e2e8f0]/80">
              The CFO flagged net collection rate dropped 4 points in the
              last two quarters. Find out why before the board meeting.
            </p>

            <div className="mt-4 flex items-center gap-2 font-mono text-[11px] text-[#64748b]">
              <Database className="size-3.5" />
              12 tables · 50,000 rows · PostgreSQL
            </div>

            <Link
              href="/companies/medcore/exercise/1"
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
            {medcoreExercises.length} exercises · CEO briefing
          </span>
        </div>
        <div className="mt-4 border border-[#1e293b] bg-[#111827]">
          <ExerciseNavStatic exercises={medcoreExercises} company="medcore" />
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
