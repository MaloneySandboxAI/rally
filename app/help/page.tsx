"use client"

import Link from "next/link"

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-[#021f3d] pb-24">
      <header className="sticky top-0 z-10 bg-[#021f3d] px-5 pt-6 pb-4 border-b border-[#0a2d4a]">
        <Link href="/home" className="text-[#85B7EB]/50 text-sm font-medium hover:text-[#85B7EB] transition-colors block mb-3">
          ← back
        </Link>
        <h1 className="text-2xl font-extrabold text-white">Help</h1>
        <p className="text-[#85B7EB]/50 text-xs mt-1">Welcome to Rally! Here&apos;s how everything works.</p>
      </header>

      <main className="px-5 py-6 max-w-2xl mx-auto text-[#85B7EB]/80 text-sm leading-relaxed space-y-8">
        <section className="space-y-4">
          <h2 className="text-[#EF9F27] font-extrabold text-lg">Getting Started</h2>

          <div>
            <h3 className="text-white font-bold text-base mb-1">How do I sign in?</h3>
            <p>
              Rally uses email magic links — no password to remember. Enter your email, tap the link we send you, and you&apos;re in. Links expire after a short window for security, so click within a few minutes of receiving the email.
            </p>
          </div>

          <div>
            <h3 className="text-white font-bold text-base mb-1">Do I need an account to play?</h3>
            <p>
              You can play as a guest, but you won&apos;t be able to save progress, earn gems across sessions, or send challenges to friends. Most features work better signed in.
            </p>
          </div>

          <div>
            <h3 className="text-white font-bold text-base mb-1">What ages is Rally for?</h3>
            <p>
              13 and up. We don&apos;t knowingly collect data from anyone under 13. If you&apos;re under 13, please don&apos;t sign up.
            </p>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-[#EF9F27] font-extrabold text-lg">Playing Rally</h2>

          <div>
            <h3 className="text-white font-bold text-base mb-1">How does a round work?</h3>
            <p>
              A round is 5 questions in one category. Each question has a timer based on difficulty. Tap an answer, tap &quot;lock in&quot; to confirm, then move to the next question. At the end you see your score and gems earned.
            </p>
          </div>

          <div>
            <h3 className="text-white font-bold text-base mb-1">What&apos;s adaptive difficulty?</h3>
            <p>
              Get a question right, the next one gets harder. Get one wrong, the next one gets easier. The system finds the level where you&apos;re being challenged but not overwhelmed.
            </p>
          </div>

          <div>
            <h3 className="text-white font-bold text-base mb-1">What&apos;s the speed bonus?</h3>
            <p>
              Answer correctly before half the timer runs out and you earn extra gems. The bar at the top of the question is your timer.
            </p>
          </div>

          <div>
            <h3 className="text-white font-bold text-base mb-1">What are gems?</h3>
            <p>
              Gems are your reward currency. Earn them by answering correctly. Use them to refill hearts when you run out, or just track your progress over time. Gems have no real-world value.
            </p>
          </div>

          <div>
            <h3 className="text-white font-bold text-base mb-1">What are hearts?</h3>
            <p>
              Hearts are your daily attempts in solo mode. Wrong answers cost hearts. Run out and you wait until tomorrow (or refill with gems). Challenges don&apos;t cost hearts — play them whenever.
            </p>
          </div>

          <div>
            <h3 className="text-white font-bold text-base mb-1">Why did the question reset to easy?</h3>
            <p>
              At the start of every new round, difficulty resets to &quot;easy&quot; and adapts from there. This isn&apos;t a bug — it&apos;s how the system calibrates without locking you into a difficulty.
            </p>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-[#EF9F27] font-extrabold text-lg">Challenges</h2>

          <div>
            <h3 className="text-white font-bold text-base mb-1">How do I challenge a friend?</h3>
            <p>
              After finishing a round, tap &quot;challenge a friend.&quot; Pick how to share (iMessage works best). Your friend taps the link, plays the same 5 questions, and your scores compare.
            </p>
          </div>

          <div>
            <h3 className="text-white font-bold text-base mb-1">My friend&apos;s link bounces me to sign in. Why?</h3>
            <p>
              Old versions of Rally had this issue. The fix is now live — if you&apos;re still seeing it, sign in once on the device, then tap any challenge link.
            </p>
          </div>

          <div>
            <h3 className="text-white font-bold text-base mb-1">How do group challenges work?</h3>
            <p>
              Same as 1v1 but with more players. Whoever creates the group challenge sets the question pool. Everyone who joins plays the same questions, and the leaderboard shows where you rank.
            </p>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-[#EF9F27] font-extrabold text-lg">Categories &amp; Content</h2>

          <div>
            <h3 className="text-white font-bold text-base mb-1">What categories does Rally cover?</h3>
            <ul className="list-disc list-inside space-y-1">
              <li><span className="text-white font-semibold">SAT:</span> Algebra, Data &amp; Stats, Reading, Grammar</li>
              <li><span className="text-white font-semibold">AP:</span> an expanding library — check the app for the current list</li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-bold text-base mb-1">How are questions made?</h3>
            <p>
              Every question is reviewed against real SAT and AP curriculum. Wrong answers (distractors) are written to match common student misconceptions, not random number swaps — so getting one wrong teaches you something real about where you got tripped up.
            </p>
          </div>

          <div>
            <h3 className="text-white font-bold text-base mb-1">Why did I see the same question twice?</h3>
            <p>
              You shouldn&apos;t if you&apos;re signed in — Rally tracks every question you&apos;ve seen and excludes it from your next round in the same category. If you&apos;ve played through every question in a category, the system resets and you start fresh with a &quot;you&apos;ve mastered this!&quot; toast. If you&apos;re playing as a guest, repeats may happen across browser sessions.
            </p>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-[#EF9F27] font-extrabold text-lg">Account</h2>

          <div>
            <h3 className="text-white font-bold text-base mb-1">How do I delete my account?</h3>
            <p>
              Go to the Account page and tap <span className="text-white font-semibold">Delete account</span>. This
              permanently erases your account and all associated data and cannot be undone. You can also email us at{" "}
              <a href="mailto:maloney@evaine.ai" className="text-[#378ADD] underline">maloney@evaine.ai</a> for help.
            </p>
          </div>

          <div>
            <h3 className="text-white font-bold text-base mb-1">Where&apos;s my data stored?</h3>
            <p>
              Most of your gameplay data (gems, stats, streaks) is stored locally on your device. Account info (email, display name) and challenge data are stored in our database (Supabase). See our{" "}
              <Link href="/privacy" className="text-[#378ADD] underline">Privacy Policy</Link>{" "}
              for full details.
            </p>
          </div>

          <div>
            <h3 className="text-white font-bold text-base mb-1">Can I use Rally on multiple devices?</h3>
            <p>
              Yes — sign in with the same email on each device. Your progress syncs through your account.
            </p>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-[#EF9F27] font-extrabold text-lg">Troubleshooting</h2>

          <div>
            <h3 className="text-white font-bold text-base mb-1">The app/site isn&apos;t loading.</h3>
            <p>
              Check your internet connection. Rally needs to be online to fetch questions and save progress.
            </p>
          </div>

          <div>
            <h3 className="text-white font-bold text-base mb-1">A question or answer looks wrong.</h3>
            <p>
              Tap the feedback button (bottom right of any screen) and let us know. Include the question text if you can. We review every report.
            </p>
          </div>

          <div>
            <h3 className="text-white font-bold text-base mb-1">I lost my streak.</h3>
            <p>
              Streaks reset if you skip a day. We&apos;re working on streak freezes — coming soon.
            </p>
          </div>
        </section>

        <section className="space-y-2">
          <h2 className="text-[#EF9F27] font-extrabold text-lg">Contact</h2>
          <p>
            Still stuck? Have a feature request? Email us at{" "}
            <a href="mailto:maloney@evaine.ai" className="text-[#378ADD] underline">maloney@evaine.ai</a>. We read everything.
          </p>
          <p>
            For our Privacy Policy and Terms of Service, see{" "}
            <Link href="/privacy" className="text-[#378ADD] underline">/privacy</Link>{" "}
            and{" "}
            <Link href="/terms" className="text-[#378ADD] underline">/terms</Link>.
          </p>
        </section>
      </main>
    </div>
  )
}
