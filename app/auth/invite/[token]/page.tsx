"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase";

interface CohortInvite {
  cohort_id: string;
  cohort_name: string;
  institution: string | null;
  expires_at: string | null;
}

export default function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  const router = useRouter();
  const [invite, setInvite] = useState<CohortInvite | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);
  const configured = isSupabaseConfigured();

  useEffect(() => {
    async function load() {
      if (!configured) {
        setError("Supabase is not configured.");
        setLoading(false);
        return;
      }
      const sb = getSupabaseBrowserClient();
      if (!sb) {
        setError("Auth is not available.");
        setLoading(false);
        return;
      }
      const { data, error: lookupError } = await sb
        .from("cohort_invites")
        .select("cohort_id, expires_at, cohorts(name, institution)")
        .eq("token", token)
        .maybeSingle();

      if (lookupError || !data) {
        setError("This invite link is invalid or has expired.");
        setLoading(false);
        return;
      }

      const cohort = data.cohorts as { name?: string; institution?: string | null } | null;
      setInvite({
        cohort_id: data.cohort_id,
        cohort_name: cohort?.name ?? "Cohort",
        institution: cohort?.institution ?? null,
        expires_at: data.expires_at,
      });
      setLoading(false);
    }
    load();
  }, [configured, token]);

  async function handleJoin() {
    setJoining(true);
    setError(null);

    const sb = getSupabaseBrowserClient();
    if (!sb || !invite) return;

    const { data: userData } = await sb.auth.getUser();
    if (!userData.user) {
      router.push(`/auth/login?next=${encodeURIComponent(`/auth/invite/${token}`)}`);
      return;
    }

    const { error: updateError } = await sb
      .from("profiles")
      .update({ cohort_id: invite.cohort_id, institution: invite.institution })
      .eq("id", userData.user.id);

    if (updateError) {
      setError(updateError.message);
      setJoining(false);
      return;
    }

    await sb.from("cohort_invites").update({ accepted_at: new Date().toISOString() }).eq("token", token);
    router.push("/companies/novapay");
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-7rem)] max-w-md items-center px-6">
      <div className="w-full border border-[#1e293b] bg-[#111827] p-8">
        <h1 className="text-xl font-medium text-[#e2e8f0]">Cohort invitation</h1>

        {loading && <p className="mt-4 text-sm text-[#64748b]">Looking up invite…</p>}

        {error && (
          <div className="mt-4 border border-[#ef4444]/40 bg-[#ef4444]/5 p-3 text-xs text-[#ef4444]">
            {error}
          </div>
        )}

        {invite && (
          <>
            <p className="mt-4 text-sm text-[#64748b]">
              You&apos;ve been invited to join:
            </p>
            <p className="mt-1 text-base text-[#e2e8f0]">{invite.cohort_name}</p>
            {invite.institution && (
              <p className="text-xs text-[#64748b]">{invite.institution}</p>
            )}

            <div className="mt-6 flex flex-col gap-2">
              <button
                onClick={handleJoin}
                disabled={joining}
                className="w-full bg-[#06d6a0] px-4 py-2 text-sm font-medium text-[#0a0f1a] transition hover:bg-[#06d6a0]/90 disabled:opacity-50"
              >
                {joining ? "Joining..." : "Accept and join"}
              </button>
              <Link
                href={`/auth/login?next=${encodeURIComponent(`/auth/invite/${token}`)}`}
                className="w-full border border-[#1e293b] px-4 py-2 text-center text-sm text-[#e2e8f0] transition hover:border-[#06d6a0] hover:text-[#06d6a0]"
              >
                Sign in first
              </Link>
            </div>

            <p className="mt-4 text-[10px] text-[#64748b]">
              No account?{" "}
              <Link
                href={`/auth/signup?next=${encodeURIComponent(`/auth/invite/${token}`)}`}
                className="text-[#06d6a0] hover:underline"
              >
                Create one
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
