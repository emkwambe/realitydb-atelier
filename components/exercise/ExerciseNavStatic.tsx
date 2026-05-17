import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Exercise } from "@/lib/grading";

interface Props {
  exercises: Exercise[];
  company: string;
}

export function ExerciseNavStatic({ exercises, company }: Props) {
  return (
    <ol className="divide-y divide-[#1e293b]">
      {exercises.map((ex) => (
        <li key={ex.id}>
          <Link
            href={`/companies/${company}/exercise/${ex.id}`}
            className="flex items-center gap-4 px-5 py-3.5 transition hover:bg-[#1a2235]/60"
          >
            <span className="font-mono text-[11px] text-[#64748b]">
              {String(ex.id).padStart(2, "0")}
            </span>
            <div className="flex-1">
              <div className="text-sm font-medium text-[#e2e8f0]">
                {ex.title}
              </div>
              <div className="mt-0.5 text-xs text-[#64748b]">
                {ex.businessQuestion}
              </div>
            </div>
            <span
              className={`text-[10px] uppercase tracking-wider ${
                ex.difficulty === "beginner"
                  ? "text-[#06d6a0]"
                  : ex.difficulty === "intermediate"
                  ? "text-[#f59e0b]"
                  : "text-[#ef4444]"
              }`}
            >
              {ex.difficulty}
            </span>
            <ArrowRight className="size-4 text-[#64748b]" />
          </Link>
        </li>
      ))}
      <li>
        <Link
          href={`/companies/${company}/briefing`}
          className="flex items-center gap-4 bg-[#06d6a0]/5 px-5 py-4 transition hover:bg-[#06d6a0]/10"
        >
          <span className="font-mono text-[11px] text-[#06d6a0]">→</span>
          <div className="flex-1">
            <div className="text-sm font-medium text-[#06d6a0]">
              CEO Briefing
            </div>
            <div className="mt-0.5 text-xs text-[#64748b]">
              Write the memo. Cite your queries. Earn the credential.
            </div>
          </div>
          <ArrowRight className="size-4 text-[#06d6a0]" />
        </Link>
      </li>
    </ol>
  );
}
