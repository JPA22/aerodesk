import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "AeroDesk Terms of Service — the rules governing use of our aircraft marketplace platform.",
};

const LAST_UPDATED = "March 1, 2026";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#F1F5F9]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white rounded-2xl p-8 sm:p-12 shadow-sm border border-slate-200">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Terms of Service</h1>
          <p className="text-slate-500 text-sm mb-10">Last updated: {LAST_UPDATED}</p>

          <div className="prose prose-slate max-w-none space-y-8 text-sm leading-relaxed text-slate-700">
            <section>
              <h2 className="text-lg font-semibold text-slate-900 mb-3">1. Acceptance of Terms</h2>
              <p>
                By accessing or using AeroDesk (&ldquo;the Platform&rdquo;), you agree to be bound by these Terms of
                Service. If you do not agree, do not use the Platform. These terms apply to all visitors, buyers,
                sellers, and dealers using any part of AeroDesk.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-slate-900 mb-3">2. Description of Service</h2>
              <p>
                AeroDesk is an online marketplace that connects buyers and sellers of pre-owned aircraft. We provide
                tools for listing, searching, valuing, and contacting parties regarding aircraft transactions. AeroDesk
                is not a broker, dealer, or party to any transaction unless explicitly stated.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-slate-900 mb-3">3. User Accounts</h2>
              <p>
                You must provide accurate and complete information when creating an account. You are responsible for
                maintaining the confidentiality of your credentials and for all activities that occur under your
                account. Notify us immediately of any unauthorized use at{" "}
                <a href="mailto:support@aerodesk.com.br" className="text-[#2563EB] hover:underline">
                  support@aerodesk.com.br
                </a>.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-slate-900 mb-3">4. Listings and Content</h2>
              <p>
                Sellers are solely responsible for the accuracy of their listings, including aircraft specifications,
                pricing, photos, and condition descriptions. AeroDesk reserves the right to remove listings that
                violate these terms, contain false information, or are deemed inappropriate at our sole discretion.
              </p>
              <p className="mt-3">
                By submitting content, you grant AeroDesk a non-exclusive, royalty-free, worldwide license to display,
                reproduce, and distribute that content in connection with operating the Platform.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-slate-900 mb-3">5. AI Valuation Tool</h2>
              <p>
                The AeroDesk valuation tool provides estimates based on market data and statistical models. These
                estimates are for informational purposes only and do not constitute a professional appraisal, offer to
                buy or sell, or warranty of value. Always consult a certified aircraft appraiser before transacting.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-slate-900 mb-3">6. Prohibited Conduct</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>Post false, misleading, or fraudulent listings</li>
                <li>Attempt to circumvent the platform to avoid fees</li>
                <li>Scrape or systematically download platform data without permission</li>
                <li>Use the platform for any unlawful purpose</li>
                <li>Impersonate another user, dealer, or AeroDesk</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-slate-900 mb-3">7. Fees and Payments</h2>
              <p>
                Dealer subscription fees and listing fees are described on our pricing page. All fees are in the
                currency specified at checkout and are non-refundable unless required by applicable law. AeroDesk
                uses Stripe for payment processing and does not store payment card data.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-slate-900 mb-3">8. Disclaimer of Warranties</h2>
              <p>
                The Platform is provided &ldquo;as is&rdquo; without warranties of any kind, express or implied.
                AeroDesk does not warrant that the Platform will be uninterrupted, error-free, or that any listing
                information is accurate.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-slate-900 mb-3">9. Limitation of Liability</h2>
              <p>
                To the maximum extent permitted by law, AeroDesk shall not be liable for any indirect, incidental,
                special, or consequential damages arising from your use of the Platform, including but not limited to
                losses from aircraft transactions.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-slate-900 mb-3">10. Governing Law</h2>
              <p>
                These Terms are governed by the laws of Brazil. Any disputes shall be resolved in the courts of São
                Paulo, Brazil, unless otherwise required by applicable consumer protection law.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-slate-900 mb-3">11. Changes to Terms</h2>
              <p>
                We may update these Terms at any time. Continued use of the Platform after changes constitutes
                acceptance of the updated Terms. We will notify users of material changes via email or an in-app
                notice.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-slate-900 mb-3">12. Contact</h2>
              <p>
                Questions about these Terms? Contact us at{" "}
                <a href="mailto:legal@aerodesk.com.br" className="text-[#2563EB] hover:underline">
                  legal@aerodesk.com.br
                </a>.
              </p>
            </section>
          </div>

          <div className="mt-10 pt-8 border-t border-slate-100 text-sm text-slate-500">
            See also:{" "}
            <Link href="/privacy" className="text-[#2563EB] hover:underline">
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
