"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Play, Loader2 } from "lucide-react";
import { runQuery, type QueryResult } from "@/lib/pglite";

interface Props {
  initialSql?: string;
  onResult: (result: QueryResult, sql: string) => void;
  lastResult?: QueryResult | null;
}

export function SqlEditor({ initialSql = "", onResult, lastResult }: Props) {
  const [sql, setSql] = useState(initialSql);
  const [running, setRunning] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setSql(initialSql);
  }, [initialSql]);

  const run = useCallback(async () => {
    if (!sql.trim() || running) return;
    setRunning(true);
    const result = await runQuery(sql);
    setRunning(false);
    onResult(result, sql);
  }, [sql, running, onResult]);

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      run();
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-[#1e293b] bg-[#0a0f1a] px-3 py-2 text-xs">
        <div className="flex items-center gap-3 text-[#64748b]">
          <span className="font-mono">query.sql</span>
          <span className="text-[#1e293b]">·</span>
          <span>Ctrl+Enter to run</span>
        </div>
        <button
          onClick={run}
          disabled={running || !sql.trim()}
          className="inline-flex items-center gap-1.5 bg-[#06d6a0] px-3 py-1 font-medium text-[#0a0f1a] transition hover:bg-[#06d6a0]/90 disabled:opacity-50"
        >
          {running ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <Play className="size-3.5" />
          )}
          Run Query
        </button>
      </div>
      <textarea
        ref={textareaRef}
        value={sql}
        onChange={(e) => setSql(e.target.value)}
        onKeyDown={onKeyDown}
        spellCheck={false}
        placeholder="-- Write SQL against the company database
SELECT * FROM customers LIMIT 10;"
        className="block min-h-[200px] flex-1 resize-none border-0 bg-[#0a0f1a] p-4 font-mono text-[13px] leading-relaxed text-[#e2e8f0] outline-none placeholder:text-[#64748b]/70"
      />
      <div className="flex items-center justify-between border-t border-[#1e293b] bg-[#0a0f1a] px-3 py-1.5 font-mono text-[11px] text-[#64748b]">
        <span>
          {lastResult
            ? lastResult.error
              ? <span className="text-[#ef4444]">error: {lastResult.error}</span>
              : `${lastResult.rowCount} row(s) · ${lastResult.duration}ms`
            : "Ready"}
        </span>
        <span>{sql.length} chars</span>
      </div>
    </div>
  );
}
