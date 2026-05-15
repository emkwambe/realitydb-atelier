import Link from "next/link";
import { ArrowRight, Lock } from "lucide-react";

export type CompanyCardProps = {
  slug: string;
  name: string;
  domain: string;
  teaser: string;
  available: boolean;
  tables: number;
  rows: number;
};

export function CompanyCard(c: CompanyCardProps) {
  const rowsFmt = c.rows >= 1000 ? `${Math.round(c.rows / 1000)}K rows` : `${c.rows} rows`;
  return (
    <div className="flex flex-col gap-3 border border-[#1e293b] bg-[#111827] p-5 transition hover:border-[#06d6a0]/60">
      <div className="flex items-center justify-between gap-3">
        <div className="text-base font-medium text-[#e2e8f0]">{c.name}</div>
        <span className="text-[11px] uppercase tracking-wider text-[#64748b]">
          {c.domain}
        </span>
      </div>
      <p className="text-sm leading-relaxed text-[#e2e8f0]/70">{c.teaser}</p>
      <div className="mt-auto flex items-center justify-between pt-3 border-t border-[#1e293b]">
        <div className="flex items-center gap-2">
          {c.available ? (
            <span className="inline-flex items-center rounded-sm bg-[#06d6a0]/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-[#06d6a0]">
              Available
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-sm bg-[#1e293b] px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-[#64748b]">
              <Lock className="size-3" /> Coming soon
            </span>
          )}
          <span className="font-mono text-[11px] text-[#64748b]">
            {c.tables} tables · {rowsFmt}
          </span>
        </div>
        {c.available ? (
          <Link
            href={`/companies/${c.slug}`}
            className="inline-flex items-center gap-1 text-xs font-medium text-[#06d6a0] hover:underline"
          >
            Start module <ArrowRight className="size-3" />
          </Link>
        ) : (
          <span className="text-xs text-[#64748b]">—</span>
        )}
      </div>
    </div>
  );
}
