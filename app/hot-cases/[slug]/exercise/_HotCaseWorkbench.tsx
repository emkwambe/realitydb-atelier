"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, CheckCircle2, FileText, Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SqlEditor } from "@/components/exercise/SqlEditor";
import { ResultsTable } from "@/components/exercise/ResultsTable";
import { SchemaExplorer } from "@/components/exercise/SchemaExplorer";
import { BriefingScaffold } from "@/components/exercise/BriefingScaffold";
import {
  ReferenceAnswerPanel,
  type SubmittedAnswer,
} from "@/components/exercise/ReferenceAnswerPanel";
import {
  getInitError,
  initPGlite,
  type QueryResult,
} from "@/lib/pglite";
import type { HotCaseClientView, HotCaseExercise } from "@/lib/hotCases";

interface HistoryItem {
  sql: string;
  result: QueryResult;
  ts: number;
}

export type GradeState =
  | { status: "unlocked"; latest: SubmittedAnswer }
  | { status: "ungraded" }
  | { status: "anonymous" };

interface Props {
  content: HotCaseClientView;
  gradeState: GradeState;
}

/**
 * Hot Case workbench — a stripped-down version of the company-module
 * workbench. No dataset switcher (Hot Cases ship one dataset), no
 * comparison panel (no scenarios), no rubric sidebar (Hot Case rubric
 * lives inline on the briefing page).
 *
 * The dataset comes from one of the existing company modules — for Hot Case
 * 001 it's NovaPay. content.dataset_company tells us which.
 */
