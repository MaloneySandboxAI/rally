"use client"

import { useState, useEffect } from "react"
import { TrendingUp, Flame, Target, Swords, Calendar, BarChart3 } from "lucide-react"
import { CATEGORY_COLORS, CATEGORY_SHORT, SUBTOPIC_MAP } from "@/lib/diagnostic"
import { LEVEL_LABELS, LEVEL_COLORS, MAX_LEVEL } from "@/lib/subtopic-levels"
import { createClient } from "@/lib/supabase/client"
import type { ParentDashboardData } from "@/lib/parent-dashboard"

function LevelBar({ level }: { level: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: MAX_LEVEL }, (_, i) => (
        <div
          key={i}
          className="h-1.5 flex-1 rounded-full"
          style={{
            backgroundColor: i < level ? LEVEL_COLORS[level] : "rgba(133,183,235,0.12)",
          }}
        />
      ))}
    </div>
  )
}

export default function ParentDashboardPage({ params }: { params: { token: string } }) {
  const [data, setData] = useState<ParentDashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    async function loadDashboard() {
      try {
        const supabase = createClient()
        const { data: row, error } = await supabase
          .from("parent_tokens")
          .select("snapshot, student_name, updated_at")
          .eq("token", params.token)
          .single()

        if (error || !row) {
          setNotFound(true)
          return
        }

        if (row.snapshot) {
          setData(row.snapshot as ParentDashboardData)
        } else {
          // Token exists but no snapshot yet (student hasn't played since creating link)
          setData({
            studentName: row.student_name || "Student",
            targetScore: null,
            categoryLevels: {},
            subtopicLevels: {},
            currentStreak: 0,
            bestStreak: 0,
            totalGames: 0,
            totalCorrect: 0,
            totalQuestions: 0,
            hasUsedChallengeMode: false,
            categoryAccuracy: {},
            lastPlayed: null,
            weeklyActiveDays: 0,
          })
        }
      } catch {
        setNotFound(true)
      } finally {
        setLoading(false)
      }
    }

    loadDashboard()
  }, [params.token])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#021f3d] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#378ADD] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (notFound || !data) {
    return (
      <div className="min-h-screen bg-[#021f3d] flex flex-col items-center justify-center px-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-red-500/20 flex items-center justify-center mb-4">
          <Target className="w-8 h-8 text-red-400" />
        </div>
        <h1 className="text-xl font-extrabold text-white mb-2">link not found</h1>
        <p className="text-sm text-[#85B7EB]/50 max-w-xs">
          This parent dashboard link may have been revoked or doesn't exist. Ask your student to share a new link from their account page.
        </p>
      </div>
    )
  }

  const overallAccuracy = data.totalQuestions > 0
    ? Math.round((data.totalCorrect / data.totalQuestions) * 100)
    : null

  const lastPlayedDate = data.lastPlayed
    ? new Date(data.lastPlayed).toLocaleDateString("en-US", { month: "short", day: "numeric" })
    : "not yet"

  return (
    <div className="min-h-screen bg-[#021f3d] pb-12">
      {/* Header */}
      <header className="px-5 pt-8 pb-5">
        <p className="text-[10px] text-[#85B7EB]/30 uppercase tracking-widest mb-1">parent progress report</p>
        <h1 className="text-2xl font-extrabold text-white">{data.studentName}'s Rally</h1>
        {data.targetScore && (
          <p className="text-xs text-[#85B7EB]/50 mt-1">
            target SAT score: {data.targetScore}
          </p>
        )}
      </header>

      <main className="px-5 space-y-4">
        {/* Headline stats */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-[#0a2d4a] rounded-xl px-3 py-3 text-center">
            <Flame className="w-5 h-5 text-[#F97316] mx-auto mb-1" />
            <p className="text-lg font-extrabold text-white">{data.currentStreak}</p>
            <p className="text-[9px] text-[#85B7EB]/40">day streak</p>
          </div>
          <div className="bg-[#0a2d4a] rounded-xl px-3 py-3 text-center">
            <BarChart3 className="w-5 h-5 text-[#378ADD] mx-auto mb-1" />
            <p className="text-lg font-extrabold text-white">{overallAccuracy !== null ? `${overallAccuracy}%` : "—"}</p>
            <p className="text-[9px] text-[#85B7EB]/40">accuracy</p>
          </div>
          <div className="bg-[#0a2d4a] rounded-xl px-3 py-3 text-center">
            <Calendar className="w-5 h-5 text-[#14B8A6] mx-auto mb-1" />
            <p className="text-lg font-extrabold text-white">{data.weeklyActiveDays}</p>
            <p className="text-[9px] text-[#85B7EB]/40">days this week</p>
          </div>
        </div>

        {/* Activity overview */}
        <div className="bg-[#0a2d4a] rounded-xl px-4 py-3.5">
          <h2 className="text-xs font-bold text-[#85B7EB]/50 mb-2.5 uppercase tracking-wider">activity</h2>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-[#85B7EB]/60">total practice rounds</span>
              <span className="text-white font-bold">{data.totalGames}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#85B7EB]/60">questions answered</span>
              <span className="text-white font-bold">{data.totalQuestions}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#85B7EB]/60">best streak</span>
              <span className="text-white font-bold">{data.bestStreak} days</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#85B7EB]/60">challenge mode</span>
              <span className="text-white font-bold">{data.hasUsedChallengeMode ? "yes" : "not yet"}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#85B7EB]/60">last active</span>
              <span className="text-white font-bold">{lastPlayedDate}</span>
            </div>
          </div>
        </div>

        {/* Category levels */}
        <div>
          <h2 className="text-xs font-bold text-[#85B7EB]/50 mb-2.5 uppercase tracking-wider px-1">skill levels by category</h2>
          <div className="space-y-3">
            {Object.entries(SUBTOPIC_MAP).map(([category, subtopics]) => {
              const catColor = CATEGORY_COLORS[category] || "#378ADD"
              const catShort = CATEGORY_SHORT[category] || category
              const avgLevel = data.categoryLevels[category] || 1
              const catAcc = data.categoryAccuracy[category]
              const catPct = catAcc && catAcc.total > 0
                ? Math.round((catAcc.correct / catAcc.total) * 100)
                : null
              const subtopicData = data.subtopicLevels[category] || []

              return (
                <div key={category} className="bg-[#0a2d4a] rounded-xl px-4 py-3.5">
                  {/* Category header */}
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: catColor }} />
                      <span className="text-sm font-bold text-white">{catShort}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {catPct !== null && (
                        <span
                          className="text-[10px] font-bold"
                          style={{ color: catPct >= 70 ? "#22c55e" : catPct >= 50 ? "#f59e0b" : "#ef4444" }}
                        >
                          {catPct}% acc
                        </span>
                      )}
                      <span className="text-[10px] font-bold text-[#85B7EB]/40">
                        avg lv {avgLevel.toFixed(1)}
                      </span>
                    </div>
                  </div>

                  {/* Subtopic breakdown */}
                  <div className="space-y-2">
                    {(subtopicData.length > 0 ? subtopicData : subtopics.map(s => ({ id: s.id, label: s.label, level: 1 }))).map(sub => {
                      const levelLabel = LEVEL_LABELS[sub.level] || "beginner"
                      const levelColor = LEVEL_COLORS[sub.level] || "#85B7EB"
                      return (
                        <div key={sub.id}>
                          <div className="flex items-center justify-between mb-0.5">
                            <span className="text-xs text-[#85B7EB]/70">{sub.label}</span>
                            <span
                              className="text-[9px] font-bold"
                              style={{ color: levelColor }}
                            >
                              lv {sub.level} · {levelLabel}
                            </span>
                          </div>
                          <LevelBar level={sub.level} />
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center pt-4 pb-2">
          <p className="text-[10px] text-[#85B7EB]/25">
            Rally SAT Prep · progress updated after each practice session
          </p>
        </div>
      </main>
    </div>
  )
}
