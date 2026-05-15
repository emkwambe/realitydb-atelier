"use client";

import Link from "next/link";
import { Lock, CheckCircle2, Circle } from "lucide-react";
import type { Exercise } from "@/lib/grading";

export type ExerciseStatus = "locked" | "available" | "in_progress" | "completed";

interface Props {
  company: string;
  exercises: Exercise[];
  statuses: Record<number, ExerciseStatus>;
  currentId?: number;
}

export function ExerciseNav({ company, exercises, statuses, currentId }: Props) {
  const completed = exercises.filter((e) => statuses[e.id] === "completed").length;
  const progressPct = Math.round((completed / exercises.length) * 100);

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-[#1e293b] p-4">
        <div className="text-[11px] uppercase tracking-wider text-[#64748b]">
          Module progress
        </div>
        <div className="mt-1 flex items-baseline justify-between">
          <span className="font-mono text-sm text-[#e2e8f0]">
            {completed} / {exercises.length}
          </span>
          <span className="text-xs text-[#06d6a0]">{progressPct}%</span>
        </div>
        <div className="mt-2 h-1 w-full bg-[#1e293b]">
          <div
            className="h-1 bg-[#06d6a0] transition-all"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      <ol className="flex-1 divide-y divide-[#1e293b] overflow-y-auto">
        {exercises.map((ex) => {
          const status = statuses[ex.id] ?? "available";
          const isCurrent = ex.id === currentId;
          const locked = status === "locked";
          const Icon =
            status === "completed" ? CheckCircle2 : locked ? Lock : Circle;
          const iconColor =
            status === "completed"
              ? "text-[#06d6a0]"
              : locked
              ? "text-[#64748b]"
              : "text-[#64748b]";

          const inner = (
            <div
              className={`flex items-center gap-3 px-4 py-3 text-sm ${
                isCurrent ? "bg-[#1a2235]" : "hover:bg-[#1a2235]/60"
              } ${locked ? "opacity-50" : ""}`}
            >
              <Icon className={`size-4 shrink-0 ${iconColor}`} />
              <span className="font-mono text-[11px] text-[#64748b]">
                {String(ex.id).padStart(2, "0")}
              </span>
              <span className="flex-1 truncate text-[#e2e8f0]">{ex.title}</span>
              <span
                className={`text-[10px] uppercase tracking-wider ${
                  ex.difficulty === "beginner"
                    ? "text-[#06d6a0]"
                    : ex.difficulty === "intermediate"
                    ? "text-[#f59e0b]"
                    : "text-[#ef4444]"
                }`}
              >
                {ex.difficulty[0].toUpperCase()}
              </span>
            </div>
          );

          if (locked) {
            return <li key={ex.id}>{inner}</li>;
          }

          return (
            <li key={ex.id}>
              <Link href={`/companies/${company}/exercise/${ex.id}`}>{inner}</Link>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
