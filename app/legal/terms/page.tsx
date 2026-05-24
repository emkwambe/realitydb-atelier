import type { Metadata } from "next";
import Link from "next/link";
import { LegalLayout, LegalSection } from "../_components/LegalLayout";

export const metadata: Metadata = {
  title: "Terms of Service · Atelier",
  description:
    "Terms governing your use of Atelier by Mpingo Systems LLC.",
};

const CONTACT_EMAIL = "atelier@realitydb.dev";

export default function TermsPage() {
  return (
    <LegalLayout title="Terms of Service" lastUpdated="May 2026">
      <p>
        These terms govern your use of Atelier, a product of Mpingo
        Systems LLC. Questions go to{" "}
        <a
          href={`mailto:${CONTACT_EMAIL}`}
          className="text-[#06d6a0] hover:underline"
        >
          {CONTACT_EMAIL}
        </a>
        .
      </p>

      <LegalSection n={1} title="Acceptance">
        <p>By using Atelier you agree to these terms.</p>
      </LegalSection>

      <LegalSection n={2} title="The service">
        <p>
          Atelier provides SQL-based business acumen training through
          synthetic company datasets. Access is provided via subscription
          or the free tier.
        </p>
      </LegalSection>

      <LegalSection n={3} title="Account responsibilities">
        <ul className="ml-5 list-disc space-y-1.5">
          <li>You are responsible for your account security.</li>
          <li>One account per person.</li>
          <li>Do not share account credentials.</li>
          <li>Do not attempt to manipulate or game the grading system.</li>
          <li>
            Do not attempt to extract, scrape, or redistribute the
            synthetic company datasets.
          </li>
        </ul>
      </LegalSection>

      <LegalSection n={4} title="Subscriptions and payments">
        <ul className="ml-5 list-disc space-y-1.5">
          <li>All billing is processed via Stripe.</li>
          <li>Annual plans are non-refundable after 30 days.</li>
          <li>Monthly plans can be cancelled anytime.</li>
          <li>No refunds for partial months.</li>
        </ul>
      </LegalSection>

      <LegalSection n={5} title="Intellectual property">
        <ul className="ml-5 list-disc space-y-1.5">
          <li>
            Atelier&apos;s synthetic company datasets are proprietary to
            Mpingo Systems LLC.
          </li>
          <li>
            The Atelier Rank methodology is publicly documented, but the
            platform implementation is proprietary.
          </li>
          <li>Your briefing submissions belong to you.</li>
          <li>
            You grant Mpingo Systems a non-exclusive license to use
            anonymized submissions to improve the grading system.
          </li>
        </ul>
      </LegalSection>

      <LegalSection n={6} title="The credential">
        <ul className="ml-5 list-disc space-y-1.5">
          <li>Atelier credentials are earned, not purchased.</li>
          <li>
            Mpingo Systems reserves the right to revoke credentials if
            evidence of manipulation or fraud is found.
          </li>
          <li>Credentials are publicly verifiable at the issued URL.</li>
        </ul>
      </LegalSection>

      <LegalSection n={7} title="Disclaimers">
        <ul className="ml-5 list-disc space-y-1.5">
          <li>
            Atelier is a training platform, not a certification body.
          </li>
          <li>
            Scores and rankings are for educational and professional
            development purposes.
          </li>
          <li>We do not guarantee employment outcomes.</li>
        </ul>
      </LegalSection>

      <LegalSection n={8} title="Limitation of liability">
        <p>
          To the maximum extent permitted by law, Mpingo Systems LLC is
          not liable for indirect, incidental, special, consequential, or
          punitive damages arising out of or related to your use of
          Atelier. Our total aggregate liability for any claim is limited
          to the amount you paid to Mpingo Systems in the twelve (12)
          months preceding the claim.
        </p>
      </LegalSection>

      <LegalSection n={9} title="Governing law">
        <p>
          These terms are governed by the laws of the State of North
          Carolina, United States, without regard to its conflict of
          laws provisions.
        </p>
      </LegalSection>

      <LegalSection n={10} title="Changes">
        <p>
          We may update these terms from time to time. Material changes
          will be notified by email. Continued use of Atelier after a
          change constitutes acceptance of the updated terms.
        </p>
      </LegalSection>

      <LegalSection n={11} title="Contact">
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
          href="/legal/privacy"
          className="text-[#06d6a0] hover:underline"
        >
          Privacy Policy →
        </Link>
      </p>
    </LegalLayout>
  );
}
