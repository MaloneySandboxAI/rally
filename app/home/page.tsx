import { Header } from "@/components/rally/header"
import { SatCountdown } from "@/components/rally/sat-countdown"
import { GamesSummary } from "@/components/rally/games-list"
import { ChallengeButton } from "@/components/rally/challenge-button"
import { BottomNav } from "@/components/rally/bottom-nav"
import { CategoryRings } from "@/components/rally/category-rings"
import { ReferralBanner } from "@/components/rally/referral-banner"
import { DiagnosticCard } from "@/components/rally/diagnostic-card"
import { PushPrompt } from "@/components/rally/push-prompt"
import { WeeklyRecapCard } from "@/components/rally/weekly-recap-card"

export default function RallyHome() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 px-4 pb-24 pt-1 overflow-y-auto">
        {/* Hero: Challenge a friend — top of page */}
        <section className="mb-4 bg-gradient-to-br from-[#378ADD]/20 to-[#A855F7]/10 rounded-2xl p-4 border border-[#378ADD]/25">
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-lg font-extrabold text-white">challenge a friend</h2>
            <span className="text-[10px] font-bold bg-[#EF9F27] text-white px-2 py-0.5 rounded-full">4x gems</span>
          </div>
          <p className="text-xs text-[#85B7EB]/60 mb-3">pick a category, share the link, compete head-to-head</p>
          <ChallengeButton />
        </section>

        {/* Active games summary — tap to see full list */}
        <div className="mb-3">
          <GamesSummary />
        </div>

        {/* Weekly recap + push prompt */}
        <div className="mb-3 space-y-2">
          <WeeklyRecapCard />
          <PushPrompt />
        </div>

        {/* Solo Practice */}
        <section className="mb-4 bg-[#0a2d4a] rounded-2xl p-4 border border-[#85B7EB]/10">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-base font-extrabold text-white">solo practice &amp; diagnostic tests</h2>
              <p className="text-xs text-[#85B7EB]/60 mt-0.5">self-paced — tap a category to start</p>
            </div>
            <span className="text-[10px] font-bold bg-[#85B7EB]/15 text-[#85B7EB]/60 px-2.5 py-1 rounded-full">solo</span>
          </div>
          <CategoryRings />
        </section>

        {/* Secondary info */}
        <div className="space-y-2.5">
          <DiagnosticCard />
          <SatCountdown />
          <ReferralBanner />
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
