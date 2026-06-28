"use client"

import { useState, useEffect } from "react"
import { Check, X, ChevronRight, Diamond, Sparkles, BookOpen, ChevronDown, Swords, RotateCcw, TrendingUp, Copy } from "lucide-react"
import { useGems, GEM_VALUES } from "@/lib/gem-context"
import { createClient } from "@/lib/supabase/client"
import { type Question } from "@/lib/questions"
import { getDetailedExplanation } from "@/lib/explanations"
import { getChallenge } from "@/lib/challenges"
import { MathText } from "./math-text"
import { RematchButton } from "./rematch-button"

interface AnswerResult {
  questionIndex: number
  isCorrect: boolean
  difficulty: string
  wasSpeedBonus: boolean
  gemsEarned: number
  chosenAnswerIndex: number | null
}

const DIFFICULTY_COLORS = {
  easy: { bg: "bg-green-500/20", text: "text-green-400", border: "border-green-500/40" },
  medium: { bg: "bg-amber-500/20", text: "text-amber-400", border: "border-amber-500/40" },
  hard: { bg: "bg-red-500/20", text: "text-red-400", border: "border-red-500/40" },
}

function letterToIndex(letter: string): number {
  return letter.charCodeAt(0) - 'A'.charCodeAt(0)
}

function getEncouragementMessage(score: number, isChallenge: boolean): string {
  if (isChallenge) {
    if (score === 5) return "Perfect score! Let’s see if they can match it"
    if (score === 4) return "Strong round! Hard to beat that"
    if (score === 3) return "Solid effort — could go either way"
    return "Tough round — anything can happen"
  }
  if (score === 5) return "Flawless! You nailed every question"
  if (score === 4) return "Really strong round!"
  if (score === 3) return "Not bad! Room to improve"
  return "Tough round. Keep practicing!"
}

export interface ResultsScreenProps {
  score: number
  isChallenge: boolean
  isCreatorChallenge: boolean
  challengeCode: string | null
  creatorChallengeCode: string | null
  categoryId: string
  categoryName: string
  onPlayAgain: () => void
  answerResults: AnswerResult[]
  sessionQuestions: Question[]
  creatorScore: number | null
  isUntimed?: boolean
  gemsCapped?: boolean
}

