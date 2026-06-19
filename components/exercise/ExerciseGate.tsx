// Server-rendered "locked" screen shown when canAccess denies an exercise.
// Rendered INSTEAD of <ExerciseWorkbench>, so no exercise content (referenceSQL,
// hint) is ever passed to the client for a gated exercise.

import Link from "next/link";
import { Lock } from "lucide-react";

interface Props {
  company: string;
  exerciseNumber: number;
  difficulty: string;
  reason: string;
  upgradeHref: string;
}

export function ExerciseGate({
  company,
  exerciseNumber,
  difficulty,
  reason,
  upgradeHref,
}: Props) {
  const notSignedIn = reason === "not_signed_in";
  const cta = notSignedIn ? "Sign in to continue" : "Upgrade to unlock";

  return (
    <div className="mx-auto flex min-h-[calc(100vh-7rem)] max-w-lg flex-col items-center justify-center px-6 py-16 text-center">
      <div className="flex size-12 items-center justify-center border border-[#1e293b] bg-[#111827] text-[#64748b]">
        <Lock className="size-5" />
      </div>

      <div className="mt-6 font-mono text-xs uppercase tracking-wider text-[#64748b]">
        {company} · Exercise {exerciseNumber} · {difficulty}
      </div>

      <h1 className="mt-2 text-2xl font-medium text-[#e2e8f0]">
        This exercise is locked
      </h1>

      <p className="mt-3 text-sm leading-relaxed text-[#64748b]">
        {notSignedIn
          ? "Sign in to your account to continue."
          : `${cap(difficulty)} exercises are part of the paid module. Beginner exercises stay free — upgrade to unlock the full case.`}
      </p>

      <Link
        href={upgradeHref}
        className="mt-6 inline-flex items-center gap-2 bg-[#06d6a0] px-5 py-3 text-sm font-medium text-[#0a0f1a] transition hover:bg-[#06d6a0]/90"
      >
        {cta}
      </Link>

      <Link
        href={`/companies/${company}`}
        className="mt-4 text-xs text-[#64748b] hover:text-[#06d6a0]"
      >
        ← Back to {company} overview
      </Link>
    </div>
  );
}

function cap(s: string): string {
  return s.length ? s[0].toUpperCase() + s.slice(1) : s;
}
