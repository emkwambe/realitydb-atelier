"use client";

import { Loader2 } from "lucide-react";
import type { DatasetVariant } from "@/lib/pglite";
import type { ScenarioMeta } from "@/content/companies/novapay/scenarios";
import { NOVAPAY_SCENARIOS } from "@/content/companies/novapay/scenarios";
import { MEDCORE_SCENARIOS } from "@/content/companies/medcore/scenarios";
import { SUPPLYLINK_SCENARIOS } from "@/content/companies/supplylink/scenarios";
import { TOWERNET_SCENARIOS } from "@/content/companies/towernet/scenarios";
import { CLEARBANK_SCENARIOS } from "@/content/companies/clearbank/scenarios";

const SCENARIO_BY_COMPANY: Record<string, ScenarioMeta[]> = {
  novapay: NOVAPAY_SCENARIOS,
  medcore: MEDCORE_SCENARIOS,
  supplylink: SUPPLYLINK_SCENARIOS,
  towernet: TOWERNET_SCENARIOS,
  clearbank: CLEARBANK_SCENARIOS,
};

interface Props {
  company: string;
  current: DatasetVariant;
  switching: boolean;
  onSwitch: (variant: DatasetVariant) => void;
}

export function DatasetSwitcher({ company, current, switching, onSwitch }: Props) {
  const scenarios = SCENARIO_BY_COMPANY[company] ?? NOVAPAY_SCENARIOS;
  return (
    <div className="flex items-stretch border-b border-[#1e293b] bg-[#0a0f1a]">
      <div className="flex items-center px-4 font-mono text-[10px] uppercase tracking-wider text-[#64748b]">
        Dataset
      </div>
      {scenarios.map((s) => {
        const active = s.id === current;
        return (
          <button
            key={s.id}
            onClick={() => !switching && !active && onSwitch(s.id)}
            disabled={switching || active}
            title={s.description}
            className={`flex items-center gap-2 border-l border-[#1e293b] px-4 py-2 font-mono text-xs transition ${
              active
                ? "border-b-2 border-b-[#06d6a0] bg-[#111827] text-[#06d6a0]"
                : "text-[#e2e8f0]/70 hover:bg-[#111827] hover:text-[#e2e8f0]"
            } ${switching && !active ? "opacity-40" : ""}`}
          >
            {switching && active ? (
              <Loader2 className="size-3 animate-spin" />
            ) : (
              <span
                className={`size-1.5 rounded-full ${
                  active ? "bg-[#06d6a0]" : "bg-[#64748b]"
                }`}
              />
            )}
            {s.shortLabel}
          </button>
        );
      })}
      <div className="ml-auto flex items-center pr-4 text-[10px] text-[#64748b]">
        {switching
          ? "Reloading PGlite…"
          : "Switching resets your query history"}
      </div>
    </div>
  );
}
