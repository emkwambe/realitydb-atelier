"use client";

import { useEffect, useMemo, useState } from "react";
import { BookOpen, ChevronRight, Database, Search, Loader2, PlayCircle } from "lucide-react";
import { initPGlite, runQuery } from "@/lib/pglite";
import { NOVAPAY_CITATIONS } from "@/content/companies/novapay/citations";
import { MEDCORE_CITATIONS } from "@/content/companies/medcore/citations";
import { SUPPLYLINK_CITATIONS } from "@/content/companies/supplylink/citations";
import type { CompanyCitations } from "@/content/companies/novapay/citations";
import { NOVAPAY_QUICK_QUERIES } from "@/content/companies/novapay/quickQueries";
import { MEDCORE_QUICK_QUERIES } from "@/content/companies/medcore/quickQueries";
import { SUPPLYLINK_QUICK_QUERIES } from "@/content/companies/supplylink/quickQueries";
import type { CompanyQuickQueries } from "@/content/companies/novapay/quickQueries";

const CITATIONS_BY_COMPANY: Record<string, CompanyCitations> = {
  novapay: NOVAPAY_CITATIONS,
  medcore: MEDCORE_CITATIONS,
  supplylink: SUPPLYLINK_CITATIONS,
};

const QUICK_QUERIES_BY_COMPANY: Record<string, CompanyQuickQueries> = {
  novapay: NOVAPAY_QUICK_QUERIES,
  medcore: MEDCORE_QUICK_QUERIES,
  supplylink: SUPPLYLINK_QUICK_QUERIES,
};

interface ColumnInfo {
  table_name: string;
  column_name: string;
  data_type: string;
  is_nullable: string;
}

interface TableInfo {
  name: string;
  columns: { name: string; type: string; nullable: boolean }[];
  sampleRows: Record<string, unknown>[];
  loadedSample: boolean;
}

interface Props {
  company: string;
  onLoadQuery?: (sql: string) => void;
}

