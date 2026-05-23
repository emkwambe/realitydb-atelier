"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/lib/hooks/useAuth";
import type { HotCaseClientView } from "@/lib/hotCases";

const MIN_CHARS = 100;

interface SubmitResponse {
  submissionId: string;
  score: number;
}

export function BriefingForm({ content }: { content: HotCaseClientView }) {
  const router = useRouter();
  const auth = useAuth();
  const isAuthed = auth?.isAuthenticated ?? false;

  const [text, setText] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Restore draft and email from localStorage so an accidental refresh
  // doesn't lose work.
  const draftKey = `atelier:hot-case:${content.slug}:draft`;
  useEffect(() => {
    try {
      const raw = localStorage.getItem(draftKey);
      if (raw) {
        const parsed = JSON.parse(raw) as { text?: string; email?: string };
        if (parsed.text) setText(parsed.text);
        if (parsed.email) setEmail(parsed.email);
      }
    } catch {}
  }, [draftKey]);
  useEffect(() => {
    try {
      localStorage.setItem(draftKey, JSON.stringify({ text, email }));
    } catch {}
  }, [draftKey, text, email]);

  const wordCount = useMemo(
    () => text.trim().split(/\s+/).filter(Boolean).length,
    [text]
  );
  const charCount = text.length;
  const charOk = charCount >= MIN_CHARS;
  const canSubmit =
    charOk && !submitting && (isAuthed || /^\S+@\S+\.\S+$/.test(email));

  async function submit() {
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/hot-cases/${encodeURIComponent(content.slug)}/submit`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            briefing_text: text,
            email: isAuthed ? null : email,
          }),
        }
      );
      if (!res.ok) {
        const body = await res.text();
        throw new Error(body || `Grading failed (${res.status})`);
      }
      const data = (await res.json()) as SubmitResponse;
      // Clear the draft once we have a graded submission to look at.
      try {
        localStorage.removeItem(draftKey);
      } catch {}
      router.push(`/hot-cases/${content.slug}/results/${data.submissionId}`);
    } catch (e) {
      setSubmitting(false);
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  return (
    <div className="mt-8">
      <label className="block">
        <span className="font-mono text-[11px] uppercase tracking-wider text-[#64748b]">
          Your briefing · 4 bullets recommended · {MIN_CHARS}+ characters
        </span>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          spellCheck
          placeholder={`1. What I found…\n2. The number that matters…\n3. What I recommend, with a timeline…\n4. What I cannot confirm yet…`}
          className="mt-2 block min-h-[300px] w-full resize-y border border-[#1e293b] bg-[#111827] p-4 font-mono text-[13px] leading-relaxed text-[#e2e8f0] outline-none focus:border-[#00f5d4]"
        />
      </label>

      <div className="mt-2 flex items-center justify-between font-mono text-[11px]">
        <span
          className={
            charOk ? "text-[#06d6a0]" : "text-[#64748b]"
          }
        >
          {charCount} characters{!charOk && ` · need ${MIN_CHARS - charCount} more`}
        </span>
        <span className="text-[#64748b]">{wordCount} words</span>
      </div>

      {!isAuthed && (
        <label className="mt-6 block">
          <span className="font-mono text-[11px] uppercase tracking-wider text-[#64748b]">
            Email · so we can send you the score
          </span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            className="mt-2 block w-full border border-[#1e293b] bg-[#111827] px-3 py-2 text-sm text-[#e2e8f0] outline-none focus:border-[#00f5d4]"
          />
          <p className="mt-1 text-[10px] text-[#64748b]">
            One-time use for the score. Create an account to track Hot Case
            scores in your Atelier Rank profile.
          </p>
        </label>
      )}

      {error && (
        <p className="mt-3 border border-[#ef4444]/40 bg-[#ef4444]/10 p-3 text-xs text-[#ef4444]">
          {error}
        </p>
      )}

      <div className="mt-6 flex items-center justify-end">
        <button
          onClick={submit}
          disabled={!canSubmit}
          className="inline-flex items-center gap-2 bg-[#00f5d4] px-5 py-3 text-sm font-medium text-[#0a0f1a] transition hover:opacity-90 disabled:opacity-40"
        >
          {submitting ? (
            <>
              <Loader2 className="size-4 animate-spin" /> Grading…
            </>
          ) : (
            "Submit for grading"
          )}
        </button>
      </div>
    </div>
  );
}
