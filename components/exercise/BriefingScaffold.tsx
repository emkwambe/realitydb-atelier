"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface Props {
  briefingHref: string;
}

/**
 * Briefing scaffold — locked copy from ATELIER-UNIFIED-BLUEPRINT.md
 * §"Locked Decisions", Decision 3 (2026-05-23). Do not modify the copy
 * without a Blueprint version bump.
 *
 * Appears in the right panel of the exercise workbench (replacing the
 * current exercise prompt area) when exercisesCompleted === totalExercises.
 */
export function BriefingScaffold({ briefingHref }: Props) {
  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <div className="border-b border-[#1e293b] p-5">
        <div className="font-mono text-[11px] uppercase tracking-wider text-[#06d6a0]">
          All exercises complete
        </div>
        <h2 className="mt-1 text-lg font-medium text-[#e2e8f0]">
          Ready to write your briefing?
        </h2>
      </div>

      <div className="space-y-5 p-5">
        <p className="text-sm leading-relaxed text-[#e2e8f0]/90">
          The CFO needs four things in the next 10 minutes:
        </p>
        <ol className="space-y-2.5 font-mono text-[13px] leading-relaxed text-[#06d6a0]">
          <li className="flex gap-3">
            <span className="text-[#06d6a0]/60">1.</span>
            <span>
              <span className="text-[#06d6a0]">What you found</span>
              <span className="text-[#e2e8f0]/80"> — the specific pattern in the data</span>
            </span>
          </li>
          <li className="flex gap-3">
            <span className="text-[#06d6a0]/60">2.</span>
            <span>
              <span className="text-[#06d6a0]">The number that matters</span>
              <span className="text-[#e2e8f0]/80"> — quantified impact</span>
            </span>
          </li>
          <li className="flex gap-3">
            <span className="text-[#06d6a0]/60">3.</span>
            <span>
              <span className="text-[#06d6a0]">What you recommend</span>
              <span className="text-[#e2e8f0]/80"> — a specific action with a timeline</span>
            </span>
          </li>
          <li className="flex gap-3">
            <span className="text-[#06d6a0]/60">4.</span>
            <span>
              <span className="text-[#06d6a0]">What you cannot confirm yet</span>
              <span className="text-[#e2e8f0]/80"> — the limits of your analysis</span>
            </span>
          </li>
        </ol>

        <p className="border-l-2 border-[#06d6a0] bg-[#06d6a0]/5 px-3 py-2 text-sm text-[#e2e8f0]">
          You have the data. Now make the call.
        </p>
      </div>

      <div className="mt-auto border-t border-[#1e293b] p-4">
        <Link
          href={briefingHref}
          className="inline-flex w-full items-center justify-center gap-2 bg-[#06d6a0] px-4 py-2.5 text-sm font-medium text-[#0a0f1a] transition hover:bg-[#06d6a0]/90"
        >
          Write your briefing
          <ArrowRight className="size-4" />
        </Link>
      </div>
    </div>
  );
}
