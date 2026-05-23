"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Lock } from "lucide-react";

export interface SubmittedAnswer {
  briefingText: string;
  score: number;
  axesLabel?: string; // e.g. "Pattern 28/33 · Quant 25/33 · Rec 30/34"
}

interface Props {
  referenceSQL?: string | string[];
  referenceBriefing?: string;
  submitted?: SubmittedAnswer;
  /**
   * Reveal gate per Decision 1 (Blueprint v1.1):
   *   "unlocked"      → graded submission exists → button works
   *   "ungraded"      → signed in, no graded submission → hide entirely
   *   "anonymous"     → not signed in → show account-creation CTA
   */
  status: "unlocked" | "ungraded" | "anonymous";
  onLoadIntoEditor?: (sql: string) => void;
}

export function ReferenceAnswerPanel({
  referenceSQL,
  referenceBriefing,
  submitted,
  status,
  onLoadIntoEditor,
}: Props) {
  const [open, setOpen] = useState(false);

  if (status === "ungraded") return null;

  if (status === "anonymous") {
    return (
      <div className="mt-4 border border-[#1e293b] bg-[#111827] p-4">
        <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-[#64748b]">
          <Lock className="size-3.5" /> Reference answer
        </div>
        <p className="mt-2 text-xs leading-relaxed text-[#e2e8f0]/90">
          Create a free account to see the reference answer and track your
          progress across Hot Cases.
        </p>
        <Link
          href="/auth/signup?source=reference-answer"
          className="mt-3 inline-flex items-center gap-1.5 bg-[#00f5d4] px-3 py-1.5 text-xs font-medium text-[#0a0f1a] hover:opacity-90"
        >
          Create account →
        </Link>
      </div>
    );
  }

  const sqls = Array.isArray(referenceSQL)
    ? referenceSQL
    : referenceSQL
      ? [referenceSQL]
      : [];

  return (
    <div className="mt-4">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 text-xs text-[#e2e8f0]/80 hover:text-[#06d6a0]"
      >
        {open ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
        {open ? "Hide reference answer" : "Show reference answer"}
      </button>

      {open && (
        <section className="mt-3 border border-[#06d6a0]/30 bg-[#06d6a0]/[0.02] p-4">
          <div className="font-mono text-[11px] uppercase tracking-wider text-[#06d6a0]">
            Your submission vs. the reference answer
          </div>

          <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-wider text-[#64748b]">
                Your submission
              </div>
              {submitted ? (
                <>
                  <div className="mt-1 font-mono text-sm text-[#e2e8f0]">
                    {submitted.score}
                    <span className="text-xs text-[#64748b]">/100</span>
                    {submitted.axesLabel && (
                      <span className="ml-2 text-[10px] text-[#64748b]">
                        {submitted.axesLabel}
                      </span>
                    )}
                  </div>
                  <pre className="mt-2 max-h-[280px] overflow-auto whitespace-pre-wrap border border-[#1e293b] bg-[#0a0f1a] p-3 font-mono text-[11px] leading-relaxed text-[#e2e8f0]">
                    {submitted.briefingText || "(no briefing text saved locally)"}
                  </pre>
                </>
              ) : (
                <p className="mt-1 text-[11px] text-[#64748b]">
                  Your submitted briefing isn&apos;t cached on this device.
                  Open the results page to read it.
                </p>
              )}
            </div>

            <div>
              <div className="font-mono text-[10px] uppercase tracking-wider text-[#64748b]">
                Reference answer
              </div>
              {referenceBriefing ? (
                <pre className="mt-1 max-h-[280px] overflow-auto whitespace-pre-wrap border border-[#1e293b] bg-[#0a0f1a] p-3 font-mono text-[11px] leading-relaxed text-[#e2e8f0]">
                  {referenceBriefing}
                </pre>
              ) : (
                <p className="mt-1 text-[11px] text-[#64748b]">
                  Reference briefing not yet published for this case.
                </p>
              )}

              {sqls.length > 0 && (
                <div className="mt-3 space-y-3">
                  <div className="font-mono text-[10px] uppercase tracking-wider text-[#64748b]">
                    Reference SQL
                  </div>
                  {sqls.map((sql, i) => (
                    <div key={i}>
                      <pre className="overflow-x-auto border border-[#1e293b] bg-[#0a0f1a] p-3 font-mono text-[11px] leading-relaxed text-[#e2e8f0]">
                        {sql}
                      </pre>
                      {onLoadIntoEditor && (
                        <button
                          onClick={() => onLoadIntoEditor(sql)}
                          className="mt-1 text-[11px] text-[#06d6a0] hover:underline"
                        >
                          Load into editor →
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
