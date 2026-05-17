"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

type ScenarioRow = Record<string, unknown> & { label?: string };
interface ComparisonShape {
  generated_at: string;
  baseline: ScenarioRow;
  scenario_a: ScenarioRow;
  scenario_b: ScenarioRow;
}

interface RowDef {
  label: string;
  fmt: (v: number | null | undefined) => string;
  pick: (s: ScenarioRow) => number | null | undefined;
  better: "lower" | "higher" | "none";
}

const num = (s: ScenarioRow, k: string) => {
  const v = s[k];
  return typeof v === "number" ? v : null;
};

const NOVAPAY_ROWS: RowDef[] = [
  { label: "Enterprise churn",       fmt: (v) => v==null?"—":`${v.toFixed(1)}%`, pick: (s) => num(s,"enterprise_churn_pct"),  better: "lower" },
  { label: "Blended churn",          fmt: (v) => v==null?"—":`${v.toFixed(1)}%`, pick: (s) => num(s,"blended_churn_pct"),     better: "lower" },
  { label: "ARR projected 12mo",     fmt: (v) => v==null?"—":`$${(v/1_000_000).toFixed(2)}M`, pick: (s) => num(s,"arr_projected_12mo"), better: "higher" },
  { label: "Enterprise % of MRR",    fmt: (v) => v==null?"—":`${v.toFixed(1)}%`, pick: (s) => num(s,"enterprise_mrr_pct"),    better: "none" },
  { label: "Enterprise NRR",         fmt: (v) => v==null?"—":`${v}%`,            pick: (s) => num(s,"nrr_enterprise"),        better: "higher" },
  { label: "Engineering cost",       fmt: (v) => v==null?"—":`$${(v/1_000).toFixed(0)}K`, pick: (s) => num(s,"engineering_cost"), better: "none" },
  { label: "Payback period",         fmt: (v) => v==null?"—":`${v.toFixed(1)} mo`, pick: (s) => num(s,"payback_months"),       better: "none" },
];

const MEDCORE_ROWS: RowDef[] = [
  { label: "MidState denial rate (spike)",   fmt: (v) => v==null?"—":`${v.toFixed(1)}%`, pick: (s) => num(s,"midstate_spike_denial_pct"),    better: "lower" },
  { label: "MidState denial rate (baseline)",fmt: (v) => v==null?"—":`${v.toFixed(1)}%`, pick: (s) => num(s,"midstate_baseline_denial_pct"), better: "lower" },
  { label: "Other payers denial rate",       fmt: (v) => v==null?"—":`${v.toFixed(1)}%`, pick: (s) => num(s,"other_payers_denial_pct"),      better: "none" },
  { label: "MidState volume share",          fmt: (v) => v==null?"—":`${v.toFixed(1)}%`, pick: (s) => num(s,"midstate_claim_volume_pct"),    better: "none" },
  { label: "MidState underpayment rate",     fmt: (v) => v==null?"—":`${v.toFixed(1)}%`, pick: (s) => num(s,"midstate_underpayment_pct"),    better: "lower" },
  { label: "Net collection rate",            fmt: (v) => v==null?"—":`${v.toFixed(1)}%`, pick: (s) => num(s,"net_collection_rate_pct"),      better: "higher" },
  { label: "Revenue at risk (12mo)",         fmt: (v) => v==null?"—":`$${(v/1_000_000).toFixed(2)}M`, pick: (s) => num(s,"arr_at_risk_12mo"), better: "lower" },
  { label: "Intervention cost",              fmt: (v) => v==null?"—":`$${(v/1_000).toFixed(0)}K`,    pick: (s) => num(s,"contract_renegotiation_cost") ?? num(s,"short_term_revenue_impact"), better: "none" },
  { label: "Payback period",                 fmt: (v) => v==null?"—":`${v.toFixed(1)} mo`, pick: (s) => num(s,"payback_months"),              better: "none" },
];

const ROWS_BY_COMPANY: Record<string, RowDef[]> = {
  novapay: NOVAPAY_ROWS,
  medcore: MEDCORE_ROWS,
};

export function ComparisonPanel({ company = "novapay" }: { company?: string }) {
  const [data, setData] = useState<ComparisonShape | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/data/${company}-comparison-ab.json`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const j = (await res.json()) as ComparisonShape;
        if (!cancelled) setData(j);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [company]);

  const rows = ROWS_BY_COMPANY[company] ?? NOVAPAY_ROWS;

  if (error) {
    return (
      <div className="border border-[#ef4444]/40 bg-[#ef4444]/5 p-3 text-xs text-[#ef4444]">
        Failed to load comparison data: {error}
      </div>
    );
  }
  if (!data) {
    return (
      <div className="flex items-center gap-2 p-3 text-xs text-[#64748b]">
        <Loader2 className="size-3 animate-spin" /> Loading comparison…
      </div>
    );
  }

  return (
    <div className="border border-[#1e293b]">
      <div className="flex items-center justify-between border-b border-[#1e293b] bg-[#1a2235] px-3 py-2">
        <span className="font-mono text-[11px] uppercase tracking-wider text-[#64748b]">
          Baseline vs scenarios
        </span>
        <span className="text-[10px] text-[#64748b]">
          pre-computed snapshot
        </span>
      </div>
      <table className="data-grid w-full font-mono text-[12px]">
        <thead className="bg-[#0a0f1a] text-[10px] uppercase tracking-wider text-[#64748b]">
          <tr>
            <th className="px-3 py-2 text-left font-medium">Metric</th>
            <th className="px-3 py-2 text-right font-medium">Baseline</th>
            <th className="px-3 py-2 text-right font-medium">Scenario A</th>
            <th className="px-3 py-2 text-right font-medium">Scenario B</th>
            <th className="px-3 py-2 text-right font-medium">Δ A vs Base</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const b = row.pick(data.baseline);
            const a = row.pick(data.scenario_a);
            const c = row.pick(data.scenario_b);
            const delta =
              typeof a === "number" && typeof b === "number" ? a - b : null;
            const deltaColor =
              delta == null || row.better === "none"
                ? "text-[#64748b]"
                : (row.better === "higher" ? delta > 0 : delta < 0)
                  ? "text-[#06d6a0]"
                  : "text-[#ef4444]";
            return (
              <tr key={row.label} className="border-t border-[#1e293b]/60">
                <td className="px-3 py-2 text-[#e2e8f0]">{row.label}</td>
                <td className="px-3 py-2 text-right text-[#e2e8f0]/80">
                  {row.fmt(b)}
                </td>
                <td className="px-3 py-2 text-right text-[#06d6a0]">
                  {row.fmt(a)}
                </td>
                <td className="px-3 py-2 text-right text-[#e2e8f0]/80">
                  {row.fmt(c)}
                </td>
                <td className={`px-3 py-2 text-right ${deltaColor}`}>
                  {delta == null
                    ? "—"
                    : `${delta > 0 ? "+" : ""}${row.fmt(delta)}`}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
