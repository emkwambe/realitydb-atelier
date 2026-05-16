"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronRight, FileText, Loader2 } from "lucide-react";
import { novaPayExercises } from "@/content/companies/novapay/exercises";
import { novaPayRubric } from "@/content/companies/novapay/rubric";
import { NOVAPAY_SCENARIOS } from "@/content/companies/novapay/scenarios";

const STORAGE_KEY = "atelier:novapay:briefing";
const RESULT_KEY = "atelier:novapay:result";
const DATASET_KEY = "atelier:novapay:dataset";
const VISITED_KEY = "atelier:novapay:visitedScenarios";

// CEO Briefing v2 — four parts. Same prompt that grading sees.
const PARTS = [
  {
    letter: "1",
    name: "Diagnosis",
    body: "What did you find in the baseline data? Segment by tier, name the smoking gun, cite numbers.",
  },
  {
    letter: "2",
    name: "Intervention",
    body: "Which scenario did you test, and why that one? Quantify what changed vs. baseline.",
  },
  {
    letter: "3",
    name: "Decision",
    body: "What do you recommend? Include cost, payback period, and the trade-off you accept.",
  },
  {
    letter: "4",
    name: "Epistemic honesty",
    body: "What can you NOT confirm from this data? How would you resolve it before betting the company?",
  },
];

