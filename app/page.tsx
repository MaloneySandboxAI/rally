import { Header } from "@/components/rally/header"
import { StreakBanner } from "@/components/rally/streak-banner"
import { SatCountdown } from "@/components/rally/sat-countdown"
import { GamesList } from "@/components/rally/games-list"
import { ChallengeButton } from "@/components/rally/challenge-button"
import { BottomNav } from "@/components/rally/bottom-nav"
import { CategoryCards } from "@/components/rally/category-cards"
import { ReferralBanner } from "@/components/rally/referral-banner"
import { WeakSpotCard } from "@/components/rally/weak-spot-card"
import { DiagnosticCard } from "@/components/rally/diagnostic-card"

export default function RallyHome() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 px-4 pb-24 pt-2 overflow-y-auto">
        {/* Hero: Pick a category — visible immediately */}
        <section>
          <h2 className="text-base font-extrabold text-foreground mb-0.5">practice</h2>
          <p className="text-xs text-[#85B7EB]/60 mb-2">pick a category · level up each skill</p>
          <CategoryCards variant="grid" />
        </section>

        {/* Diagnostic Test */}
        <div className="mt-3">
          <DiagnosticCard />
        </div>

        {/* Challenge Button */}
        <div className="mt-3">
          <ChallengeButton />
        </div>

        {/* Weak spot drill nudge */}
        <div className="mt-3">
          <WeakSpotCard />
        </div>

        {/* Streak + SAT countdown */}
        <div className="mt-3">
          <StreakBanner />
        </div>

        <div className="mt-2.5">
          <SatCountdown />
        </div>

        {/* Active games */}
        <section className="mt-3">
          <h2 className="text-base font-extrabold text-foreground mb-2">your games</h2>
          <GamesList />
        </section>

        {/* Referral Banner */}
        <div className="mt-3">
          <ReferralBanner />
        </div>

      </main>

      <BottomNav />
    </div>
  )
}
