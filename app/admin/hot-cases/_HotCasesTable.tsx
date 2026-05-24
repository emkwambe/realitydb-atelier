"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

export interface HotCaseRow {
  slug: string;
  title: string;
  vertical: string;
  status: "draft" | "published" | "archived";
  published_at: string | null;
  primary_dimension: string;
}

type Action = "publish" | "unpublish" | "restore";

interface ActionDescriptor {
  label: string;
  action: Action;
  tone: "primary" | "secondary" | "warning";
}

function actionFor(status: HotCaseRow["status"]): ActionDescriptor | null {
  switch (status) {
    case "draft":
      return { label: "Publish", action: "publish", tone: "primary" };
    case "published":
      return { label: "Unpublish", action: "unpublish", tone: "secondary" };
    case "archived":
      return { label: "Restore", action: "restore", tone: "warning" };
  }
}

interface Props {
  initialRows: HotCaseRow[];
}

export function HotCasesTable({ initialRows }: Props) {
  const [rows, setRows] = useState<HotCaseRow[]>(initialRows);
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function perform(slug: string, action: Action) {
    setPending(slug);
    setError(null);
    try {
      const res = await fetch(
        `/api/admin/hot-cases/${encodeURIComponent(slug)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action }),
        }
      );
      if (!res.ok) {
        const body = await res.text();
        throw new Error(body || `Action failed (${res.status})`);
      }
      const data = (await res.json()) as { hotCase: HotCaseRow };
      setRows((prev) =>
        prev.map((r) => (r.slug === slug ? { ...r, ...data.hotCase } : r))
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setPending(null);
    }
  }

  if (rows.length === 0) {
    return (
      <div className="border border-[#1e293b] bg-[#111827] p-6 text-sm text-[#64748b]">
        No Hot Cases yet. Add a row to{" "}
        <code className="font-mono text-[12px] text-[#06d6a0]">hot_cases</code>{" "}
        in Supabase to see it here.
      </div>
    );
  }

  return (
    <div>
      {error && (
        <p className="mb-4 border border-[#ef4444]/40 bg-[#ef4444]/10 p-3 text-xs text-[#ef4444]">
          {error}
        </p>
      )}
      <div className="overflow-hidden border border-[#1e293b]">
        <table className="data-grid w-full text-[13px]">
          <thead className="bg-[#1a2235] text-[11px] uppercase tracking-wider text-[#64748b]">
            <tr>
              <th className="px-4 py-2.5 text-left font-medium">Title</th>
              <th className="px-4 py-2.5 text-left font-medium">Vertical</th>
              <th className="px-4 py-2.5 text-left font-medium">Status</th>
              <th className="px-4 py-2.5 text-left font-medium">Published</th>
              <th className="px-4 py-2.5 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const a = actionFor(row.status);
              const busy = pending === row.slug;
              return (
                <tr
                  key={row.slug}
                  className="border-t border-[#1e293b]/60 hover:bg-[#111827]/60"
                >
                  <td className="px-4 py-3 align-top">
                    <div className="text-[#e2e8f0]">{row.title}</div>
                    <div className="font-mono text-[11px] text-[#64748b]">
                      {row.slug} · {row.primary_dimension}
                    </div>
                  </td>
                  <td className="px-4 py-3 align-top text-[#94a3b8]">
                    {row.vertical}
                  </td>
                  <td className="px-4 py-3 align-top">
                    <StatusBadge status={row.status} />
                  </td>
                  <td className="px-4 py-3 align-top font-mono text-[12px] text-[#94a3b8]">
                    {row.published_at
                      ? new Date(row.published_at).toLocaleDateString()
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-right align-top">
                    {a && (
                      <button
                        onClick={() => perform(row.slug, a.action)}
                        disabled={busy}
                        className={[
                          "inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition disabled:opacity-50",
                          a.tone === "primary" &&
                            "bg-[#06d6a0] text-[#0a0f1a] hover:bg-[#06d6a0]/90",
                          a.tone === "secondary" &&
                            "border border-[#1e293b] text-[#e2e8f0] hover:border-[#06d6a0] hover:text-[#06d6a0]",
                          a.tone === "warning" &&
                            "border border-[#f59e0b]/60 text-[#f59e0b] hover:bg-[#f59e0b]/10",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                      >
                        {busy && <Loader2 className="size-3.5 animate-spin" />}
                        {a.label}
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: HotCaseRow["status"] }) {
  const styles: Record<HotCaseRow["status"], string> = {
    draft: "border border-[#1e293b] bg-[#1a2235] text-[#94a3b8]",
    published: "border border-[#06d6a0]/40 bg-[#06d6a0]/10 text-[#06d6a0]",
    archived: "border border-[#f59e0b]/40 bg-[#f59e0b]/10 text-[#f59e0b]",
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider ${styles[status]}`}
    >
      {status}
    </span>
  );
}
