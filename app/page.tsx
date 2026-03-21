import { Header } from "@/components/rally/header"
import { StreakBanner } from "@/components/rally/streak-banner"
import { SatCountdown } from "@/components/rally/sat-countdown"
import { GamesList } from "@/components/rally/games-list"
import { ChallengeButton } from "@/components/rally/challenge-button"
import { BottomNav } from "@/components/rally/bottom-nav"
import { CategoryCards } from "@/components/rally/category-cards"
import { ReferralBanner } from "@/components/rally/referral-banner"
import { ProBanner } from "@/components/rally/pro-banner"

export default function RallyHome() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 px-4 pb-32 pt-2 overflow-y-auto">
        {/* Hero: Pick a category — visible immediately, no scroll */}
        <section>
          <h2 className="text-lg font-extrabold text-foreground mb-1">pick a category</h2>
          <p className="text-sm text-[#85B7EB]/60 mb-3">10–40 gems per correct answer · 4x more in challenges</p>
          <CategoryCards variant="grid" />
        </section>

        {/* Streak + SAT countdown — compact row */}
        <div className="mt-4">
          <StreakBanner />
        </div>

        <div className="mt-3">
          <SatCountdown />
        </div>

        {/* Challenge Button */}
        <div className="mt-4">
          <ChallengeButton />
        </div>

        {/* Active games (if any) */}
        <section className="mt-5">
          <h2 className="text-lg font-extrabold text-foreground mb-3">your games</h2>
          <GamesList />
        </section>

        {/* Referral Banner */}
        <div className="mt-4">
          <ReferralBanner />
        </div>

        {/* Go Pro */}
        <div className="mt-4">
          <ProBanner />
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
