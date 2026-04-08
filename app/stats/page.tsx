"use client"

import { useEffect, useState } from "react"
import { Diamond, Flame, Target, Zap, BarChart3, TrendingUp, TrendingDown, Minus, ChevronRight, Lock } from "lucide-react"
import { loadStats, getAdaptiveDifficulty, type RallyStats, type CategoryDetail } from "@/lib/stats"
import { hasStatsDeepDive, GEM_ECONOMY } from "@/lib/gem-context"
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

function pct(correct: number, total: number): number {
  if (total === 0) return 0
  return Math.round((correct / total) * 100)
}

function pctStr(correct: number, total: number): string {
  if (total === 0) return "—"
  return pct(correct, total) + "%"
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

function getTrend(categoryId: string): { label: string; icon: React.ReactNode; color: string } | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem("rally_round_history")
    if (!raw) return null
    const history = JSON.parse(raw) as Record<string, number[]>
    const values = history[categoryId]
    if (!values || values.length < 4) return null

    const mid = Math.floor(values.length / 2)
    const recent = values.slice(mid)
    const older = values.slice(0, mid)
    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length
    const olderAvg = older.reduce((a, b) => a + b, 0) / older.length
    const diff = recentAvg - olderAvg

    if (diff > 5) return { label: "Improving", icon: <TrendingUp className="w-3.5 h-3.5" />, color: "#22C55E" }
    if (diff < -5) return { label: "Needs work", icon: <TrendingDown className="w-3.5 h-3.5" />, color: "#EF4444" }
    return { label: "Steady", icon: <Minus className="w-3.5 h-3.5" />, color: "#F59E0B" }
  } catch {
    return null
  }
}

