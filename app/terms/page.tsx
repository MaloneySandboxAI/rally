"use client"

import Link from "next/link"

export default function TermsOfServicePage() {
  const lastUpdated = "April 7, 2026"

  return (
    <div className="min-h-screen bg-[#021f3d] pb-24">
      <header className="sticky top-0 z-10 bg-[#021f3d] px-5 pt-6 pb-4 border-b border-[#0a2d4a]">
        <Link href="/" className="text-[#85B7EB]/50 text-sm font-medium hover:text-[#85B7EB] transition-colors block mb-3">
          ← back
        </Link>
        <h1 className="text-2xl font-extrabold text-white">Terms of Service</h1>
        <p className="text-[#85B7EB]/50 text-xs mt-1">Last updated: {lastUpdated}</p>
      </header>

      <main className="px-5 py-6 max-w-2xl mx-auto text-[#85B7EB]/80 text-sm leading-relaxed space-y-6">
        <section>
          <h2 className="text-white font-bold text-base mb-2">1. Acceptance of Terms</h2>
          <p>
            By accessing or using Rally (&quot;the App&quot;), you agree to be bound by these Terms of Service. If you do not agree to these terms, do not use the App. You must be at least 13 years of age to use Rally.
          </p>
        </section>

        <section>
          <h2 className="text-white font-bold text-base mb-2">2. Description of Service</h2>
          <p>
            Rally is a SAT preparation quiz application that offers solo practice and head-to-head challenge modes. The App includes a virtual gem economy, adaptive difficulty system, and performance tracking. Rally is designed as a supplemental study tool and does not guarantee any specific SAT score improvement.
          </p>
        </section>

        <section>
          <h2 className="text-white font-bold text-base mb-2">3. User Accounts</h2>
          <p>
            You may create an account using Google OAuth, email magic link, or play as a guest. You are responsible for maintaining the security of your account credentials. Guest accounts have limited functionality and data is stored locally on your device. You agree to provide accurate information when creating an account.
          </p>
        </section>

        <section>
          <h2 className="text-white font-bold text-base mb-2">4. Virtual Currency (Gems)</h2>
          <p>
            Rally uses a virtual currency called &quot;gems&quot; earned through gameplay. Gems have no real-world monetary value and cannot be exchanged for cash or transferred between accounts. We reserve the right to modify gem earning rates, costs, and balances at any time. Any future purchases of gems or premium features will be subject to additional terms.
          </p>
        </section>

        <section>
          <h2 className="text-white font-bold text-base mb-2">5. Acceptable Use</h2>
          <p>
            You agree not to: use the App for any unlawful purpose; attempt to gain unauthorized access to our systems; interfere with other users&apos; enjoyment of the App; use automated tools, bots, or scripts to interact with the App; share challenge links in a deceptive or harassing manner; or attempt to manipulate your stats, gems, or leaderboard position.
          </p>
        </section>

        <section>
          <h2 className="text-white font-bold text-base mb-2">6. Intellectual Property</h2>
          <p>
            All content in Rally, including but not limited to questions, design, graphics, and code, is owned by Rally and protected by intellectual property laws. You may not reproduce, distribute, or create derivative works from our content without written permission.
          </p>
        </section>

        <section>
          <h2 className="text-white font-bold text-base mb-2">7. Disclaimers</h2>
          <p>
            Rally is provided &quot;as is&quot; and &quot;as available&quot; without warranties of any kind, either express or implied. We do not warrant that the App will be uninterrupted, error-free, or free of harmful components. SAT questions in Rally are for practice purposes and may not reflect the exact format or difficulty of the actual SAT exam.
          </p>
        </section>

        <section>
          <h2 className="text-white font-bold text-base mb-2">8. Limitation of Liability</h2>
          <p>
            To the fullest extent permitted by law, Rally and its operators shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the App, including but not limited to loss of data, loss of profits, or damage to your device. Our total liability for any claim arising from these terms shall not exceed the amount you paid us in the 12 months preceding the claim, or $100, whichever is less.
          </p>
        </section>

        <section>
          <h2 className="text-white font-bold text-base mb-2">9. Account Termination</h2>
          <p>
            You may delete your account at any time through the Account page or by contacting us. We reserve the right to suspend or terminate accounts that violate these terms. Upon termination, your right to use the App ceases immediately and we may delete your data.
          </p>
        </section>

        <section>
          <h2 className="text-white font-bold text-base mb-2">10. Dispute Resolution</h2>
          <p>
            Any disputes arising from these terms or your use of Rally shall first be attempted to be resolved through good-faith negotiation. If negotiation fails, disputes shall be resolved through binding arbitration in accordance with the rules of the American Arbitration Association. You agree that any dispute resolution proceedings will be conducted on an individual basis and not as a class action.
          </p>
        </section>

        <section>
          <h2 className="text-white font-bold text-base mb-2">11. Changes to Terms</h2>
          <p>
            We may modify these Terms of Service at any time. We will notify users of material changes by posting the updated terms and revising the &quot;Last updated&quot; date. Your continued use of Rally after changes take effect constitutes acceptance of the new terms.
          </p>
        </section>

        <section>
          <h2 className="text-white font-bold text-base mb-2">12. Contact</h2>
          <p>
            For questions about these Terms of Service, contact us at:{" "}
            <a href="mailto:maloney@evaine.ai" className="text-[#378ADD] underline">maloney@evaine.ai</a>
          </p>
        </section>
      </main>
    </div>
  )
}
