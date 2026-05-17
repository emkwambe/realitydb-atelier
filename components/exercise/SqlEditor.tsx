"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Play, Loader2, Bookmark } from "lucide-react";
import { runQuery, type QueryResult } from "@/lib/pglite";

interface Props {
  initialSql?: string;
  onResult: (result: QueryResult, sql: string) => void;
  onSave?: (sql: string, label: string, result: QueryResult | null) => void;
  lastResult?: QueryResult | null;
}

export function SqlEditor({ initialSql = "", onResult, onSave, lastResult }: Props) {
  const [sql, setSql] = useState(initialSql);
  const [running, setRunning] = useState(false);
  const [saveOpen, setSaveOpen] = useState(false);
  const [saveLabel, setSaveLabel] = useState("");
  const [savedFlash, setSavedFlash] = useState(false);
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

  function handleSave() {
    if (!onSave || !sql.trim() || !saveLabel.trim()) return;
    onSave(sql, saveLabel.trim(), lastResult ?? null);
    setSaveOpen(false);
    setSaveLabel("");
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 1500);
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-[#1e293b] bg-[#0a0f1a] px-3 py-2 text-xs">
        <div className="flex items-center gap-3 text-[#64748b]">
          <span className="font-mono">query.sql</span>
          <span className="text-[#1e293b]">·</span>
          <span>Ctrl+Enter to run</span>
        </div>
        <div className="flex items-center gap-2">
          {onSave && (
            <button
              onClick={() => setSaveOpen((v) => !v)}
              disabled={!sql.trim()}
              title="Save this query with a label"
              className="inline-flex items-center gap-1.5 border border-[#1e293b] px-2.5 py-1 text-[#e2e8f0]/80 transition hover:border-[#06d6a0] hover:text-[#06d6a0] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Bookmark className="size-3.5" />
              {savedFlash ? "Saved" : "Save"}
            </button>
          )}
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
      </div>
      {saveOpen && onSave && (
        <div className="flex items-center gap-2 border-b border-[#1e293b] bg-[#111827] px-3 py-2">
          <input
            autoFocus
            value={saveLabel}
            onChange={(e) => setSaveLabel(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSave();
              if (e.key === "Escape") setSaveOpen(false);
            }}
            placeholder="Name this query, e.g. 'My churn analysis'"
            className="flex-1 border border-[#1e293b] bg-[#1a2235] px-2 py-1 font-mono text-[12px] text-[#e2e8f0] outline-none focus:border-[#06d6a0]"
          />
          <button
            onClick={handleSave}
            disabled={!saveLabel.trim()}
            className="bg-[#06d6a0] px-3 py-1 text-xs font-medium text-[#0a0f1a] disabled:opacity-50"
          >
            Save
          </button>
          <button
            onClick={() => setSaveOpen(false)}
            className="text-xs text-[#64748b] hover:text-[#e2e8f0]"
          >
            Cancel
          </button>
        </div>
      )}
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
