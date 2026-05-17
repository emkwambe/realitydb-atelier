"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Loader2, FileText } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExercisePanel } from "@/components/exercise/ExercisePanel";
import { SqlEditor } from "@/components/exercise/SqlEditor";
import { ResultsTable } from "@/components/exercise/ResultsTable";
import { SchemaExplorer } from "@/components/exercise/SchemaExplorer";
import { DatasetSwitcher } from "@/components/exercise/DatasetSwitcher";
import { ComparisonPanel } from "@/components/exercise/ComparisonPanel";
import {
  getInitError,
  initPGlite,
  switchDataset,
  type DatasetVariant,
  type QueryResult,
} from "@/lib/pglite";
import type { Exercise } from "@/lib/grading";

interface HistoryItem {
  sql: string;
  result: QueryResult;
  ts: number;
}

interface Props {
  exercise: Exercise;
  exerciseNumber: number;
  totalExercises: number;
  hasNext: boolean;
  hasPrev: boolean;
  company: string;
}

const DATASET_KEY = (company: string) => `atelier:${company}:dataset`;
const VISITED_KEY = (company: string) => `atelier:${company}:visitedScenarios`;

export function ExerciseWorkbench({
  exercise,
  exerciseNumber,
  totalExercises,
  hasNext,
  hasPrev,
  company,
}: Props) {
  const [dbReady, setDbReady] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [lastResult, setLastResult] = useState<QueryResult | null>(null);
  const [editorSql, setEditorSql] = useState("");
  const [tab, setTab] = useState("query");
  const [dataset, setDataset] = useState<DatasetVariant>("baseline");
  const [switching, setSwitching] = useState(false);
  const [visited, setVisited] = useState<Set<DatasetVariant>>(
    () => new Set<DatasetVariant>(["baseline"])
  );

  const storageKey = `atelier:${company}:progress`;
  const [completed, setCompleted] = useState<Record<number, boolean>>({});

  // Restore prior dataset choice
  useEffect(() => {
    try {
      const stored = localStorage.getItem(
        DATASET_KEY(company)
      ) as DatasetVariant | null;
      if (
        stored === "baseline" ||
        stored === "scenario-a" ||
        stored === "scenario-b"
      ) {
        setDataset(stored);
      }
      const visitRaw = localStorage.getItem(VISITED_KEY(company));
      if (visitRaw) {
        const arr = JSON.parse(visitRaw) as DatasetVariant[];
        setVisited(new Set(arr));
      }
    } catch {}
  }, [company]);

  useEffect(() => {
    (async () => {
      try {
        await initPGlite(company, dataset);
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
  }, [company, dataset]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) setCompleted(JSON.parse(raw));
    } catch {}
  }, [storageKey]);

  const handleResult = useCallback((result: QueryResult, sql: string) => {
    setLastResult(result);
    setHistory((h) => [{ sql, result, ts: Date.now() }, ...h].slice(0, 10));
  }, []);

  const markComplete = useCallback(() => {
    setCompleted((c) => {
      const next = { ...c, [exercise.id]: true };
      try {
        localStorage.setItem(storageKey, JSON.stringify(next));
      } catch {}
      return next;
    });
  }, [exercise.id, storageKey]);

  const onSwitchDataset = useCallback(
    async (next: DatasetVariant) => {
      if (next === dataset || switching) return;
      setSwitching(true);
      setDbReady(false);
      try {
        await switchDataset(company, next);
        setInitError(getInitError());
      } catch (e) {
        setInitError(e instanceof Error ? e.message : String(e));
      }
      setDataset(next);
      setHistory([]);
      setLastResult(null);
      const newVisited = new Set(visited);
      newVisited.add(next);
      setVisited(newVisited);
      try {
        localStorage.setItem(DATASET_KEY(company), next);
        localStorage.setItem(
          VISITED_KEY(company),
          JSON.stringify(Array.from(newVisited))
        );
      } catch {}
      setSwitching(false);
      setDbReady(true);
    },
    [company, dataset, switching, visited]
  );

  const showComparison = visited.size >= 2;

  const allCompleted =
    Object.values({ ...completed, [exercise.id]: completed[exercise.id] }).filter(
      Boolean
    ).length >= totalExercises ||
    (exercise.id === totalExercises && completed[exercise.id]);

  return (
    <div className="flex h-[calc(100vh-7rem)] flex-col">
      {!dbReady && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-3 bg-[#0a0f1a]/95 backdrop-blur">
          <Loader2 className="size-6 animate-spin text-[#06d6a0]" />
          <p className="font-mono text-sm text-[#e2e8f0]">
            Initializing PostgreSQL in your browser…
          </p>
          <p className="text-xs text-[#64748b]">
            Loading {company} {dataset} (PGlite WASM)
          </p>
          {initError && (
            <p className="mt-4 max-w-md text-center text-xs text-[#ef4444]">
              {initError}
            </p>
          )}
        </div>
      )}

      <DatasetSwitcher
        company={company}
        current={dataset}
        switching={switching}
        onSwitch={onSwitchDataset}
      />

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-[40%] min-w-[320px] border-r border-[#1e293b] bg-[#111827]">
          <ExercisePanel
            exercise={exercise}
            exerciseNumber={exerciseNumber}
            totalExercises={totalExercises}
            hasAttempted={history.length > 0}
            isCompleted={Boolean(completed[exercise.id])}
            onComplete={markComplete}
            onUseReference={(sql) => {
              setEditorSql(sql);
              setTab("query");
            }}
          />
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
              {showComparison && (
                <TabsTrigger value="compare" className="rounded-none">
                  Compare
                </TabsTrigger>
              )}
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
              <SchemaExplorer company={company} />
            </TabsContent>

            <TabsContent value="history" className="m-0 flex-1 overflow-y-auto">
              {history.length === 0 ? (
                <div className="p-6 text-sm text-[#64748b]">
                  No queries run yet.
                </div>
              ) : (
                <ul className="divide-y divide-[#1e293b]">
                  {history.map((h, i) => (
                    <li key={i} className="p-4">
                      <div className="flex items-center justify-between font-mono text-[11px] text-[#64748b]">
                        <span>{new Date(h.ts).toLocaleTimeString()}</span>
                        <span>
                          {h.result.error
                            ? <span className="text-[#ef4444]">error</span>
                            : `${h.result.rowCount} rows · ${h.result.duration}ms`}
                        </span>
                      </div>
                      <pre className="mt-2 overflow-x-auto font-mono text-[11px] text-[#e2e8f0]">
                        {h.sql}
                      </pre>
                      <button
                        onClick={() => {
                          setEditorSql(h.sql);
                          setTab("query");
                        }}
                        className="mt-2 text-[11px] text-[#06d6a0] hover:underline"
                      >
                        Load into editor →
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </TabsContent>

            {showComparison && (
              <TabsContent value="compare" className="m-0 flex-1 overflow-y-auto p-4">
                <ComparisonPanel company={company} />
                <p className="mt-4 text-[11px] leading-relaxed text-[#64748b]">
                  Numbers are pre-computed from{" "}
                  <code className="font-mono text-[#06d6a0]">
                    public/data/{company}-comparison-ab.json
                  </code>
                  . Run the same queries on each dataset to verify them
                  yourself — the briefing rewards students who say what they
                  tested and what they observed.
                </p>
              </TabsContent>
            )}
          </Tabs>
        </section>
      </div>

      <nav className="flex items-center justify-between border-t border-[#1e293b] bg-[#0a0f1a] px-6 py-3">
        {hasPrev ? (
          <Link
            href={`/companies/${company}/exercise/${exerciseNumber - 1}`}
            className="inline-flex items-center gap-1 text-sm text-[#e2e8f0]/80 hover:text-[#06d6a0]"
          >
            <ArrowLeft className="size-4" /> Previous
          </Link>
        ) : (
          <span />
        )}

        <div className="flex items-center gap-4 font-mono text-xs text-[#64748b]">
          <span>
            Exercise {exerciseNumber} of {totalExercises}
          </span>
          {(exerciseNumber === totalExercises || allCompleted) && (
            <Link
              href={`/companies/${company}/briefing`}
              className="inline-flex items-center gap-1 bg-[#06d6a0] px-3 py-1.5 font-sans text-xs font-medium text-[#0a0f1a] hover:bg-[#06d6a0]/90"
            >
              <FileText className="size-3.5" /> Go to CEO Briefing
            </Link>
          )}
        </div>

        {hasNext ? (
          <Link
            href={`/companies/${company}/exercise/${exerciseNumber + 1}`}
            className="inline-flex items-center gap-1 text-sm text-[#e2e8f0]/80 hover:text-[#06d6a0]"
          >
            Next <ArrowRight className="size-4" />
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </div>
  );
}
