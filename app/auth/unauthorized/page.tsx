import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-7rem)] max-w-md items-center px-6">
      <div className="w-full border border-[#1e293b] bg-[#111827] p-8 text-center">
        <h1 className="text-xl font-medium text-[#e2e8f0]">Access denied</h1>
        <p className="mt-3 text-sm text-[#64748b]">
          You don&apos;t have permission to view this page. If you believe this is a mistake,
          contact your administrator.
        </p>

        <div className="mt-6 flex flex-col gap-2">
          <Link
            href="/companies/novapay"
            className="w-full bg-[#06d6a0] px-4 py-2 text-sm font-medium text-[#0a0f1a] transition hover:bg-[#06d6a0]/90"
          >
            Back to modules
          </Link>
          <Link
            href="/"
            className="w-full border border-[#1e293b] px-4 py-2 text-sm text-[#e2e8f0] transition hover:border-[#06d6a0] hover:text-[#06d6a0]"
          >
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}
