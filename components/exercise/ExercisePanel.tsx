"use client";

import { useState } from "react";
import { Eye, EyeOff, CheckCircle2, Lightbulb } from "lucide-react";
import type { Exercise } from "@/lib/grading";

interface Props {
  exercise: Exercise;
  exerciseNumber: number;
  totalExercises: number;
  hasAttempted: boolean;
  isCompleted: boolean;
  onComplete: () => void;
  onUseReference: (sql: string) => void;
}

export function ExercisePanel({
  exercise,
  exerciseNumber,
  totalExercises,
  hasAttempted,
  isCompleted,
  onComplete,
  onUseReference,
}: Props) {
  const [hintOpen, setHintOpen] = useState(false);
  const [refOpen, setRefOpen] = useState(false);

  const difficultyColor =
    exercise.difficulty === "beginner"
      ? "text-[#06d6a0]"
      : exercise.difficulty === "intermediate"
      ? "text-[#f59e0b]"
      : "text-[#ef4444]";

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

        <div>
          <button
            onClick={() => setRefOpen((v) => !v)}
            disabled={!hasAttempted}
            className="flex items-center gap-2 text-xs text-[#e2e8f0]/80 hover:text-[#06d6a0] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {refOpen ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
            {hasAttempted
              ? refOpen
                ? "Hide reference answer"
                : "Show reference answer"
              : "Reference answer (locked until first attempt)"}
          </button>
          {refOpen && hasAttempted && (
            <div className="mt-2 space-y-2">
              <pre className="overflow-x-auto border border-[#1e293b] bg-[#0a0f1a] p-3 font-mono text-[11px] leading-relaxed text-[#e2e8f0]">
                {exercise.referenceSQL}
              </pre>
              <button
                onClick={() => onUseReference(exercise.referenceSQL)}
                className="text-[11px] text-[#06d6a0] hover:underline"
              >
                Load into editor →
              </button>
            </div>
          )}
        </div>
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
