import { ChevronLeft } from "lucide-react"
import Link from "next/link"
import { GamesList } from "@/components/rally/games-list"
import { BottomNav } from "@/components/rally/bottom-nav"

export default function GamesPage() {
  return (
    <div className="min-h-screen bg-[#021f3d] flex flex-col">
      <header className="flex-shrink-0 px-5 pt-6 pb-4 border-b border-[#0a2d4a]">
        <Link href="/home" className="text-[#85B7EB]/50 text-sm font-medium hover:text-[#85B7EB] transition-colors inline-flex items-center gap-1 mb-3">
          <ChevronLeft className="w-4 h-4" /> home
        </Link>
        <h1 className="text-xl font-extrabold text-white">your games</h1>
        <p className="text-xs text-[#85B7EB]/60 mt-0.5">active challenges and results</p>
      </header>

      <main className="flex-1 px-4 py-4 pb-24 overflow-y-auto">
        <GamesList />
      </main>

      <BottomNav />
    </div>
  )
}