export default function BriefingPage() {
  const router = useRouter();
  const [text, setText] = useState("");
  const [citations, setCitations] = useState<number[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [rubricOpen, setRubricOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [scenariosTested, setScenariosTested] = useState<string[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setText(parsed.text ?? "");
        setCitations(parsed.citations ?? []);
      }
      const visited = localStorage.getItem(VISITED_KEY);
      if (visited) {
        const arr = JSON.parse(visited) as string[];
        setScenariosTested(arr);
      } else {
        const cur = localStorage.getItem(DATASET_KEY);
        if (cur) setScenariosTested([cur]);
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ text, citations })
      );
    } catch {}
  }, [text, citations]);

  const wordCount = useMemo(
    () => text.trim().split(/\s+/).filter(Boolean).length,
    [text]
  );

  const inRange = wordCount >= 700 && wordCount <= 900;
  const overLimit = wordCount > 900;
  const countColor = overLimit
    ? "text-[#ef4444]"
    : inRange
      ? "text-[#06d6a0]"
      : "text-[#64748b]";

  function toggleCitation(n: number) {
    setCitations((c) =>
      c.includes(n) ? c.filter((x) => x !== n) : [...c, n].sort((a, b) => a - b)
    );
  }

  async function submit() {
    if (wordCount < 300) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch("/api/grade-briefing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          briefingText: text,
          companyId: "novapay",
          wordCount,
          exercisesCited: citations,
          scenariosTested,
        }),
      });
      if (!res.ok) {
        const body = await res.text();
        throw new Error(body || `Grading failed (${res.status})`);
      }
      const data = await res.json();
      try {
        localStorage.setItem(RESULT_KEY, JSON.stringify(data));
      } catch {}
      router.push("/companies/novapay/results");
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setSubmitError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-7rem)]">
      <aside
        className={`shrink-0 border-r border-[#1e293b] bg-[#111827] transition-all ${
          sidebarOpen ? "w-[300px]" : "w-10"
        }`}
      >
        <button
          onClick={() => setSidebarOpen((v) => !v)}
          className="flex w-full items-center justify-end border-b border-[#1e293b] px-3 py-2 text-[#64748b] hover:text-[#06d6a0]"
        >
          {sidebarOpen ? <ChevronRight className="size-4" /> : <FileText className="size-4" />}
        </button>

        {sidebarOpen && (
          <div className="space-y-6 p-5">
            <div>
              <h3 className="text-[11px] uppercase tracking-wider text-[#64748b]">
                Briefing structure (4 parts)
              </h3>
              <ul className="mt-3 space-y-3">
                {PARTS.map((s) => (
                  <li key={s.letter}>
                    <div className="flex items-center gap-2 text-sm font-medium text-[#e2e8f0]">
                      <span className="inline-flex size-5 items-center justify-center bg-[#06d6a0] font-mono text-[11px] text-[#0a0f1a]">
                        {s.letter}
                      </span>
                      {s.name}
                    </div>
                    <p className="mt-1 pl-7 text-xs leading-relaxed text-[#64748b]">
                      {s.body}
                    </p>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-[11px] uppercase tracking-wider text-[#64748b]">
                Scenarios you visited
              </h3>
              <ul className="mt-2 space-y-1">
                {NOVAPAY_SCENARIOS.map((s) => {
                  const visited = scenariosTested.includes(s.id);
                  return (
                    <li
                      key={s.id}
                      className={`flex items-center gap-2 font-mono text-[11px] ${
                        visited ? "text-[#06d6a0]" : "text-[#64748b]"
                      }`}
                    >
                      <span className="size-1.5 rounded-full bg-current" />
                      {s.shortLabel}
                      {!visited && (
                        <span className="text-[10px] opacity-60">(not tested)</span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>

            <div>
              <h3 className="text-[11px] uppercase tracking-wider text-[#64748b]">
                Cite exercises
              </h3>
              <ul className="mt-3 space-y-1.5">
                {novaPayExercises.map((ex) => (
                  <li key={ex.id}>
                    <label className="flex items-start gap-2 text-xs text-[#e2e8f0]/80 hover:text-[#e2e8f0]">
                      <input
                        type="checkbox"
                        checked={citations.includes(ex.id)}
                        onChange={() => toggleCitation(ex.id)}
                        className="mt-0.5 accent-[#06d6a0]"
                      />
                      <span>
                        <span className="font-mono text-[#64748b]">
                          {String(ex.id).padStart(2, "0")}
                        </span>{" "}
                        {ex.title}
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <button
                onClick={() => setRubricOpen((v) => !v)}
                className="flex w-full items-center justify-between text-[11px] uppercase tracking-wider text-[#64748b] hover:text-[#e2e8f0]"
              >
                <span>Grading rubric (5 axes)</span>
                {rubricOpen ? (
                  <ChevronDown className="size-3.5" />
                ) : (
                  <ChevronRight className="size-3.5" />
                )}
              </button>
              {rubricOpen && (
                <ul className="mt-2 space-y-2 text-[11px] leading-relaxed text-[#64748b]">
                  {Object.values(novaPayRubric.axes).map((axis) => (
                    <li key={axis.name}>
                      <span className="text-[#e2e8f0]">{axis.name}</span>
                      <span className="ml-1 font-mono text-[#06d6a0]">
                        / {axis.maxScore}
                      </span>
                      <p className="mt-0.5">{axis.passCriteria}</p>
                    </li>
                  ))}
                  <li className="pt-2 text-[#06d6a0]">
                    Passing score: {novaPayRubric.passingScore}/100
                  </li>
                </ul>
              )}
            </div>
          </div>
        )}
      </aside>

      <main className="flex-1 bg-[#0a0f1a]">
        <div className="mx-auto max-w-3xl px-6 py-10">
          <header>
            <div className="font-mono text-xs uppercase tracking-wider text-[#64748b]">
              NovaPay · Module 01
            </div>
            <h1 className="mt-2 text-3xl font-medium text-[#e2e8f0]">
              CEO Briefing — NovaPay Series B
            </h1>
            <p className="mt-2 text-sm text-[#64748b]">
              Board meeting in 2 weeks. 700–900 words. Four-part structure
              below. Cite at least four exercises and include numbers from
              the baseline AND any scenario you tested.
            </p>
          </header>

          <div className="mt-6">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              spellCheck
              placeholder={`1. Diagnosis (what I found in baseline)…\n\n2. Intervention (scenario I tested and why)…\n\n3. Decision (recommendation with cost / payback)…\n\n4. Epistemic honesty (what I cannot confirm yet)…`}
              className="block min-h-[560px] w-full resize-y border border-[#1e293b] bg-[#111827] p-5 font-mono text-[14px] leading-relaxed text-[#e2e8f0] outline-none focus:border-[#06d6a0]"
            />
          </div>

          <div className="mt-3 flex items-center justify-between text-xs">
            <span className={`${countColor} font-mono`}>
              {wordCount} words
              {overLimit && " · over limit"}
              {inRange && " · in range"}
            </span>
            <span className="text-[#64748b]">
              {citations.length} citation(s) · {scenariosTested.length}{" "}
              scenario(s) tested
            </span>
          </div>

          {submitError && (
            <p className="mt-3 border border-[#ef4444]/40 bg-[#ef4444]/10 p-3 text-xs text-[#ef4444]">
              {submitError}
            </p>
          )}

          <div className="mt-6 flex items-center justify-end">
            <button
              onClick={submit}
              disabled={wordCount < 300 || submitting}
              className="inline-flex items-center gap-2 bg-[#06d6a0] px-5 py-3 text-sm font-medium text-[#0a0f1a] transition hover:bg-[#06d6a0]/90 disabled:opacity-40"
            >
              {submitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Grading…
                </>
              ) : (
                "Submit for Grading"
              )}
            </button>
          </div>

          {wordCount < 300 && (
            <p className="mt-2 text-right text-[11px] text-[#64748b]">
              Reach 300 words to submit.
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
