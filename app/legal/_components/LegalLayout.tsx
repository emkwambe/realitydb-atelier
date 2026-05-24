import type { ReactNode } from "react";

interface Props {
  title: string;
  lastUpdated: string;
  children: ReactNode;
}

/**
 * Shared prose container for the static legal pages. Centered ~700px
 * column, dark theme, teal section headings via the `prose` helper
 * classes defined inline below. Kept intentionally simple — no MDX,
 * no client-only dependencies, no markdown runtime — these pages must
 * render statically and stay readable in the source.
 */
export function LegalLayout({ title, lastUpdated, children }: Props) {
  return (
    <div className="mx-auto max-w-[700px] px-6 py-12 text-[#e2e8f0]">
      <header className="border-b border-[#1e293b] pb-6">
        <h1 className="text-3xl font-medium text-[#e2e8f0]">{title}</h1>
        <p className="mt-2 font-mono text-[11px] uppercase tracking-wider text-[#64748b]">
          Last updated · {lastUpdated}
        </p>
      </header>

      <article className="legal-prose mt-8 space-y-8 text-[15px] leading-relaxed text-[#94a3b8]">
        {children}
      </article>
    </div>
  );
}

interface SectionProps {
  n: number;
  title: string;
  children: ReactNode;
}

export function LegalSection({ n, title, children }: SectionProps) {
  return (
    <section>
      <h2 className="text-base font-medium text-[#06d6a0]">
        <span className="mr-2 font-mono text-xs text-[#06d6a0]/60">
          {String(n).padStart(2, "0")}
        </span>
        {title}
      </h2>
      <div className="mt-3 space-y-3 text-[#e2e8f0]/85">{children}</div>
    </section>
  );
}
