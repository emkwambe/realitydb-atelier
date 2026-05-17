import Link from "next/link";
import { ArrowRight, Database } from "lucide-react";
import { novaPayExercises } from "@/content/companies/novapay/exercises";
import { ExerciseNavStatic } from "@/components/exercise/ExerciseNavStatic";

export default function NovaPayPage() {
  return (
    <div className="mx-auto max-w-[1280px] px-6 py-12 md:py-16">
      <section className="border border-[#1e293b] bg-[#111827] p-8 md:p-12">
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="font-mono text-xs uppercase tracking-wider text-[#64748b]">
              Module 01 · Available
            </div>
            <h1 className="mt-2 text-3xl font-medium text-[#e2e8f0] md:text-5xl">
              NovaPay
            </h1>
            <p className="mt-1 text-sm text-[#64748b]">
              B2B SaaS Payments Platform
            </p>

            <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
              <Stat label="Stage" value="Series B" />
              <Stat label="ARR" value="$2.1M" />
              <Stat label="Growth" value="8% MoM" />
              <Stat label="Customers" value="400+" />
            </div>
          </div>

          <div className="md:max-w-sm">
            <div className="font-mono text-xs uppercase tracking-wider text-[#06d6a0]">
              Your role
            </div>
            <p className="mt-1 text-base font-medium text-[#e2e8f0]">
              VP of Growth
            </p>
            <p className="mt-3 text-sm leading-relaxed text-[#e2e8f0]/80">
              The board meeting is in two weeks. The lead investor flagged
              retention metrics. Find out why.
            </p>

            <div className="mt-4 flex items-center gap-2 font-mono text-[11px] text-[#64748b]">
              <Database className="size-3.5" />
              13 tables · 50,000 rows · PostgreSQL
            </div>

            <Link
              href="/companies/novapay/exercise/1"
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
            {novaPayExercises.length} exercises · CEO briefing
          </span>
        </div>
        <div className="mt-4 border border-[#1e293b] bg-[#111827]">
          <ExerciseNavStatic exercises={novaPayExercises} company="novapay" />
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