export default function StatsPage() {
  const [stats, setStats] = useState<RallyStats | null>(null)
  const [headline, setHeadline] = useState<string | null>(null)
  const [deepDiveUnlocked, setDeepDiveUnlocked] = useState(false)

  useEffect(() => {
    setDeepDiveUnlocked(hasStatsDeepDive())
    const s = loadStats()
    setStats(s)

    // Generate headline stat
    if (s.totalGames > 0) {
      let bestImprovement = ""
      let bestDiff = 0
      for (const cat of ALL_CATEGORIES) {
        const trend = getTrend(cat)
        if (trend && trend.label === "Improving") {
          const raw = localStorage.getItem("rally_round_history")
          if (raw) {
            const history = JSON.parse(raw) as Record<string, number[]>
            const vals = history[cat]
            if (vals && vals.length >= 4) {
              const mid = Math.floor(vals.length / 2)
              const recent = vals.slice(mid)
              const older = vals.slice(0, mid)
              const diff = (recent.reduce((a, b) => a + b, 0) / recent.length) - (older.reduce((a, b) => a + b, 0) / older.length)
              if (diff > bestDiff) {
                bestDiff = diff
                bestImprovement = CATEGORY_LABELS[cat]
              }
            }
          }
        }
      }
      if (bestImprovement && bestDiff > 0) {
        setHeadline(`You've improved ${Math.round(bestDiff)}% in ${bestImprovement} recently`)
      }
    }
  }, [])

  if (!stats) {
    return (
      <div className="min-h-screen bg-[#021f3d] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[#378ADD] border-t-transparent animate-spin" />
      </div>
    )
  }

  const overallAccuracy = pctStr(stats.totalCorrect, stats.totalQuestions)
  const hasPlayed = stats.totalGames > 0

  return (
    <div className="min-h-screen bg-[#021f3d] pb-24">
      <header className="sticky top-0 z-10 bg-[#021f3d] px-5 pt-6 pb-4 border-b border-[#0a2d4a]">
        <Link href="/" className="text-[#85B7EB]/50 text-sm font-medium hover:text-[#85B7EB] transition-colors block mb-3">
          ← home
        </Link>
        <div className="flex items-center gap-3">
          <BarChart3 className="w-6 h-6 text-[#378ADD]" />
          <h1 className="text-2xl font-extrabold text-white">your progress</h1>
        </div>
      </header>

      <main className="px-5 py-6 space-y-6 max-w-lg mx-auto">

        {!hasPlayed && (
          <div className="bg-[#0a2d4a] rounded-2xl p-6 text-center">
            <p className="text-[#85B7EB] font-medium">No games played yet.</p>
            <p className="text-[#85B7EB]/60 text-sm mt-1">Complete a round to see your progress here.</p>
            <Link href="/" className="mt-4 inline-block text-[#378ADD] font-bold text-sm">
              start playing →
            </Link>
          </div>
        )}

        {/* Headline improvement stat — deep dive only */}
        {deepDiveUnlocked && headline && (
          <div className="bg-gradient-to-r from-[#378ADD]/15 to-[#14B8A6]/15 border border-[#378ADD]/30 rounded-2xl px-4 py-3.5">
            <p className="text-white font-bold text-sm">{headline}</p>
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
        </section>

        {/* Progress by category — enhanced cards */}
        <section>
          <p className="text-xs font-bold text-[#85B7EB]/50 uppercase tracking-widest mb-3">by category</p>
          <div className="space-y-3">
            {ALL_CATEGORIES.map((cat) => {
              const s = stats.byCategory[cat] ?? { correct: 0, total: 0 }
              const catDetail: CategoryDetail | undefined = stats.byCategoryDifficulty?.[cat]
              const color = CATEGORY_COLORS[cat]
              const accuracy = pct(s.correct, s.total)
              const diffLevel = getAdaptiveDifficulty(cat) || "easy"
              const trend = getTrend(cat)

              const DIFF_COLORS = {
                easy: { text: "text-green-400", bg: "rgba(34,197,94,0.12)", label: "#22C55E" },
                medium: { text: "text-amber-400", bg: "rgba(245,158,11,0.12)", label: "#F59E0B" },
                hard: { text: "text-red-400", bg: "rgba(239,68,68,0.12)", label: "#EF4444" },
              }

              return (
                <div key={cat} className="bg-[#0a2d4a] rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-white text-sm">{CATEGORY_LABELS[cat]}</span>
                    <span className="text-2xl font-extrabold" style={{ color }}>
                      {s.total === 0 ? "—" : `${accuracy}%`}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs text-[#85B7EB]/50">{s.total} questions</span>
                    <span className="text-xs font-semibold px-1.5 py-0.5 rounded-md" style={{
                      backgroundColor: diffLevel === "hard" ? "rgba(239,68,68,0.15)" : diffLevel === "medium" ? "rgba(245,158,11,0.15)" : "rgba(34,197,94,0.15)",
                      color: diffLevel === "hard" ? "#EF4444" : diffLevel === "medium" ? "#F59E0B" : "#22C55E"
                    }}>
                      {diffLevel}
                    </span>
                    {deepDiveUnlocked && trend && (
                      <span className="flex items-center gap-1 text-xs font-semibold" style={{ color: trend.color }}>
                        {trend.icon}
                        {trend.label}
                      </span>
                    )}
                  </div>

                  <AccuracyBar correct={s.correct} total={s.total} color={color} />

                  {/* Per-difficulty breakdown within this category — deep dive only */}
                  {deepDiveUnlocked && catDetail && catDetail.total > 0 && (
                    <div className="grid grid-cols-3 gap-2 mt-3">
                      {(["easy", "medium", "hard"] as const).map((diff) => {
                        const d = catDetail.byDifficulty?.[diff] ?? { correct: 0, total: 0 }
                        const c = DIFF_COLORS[diff]
                        return (
                          <div key={diff} className="rounded-lg px-2 py-2 text-center" style={{ backgroundColor: c.bg }}>
                            <p className={`text-sm font-extrabold ${c.text}`}>
                              {d.total === 0 ? "—" : pctStr(d.correct, d.total)}
                            </p>
                            <p className="text-[10px] capitalize" style={{ color: c.label, opacity: 0.7 }}>{diff}</p>
                            {d.total > 0 && (
                              <p className="text-[10px] text-[#85B7EB]/40">{d.correct}/{d.total}</p>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {/* Drill weak spot link */}
                  {s.total >= 10 && accuracy < 60 && (
                    <a
                      href={`/play?category=${encodeURIComponent(cat)}`}
                      className="mt-3 flex items-center gap-2 text-[#378ADD] text-xs font-bold"
                    >
                      Drill this category
                      <ChevronRight className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              )
            })}
          </div>
        </section>

        {/* By difficulty — deep dive only */}
        {deepDiveUnlocked ? (
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
                      <p className={`text-2xl font-extrabold ${colors[diff].text}`}>{pctStr(s.correct, s.total)}</p>
                      <p className="text-xs text-[#85B7EB]/60 mt-0.5 capitalize">{diff}</p>
                      <p className="text-xs text-[#85B7EB]/40 mt-0.5">{s.total} qs</p>
                    </div>
                  )
                })}
              </div>
            </div>
          </section>
        ) : (
          <section>
            <Link href="/store" className="block bg-[#0a2d4a] rounded-2xl p-5 border border-purple-500/20 active:scale-[0.98] transition-transform">
              <div className="flex items-center gap-3 mb-2">
                <Lock className="w-5 h-5 text-purple-400" />
                <p className="text-white font-bold text-sm">unlock stats deep dive</p>
              </div>
              <p className="text-[#85B7EB]/50 text-xs leading-relaxed mb-3">
                see per-difficulty breakdowns, trend analysis, and detailed insights for every category.
              </p>
              <div className="flex items-center gap-1.5">
                <Diamond className="w-3.5 h-3.5 text-[#EF9F27] fill-[#EF9F27]" />
                <span className="text-[#EF9F27] font-bold text-sm">{GEM_ECONOMY.statsDeepDiveCost} gems</span>
                <span className="text-[#85B7EB]/40 text-xs ml-1">· one-time unlock</span>
              </div>
            </Link>
          </section>
        )}

      </main>
    </div>
  )
}