export function ResultsScreen({ score, isChallenge, isCreatorChallenge, challengeCode, creatorChallengeCode, categoryId, categoryName, onPlayAgain, answerResults, sessionQuestions, creatorScore, isUntimed, gemsCapped }: ResultsScreenProps) {
  const { totalGems } = useGems()
  const [isGuest, setIsGuest] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [opponentName, setOpponentName] = useState<string | null>(null)
  const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set())
  const [copiedPromptIdx, setCopiedPromptIdx] = useState<number | null>(null)

  const toggleExpanded = (idx: number) => {
    setExpandedCards(prev => {
      const next = new Set(prev)
      if (next.has(idx)) next.delete(idx)
      else next.add(idx)
      return next
    })
  }

  const wrongAnswers = answerResults
    .map((r, i) => ({ ...r, question: sessionQuestions[i] }))
    .filter(r => !r.isCorrect && r.question)

  useEffect(() => {
    if (wrongAnswers.length > 0) {
      setShowReviewModal(true)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setIsGuest(localStorage.getItem("rally_is_guest") === "true")
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session)

      const activeCode = challengeCode || creatorChallengeCode
      if (activeCode && session?.user) {
        getChallenge(activeCode).then(c => {
          if (!c) return
          const isCreator = c.creator_id === session.user.id
          setOpponentName(isCreator ? (c.challenger_name || "friend") : c.creator_name)
        })
      }
    })
  }, [])

  const correctCount = answerResults.filter(r => r.isCorrect).length
  const speedBonusCount = answerResults.filter(r => r.isCorrect && r.wasSpeedBonus).length
  const answerGems = answerResults.reduce((sum, r) => sum + r.gemsEarned, 0)

  const breakdown: { label: string; amount: number }[] = []
  const gemMode = isChallenge ? GEM_VALUES.challenge : GEM_VALUES.solo
  const diffGroups = { easy: [] as AnswerResult[], medium: [] as AnswerResult[], hard: [] as AnswerResult[] }
  for (const r of answerResults.filter(r => r.isCorrect)) {
    const d = (r.difficulty || "easy") as keyof typeof diffGroups
    if (diffGroups[d]) diffGroups[d].push(r)
  }
  let speedBonusExtra = 0
  for (const [diff, results] of Object.entries(diffGroups)) {
    if (results.length > 0) {
      const baseRate = gemMode[diff as keyof typeof gemMode] ?? gemMode.easy
      const baseGems = results.length * baseRate
      const actualGems = results.reduce((sum, r) => sum + r.gemsEarned, 0)
      speedBonusExtra += actualGems - baseGems
      breakdown.push({
        label: `${results.length} ${diff} correct${isChallenge ? " (4x)" : ""}`,
        amount: baseGems,
      })
    }
  }
  if (speedBonusCount > 0 && speedBonusExtra > 0) {
    breakdown.push({
      label: `${speedBonusCount} speed bonus${speedBonusCount > 1 ? "es" : ""}`,
      amount: speedBonusExtra,
    })
  }
  let outcomeBonus = 0
  let outcomeLabel = ""
  if (isChallenge && creatorScore !== null && creatorScore >= 0) {
    if (answerGems > creatorScore) {
      outcomeBonus = GEM_VALUES.challengeOutcome.win
      outcomeLabel = "challenge won!"
    } else if (answerGems < creatorScore) {
      outcomeBonus = GEM_VALUES.challengeOutcome.loss
      outcomeLabel = "challenge participation"
    } else {
      outcomeBonus = GEM_VALUES.challengeOutcome.tie
      outcomeLabel = "challenge tied"
    }
    breakdown.push({ label: outcomeLabel, amount: outcomeBonus })
  }
  if (correctCount === 0 && outcomeBonus === 0) {
    breakdown.push({ label: "no correct answers", amount: 0 })
  }
  const gemsEarned = answerGems + outcomeBonus

  return (
    <div className="min-h-[100dvh] bg-[#021f3d] flex flex-col items-center px-4 pt-6 pb-4">
      {/* Score + Answer Pips */}
      <div className="text-center mb-3">
        <div className={`flex items-center justify-center gap-2.5 mb-3 ${isUntimed ? "flex-wrap gap-1.5" : ""}`}>
          {(isUntimed && answerResults.length > 10 ? answerResults.slice(-10) : answerResults).map((result, index) => {
            const diffColor = result.difficulty === "hard" ? "#EF4444" : result.difficulty === "medium" ? "#F59E0B" : "#22C55E"
            return (
              <div key={index} className={`flex flex-col items-center gap-1 ${isUntimed ? "scale-75" : ""}`}>
                <div className={`w-9 h-9 rounded-full flex items-center justify-center ${result.isCorrect ? "bg-green-500" : "bg-red-500"}`}>
                  {result.isCorrect ? <Check className="w-4 h-4 text-white" strokeWidth={3} /> : <X className="w-4 h-4 text-white" strokeWidth={3} />}
                </div>
                <span className="text-[9px] font-bold" style={{ color: diffColor }}>{result.difficulty}</span>
              </div>
            )
          })}
          {isUntimed && answerResults.length > 10 && (
            <span className="text-xs text-[#85B7EB]/40">+{answerResults.length - 10} more</span>
          )}
        </div>

        <h1 className="text-4xl font-extrabold text-white leading-none">{correctCount}/{answerResults.length}</h1>
        <p className="text-[#85B7EB] text-base font-semibold mt-0.5">{categoryName}{isUntimed ? " — practice" : ""}</p>
        <p className="text-[#85B7EB]/70 text-sm mt-1.5 max-w-[280px] mx-auto leading-snug">
          {isUntimed
            ? (correctCount === answerResults.length ? "Perfect practice session!" : `${correctCount} correct out of ${answerResults.length} questions`)
            : getEncouragementMessage(correctCount, isChallenge || isCreatorChallenge)}
        </p>
      </div>

      {/* Guest save-progress banner */}
      {isGuest && (
        <div className="w-full max-w-sm mb-3 bg-[#0a2d4a] border border-[#378ADD]/40 rounded-xl px-4 py-2.5 flex items-center justify-between gap-2">
          <p className="text-[#85B7EB] text-xs font-medium leading-snug flex-1">save your progress — create a free account</p>
          <a href="/login" className="bg-[#378ADD] text-white text-xs font-bold rounded-lg px-3 py-1.5 whitespace-nowrap">sign up</a>
        </div>
      )}

      {/* Gems Earned */}
      <div className="w-full max-w-sm mb-3 bg-gradient-to-r from-[#F59E0B]/15 to-[#F97316]/15 border border-[#F59E0B]/30 rounded-xl p-3.5">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <Diamond className="w-5 h-5 text-[#F59E0B] fill-[#F59E0B]" />
            <span className="text-xl font-extrabold text-white">+{gemsEarned}</span>
          </div>
          <span className="text-xs text-[#85B7EB]/50">total: {totalGems}</span>
        </div>
        <div className="space-y-0.5">
          {breakdown.map((item, index) => (
            <div key={index} className="flex justify-between text-xs">
              <span className="text-[#85B7EB]/70">{item.label}</span>
              <span className="text-[#F59E0B] font-semibold">+{item.amount}</span>
            </div>
          ))}
        </div>
        {gemsCapped && !isChallenge && (
          <div className="text-xs text-[#EF9F27] mt-2 text-center">
            ⭐ you've earned today's max gems — keep playing for streak + practice
          </div>
        )}
      </div>

      {/* Streak + Difficulty Reached + Weak Spot Nudge */}
      <div className="w-full max-w-sm mb-3 space-y-2">
        {(() => {
          const streak = typeof window !== "undefined" ? parseInt(localStorage.getItem("rally_streak") || "0", 10) : 0
          if (streak > 0) {
            return (
              <div className="flex items-center gap-2 bg-[#EF9F27]/10 border border-[#EF9F27]/25 rounded-xl px-3.5 py-2.5">
                <BookOpen className="w-5 h-5 text-[#EF9F27]" />
                <span className="text-sm font-bold text-[#EF9F27]">Day {streak} streak</span>
                {streak >= 7 && <span className="text-xs text-[#EF9F27]/60 ml-auto">keep it going!</span>}
              </div>
            )
          }
          return null
        })()}

        {(() => {
          const hardCorrect = answerResults.filter(r => r.difficulty === "hard" && r.isCorrect).length
          const medCount = answerResults.filter(r => r.difficulty === "medium").length
          if (hardCorrect > 0) {
            return (
              <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/25 rounded-xl px-3.5 py-2.5">
                <TrendingUp className="w-5 h-5 text-red-400" />
                <span className="text-sm font-bold text-red-400">You nailed {hardCorrect} hard question{hardCorrect > 1 ? "s" : ""}!</span>
              </div>
            )
          } else if (medCount > 0) {
            const medCorrect = answerResults.filter(r => r.difficulty === "medium" && r.isCorrect).length
            if (medCorrect > 0) {
              return (
                <div className="flex items-center gap-2 bg-[#F59E0B]/10 border border-[#F59E0B]/25 rounded-xl px-3.5 py-2.5">
                  <TrendingUp className="w-5 h-5 text-[#F59E0B]" />
                  <span className="text-sm font-bold text-[#F59E0B]">Reached medium difficulty!</span>
                </div>
              )
            }
          }
          return null
        })()}

        {(() => {
          if (typeof window === "undefined") return null
          try {
            const raw = localStorage.getItem("rally_stats")
            if (!raw) return null
            const stats = JSON.parse(raw)
            const cats = stats.byCategory as Record<string, { correct: number; total: number }> | undefined
            if (!cats) return null
            let weakest = ""
            let weakestAcc = 100
            for (const [cat, data] of Object.entries(cats)) {
              if (data.total >= 10 && cat !== categoryId) {
                const acc = Math.round((data.correct / data.total) * 100)
                if (acc < weakestAcc) { weakestAcc = acc; weakest = cat }
              }
            }
            if (weakest && weakestAcc < 70) {
              return (
                <a
                  href={`/play?category=${encodeURIComponent(weakest)}`}
                  className="flex items-center gap-2 bg-[#378ADD]/10 border border-[#378ADD]/25 rounded-xl px-3.5 py-2.5 active:scale-[0.98] transition-transform"
                >
                  <Sparkles className="w-5 h-5 text-[#378ADD]" />
                  <span className="text-sm text-[#85B7EB] flex-1">
                    Your weak spot: <span className="font-bold text-white">{weakest}</span> ({weakestAcc}%)
                  </span>
                  <ChevronRight className="w-4 h-4 text-[#378ADD]" />
                </a>
              )
            }
          } catch {}
          return null
        })()}
      </div>

      {/* Action buttons */}
      <div className="w-full max-w-sm space-y-2.5 mb-3">
        {isCreatorChallenge && creatorChallengeCode ? (
          <div className="bg-[#0a2d4a] border border-[#378ADD]/40 rounded-xl p-4">
            <div className="flex items-center justify-center gap-2 mb-1.5">
              <Swords className="w-4 h-4 text-[#378ADD]" />
              <p className="text-white font-bold text-sm">score locked in!</p>
            </div>
            <p className="text-[#85B7EB]/60 text-xs text-center mb-3">waiting for your friend to play</p>
            <a href={`/challenge/${creatorChallengeCode}`} className="w-full bg-[#378ADD] text-white rounded-lg py-3 font-bold text-sm flex items-center justify-center gap-2 active:scale-[0.98]">
              <Swords className="w-4 h-4" /> show results
            </a>
          </div>
        ) : challengeCode ? (
          <>
            <a href={`/challenge/${challengeCode}`} className="w-full bg-[#378ADD] text-white rounded-xl py-3.5 px-5 flex items-center justify-center gap-2 font-extrabold text-base shadow-lg shadow-[#378ADD]/30 active:scale-[0.98]">
              <Swords className="w-4 h-4" /> see head-to-head results
            </a>
            {opponentName && (
              <RematchButton category={categoryId} opponentName={opponentName} />
            )}
          </>
        ) : null}

        <div className="flex gap-2">
          <button onClick={onPlayAgain} className="flex-1 bg-transparent border-2 border-[#378ADD] text-[#378ADD] rounded-xl py-3 flex items-center justify-center gap-1.5 font-bold text-sm active:scale-[0.98]">
            <RotateCcw className="w-4 h-4" strokeWidth={2.5} />
            {isUntimed ? "practice more" : "play again"}
          </button>
          <a href={isUntimed ? `/skills?category=${encodeURIComponent(categoryId)}` : "/home"} className="flex-1 bg-[#0a2d4a] text-[#85B7EB] rounded-xl py-3 flex items-center justify-center gap-1.5 font-bold text-sm active:scale-[0.98]">
            {isUntimed ? "back to skills" : "home"}
          </a>
        </div>
      </div>

      {/* Review Wrong Answers Modal */}
      {showReviewModal && wrongAnswers.length > 0 && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-end sm:items-center justify-center">
          <div className="bg-[#0a2d4a] w-full max-w-md max-h-[85vh] rounded-t-3xl sm:rounded-3xl flex flex-col animate-in slide-in-from-bottom duration-300">
            <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-[#85B7EB]/20">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#378ADD]" />
                <h2 className="text-lg font-extrabold text-white">review mistakes</h2>
              </div>
              <span className="text-sm text-[#85B7EB]/60">{wrongAnswers.length} to review</span>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              {wrongAnswers.map((item, idx) => {
                const q = item.question
                const correctIdx = letterToIndex(q.correct)
                const options = [q.option_a, q.option_b, q.option_c, q.option_d]
                const diffColors = DIFFICULTY_COLORS[q.difficulty as keyof typeof DIFFICULTY_COLORS] || DIFFICULTY_COLORS.medium
                const isExpanded = expandedCards.has(idx)
                const detailed = isExpanded ? getDetailedExplanation(q) : null
                return (
                  <div key={idx} className="bg-[#021f3d] rounded-2xl p-4 border border-[#85B7EB]/10">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${diffColors.bg} ${diffColors.text}`}>{q.difficulty}</span>
                    <p className="text-white font-semibold text-sm mt-2 mb-3 leading-relaxed"><MathText text={q.question} /></p>
                    {item.chosenAnswerIndex !== null ? (
                      <div className="flex items-center gap-2 bg-red-500/15 border border-red-500/30 rounded-xl px-3 py-2 mb-2">
                        <X className="w-4 h-4 text-red-400 flex-shrink-0" strokeWidth={3} />
                        <span className="text-red-400 text-sm font-semibold">your answer: {String.fromCharCode(65 + item.chosenAnswerIndex)}) <MathText text={options[item.chosenAnswerIndex]} /></span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 bg-red-500/15 border border-red-500/30 rounded-xl px-3 py-2 mb-2">
                        <X className="w-4 h-4 text-red-400 flex-shrink-0" strokeWidth={3} />
                        <span className="text-red-400 text-sm font-semibold italic">time ran out — no answer given</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 bg-green-500/15 border border-green-500/30 rounded-xl px-3 py-2 mb-3">
                      <Check className="w-4 h-4 text-green-400 flex-shrink-0" strokeWidth={3} />
                      <span className="text-green-400 text-sm font-semibold">{q.correct}) <MathText text={options[correctIdx]} /></span>
                    </div>
                    <p className="text-[#85B7EB]/80 text-sm leading-relaxed"><MathText text={q.explanation} /></p>

                    <button onClick={() => toggleExpanded(idx)} className="mt-3 flex items-center gap-1.5 text-[#378ADD] text-sm font-bold transition-all hover:brightness-125">
                      <BookOpen className="w-4 h-4" />
                      {isExpanded ? "hide details" : "learn more"}
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                    </button>

                    {isExpanded && detailed && (
                      <div className="mt-3 space-y-3 animate-in fade-in slide-in-from-top-1 duration-200">
                        <div className="bg-[#378ADD]/10 border border-[#378ADD]/20 rounded-xl px-3 py-2.5">
                          <p className="text-xs font-bold text-[#378ADD] uppercase tracking-wide mb-1">{detailed.concept}</p>
                          <p className="text-[#85B7EB] text-sm leading-relaxed"><MathText text={detailed.approach} /></p>
                        </div>
                        <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2.5">
                          <p className="text-xs font-bold text-red-400 uppercase tracking-wide mb-1">where students go wrong</p>
                          <p className="text-red-300/80 text-sm leading-relaxed"><MathText text={detailed.commonMistake} /></p>
                        </div>
                        <div className="bg-[#EF9F27]/10 border border-[#EF9F27]/20 rounded-xl px-3 py-2.5">
                          <p className="text-xs font-bold text-[#EF9F27] uppercase tracking-wide mb-1">remember this</p>
                          <p className="text-[#EF9F27]/80 text-sm leading-relaxed"><MathText text={detailed.takeaway} /></p>
                        </div>

                        <button
                          onClick={() => {
                            const userAnswer = item.chosenAnswerIndex !== null
                              ? `${String.fromCharCode(65 + item.chosenAnswerIndex)}) ${options[item.chosenAnswerIndex]}`
                              : "I ran out of time"
                            const prompt = `I'm studying for the SAT and got this question wrong. Can you explain it step by step like I'm in high school?\n\nQuestion: ${q.question}\n\nA) ${q.option_a}\nB) ${q.option_b}\nC) ${q.option_c}\nD) ${q.option_d}\n\nCorrect answer: ${q.correct}) ${options[correctIdx]}\nMy answer: ${userAnswer}\n\nPlease explain:\n1. Why the correct answer is right\n2. Why my answer was wrong\n3. How to recognize this type of problem in the future`
                            navigator.clipboard.writeText(prompt)
                            setCopiedPromptIdx(idx)
                            setTimeout(() => setCopiedPromptIdx(null), 2000)
                          }}
                          className="w-full mt-2 bg-purple-500/15 border border-purple-500/30 rounded-xl px-3 py-2.5 flex items-center justify-center gap-2 transition-all hover:bg-purple-500/25 active:scale-[0.98]"
                        >
                          {copiedPromptIdx === idx ? (
                            <>
                              <Check className="w-4 h-4 text-green-400" strokeWidth={3} />
                              <span className="text-green-400 text-sm font-bold">copied! paste into your favorite AI tool</span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-4 h-4 text-purple-400" />
                              <span className="text-purple-400 text-sm font-bold">still don&apos;t get it? copy AI prompt</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            <div className="px-5 pb-5 pt-3 border-t border-[#85B7EB]/20">
              <button onClick={() => setShowReviewModal(false)} className="w-full bg-[#378ADD] text-white rounded-2xl py-3.5 font-extrabold text-base transition-all active:scale-[0.98] hover:brightness-110">
                got it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
