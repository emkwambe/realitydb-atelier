import type { Metadata } from "next";
import Link from "next/link";
import { LegalLayout, LegalSection } from "../_components/LegalLayout";

export const metadata: Metadata = {
  title: "Privacy Policy · Atelier",
  description:
    "How Atelier by Mpingo Systems LLC collects, uses, and protects your data.",
};

const CONTACT_EMAIL = "atelier@realitydb.dev";

export default function PrivacyPage() {
  return (
    <LegalLayout title="Privacy Policy" lastUpdated="May 2026">
      <p>
        This policy explains what data Atelier (
        <Link
          href="https://atelier.realitydb.dev"
          className="text-[#06d6a0] hover:underline"
        >
          atelier.realitydb.dev
        </Link>
        ), operated by Mpingo Systems LLC, collects from you, how we use
        it, and the choices you have. Questions go to{" "}
        <a
          href={`mailto:${CONTACT_EMAIL}`}
          className="text-[#06d6a0] hover:underline"
        >
          {CONTACT_EMAIL}
        </a>
        .
      </p>

      <LegalSection n={1} title="What we collect">
        <ul className="ml-5 list-disc space-y-1.5">
          <li>
            <span className="text-[#e2e8f0]">Email address and name</span> —
            collected when you create an account.
          </li>
          <li>
            <span className="text-[#e2e8f0]">
              Briefing submissions and scores
            </span>{" "}
            — used to grade your work and compute your Atelier Rank.
          </li>
          <li>
            <span className="text-[#e2e8f0]">SQL query history</span> —
            retained on a 90-day rolling window to provide context for the
            Co-Pilot feature.
          </li>
          <li>
            <span className="text-[#e2e8f0]">Stripe customer ID</span> —
            used for billing. We never see, store, or transmit raw card
            data; Stripe handles that directly.
          </li>
          <li>
            <span className="text-[#e2e8f0]">IP addresses</span> — used for
            rate limiting and fraud prevention; retained for 30 days.
          </li>
          <li>
            <span className="text-[#e2e8f0]">Usage analytics</span> —
            collected to improve the product; anonymized after 90 days.
          </li>
        </ul>
      </LegalSection>

      <LegalSection n={2} title="How we use it">
        <ul className="ml-5 list-disc space-y-1.5">
          <li>Provide access to Atelier modules and Hot Cases.</li>
          <li>
            Grade CEO briefings using AI (Claude by Anthropic).
          </li>
          <li>Calculate and display your Atelier Rank.</li>
          <li>Process payments via Stripe.</li>
          <li>Send transactional emails via Resend.</li>
          <li>Improve the product and develop new modules.</li>
        </ul>
      </LegalSection>

      <LegalSection n={3} title="Third-party processors">
        <p>
          We share data with the following processors strictly for the
          purposes listed:
        </p>
        <ul className="ml-5 list-disc space-y-1.5">
          <li>
            <span className="text-[#e2e8f0]">Supabase</span> — database and
            authentication (US-East-1 region).
          </li>
          <li>
            <span className="text-[#e2e8f0]">Stripe</span> — payment
            processing (PCI-compliant).
          </li>
          <li>
            <span className="text-[#e2e8f0]">Anthropic</span> — AI grading
            of briefing submissions.
          </li>
          <li>
            <span className="text-[#e2e8f0]">Resend</span> — transactional
            email delivery.
          </li>
          <li>
            <span className="text-[#e2e8f0]">Cloudflare</span> — hosting
            and CDN.
          </li>
        </ul>
      </LegalSection>

      <LegalSection n={4} title="Data retention">
        <ul className="ml-5 list-disc space-y-1.5">
          <li>
            <span className="text-[#e2e8f0]">Account data</span> — kept
            until you request deletion.
          </li>
          <li>
            <span className="text-[#e2e8f0]">Briefing submissions</span> —
            3 years.
          </li>
          <li>
            <span className="text-[#e2e8f0]">SQL query history</span> — 90
            days, rolling.
          </li>
          <li>
            <span className="text-[#e2e8f0]">IP addresses</span> — 30 days.
          </li>
          <li>
            <span className="text-[#e2e8f0]">Analytics</span> — 90 days,
            anonymized thereafter.
          </li>
        </ul>
      </LegalSection>

      <LegalSection n={5} title="Your rights">
        <p>You can:</p>
        <ul className="ml-5 list-disc space-y-1.5">
          <li>Access the data we hold about you.</li>
          <li>Delete your account and associated data.</li>
          <li>Export your briefing history.</li>
          <li>Opt out of product analytics.</li>
        </ul>
        <p>
          To exercise any of these rights, email{" "}
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="text-[#06d6a0] hover:underline"
          >
            {CONTACT_EMAIL}
          </a>
          . We respond within 30 days.
        </p>
      </LegalSection>

      <LegalSection n={6} title="AI grading disclosure">
        <p>
          Briefing submissions are processed by Anthropic&apos;s Claude
          API for the purpose of grading. Submissions are used for grading
          only and are not used by Anthropic to train models. Anthropic
          publishes their own data handling practices at{" "}
          <a
            href="https://www.anthropic.com/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#06d6a0] hover:underline"
          >
            anthropic.com/privacy
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection n={7} title="Children">
        <p>
          Atelier is intended for adults aged 18 and over. We do not
          knowingly collect personal data from minors. If you believe a
          minor has provided us data, email{" "}
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="text-[#06d6a0] hover:underline"
          >
            {CONTACT_EMAIL}
          </a>{" "}
          and we will delete it.
        </p>
      </LegalSection>

      <LegalSection n={8} title="Changes to this policy">
        <p>
          We will notify users of material changes to this policy by
          email. Continued use of Atelier after a change constitutes
          acceptance of the updated policy.
        </p>
      </LegalSection>

      <LegalSection n={9} title="Contact">
        <p>
          Mpingo Systems LLC
          <br />
          Raleigh, NC, USA
          <br />
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="text-[#06d6a0] hover:underline"
          >
            {CONTACT_EMAIL}
          </a>
        </p>
      </LegalSection>

      <p className="border-t border-[#1e293b] pt-6 text-sm text-[#64748b]">
        Read our{" "}
        <Link
          href="/legal/terms"
          className="text-[#06d6a0] hover:underline"
        >
          Terms of Service →
        </Link>
      </p>
    </LegalLayout>
  );
}
