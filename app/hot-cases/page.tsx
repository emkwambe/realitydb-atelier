import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { getSupabaseAdminClient } from "@/lib/supabase";

export const metadata: Metadata = {
  title: "Hot Cases · Atelier",
  description:
    "A free 30-minute business acumen exercise every Monday. Auto-graded on a 3-axis rubric. Free forever, never paywalled.",
};

export const dynamic = "force-dynamic";

interface CatalogRow {
  slug: string;
  title: string;
  vertical: string;
  primary_dimension: string;
  published_at: string | null;
  status: string;
}

async function loadPublished(): Promise<CatalogRow[]> {
  const admin = getSupabaseAdminClient();
  if (!admin) return [];
  const { data } = await admin
    .from("hot_cases")
    .select("slug, title, vertical, primary_dimension, published_at, status")
    .eq("status", "published")
    .order("published_at", { ascending: false });
  return (data as CatalogRow[] | null) ?? [];
}

export default async function HotCasesIndexPage() {
  const published = await loadPublished();

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <div className="inline-flex items-center gap-2 border border-[#1e293b] bg-[#111827] px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-[#64748b]">
        <span className="inline-block size-1.5 rounded-full bg-[#00f5d4]" />
        Free · No account required
      </div>
      <h1 className="mt-5 text-3xl font-medium text-[#e2e8f0] md:text-5xl">
        Hot Cases<span className="text-[#a855f7]">.</span>
        <br />
        <span className="text-[#00f5d4]">A free 30-minute case every Monday.</span>
      </h1>
      <p className="mt-6 text-base text-[#e2e8f0]/80 md:text-lg">
        One pattern. One schema. Two SQL exercises. A four-bullet CEO briefing.
        Auto-graded on a three-axis rubric. Free forever — never paywalled.
      </p>

      {published.length > 0 ? (
        <section className="mt-12 space-y-4">
          <h2 className="text-sm font-medium uppercase tracking-wider text-[#64748b]">
            Published
          </h2>
          {published.map((c) => (
            <article
              key={c.slug}
              className="border border-[#1e293b] bg-[#111827] p-6 transition hover:border-l-[#00f5d4] hover:border-l-2"
            >
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="text-lg font-medium text-[#e2e8f0]">{c.title}</h3>
                <span className="inline-flex items-center rounded-sm bg-[#00f5d4]/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-[#00f5d4]">
                  Free
                </span>
              </div>
              <p className="mt-1 font-mono text-xs uppercase tracking-wider text-[#64748b]">
                {c.vertical} · {c.primary_dimension}
                {c.published_at && (
                  <> · Published {new Date(c.published_at).toLocaleDateString()}</>
                )}
              </p>
              <Link
                href={`/hot-cases/${c.slug}`}
                className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-[#00f5d4] hover:underline"
              >
                Open the case <ArrowRight className="size-3.5" />
              </Link>
            </article>
          ))}
        </section>
      ) : (
        <section className="mt-12 border border-[#1e293b] bg-[#111827] p-8 text-center">
          <p className="font-mono text-xs uppercase tracking-wider text-[#00f5d4]">
            First Hot Case drops Monday, June 16
          </p>
          <p className="mt-3 text-sm text-[#e2e8f0]/80">
            Hot Case 001 — <span className="text-[#e2e8f0]">The Cohort Collapse</span> — is in
            final QA. Create an account and we&apos;ll email you when it
            publishes.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link
              href="/auth/signup?source=hot-cases"
              className="inline-flex items-center gap-2 bg-[#00f5d4] px-4 py-2 text-sm font-medium text-[#0a0f1a] transition hover:opacity-90"
            >
              Notify me
            </Link>
            <Link
              href="/companies"
              className="inline-flex items-center gap-2 border border-[#06d6a0]/60 px-4 py-2 text-sm font-medium text-[#06d6a0] transition hover:bg-[#06d6a0]/10"
            >
              Browse modules
            </Link>
          </div>
        </section>
      )}

      <div className="mt-16 grid grid-cols-1 gap-6 border-t border-[#1e293b] pt-12 md:grid-cols-3">
        <div className="border-l-2 border-[#00f5d4] pl-4">
          <div className="font-mono text-[11px] uppercase tracking-wider text-[#00f5d4]">
            Every Monday
          </div>
          <p className="mt-2 text-sm text-[#e2e8f0]/80">
            A new Hot Case lands at 8am ET. Synthesised by RealityDB.
            Always free.
          </p>
        </div>
        <div className="border-l-2 border-[#06d6a0] pl-4">
          <div className="font-mono text-[11px] uppercase tracking-wider text-[#06d6a0]">
            30 minutes
          </div>
          <p className="mt-2 text-sm text-[#e2e8f0]/80">
            Read-in, two exercises, a four-bullet briefing. Sized for a
            Sunday evening or a Monday lunch break.
          </p>
        </div>
        <div className="border-l-2 border-[#a855f7] pl-4">
          <div className="font-mono text-[11px] uppercase tracking-wider text-[#a855f7]">
            Auto-graded · ranked
          </div>
          <p className="mt-2 text-sm text-[#e2e8f0]/80">
            Three-axis rubric: pattern detection, quantification, recommendation
            specificity. Your score feeds your public Atelier Rank.
          </p>
        </div>
      </div>
    </div>
  );
}
