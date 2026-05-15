"use client";

import { useMemo, useState } from "react";
import { Download } from "lucide-react";
import type { QueryResult } from "@/lib/pglite";

const PAGE_SIZE = 100;

export function ResultsTable({ result }: { result: QueryResult | null }) {
  const [page, setPage] = useState(0);

  const cols = useMemo(() => {
    if (!result) return [] as string[];
    if (result.fields && result.fields.length > 0) {
      return result.fields.map((f) => f.name);
    }
    if (result.rows.length > 0) {
      return Object.keys(result.rows[0]);
    }
    return [];
  }, [result]);

  if (!result) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-[#64748b]">
        Run a query to see results.
      </div>
    );
  }

  if (result.error) {
    return (
      <div className="border border-[#ef4444]/40 bg-[#ef4444]/10 p-4 font-mono text-[12px] text-[#ef4444]">
        {result.error}
      </div>
    );
  }

  if (result.rows.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-[#64748b]">
        Query returned 0 rows in {result.duration}ms.
      </div>
    );
  }

  const totalPages = Math.max(1, Math.ceil(result.rows.length / PAGE_SIZE));
  const pageRows = result.rows.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-[#1e293b] bg-[#0a0f1a] px-3 py-1.5 font-mono text-[11px] text-[#64748b]">
        <span>
          {result.rowCount} row(s) · {cols.length} cols · {result.duration}ms
        </span>
        <button
          onClick={() => downloadCsv(cols, result.rows)}
          className="inline-flex items-center gap-1 text-[#06d6a0] hover:underline"
        >
          <Download className="size-3" /> CSV
        </button>
      </div>
      <div className="data-grid flex-1 overflow-auto">
        <table className="w-full border-collapse font-mono text-[12px]">
          <thead className="sticky top-0 bg-[#1a2235] text-[11px] uppercase tracking-wider text-[#64748b]">
            <tr>
              {cols.map((c) => (
                <th
                  key={c}
                  className="border-b border-[#1e293b] px-3 py-1.5 text-left font-medium"
                >
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageRows.map((row, i) => (
              <tr
                key={i}
                className="border-b border-[#1e293b]/60 hover:bg-[#1a2235]/60"
              >
                {cols.map((c) => (
                  <td key={c} className="px-3 py-1 text-[#e2e8f0]">
                    {formatCell((row as Record<string, unknown>)[c])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-[#1e293b] bg-[#0a0f1a] px-3 py-1.5 font-mono text-[11px] text-[#64748b]">
          <button
            disabled={page === 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            className="text-[#06d6a0] disabled:opacity-30"
          >
            ← Prev
          </button>
          <span>
            Page {page + 1} of {totalPages}
          </span>
          <button
            disabled={page >= totalPages - 1}
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            className="text-[#06d6a0] disabled:opacity-30"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}

function formatCell(v: unknown): string {
  if (v === null || v === undefined) return "—";
  if (v instanceof Date) return v.toISOString();
  if (typeof v === "object") return JSON.stringify(v);
  if (typeof v === "number") {
    if (!Number.isInteger(v) && Math.abs(v) > 0.001) return v.toFixed(2);
  }
  return String(v);
}

function downloadCsv(cols: string[], rows: Record<string, unknown>[]) {
  const esc = (v: unknown) => {
    if (v === null || v === undefined) return "";
    const s = typeof v === "object" ? JSON.stringify(v) : String(v);
    if (s.includes(",") || s.includes("\"") || s.includes("\n")) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };
  const lines = [cols.join(",")];
  for (const r of rows) {
    lines.push(cols.map((c) => esc((r as Record<string, unknown>)[c])).join(","));
  }
  const blob = new Blob([lines.join("\n")], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `query-${Date.now()}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(a.href);
}
