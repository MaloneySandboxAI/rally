import { Header } from "@/components/rally/header"
import { SatCountdown } from "@/components/rally/sat-countdown"
import { GamesList } from "@/components/rally/games-list"
import { ChallengeButton } from "@/components/rally/challenge-button"
import { BottomNav } from "@/components/rally/bottom-nav"
import { CategoryRings } from "@/components/rally/category-rings"
import { ReferralBanner } from "@/components/rally/referral-banner"
import { DiagnosticCard } from "@/components/rally/diagnostic-card"

export default function RallyHome() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 px-4 pb-24 pt-1 overflow-y-auto">
        {/* Category level rings — the main visual */}
        <section className="mb-4">
          <h2 className="text-base font-extrabold text-foreground mb-0.5">your levels</h2>
          <p className="text-xs text-[#85B7EB]/60 mb-2.5">tap a category to practice &amp; level up</p>
          <CategoryRings />
        </section>

        {/* Challenge — full width */}
        <div className="mb-3">
          <ChallengeButton />
        </div>

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