export function HotCaseWorkbench({ content, gradeState }: Props) {
  const company = content.dataset_company;
  const [dbReady, setDbReady] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [lastResult, setLastResult] = useState<QueryResult | null>(null);
  const [editorSql, setEditorSql] = useState("");
  const [tab, setTab] = useState("query");
  const [exerciseIdx, setExerciseIdx] = useState(0);
  const [completed, setCompleted] = useState<Record<number, boolean>>({});
  const completedKey = `atelier:hot-case:${content.slug}:completed`;

  const current: HotCaseExercise = content.exercises[exerciseIdx];

  useEffect(() => {
    try {
      const raw = localStorage.getItem(completedKey);
      if (raw) setCompleted(JSON.parse(raw) as Record<number, boolean>);
    } catch {}
  }, [completedKey]);

  const markComplete = useCallback(() => {
    setCompleted((c) => {
      const next = { ...c, [current.id]: true };
      try {
        localStorage.setItem(completedKey, JSON.stringify(next));
      } catch {}
      return next;
    });
  }, [completedKey, current.id]);

  const completedCount = useMemo(
    () => Object.values(completed).filter(Boolean).length,
    [completed]
  );
  const totalExercises = content.exercises.length;
  const isLastExercise = exerciseIdx === totalExercises - 1;
  // Per Decision 3 (Blueprint v1.1), scaffold replaces the prompt panel
  // only on the last exercise once every exercise has been marked complete.
  const showScaffold = isLastExercise && completedCount >= totalExercises;

  useEffect(() => {
    (async () => {
      try {
        await initPGlite(company, "baseline");
        const err = getInitError();
        if (err) setInitError(err);
        else setInitError(null);
        setDbReady(true);
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        setInitError(msg);
        setDbReady(true);
      }
    })();
  }, [company]);

  const handleResult = useCallback((result: QueryResult, sql: string) => {
    setLastResult(result);
    setHistory((h) => [{ sql, result, ts: Date.now() }, ...h].slice(0, 10));
  }, []);

  const loadIntoEditor = useCallback((sql: string) => {
    setEditorSql(sql);
    setTab("query");
  }, []);

  return (
    <div className="flex h-[calc(100vh-7rem)] flex-col">
      {!dbReady && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-3 bg-[#0a0f1a]/95 backdrop-blur">
          <Loader2 className="size-6 animate-spin text-[#00f5d4]" />
          <p className="font-mono text-sm text-[#e2e8f0]">
            Initializing PostgreSQL in your browser…
          </p>
          <p className="text-xs text-[#64748b]">
            Loading {company} dataset (PGlite WASM)
          </p>
          {initError && (
            <p className="mt-4 max-w-md text-center text-xs text-[#ef4444]">
              {initError}
            </p>
          )}
        </div>
      )}

      <div className="flex items-center justify-between border-b border-[#1e293b] bg-[#111827] px-6 py-3">
        <div>
          <div className="font-mono text-[11px] uppercase tracking-wider text-[#00f5d4]">
            Hot Case · {content.vertical} · Free
          </div>
          <h1 className="mt-0.5 text-base font-medium text-[#e2e8f0]">
            {content.title}
          </h1>
        </div>
        <Link
          href={`/hot-cases/${content.slug}`}
          className="font-mono text-xs uppercase tracking-wider text-[#64748b] hover:text-[#00f5d4]"
        >
          ← Detail
        </Link>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <aside className="flex w-[40%] min-w-[320px] flex-col border-r border-[#1e293b] bg-[#111827]">
          {showScaffold ? (
            <BriefingScaffold
              briefingHref={`/hot-cases/${content.slug}/briefing`}
            />
          ) : (
            <>
              <div className="flex-1 overflow-y-auto p-5">
                <div className="flex items-center justify-between">
                  <div className="font-mono text-[11px] uppercase tracking-wider text-[#64748b]">
                    Exercise {exerciseIdx + 1} / {totalExercises}
                  </div>
                  <div className="font-mono text-[10px] uppercase tracking-wider text-[#06d6a0]">
                    {completedCount}/{totalExercises} complete
                  </div>
                </div>
                <h2 className="mt-1 text-lg font-medium text-[#e2e8f0]">{current.title}</h2>

                <div className="mt-4">
                  <div className="text-[11px] uppercase tracking-wider text-[#64748b]">
                    Question
                  </div>
                  <p className="mt-1 text-sm font-medium text-[#e2e8f0]">
                    {current.question}
                  </p>
                </div>

                {current.tags && current.tags.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {current.tags.map((t) => (
                      <span
                        key={t}
                        className="border border-[#1e293b] bg-[#1a2235] px-2 py-0.5 font-mono text-[10px] text-[#64748b]"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}

                {current.hint && (
                  <p className="mt-4 border-l-2 border-[#00f5d4]/50 bg-[#00f5d4]/5 px-3 py-2 text-xs leading-relaxed text-[#e2e8f0]/90">
                    <span className="font-mono uppercase tracking-wider text-[#00f5d4]">
                      Hint
                    </span>
                    <br />
                    {current.hint}
                  </p>
                )}

                <ReferenceAnswerPanel
                  status={gradeState.status}
                  referenceSQL={current.referenceSQL}
                  referenceBriefing={content.reference_briefing}
                  submitted={
                    gradeState.status === "unlocked" ? gradeState.latest : undefined
                  }
                  onLoadIntoEditor={loadIntoEditor}
                />
              </div>

              <div className="border-t border-[#1e293b] p-4">
                <button
                  onClick={markComplete}
                  disabled={history.length === 0}
                  className={`mb-3 inline-flex w-full items-center justify-center gap-2 px-3 py-2 text-xs font-medium transition ${
                    completed[current.id]
                      ? "border border-[#06d6a0] bg-transparent text-[#06d6a0]"
                      : "bg-[#06d6a0] text-[#0a0f1a] hover:bg-[#06d6a0]/90 disabled:opacity-40"
                  }`}
                  title={
                    history.length === 0
                      ? "Run at least one query before marking complete"
                      : completed[current.id]
                        ? "Marked complete"
                        : "Mark this exercise complete"
                  }
                >
                  <CheckCircle2 className="size-3.5" />
                  {completed[current.id] ? "Completed" : "Mark complete"}
                </button>
                <nav className="flex items-center justify-between">
                  <button
                    onClick={() => setExerciseIdx(Math.max(0, exerciseIdx - 1))}
                    disabled={exerciseIdx === 0}
                    className="inline-flex items-center gap-1 text-xs text-[#e2e8f0]/80 hover:text-[#00f5d4] disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    <ArrowLeft className="size-3.5" /> Prev
                  </button>
                  {!isLastExercise ? (
                    <button
                      onClick={() => setExerciseIdx(exerciseIdx + 1)}
                      className="inline-flex items-center gap-1 text-xs text-[#e2e8f0]/80 hover:text-[#00f5d4]"
                    >
                      Next <ArrowRight className="size-3.5" />
                    </button>
                  ) : (
                    <Link
                      href={`/hot-cases/${content.slug}/briefing`}
                      className="inline-flex items-center gap-2 bg-[#00f5d4] px-3 py-1.5 text-xs font-medium text-[#0a0f1a] hover:opacity-90"
                    >
                      <FileText className="size-3.5" /> Write your briefing
                    </Link>
                  )}
                </nav>
              </div>
            </>
          )}
        </aside>

        <section className="flex flex-1 flex-col bg-[#0a0f1a]">
          <Tabs value={tab} onValueChange={setTab} className="flex flex-1 flex-col">
            <TabsList className="rounded-none border-b border-[#1e293b] bg-[#0a0f1a] p-0">
              <TabsTrigger value="query" className="rounded-none">
                Query
              </TabsTrigger>
              <TabsTrigger value="schema" className="rounded-none">
                Schema
              </TabsTrigger>
              <TabsTrigger value="history" className="rounded-none">
                History {history.length > 0 && `(${history.length})`}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="query" className="m-0 flex flex-1 flex-col overflow-hidden">
              <div className="flex h-[45%] flex-col border-b border-[#1e293b]">
                <SqlEditor
                  initialSql={editorSql}
                  onResult={handleResult}
                  lastResult={lastResult}
                />
              </div>
              <div className="flex-1 overflow-hidden">
                <ResultsTable result={lastResult} />
              </div>
            </TabsContent>

            <TabsContent value="schema" className="m-0 flex-1 overflow-hidden">
              <SchemaExplorer company={company} onLoadQuery={loadIntoEditor} />
            </TabsContent>

            <TabsContent value="history" className="m-0 flex-1 overflow-y-auto">
              {history.length === 0 ? (
                <div className="p-6 text-sm text-[#64748b]">No queries run yet.</div>
              ) : (
                <ul className="divide-y divide-[#1e293b]">
                  {history.map((h, i) => (
                    <li key={i} className="p-4">
                      <div className="flex items-center justify-between font-mono text-[11px] text-[#64748b]">
                        <span>{new Date(h.ts).toLocaleTimeString()}</span>
                        <span>
                          {h.result.error ? (
                            <span className="text-[#ef4444]">error</span>
                          ) : (
                            `${h.result.rowCount} rows · ${h.result.duration}ms`
                          )}
                        </span>
                      </div>
                      <pre className="mt-2 overflow-x-auto font-mono text-[11px] text-[#e2e8f0]">
                        {h.sql}
                      </pre>
                      <button
                        onClick={() => loadIntoEditor(h.sql)}
                        className="mt-2 text-[11px] text-[#00f5d4] hover:underline"
                      >
                        Load into editor →
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </TabsContent>
          </Tabs>
        </section>
      </div>

      <nav className="flex items-center justify-between border-t border-[#1e293b] bg-[#0a0f1a] px-6 py-3 font-mono text-xs text-[#64748b]">
        <Link
          href={`/hot-cases/${content.slug}`}
          className="hover:text-[#00f5d4]"
        >
          ← Case detail
        </Link>
        <Link
          href={`/hot-cases/${content.slug}/briefing`}
          className="inline-flex items-center gap-2 bg-[#00f5d4] px-3 py-1.5 font-sans font-medium text-[#0a0f1a] hover:opacity-90"
        >
          <FileText className="size-3.5" /> Write your briefing
        </Link>
      </nav>
    </div>
  );
}
