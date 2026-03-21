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
      
      <main className="flex-1 px-4 pb-32 pt-4 overflow-y-auto">
        <StreakBanner />

        {/* SAT Date Countdown */}
        <div className="mt-4">
          <SatCountdown />
        </div>

        {/* Referral Banner */}
        <div className="mt-4">
          <ReferralBanner />
        </div>
        
        <section className="mt-6">
          <h2 className="text-lg font-extrabold text-foreground mb-4">your games</h2>
          <GamesList />
        </section>

        {/* Challenge Button */}
        <div className="mt-6">
          <ChallengeButton />
        </div>

        {/* Practice Solo Section - Always visible */}
        <section className="mt-8">
          <h2 className="text-lg font-extrabold text-foreground mb-2">practice solo</h2>
          <p className="text-sm text-[#85B7EB]/60 mb-4">10–40 gems per correct answer · 4x more in challenges</p>
          <CategoryCards variant="grid" />
        </section>

        {/* Go Pro */}
        <div className="mt-6">
          <ProBanner />
        </div>
      </main>
      
      <BottomNav />
    </div>
  )
}
