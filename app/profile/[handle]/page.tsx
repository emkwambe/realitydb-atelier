import Link from "next/link";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ handle: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { handle } = await params;
  const safe = handle.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 32) || "learner";
  return {
    title: `${safe} · Atelier profile`,
    description:
      "Atelier rank profile. Auto-graded briefings, public rank, signed credentials.",
  };
}

export default async function ProfileStubPage({ params }: PageProps) {
  const { handle } = await params;
  const safe = handle.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 32) || "learner";

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <div className="border border-[#1e293b] bg-[#111827] p-8 md:p-12">
        <div className="font-mono text-xs uppercase tracking-wider text-[#64748b]">
          Atelier profile
        </div>
        <h1 className="mt-2 break-all font-mono text-3xl font-medium text-[#e2e8f0] md:text-4xl">
          @{safe}
        </h1>

        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="border-l-2 border-[#06d6a0] pl-4">
            <div className="font-mono text-[11px] uppercase tracking-wider text-[#06d6a0]">
              Rank
            </div>
            <div className="mt-2 font-mono text-2xl text-[#e2e8f0]">—</div>
            <p className="mt-1 text-xs text-[#64748b]">Calibrating</p>
          </div>
          <div className="border-l-2 border-[#00f5d4] pl-4">
            <div className="font-mono text-[11px] uppercase tracking-wider text-[#00f5d4]">
              Modules solved
            </div>
            <div className="mt-2 font-mono text-2xl text-[#e2e8f0]">—</div>
            <p className="mt-1 text-xs text-[#64748b]">
              Sign in to populate
            </p>
          </div>
          <div className="border-l-2 border-[#a855f7] pl-4">
            <div className="font-mono text-[11px] uppercase tracking-wider text-[#a855f7]">
              Open to opportunities
            </div>
            <div className="mt-2 font-mono text-2xl text-[#e2e8f0]">—</div>
            <p className="mt-1 text-xs text-[#64748b]">Opt-in toggle</p>
          </div>
        </div>

        <div className="mt-10 border-t border-[#1e293b] pt-6">
          <div className="font-mono text-[11px] uppercase tracking-wider text-[#06d6a0]">
            Ranks calibrating · launching Q3 2026
          </div>
          <p className="mt-3 text-sm leading-relaxed text-[#e2e8f0]/80">
            Atelier Rank is the public credential that moves with each
            auto-graded briefing you submit. Score across six industry-vertical
            modules — FinTech, healthcare RCM, supply chain, telecom, AML
            banking, oncology trials. Each module names the specific crisis you
            solved.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-[#64748b]">
            The ladder ships in Q3 2026. Briefings you submit between now and
            launch are saved and backfilled into your rank when it goes live.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/companies/novapay"
              className="inline-flex items-center gap-2 bg-[#06d6a0] px-4 py-2 text-sm font-medium text-[#0a0f1a] transition hover:bg-[#06d6a0]/90"
            >
              Start with NovaPay
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 border border-[#a855f7]/60 px-4 py-2 text-sm font-medium text-[#a855f7] transition hover:bg-[#a855f7]/10"
            >
              See pricing
            </Link>
          </div>
        </div>
      </div>

      <p className="mt-8 text-center text-xs text-[#64748b]">
        Public profiles are opt-in. Anyone with the handle URL can see this
        page once the owner enables it. The page you are viewing is a
        placeholder.
      </p>
    </div>
  );
}
