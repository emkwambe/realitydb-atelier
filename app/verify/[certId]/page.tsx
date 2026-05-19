import { Award } from "lucide-react";
import { VerifyClient } from "./_VerifyClient";

export default function VerifyPage({ params }: { params: { certId: string } }) {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <div className="border border-[#1e293b] bg-[#111827] p-8 md:p-10">
        <div className="flex items-center gap-3 font-mono text-xs uppercase tracking-wider text-[#06d6a0]">
          <Award className="size-4" />
          Business Acumen Certificate · Verification
        </div>

        <h1 className="mt-4 font-mono text-2xl text-[#e2e8f0]">
          {params.certId}
        </h1>

        <VerifyClient certId={params.certId} />

        <div className="mt-10 border-t border-[#1e293b] pt-4 text-xs text-[#64748b]">
          Issued by RealityDb Atelier · Mpingo Systems LLC
        </div>
      </div>
    </div>
  );
}
