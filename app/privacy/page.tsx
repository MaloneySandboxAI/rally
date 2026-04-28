"use client"

import Link from "next/link"

export default function PrivacyPolicyPage() {
  const lastUpdated = "April 7, 2026"

  return (
    <div className="min-h-screen bg-[#021f3d] pb-24">
      <header className="sticky top-0 z-10 bg-[#021f3d] px-5 pt-6 pb-4 border-b border-[#0a2d4a]">
        <Link href="/home" className="text-[#85B7EB]/50 text-sm font-medium hover:text-[#85B7EB] transition-colors block mb-3">
          ← back
        </Link>
        <h1 className="text-2xl font-extrabold text-white">Privacy Policy</h1>
        <p className="text-[#85B7EB]/50 text-xs mt-1">Last updated: {lastUpdated}</p>
      </header>

      <main className="px-5 py-6 max-w-2xl mx-auto text-[#85B7EB]/80 text-sm leading-relaxed space-y-6">
        <section>
          <h2 className="text-white font-bold text-base mb-2">1. Introduction</h2>
          <p>
            Rally (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is a SAT preparation quiz application. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile and web application. Please read this policy carefully. By using Rally, you agree to the collection and use of information in accordance with this policy.
          </p>
        </section>

        <section>
          <h2 className="text-white font-bold text-base mb-2">2. Information We Collect</h2>
          <p className="mb-2"><span className="text-white font-semibold">Account information:</span> When you sign up via Google OAuth or email magic link, we receive your email address and display name from your authentication provider. We do not store your password.</p>
          <p className="mb-2"><span className="text-white font-semibold">Gameplay data:</span> We store your quiz performance statistics, gem balances, streak information, and challenge results locally on your device and, for challenges, on our servers.</p>
          <p className="mb-2"><span className="text-white font-semibold">Age verification:</span> We collect your birth year during signup solely to verify you meet the minimum age requirement (13 years). We do not store birth year data on our servers.</p>
          <p><span className="text-white font-semibold">Analytics data:</span> We collect anonymous usage analytics including page views, feature usage, and session data through PostHog and Vercel Analytics to improve the app experience.</p>
        </section>

        <section>
          <h2 className="text-white font-bold text-base mb-2">3. How We Use Your Information</h2>
          <p>We use the information we collect to: provide and maintain the Rally application; manage your account and authentication; track your gameplay progress and performance; facilitate head-to-head challenge games between users; improve and optimize the app experience; communicate with you about your account; and comply with legal obligations.</p>
        </section>

        <section>
          <h2 className="text-white font-bold text-base mb-2">4. Third-Party Services</h2>
          <p>We share data with the following service providers who help us operate Rally:</p>
          <p className="mt-2"><span className="text-white font-semibold">Supabase</span> — Authentication and database hosting. Stores your authentication credentials and challenge game data.</p>
          <p className="mt-2"><span className="text-white font-semibold">Vercel</span> — Application hosting and deployment. Processes web requests and collects basic analytics.</p>
          <p className="mt-2"><span className="text-white font-semibold">PostHog</span> — Product analytics. Collects anonymous usage data to help us understand how the app is used.</p>
          <p className="mt-2"><span className="text-white font-semibold">Google</span> — Authentication provider (if you sign in with Google). We receive your name and email only.</p>
          <p className="mt-2">We do not sell your personal information to any third party.</p>
        </section>

        <section>
          <h2 className="text-white font-bold text-base mb-2">5. Children&apos;s Privacy</h2>
          <p>
            Rally is not intended for children under the age of 13. We do not knowingly collect personal information from children under 13. If we learn that we have collected personal information from a child under 13, we will take steps to delete that information as quickly as possible. If you believe we may have collected information from a child under 13, please contact us immediately.
          </p>
        </section>

        <section>
          <h2 className="text-white font-bold text-base mb-2">6. Data Storage &amp; Security</h2>
          <p>
            Most of your gameplay data (gems, stats, streaks) is stored locally on your device using browser storage. Challenge data is stored on our servers via Supabase with encryption at rest and in transit. We implement reasonable security measures to protect your data, but no method of electronic storage is 100% secure.
          </p>
        </section>

        <section>
          <h2 className="text-white font-bold text-base mb-2">7. Data Deletion &amp; Your Rights</h2>
          <p>
            You have the right to request deletion of your account and all associated data at any time. You can delete your account directly from the Account page within the app, or by contacting us at the email below. Upon deletion, we will remove your authentication data and any server-stored challenge data. Locally stored data on your device can be cleared through your browser settings.
          </p>
        </section>

        <section>
          <h2 className="text-white font-bold text-base mb-2">8. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the &quot;Last updated&quot; date. Your continued use of Rally after changes constitutes acceptance of the updated policy.
          </p>
        </section>

        <section>
          <h2 className="text-white font-bold text-base mb-2">9. Contact Us</h2>
          <p>
            If you have questions about this Privacy Policy, want to request data deletion, or believe we may have collected data from a child under 13, please contact us at:{" "}
            <a href="mailto:maloney@evaine.ai" className="text-[#378ADD] underline">maloney@evaine.ai</a>
          </p>
        </section>
      </main>
    </div>
  )
}
