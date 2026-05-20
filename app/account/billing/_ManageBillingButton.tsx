"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

export function ManageBillingButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function open() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/portal", { method: "POST" });
      if (!res.ok) {
        const body = await res.text();
        throw new Error(body || `Portal failed (${res.status})`);
      }
      const { url } = (await res.json()) as { url?: string };
      if (!url) throw new Error("Portal returned no URL.");
      window.location.href = url;
    } catch (e) {
      setLoading(false);
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  return (
    <div>
      <button
        onClick={open}
        disabled={loading}
        className="inline-flex items-center gap-2 border border-[#06d6a0] bg-transparent px-4 py-2 text-sm font-medium text-[#06d6a0] transition hover:bg-[#06d6a0]/10 disabled:opacity-50"
      >
        {loading && <Loader2 className="size-3.5 animate-spin" />}
        Manage billing
      </button>
      {error && <p className="mt-2 text-xs text-[#ef4444]">{error}</p>}
    </div>
  );
}
