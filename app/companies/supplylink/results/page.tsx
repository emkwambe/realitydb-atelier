"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Award, CheckCircle2, Download, Copy, Share2, ArrowRight } from "lucide-react";
import { supplylinkRubric } from "@/content/companies/supplylink/rubric";
import { generateCertId, signCertificate, linkedInShareUrl, type BizCertificate } from "@/lib/certificate";

const RESULT_KEY = "atelier:supplylink:result";
const CERT_KEY = "atelier:supplylink:cert";

interface AxisScore {
  score: number;
  feedback: string;
}

interface GradingResult {
  overall_score: number;
  passed: boolean;
  axes: {
    segmentation: AxisScore;
    causal_reasoning: AxisScore;
    quantification: AxisScore;
    recommendation: AxisScore;
    epistemic_honesty?: AxisScore;
  };
  summary_feedback: string;
}

export default function ResultsPage() {
  const [result, setResult] = useState<GradingResult | null>(null);
  const [cert, setCert] = useState<(BizCertificate & { signature: string }) | null>(null);
  const [copied, setCopied] = useState(false);
  const [userName, setUserName] = useState("Atelier Student");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(RESULT_KEY);
      if (raw) setResult(JSON.parse(raw));
      const cachedCert = localStorage.getItem(CERT_KEY);
      if (cachedCert) setCert(JSON.parse(cachedCert));
    } catch {}
  }, []);

  useEffect(() => {
    if (!result || !result.passed || cert) return;
    (async () => {
      const c: BizCertificate = {
        certId: generateCertId(),
        userId: "preview",
        userName,
        userEmail: "preview@atelier.realitydb.dev",
        company: supplylinkRubric.company,
        companyLabel: supplylinkRubric.companyLabel,
        score: result.overall_score,
        passed: true,
        issuedAt: new Date().toISOString(),
        publicKeyId: "realitydb-atelier-2026",
      };
      const signature = await signCertificate(c);
      const signed = { ...c, signature };
      setCert(signed);
      try {
        localStorage.setItem(CERT_KEY, JSON.stringify(signed));
      } catch {}
    })();
  }, [result, userName, cert]);

  if (!result) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-20 text-center">
        <h1 className="text-2xl font-medium text-[#e2e8f0]">No results yet</h1>
        <p className="mt-2 text-sm text-[#64748b]">
          Submit a briefing to see your score and certificate.
        </p>
        <Link
          href="/companies/supplylink/briefing"
          className="mt-6 inline-flex items-center gap-2 bg-[#06d6a0] px-4 py-2 text-sm font-medium text-[#0a0f1a]"
        >
          Go to briefing <ArrowRight className="size-4" />
        </Link>
      </div>
    );
  }

  const verifyUrl =
    typeof window !== "undefined" && cert
      ? `${window.location.origin}/verify/${cert.certId}`
      : "";

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <section
        className={`border p-6 ${
          result.passed
            ? "border-[#06d6a0]/40 bg-[#06d6a0]/5"
            : "border-[#ef4444]/40 bg-[#ef4444]/5"
        }`}
      >
        <div className="flex items-center gap-4">
          <div
            className={`flex size-12 items-center justify-center border ${
              result.passed
                ? "border-[#06d6a0] text-[#06d6a0]"
                : "border-[#ef4444] text-[#ef4444]"
            }`}
          >
            {result.passed ? (
              <CheckCircle2 className="size-6" />
            ) : (
              <span className="font-mono text-xl">×</span>
            )}
          </div>
          <div>
            <div className="font-mono text-xs uppercase tracking-wider text-[#64748b]">
              CEO Briefing · SupplyLink Operations
            </div>
            <h1
              className={`text-2xl font-medium ${
                result.passed ? "text-[#06d6a0]" : "text-[#ef4444]"
              }`}
            >
              {result.passed ? "Passed" : "Did not pass"}
            </h1>
          </div>
          <div className="ml-auto text-right">
            <div className="font-mono text-[11px] uppercase tracking-wider text-[#64748b]">
              Score
            </div>
            <div className="font-mono text-4xl font-medium text-[#e2e8f0]">
              {result.overall_score}
              <span className="text-base text-[#64748b]">/100</span>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-sm font-medium uppercase tracking-wider text-[#64748b]">
          Per-axis breakdown
        </h2>
        <div className="mt-3 overflow-hidden border border-[#1e293b]">
          <table className="data-grid w-full font-mono text-[13px]">
            <thead className="bg-[#1a2235] text-[11px] uppercase tracking-wider text-[#64748b]">
              <tr>
                <th className="px-4 py-2 text-left font-medium">Axis</th>
                <th className="px-4 py-2 text-right font-medium">Score</th>
                <th className="px-4 py-2 text-left font-medium">Feedback</th>
              </tr>
            </thead>
            <tbody>
              {(
                [
                  "segmentation",
                  "causal_reasoning",
                  "quantification",
                  "recommendation",
                  "epistemic_honesty",
                ] as const
              ).map((key) => {
                const axis = result.axes[key];
                const def = supplylinkRubric.axes[key];
                if (!axis || !def) return null;
                return (
                  <tr key={key} className="border-t border-[#1e293b]/60">
                    <td className="px-4 py-2 text-[#e2e8f0]">{def.name}</td>
                    <td
                      className={`px-4 py-2 text-right ${
                        axis.score >= def.maxScore * 0.7
                          ? "text-[#06d6a0]"
                          : axis.score >= def.maxScore * 0.5
                            ? "text-[#f59e0b]"
                            : "text-[#ef4444]"
                      }`}
                    >
                      {axis.score}/{def.maxScore}
                    </td>
                    <td className="px-4 py-2 text-[#e2e8f0]/80">
                      {axis.feedback}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-sm font-medium uppercase tracking-wider text-[#64748b]">
          Briefing feedback
        </h2>
        <p className="mt-3 border border-[#1e293b] bg-[#111827] p-4 text-sm leading-relaxed text-[#e2e8f0]/90">
          {result.summary_feedback}
        </p>
      </section>

      {result.passed && cert && (
        <section className="mt-8 border border-[#06d6a0]/40 bg-[#06d6a0]/5 p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-[#06d6a0]">
                <Award className="size-3.5" /> Business Acumen Certificate
              </div>
              <div className="mt-1 font-mono text-xl text-[#e2e8f0]">
                {cert.certId}
              </div>
              <div className="mt-3 text-sm text-[#e2e8f0]/80">
                <input
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="border-b border-[#1e293b] bg-transparent text-[#e2e8f0] outline-none focus:border-[#06d6a0]"
                />{" "}
                — {cert.companyLabel} · Score {cert.score}/100 ·{" "}
                {new Date(cert.issuedAt).toLocaleDateString()}
              </div>
              <div className="mt-1 font-mono text-[10px] text-[#64748b]">
                signature: {cert.signature.slice(0, 24)}…
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 border border-[#06d6a0] px-3 py-2 text-xs text-[#06d6a0] hover:bg-[#06d6a0]/10"
              >
                <Download className="size-3.5" /> PDF
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(verifyUrl);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1500);
                }}
                className="inline-flex items-center gap-1.5 border border-[#1e293b] px-3 py-2 text-xs text-[#e2e8f0] hover:border-[#06d6a0] hover:text-[#06d6a0]"
              >
                <Copy className="size-3.5" /> {copied ? "Copied" : "Copy link"}
              </button>
              <a
                href={linkedInShareUrl(
                  cert,
                  typeof window !== "undefined" ? window.location.origin : ""
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 border border-[#1e293b] px-3 py-2 text-xs text-[#e2e8f0] hover:border-[#06d6a0] hover:text-[#06d6a0]"
              >
                <Share2 className="size-3.5" /> LinkedIn
              </a>
            </div>
          </div>
        </section>
      )}

      {!result.passed && (
        <section className="mt-8 border border-[#ef4444]/30 bg-[#ef4444]/5 p-6">
          <p className="text-sm text-[#e2e8f0]">
            Score required: <span className="font-mono text-[#06d6a0]">70</span>.
            Your score:{" "}
            <span className="font-mono text-[#ef4444]">
              {result.overall_score}
            </span>
            .
          </p>
          <p className="mt-2 text-sm text-[#64748b]">
            Retake available in 24 hours.
          </p>
        </section>
      )}
    </div>
  );
}
