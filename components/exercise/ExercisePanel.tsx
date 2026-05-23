"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Lightbulb } from "lucide-react";
import { useAuth } from "@/lib/hooks/useAuth";
import {
  ReferenceAnswerPanel,
  type SubmittedAnswer,
} from "@/components/exercise/ReferenceAnswerPanel";
import type { Exercise } from "@/lib/grading";

interface Props {
  exercise: Exercise;
  exerciseNumber: number;
  totalExercises: number;
  hasAttempted: boolean;
  isCompleted: boolean;
  onComplete: () => void;
  onUseReference: (sql: string) => void;
  company: string;
}

/**
 * Reference SQL is gated per Decision 1 (Blueprint v1.1): the learner
 * must have a graded briefing for this module before the reference
 * answer is revealed. Anonymous learners see an account-creation CTA.
 * Module grading is currently persisted in localStorage under
 * `atelier:${company}:result` — the existence of an overall_score key
 * is the unlock signal until briefing_submissions ships.
 */
export function ExercisePanel({
  exercise,
  exerciseNumber,
  totalExercises,
  hasAttempted,
  isCompleted,
  onComplete,
  onUseReference,
  company,
}: Props) {
  const auth = useAuth();
  const [hintOpen, setHintOpen] = useState(false);
  const [graded, setGraded] = useState<SubmittedAnswer | null>(null);

  useEffect(() => {
    try {
      const resultRaw = localStorage.getItem(`atelier:${company}:result`);
      const briefingRaw = localStorage.getItem(`atelier:${company}:briefing`);
      if (resultRaw) {
        const parsed = JSON.parse(resultRaw) as {
          overall_score?: number;
        };
        if (typeof parsed.overall_score === "number") {
          let briefingText = "";
          if (briefingRaw) {
            try {
              const b = JSON.parse(briefingRaw) as { text?: string };
              briefingText = b.text ?? "";
            } catch {}
          }
          setGraded({
            score: parsed.overall_score,
            briefingText,
          });
        }
      }
    } catch {}
  }, [company]);

  const difficultyColor =
    exercise.difficulty === "beginner"
      ? "text-[#06d6a0]"
      : exercise.difficulty === "intermediate"
      ? "text-[#f59e0b]"
      : "text-[#ef4444]";

  const referenceStatus: "unlocked" | "ungraded" | "anonymous" = !auth?.isAuthenticated
    ? "anonymous"
    : graded
      ? "unlocked"
      : "ungraded";

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <div className="border-b border-[#1e293b] p-5">
        <div className="flex items-center justify-between text-[11px] uppercase tracking-wider text-[#64748b]">
          <span>
            Exercise {exerciseNumber} / {totalExercises}
          </span>
          <span className={difficultyColor}>{exercise.difficulty}</span>
        </div>
        <h2 className="mt-1 text-lg font-medium text-[#e2e8f0]">{exercise.title}</h2>
      </div>

      <div className="space-y-5 p-5">
        <div>
          <div className="text-[11px] uppercase tracking-wider text-[#64748b]">
            Business question
          </div>
          <p className="mt-1 text-sm font-medium text-[#e2e8f0]">
            {exercise.businessQuestion}
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {exercise.skills.map((s) => (
            <span
              key={s}
              className="border border-[#1e293b] bg-[#1a2235] px-2 py-0.5 font-mono text-[10px] text-[#64748b]"
            >
              {s}
            </span>
          ))}
        </div>

        <p className="text-sm leading-relaxed text-[#e2e8f0]/80">
          {exercise.description}
        </p>

        <p className="border-l-2 border-[#1e293b] pl-3 text-[11px] italic leading-relaxed text-[#64748b]">
          These questions are starting points. Query anything you find
          interesting — the database responds to any valid SQL.
        </p>

        <div>
          <button
            onClick={() => setHintOpen((v) => !v)}
            className="flex items-center gap-2 text-xs text-[#06d6a0] hover:underline"
          >
            <Lightbulb className="size-3.5" />
            {hintOpen ? "Hide hint" : "Show hint"}
          </button>
          {hintOpen && (
            <p className="mt-2 border-l-2 border-[#06d6a0]/50 bg-[#06d6a0]/5 px-3 py-2 text-xs leading-relaxed text-[#e2e8f0]/90">
              {exercise.hint}
            </p>
          )}
        </div>

        <ReferenceAnswerPanel
          status={referenceStatus}
          referenceSQL={exercise.referenceSQL}
          submitted={graded ?? undefined}
          onLoadIntoEditor={onUseReference}
        />
      </div>

      <div className="mt-auto border-t border-[#1e293b] p-4">
        <button
          onClick={onComplete}
          disabled={!hasAttempted}
          className={`inline-flex w-full items-center justify-center gap-2 px-4 py-2 text-sm font-medium transition ${
            isCompleted
              ? "border border-[#06d6a0] bg-transparent text-[#06d6a0]"
              : "bg-[#06d6a0] text-[#0a0f1a] hover:bg-[#06d6a0]/90 disabled:opacity-40"
          }`}
        >
          <CheckCircle2 className="size-4" />
          {isCompleted ? "Completed" : "Mark complete"}
        </button>
      </div>
    </div>
  );
}