export function SchemaExplorer({ company, onLoadQuery }: Props) {
  const [tables, setTables] = useState<TableInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      await initPGlite(company);
      const colsRes = await runQuery(
        `SELECT table_name, column_name, data_type, is_nullable
         FROM information_schema.columns
         WHERE table_schema = 'public'
         ORDER BY table_name, ordinal_position;`
      );
      if (cancelled) return;
      const rows = (colsRes.rows as unknown as ColumnInfo[]) || [];
      const grouped = new Map<string, TableInfo>();
      for (const r of rows) {
        if (!grouped.has(r.table_name)) {
          grouped.set(r.table_name, {
            name: r.table_name,
            columns: [],
            sampleRows: [],
            loadedSample: false,
          });
        }
        grouped.get(r.table_name)!.columns.push({
          name: r.column_name,
          type: r.data_type,
          nullable: r.is_nullable === "YES",
        });
      }
      setTables(Array.from(grouped.values()));
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [company]);

  const filtered = useMemo(() => {
    if (!filter.trim()) return tables;
    const q = filter.toLowerCase();
    return tables
      .map((t) => ({
        ...t,
        columns: t.columns.filter(
          (c) => c.name.toLowerCase().includes(q) || t.name.toLowerCase().includes(q)
        ),
      }))
      .filter((t) => t.columns.length > 0 || t.name.toLowerCase().includes(q));
  }, [tables, filter]);

  async function toggle(name: string) {
    const next = new Set(expanded);
    if (next.has(name)) {
      next.delete(name);
      setExpanded(next);
      return;
    }
    next.add(name);
    setExpanded(next);

    const target = tables.find((t) => t.name === name);
    if (target && !target.loadedSample) {
      const sample = await runQuery(`SELECT * FROM "${name}" LIMIT 3;`);
      setTables((prev) =>
        prev.map((t) =>
          t.name === name
            ? { ...t, sampleRows: sample.rows, loadedSample: true }
            : t
        )
      );
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 p-4 text-sm text-[#64748b]">
        <Loader2 className="size-4 animate-spin" />
        Loading schema…
      </div>
    );
  }

  if (tables.length === 0) {
    return (
      <div className="p-4 text-sm text-[#64748b]">
        No tables found. Make sure <code className="font-mono">public/data/{company}-5k.sql</code> is present.
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-[#1e293b] p-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2 top-1/2 size-4 -translate-y-1/2 text-[#64748b]" />
          <input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filter columns / tables…"
            className="w-full border border-[#1e293b] bg-[#1a2235] py-1.5 pl-8 pr-3 text-sm text-[#e2e8f0] outline-none focus:border-[#06d6a0]"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        <ul className="divide-y divide-[#1e293b]">
          {filtered.map((t) => {
            const isOpen = expanded.has(t.name);
            return (
              <li key={t.name}>
                <button
                  onClick={() => toggle(t.name)}
                  className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm hover:bg-[#1a2235]"
                >
                  <span className="flex items-center gap-2 font-mono text-[#e2e8f0]">
                    <ChevronRight
                      className={`size-3.5 text-[#64748b] transition-transform ${isOpen ? "rotate-90" : ""}`}
                    />
                    <Database className="size-3.5 text-[#06d6a0]" />
                    {t.name}
                  </span>
                  <span className="text-[11px] text-[#64748b]">
                    {t.columns.length} col
                  </span>
                </button>
                {isOpen && (
                  <div className="border-t border-[#1e293b] bg-[#0a0f1a]/40 px-3 py-2">
                    <table className="w-full font-mono text-[11px]">
                      <tbody>
                        {t.columns.map((c) => (
                          <tr key={c.name}>
                            <td className="py-0.5 pr-2 text-[#e2e8f0]">{c.name}</td>
                            <td className="py-0.5 pr-2 text-[#06d6a0]">{c.type}</td>
                            <td className="py-0.5 text-[#64748b]">
                              {c.nullable ? "null" : "not null"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {QUICK_QUERIES_BY_COMPANY[company]?.[t.name] && onLoadQuery && (
                      <div className="mt-3 border-t border-[#1e293b] pt-2">
                        <div className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-[#06d6a0]">
                          <PlayCircle className="size-3" /> Quick queries
                        </div>
                        <div className="mt-1 italic text-[10px] text-[#64748b]">
                          Exploration prompts, not exercise answers. Click to load
                          into the editor — edit freely before running.
                        </div>
                        <ul className="mt-1 space-y-1">
                          {QUICK_QUERIES_BY_COMPANY[company][t.name].map((q) => (
                            <li key={q.label}>
                              <button
                                onClick={() => onLoadQuery(q.sql)}
                                className="flex w-full items-center gap-1.5 text-left text-[11px] text-[#e2e8f0]/80 hover:text-[#06d6a0]"
                              >
                                <span className="text-[#06d6a0]">→</span>
                                {q.label}
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {CITATIONS_BY_COMPANY[company]?.[t.name] && (
                      <div className="mt-3 border-t border-[#1e293b] pt-2">
                        <div className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-[#06d6a0]">
                          <BookOpen className="size-3" /> Distribution sources
                        </div>
                        <ul className="mt-1 space-y-1.5">
                          {Object.entries(CITATIONS_BY_COMPANY[company][t.name]).map(
                            ([col, cite]) => (
                              <li key={col} className="text-[10px] leading-snug">
                                <span className="font-mono text-[#e2e8f0]">{col}</span>
                                <span className="text-[#64748b]"> — {cite.distribution}</span>
                                <div className="text-[#64748b]">
                                  Source:{" "}
                                  <a
                                    href={cite.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[#06d6a0] hover:underline"
                                  >
                                    {cite.source}
                                  </a>
                                </div>
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                    )}
                    {t.sampleRows.length > 0 && (
                      <div className="mt-2 overflow-x-auto border border-[#1e293b]">
                        <table className="w-full font-mono text-[11px]">
                          <thead className="bg-[#1a2235] text-[#64748b]">
                            <tr>
                              {Object.keys(t.sampleRows[0]).map((k) => (
                                <th
                                  key={k}
                                  className="px-2 py-1 text-left font-medium"
                                >
                                  {k}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {t.sampleRows.map((row, i) => (
                              <tr key={i} className="border-t border-[#1e293b]">
                                {Object.values(row).map((v, j) => (
                                  <td key={j} className="px-2 py-1 text-[#e2e8f0]">
                                    {formatCell(v)}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

function formatCell(v: unknown): string {
  if (v === null || v === undefined) return "—";
  if (typeof v === "object") return JSON.stringify(v);
  return String(v);
}
