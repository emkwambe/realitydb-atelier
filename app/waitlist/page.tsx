import type { Metadata } from "next";
import Link from "next/link";
import { WaitlistForm } from "./_WaitlistForm";

export const metadata: Metadata = {
  title: "Join the waitlist · RealityDb Atelier",
  description:
    "The business school that runs on live data. First Hot Case drops June 16. No account required to attempt.",
};

export default function WaitlistPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0f1e] px-6 py-12">
      <div className="w-full max-w-[480px]">
        <Link
          href="/"
          className="font-mono text-sm tracking-tight hover:opacity-90"
        >
          <span className="text-[#06d6a0]">RealityDb</span>{" "}
          <span className="text-[#00f5d4]">Atelier</span>
        </Link>

        <h1 className="mt-8 text-3xl font-medium leading-tight text-[#e2e8f0] md:text-4xl">
          The business school that runs on{" "}
          <span className="text-[#00f5d4]">live data</span>
          <span className="text-[#a855f7]">.</span>
        </h1>

        <p className="mt-3 text-sm text-[#94a3b8]">
          The first Hot Case drops <span className="text-[#06d6a0]">June 16</span>.
          Free. No account required to attempt.
        </p>

        <blockquote className="mt-7 border-l-2 border-[#00f5d4] bg-[#111827] px-4 py-3 text-sm leading-relaxed text-[#e2e8f0]/90">
          NovaPay reports 6% MRR growth. The CFO sends one message before the
          board meeting: <span className="italic text-[#00f5d4]">&ldquo;Pull
          the cohort numbers first. Something feels soft.&rdquo;</span> You
          have 90 minutes.
        </blockquote>

        <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <ProofPoint
            figure={
              <>
                59 <span className="text-[#06d6a0]">→</span> 94
              </>
            }
            label="The score gap between a generic and an ideal briefing"
          />
          <ProofPoint
            figure="50,000"
            label="Rows of real PostgreSQL data in the first exercise"
          />
          <ProofPoint figure="60 sec" label="Time to receive your AI-graded score" />
        </div>

        <div className="mt-8">
          <WaitlistForm source="waitlist-page" />
        </div>

        <p className="mt-10 text-center text-xs text-[#64748b]">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-[#06d6a0] hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

function ProofPoint({
  figure,
  label,
}: {
  figure: React.ReactNode;
  label: string;
}) {
  return (
    <div className="border-l-2 border-[#1e293b] pl-3">
      <div className="font-mono text-base font-medium text-[#e2e8f0]">{figure}</div>
      <p className="mt-1 text-[11px] leading-relaxed text-[#64748b]">{label}</p>
    </div>
  );
}
