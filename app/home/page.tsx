import { Header } from "@/components/rally/header"
import { SatCountdown } from "@/components/rally/sat-countdown"
import { GamesList } from "@/components/rally/games-list"
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
        {/* Solo Practice */}
        <section className="mb-5">
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-base font-extrabold text-foreground">solo practice</h2>
            <span className="text-[10px] font-bold bg-[#378ADD]/15 text-[#378ADD] px-2 py-0.5 rounded-full">self-paced</span>
          </div>
          <p className="text-xs text-[#85B7EB]/60 mb-2.5">tap a category to practice at your own pace — no timer pressure</p>
          <CategoryRings />
        </section>

        {/* Compete */}
        <section className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <h2 className="text-base font-extrabold text-foreground">compete</h2>
            <span className="text-[10px] font-bold bg-[#EF9F27]/15 text-[#EF9F27] px-2 py-0.5 rounded-full">4x gems</span>
          </div>

          {/* Weekly challenge recap */}
          <div className="mb-2">
            <WeeklyRecapCard />
          </div>

          {/* Push notification prompt */}
          <div className="mb-2">
            <PushPrompt />
          </div>

          {/* Challenge button */}
          <ChallengeButton />
        </section>

        {/* Active games (only renders if there are games) */}
        <section className="mb-3">
          <GamesList />
        </section>

        {/* Diagnostic + SAT countdown — compact secondary info */}
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
