"use client";

import { useCallback } from "react";
import { Download } from "lucide-react";

export interface WaitlistRow {
  id: string;
  email: string;
  source: string | null;
  referrer: string | null;
  created_at: string;
}

interface Props {
  rows: WaitlistRow[];
}

// RFC 4180 CSV: wrap in quotes and double up embedded quotes. Keeps
// commas, newlines, and quote chars in the data from breaking the file
// when it's pasted into Resend / Sheets / Mailchimp.
function csvCell(value: string | null | undefined): string {
  if (value == null) return "";
  const s = String(value);
  return `"${s.replace(/"/g, '""')}"`;
}

export function WaitlistTable({ rows }: Props) {
  const exportCsv = useCallback(() => {
    const header = ["email", "source", "created_at"].join(",");
    const body = rows
      .map((r) =>
        [csvCell(r.email), csvCell(r.source ?? ""), csvCell(r.created_at)].join(",")
      )
      .join("\n");
    const blob = new Blob([header + "\n" + body], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const stamp = new Date().toISOString().slice(0, 10);
    a.download = `atelier-waitlist-${stamp}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [rows]);

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <div className="font-mono text-sm text-[#e2e8f0]">
          <span className="text-2xl text-[#06d6a0]">{rows.length}</span>{" "}
          <span className="text-[#64748b]">
            {rows.length === 1 ? "subscriber" : "subscribers"}
          </span>
        </div>
        <button
          onClick={exportCsv}
          disabled={rows.length === 0}
          className="inline-flex items-center gap-1.5 border border-[#1e293b] px-3 py-1.5 text-xs text-[#e2e8f0] transition hover:border-[#06d6a0] hover:text-[#06d6a0] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Download className="size-3.5" />
          Export CSV
        </button>
      </div>

      <div className="mt-4 overflow-hidden border border-[#1e293b]">
        {rows.length === 0 ? (
          <div className="p-6 text-sm text-[#64748b]">
            No signups yet. Submissions at{" "}
            <code className="font-mono text-[12px] text-[#06d6a0]">/waitlist</code>{" "}
            land here.
          </div>
        ) : (
          <table className="data-grid w-full text-[13px]">
            <thead className="bg-[#1a2235] text-[11px] uppercase tracking-wider text-[#64748b]">
              <tr>
                <th className="px-4 py-2.5 text-left font-medium">Email</th>
                <th className="px-4 py-2.5 text-left font-medium">Source</th>
                <th className="px-4 py-2.5 text-left font-medium">Joined</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr
                  key={r.id}
                  className="border-t border-[#1e293b]/60 hover:bg-[#111827]/60"
                >
                  <td className="px-4 py-2.5 font-mono text-[12px] text-[#e2e8f0]">
                    {r.email}
                  </td>
                  <td className="px-4 py-2.5 text-[#94a3b8]">
                    {r.source ?? <span className="text-[#64748b]">—</span>}
                  </td>
                  <td className="px-4 py-2.5 font-mono text-[12px] text-[#94a3b8]">
                    {new Date(r.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
