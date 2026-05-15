"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase";

interface CertRecord {
  cert_id: string;
  user_name: string;
  company: string;
  company_label: string;
  score: number;
  passed: boolean;
  issued_at: string;
  signature: string;
}

export function VerifyClient({ certId }: { certId: string }) {
  const [state, setState] = useState<"loading" | "valid" | "invalid" | "not_configured" | "local">(
    "loading"
  );
  const [cert, setCert] = useState<CertRecord | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const sb = getSupabaseBrowserClient();
      if (!sb) {
        // No backend — try local certificate cache for preview purposes.
        try {
          const raw = localStorage.getItem("atelier:novapay:cert");
          if (raw) {
            const local = JSON.parse(raw);
            if (local.certId === certId) {
              setCert({
                cert_id: local.certId,
                user_name: local.userName,
                company: local.company,
                company_label: local.companyLabel,
                score: local.score,
                passed: local.passed,
                issued_at: local.issuedAt,
                signature: local.signature,
              });
              setState("local");
              return;
            }
          }
        } catch {}
        setState("not_configured");
        return;
      }

      const { data, error } = await sb
        .from("biz_certifications")
        .select("cert_id, user_name, company, company_label, score, passed, issued_at, signature")
        .eq("cert_id", certId)
        .maybeSingle();
      if (cancelled) return;
      if (error || !data) {
        setState("invalid");
        return;
      }
      setCert(data as CertRecord);
      setState("valid");
    })();
    return () => {
      cancelled = true;
    };
  }, [certId]);

  if (state === "loading") {
    return (
      <div className="mt-6 flex items-center gap-2 text-sm text-[#64748b]">
        <Loader2 className="size-4 animate-spin" /> Verifying…
      </div>
    );
  }

  if (state === "not_configured") {
    return (
      <div className="mt-6 border border-[#f59e0b]/40 bg-[#f59e0b]/10 p-4 text-sm text-[#f59e0b]">
        Verification backend not configured. This certificate cannot be checked
        without a connected database.
      </div>
    );
  }

  if (state === "invalid" || !cert) {
    return (
      <div className="mt-6 flex items-center gap-3 border border-[#ef4444]/40 bg-[#ef4444]/10 p-4 text-sm text-[#ef4444]">
        <XCircle className="size-5" />
        No certificate found with this ID.
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-5">
      <div className="flex items-center gap-2 text-sm text-[#06d6a0]">
        <CheckCircle2 className="size-5" />
        {state === "local" ? "Locally cached certificate — preview" : "Valid certificate"}
      </div>

      <dl className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
        <Field label="Holder" value={cert.user_name} />
        <Field label="Company" value={cert.company_label} />
        <Field label="Score" value={`${cert.score}/100`} />
        <Field
          label="Issued"
          value={new Date(cert.issued_at).toLocaleDateString(undefined, {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        />
      </dl>

      <div>
        <div className="font-mono text-[11px] uppercase tracking-wider text-[#64748b]">
          Signature
        </div>
        <div className="mt-1 break-all font-mono text-[11px] text-[#e2e8f0]/70">
          {cert.signature}
        </div>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="font-mono text-[11px] uppercase tracking-wider text-[#64748b]">
        {label}
      </dt>
      <dd className="mt-0.5 text-[#e2e8f0]">{value}</dd>
    </div>
  );
}
