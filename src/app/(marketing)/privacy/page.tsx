import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "AeroDesk Privacy Policy — how we collect, use, and protect your personal data.",
};

const LAST_UPDATED = "March 1, 2026";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#F1F5F9]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white rounded-2xl p-8 sm:p-12 shadow-sm border border-slate-200">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Privacy Policy</h1>
          <p className="text-slate-500 text-sm mb-10">Last updated: {LAST_UPDATED}</p>

          <div className="prose prose-slate max-w-none space-y-8 text-sm leading-relaxed text-slate-700">
            <section>
              <h2 className="text-lg font-semibold text-slate-900 mb-3">1. Introduction</h2>
              <p>
                AeroDesk (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;) is committed to protecting your
                personal data. This Privacy Policy explains what information we collect, how we use it, and your rights
                under the Brazilian General Data Protection Law (LGPD — Lei 13.709/2018) and other applicable
                regulations.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-slate-900 mb-3">2. Data We Collect</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong>Account data:</strong> Name, email address, phone number, and company name when you register.
                </li>
                <li>
                  <strong>Listing data:</strong> Aircraft details, photos, pricing, and descriptions you submit.
                </li>
                <li>
                  <strong>Usage data:</strong> Pages visited, search queries, listing views, and interaction events
                  (via PostHog analytics).
                </li>
                <li>
                  <strong>Communication data:</strong> Messages sent via the contact form or lead system.
                </li>
                <li>
                  <strong>Payment data:</strong> Processed by Stripe; we do not store card numbers or CVV codes.
                </li>
                <li>
                  <strong>Device data:</strong> IP address, browser type, and operating system for security and
                  analytics.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-slate-900 mb-3">3. How We Use Your Data</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>Operate and improve the AeroDesk marketplace</li>
                <li>Connect buyers with sellers and dealers</li>
                <li>Send transactional emails (account verification, lead notifications)</li>
                <li>Process subscription payments</li>
                <li>Detect fraud and enforce our Terms of Service</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-slate-900 mb-3">4. Legal Basis for Processing (LGPD)</h2>
              <p>We process personal data based on:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Consent (marketing communications)</li>
                <li>Contract performance (account and listing services)</li>
                <li>Legitimate interests (fraud prevention, analytics)</li>
                <li>Legal obligation (tax records, compliance)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-slate-900 mb-3">5. Data Sharing</h2>
              <p>
                We do not sell your personal data. We share data only with:
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>
                  <strong>Supabase</strong> — database and authentication hosting
                </li>
                <li>
                  <strong>Stripe</strong> — payment processing
                </li>
                <li>
                  <strong>Vercel</strong> — web hosting and edge functions
                </li>
                <li>
                  <strong>PostHog</strong> — privacy-friendly product analytics
                </li>
                <li>
                  <strong>Anthropic</strong> — AI-powered valuation feature (no PII sent)
                </li>
              </ul>
              <p className="mt-3">
                All processors are contractually bound to protect your data and may only use it as instructed.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-slate-900 mb-3">6. Data Retention</h2>
              <p>
                We retain account data for as long as your account is active, plus 5 years for legal compliance.
                Listings are retained for 2 years after removal. You may request deletion at any time (see Section 8).
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-slate-900 mb-3">7. Cookies</h2>
              <p>
                We use essential cookies for authentication and session management, and analytics cookies (PostHog)
                to understand platform usage. You can disable non-essential cookies in your browser settings.
                Essential cookies cannot be disabled without affecting platform functionality.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-slate-900 mb-3">8. Your Rights (LGPD)</h2>
              <p>Under the LGPD, you have the right to:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Confirm whether we process your data</li>
                <li>Access a copy of your data</li>
                <li>Correct inaccurate data</li>
                <li>Request anonymization, blocking, or deletion</li>
                <li>Withdraw consent at any time</li>
                <li>Data portability</li>
                <li>Lodge a complaint with the ANPD (Autoridade Nacional de Proteção de Dados)</li>
              </ul>
              <p className="mt-3">
                To exercise these rights, email{" "}
                <a href="mailto:privacy@aerodesk.com.br" className="text-[#2563EB] hover:underline">
                  privacy@aerodesk.com.br
                </a>
                . We will respond within 15 business days.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-slate-900 mb-3">9. Security</h2>
              <p>
                We implement industry-standard security measures including TLS encryption in transit, encrypted storage
                at rest, row-level access controls, and regular security reviews. No method of transmission over the
                internet is 100% secure; we cannot guarantee absolute security.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-slate-900 mb-3">10. International Transfers</h2>
              <p>
                Your data may be processed in the United States (Supabase, Vercel, Stripe, PostHog). We ensure
                appropriate safeguards are in place through contractual clauses and processor certifications as
                required by LGPD Article 33.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-slate-900 mb-3">11. Changes to This Policy</h2>
              <p>
                We may update this Privacy Policy periodically. We will notify you of significant changes via email
                or a notice on the platform. The &ldquo;last updated&rdquo; date at the top reflects the most recent
                revision.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-slate-900 mb-3">12. Contact & DPO</h2>
              <p>
                Data Protection Officer:{" "}
                <a href="mailto:privacy@aerodesk.com.br" className="text-[#2563EB] hover:underline">
                  privacy@aerodesk.com.br
                </a>
                <br />
                AeroDesk — São Paulo, SP, Brazil
              </p>
            </section>
          </div>

          <div className="mt-10 pt-8 border-t border-slate-100 text-sm text-slate-500">
            See also:{" "}
            <Link href="/terms" className="text-[#2563EB] hover:underline">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
