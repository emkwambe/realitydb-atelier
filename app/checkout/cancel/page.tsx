import Link from "next/link";

export default function CheckoutCancelPage() {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-7rem)] max-w-md flex-col items-center justify-center px-6 py-16 text-center">
      <h1 className="text-2xl font-medium text-[#e2e8f0]">
        No charge was made.
      </h1>
      <p className="mt-2 text-sm text-[#e2e8f0]/80">
        You cancelled before completing checkout. Your card was not charged.
        You can come back any time.
      </p>
      <div className="mt-8 flex gap-3">
        <Link
          href="/pricing"
          className="inline-flex items-center gap-2 bg-[#06d6a0] px-4 py-2 text-sm font-medium text-[#0a0f1a] transition hover:bg-[#06d6a0]/90"
        >
          Back to pricing
        </Link>
        <Link
          href="/companies"
          className="inline-flex items-center gap-2 border border-[#1e293b] px-4 py-2 text-sm text-[#e2e8f0] transition hover:border-[#06d6a0] hover:text-[#06d6a0]"
        >
          Browse modules
        </Link>
      </div>
    </div>
  );
}
