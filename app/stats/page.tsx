"use client"

import { useEffect, useState } from "react"
import { Diamond, Flame, Target, Zap, BarChart3 } from "lucide-react"
import { loadStats, type RallyStats } from "@/lib/stats"
import Link from "next/link"

const CATEGORY_LABELS: Record<string, string> = {
  "Algebra": "Algebra",
  "Reading Comprehension": "Reading",
  "Grammar": "Grammar",
  "Data & Statistics": "Data & Stats",
}

const CATEGORY_COLORS: Record<string, string> = {
  "Algebra": "#378ADD",
  "Reading Comprehension": "#14B8A6",
  "Grammar": "#A855F7",
  "Data & Statistics": "#F97316",
}

const ALL_CATEGORIES = ["Algebra", "Reading Comprehension", "Grammar", "Data & Statistics"]

function pct(correct: number, total: number): string {
  if (total === 0) return "—"
  return Math.round((correct / total) * 100) + "%"
}

function StatCard({ label, value, sub, icon }: { label: string; value: string | number; sub?: string; icon?: React.ReactNode }) {
  return (
    <div className="bg-[#0a2d4a] rounded-2xl p-4 flex flex-col gap-1">
      <div className="flex items-center gap-2 mb-1">
        {icon && <span className="text-[#378ADD]">{icon}</span>}
        <span className="text-xs font-bold text-[#85B7EB]/60 uppercase tracking-wide">{label}</span>
      </div>
      <span className="text-3xl font-extrabold text-white">{value}</span>
      {sub && <span className="text-xs text-[#85B7EB]/50">{sub}</span>}
    </div>
  )
}

function AccuracyBar({ correct, total, color }: { correct: number; total: number; color: string }) {
  const ratio = total === 0 ? 0 : correct / total
  return (
    <div className="w-full bg-[#021f3d] rounded-full h-2 mt-2">
      <div
        className="h-2 rounded-full transition-all duration-500"
        style={{ width: `${ratio * 100}%`, backgroundColor: color }}
      />
    </div>
  )
}

export default function StatsPage() {
  const [stats, setStats] = useState<RallyStats | null>(null)

  useEffect(() => {
    setStats(loadStats())
  }, [])

  if (!stats) {
    return (
      <div className="min-h-screen bg-[#021f3d] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[#378ADD] border-t-transparent animate-spin" />
      </div>
    )
  }

  const overallAccuracy = pct(stats.totalCorrect, stats.totalQuestions)
  const hasPlayed = stats.totalGames > 0

  // Favorite category = most total questions answered
  const favCategory = ALL_CATEGORIES.reduce((best, cat) => {
    const catTotal = stats.byCategory[cat]?.total ?? 0
    const bestTotal = stats.byCategory[best]?.total ?? 0
    return catTotal > bestTotal ? cat : best
  }, ALL_CATEGORIES[0])
  const favCategoryLabel = hasPlayed && (stats.byCategory[favCategory]?.total ?? 0) > 0
    ? CATEGORY_LABELS[favCategory]
    : "—"

  return (
    <div className="min-h-screen bg-[#021f3d] pb-24">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-[#021f3d] px-5 pt-6 pb-4 border-b border-[#0a2d4a]">
        <Link href="/" className="text-[#85B7EB]/50 text-sm font-medium hover:text-[#85B7EB] transition-colors block mb-3">
          ← home
        </Link>
        <div className="flex items-center gap-3">
          <BarChart3 className="w-6 h-6 text-[#378ADD]" />
          <h1 className="text-2xl font-extrabold text-white">your stats</h1>
        </div>
      </header>

      <main className="px-5 py-6 space-y-6 max-w-lg mx-auto">

        {!hasPlayed && (
          <div className="bg-[#0a2d4a] rounded-2xl p-6 text-center">
            <p className="text-[#85B7EB] font-medium">No games played yet.</p>
            <p className="text-[#85B7EB]/60 text-sm mt-1">Complete a round to see your stats here.</p>
            <Link href="/" className="mt-4 inline-block text-[#378ADD] font-bold text-sm">
              start playing →
            </Link>
          </div>
        )}

        {/* Overview grid */}
        <section>
          <p className="text-xs font-bold text-[#85B7EB]/50 uppercase tracking-widest mb-3">overview</p>
          <div className="grid grid-cols-2 gap-3">
            <StatCard
              label="games played"
              value={stats.totalGames}
              icon={<Target className="w-4 h-4" />}
            />
            <StatCard
              label="overall accuracy"
              value={overallAccuracy}
              sub={`${stats.totalCorrect} of ${stats.totalQuestions} correct`}
              icon={<Zap className="w-4 h-4" />}
            />
            <StatCard
              label="best streak"
              value={stats.bestStreak === 0 ? "—" : `${stats.bestStreak} days`}
              icon={<Flame className="w-4 h-4" />}
            />
            <StatCard
              label="total gems"
              value={stats.totalGemsEarned}
              icon={<Diamond className="w-4 h-4 fill-[#F59E0B] text-[#F59E0B]" />}
            />
          </div>
          {hasPlayed && (
            <div className="mt-3 bg-[#0a2d4a] rounded-2xl p-4">
              <span className="text-xs font-bold text-[#85B7EB]/60 uppercase tracking-wide">favorite category</span>
              <p className="text-xl font-extrabold text-white mt-1">{favCategoryLabel}</p>
            </div>
          )}
        </section>

        {/* By category */}
        <section>
          <p className="text-xs font-bold text-[#85B7EB]/50 uppercase tracking-widest mb-3">by category</p>
          <div className="bg-[#0a2d4a] rounded-2xl divide-y divide-[#021f3d]">
            {ALL_CATEGORIES.map((cat) => {
              const s = stats.byCategory[cat] ?? { correct: 0, total: 0 }
              const color = CATEGORY_COLORS[cat]
              return (
                <div key={cat} className="px-4 py-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-sm">{CATEGORY_LABELS[cat]}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-[#85B7EB]/50">{s.total} played</span>
                      <span className="text-lg font-extrabold" style={{ color }}>{pct(s.correct, s.total)}</span>
                    </div>
                  </div>
                  <AccuracyBar correct={s.correct} total={s.total} color={color} />
                </div>
              )
            })}
          </div>
        </section>

        {/* By difficulty */}
        <section>
          <p className="text-xs font-bold text-[#85B7EB]/50 uppercase tracking-widest mb-3">by difficulty</p>
          <div className="bg-[#0a2d4a] rounded-2xl overflow-hidden">
            <div className="grid grid-cols-3 divide-x divide-[#021f3d]">
              {(["easy", "medium", "hard"] as const).map((diff) => {
                const s = stats.byDifficulty[diff] ?? { correct: 0, total: 0 }
                const colors = {
                  easy: { text: "text-green-400", bar: "#22c55e" },
                  medium: { text: "text-amber-400", bar: "#f59e0b" },
                  hard: { text: "text-red-400", bar: "#ef4444" },
                }
                return (
                  <div key={diff} className="p-4 text-center">
                    <p className={`text-2xl font-extrabold ${colors[diff].text}`}>{pct(s.correct, s.total)}</p>
                    <p className="text-xs text-[#85B7EB]/60 mt-0.5 capitalize">{diff}</p>
                    <p className="text-xs text-[#85B7EB]/40 mt-0.5">{s.total} qs</p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

      </main>
    </div>
  )
}
