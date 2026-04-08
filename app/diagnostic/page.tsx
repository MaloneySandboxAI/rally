"use client"

import { useState, useCallback, useEffect } from "react"
import { Check, X, ChevronRight, Stethoscope, Target, RotateCcw, Home, BookOpen } from "lucide-react"
import { getDiagnosticQuestions, type Question } from "@/lib/questions"
import { WorkArea, WorkAreaButton } from "@/components/rally/work-area"
import {
  ALL_SUBTOPICS,
  SUBTOPIC_MAP,
  CATEGORY_COLORS,
  CATEGORY_SHORT,
  saveDiagnosticResult,
  scoreDiagnostic,
  type DiagnosticAnswer,
  type SubtopicScore,
} from "@/lib/diagnostic"
import { Spinner } from "@/components/ui/spinner"
import Link from "next/link"

function letterToIndex(letter: string): number {
  return { A: 0, B: 1, C: 2, D: 3 }[letter.toUpperCase()] ?? -1
}

export default function DiagnosticPage() {
  const [phase, setPhase] = useState<"intro" | "test" | "results">("intro")
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentIdx, setCurrentIdx] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [answers, setAnswers] = useState<DiagnosticAnswer[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showWorkArea, setShowWorkArea] = useState(false)

  const startTest = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const qs = await getDiagnosticQuestions(ALL_SUBTOPICS)
      if (qs.length === 0) {
        setError("No diagnostic questions available yet. Please run the subtopics migration first.")
        setIsLoading(false)
        return
      }
      setQuestions(qs)
      setCurrentIdx(0)
      setSelectedAnswer(null)
      setAnswers([])
      setPhase("test")
    } catch {
      setError("Couldn't load questions. Check your connection and try again.")
    } finally {
      setIsLoading(false)
    }
  }, [])

  const question = questions[currentIdx]
  const correctIdx = question ? letterToIndex(question.correct) : -1
  const options = question ? [question.option_a, question.option_b, question.option_c, question.option_d] : []

  const handleSelect = (idx: number) => {
    if (selectedAnswer !== null) return
    setSelectedAnswer(idx)

    const isCorrect = idx === correctIdx
    setAnswers(prev => [...prev, {
      category: question.category,
      subtopic: question.subtopic || "unknown",
      questionId: question.id,
      isCorrect,
    }])
  }

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(prev => prev + 1)
      setSelectedAnswer(null)
    } else {
      // Save results and show them
      const result = {
        date: new Date().toISOString(),
        answers: [...answers],
      }
      saveDiagnosticResult(result)
      setPhase("results")
    }
  }

  // Intro screen
  if (phase === "intro") {
    return (
      <div className="min-h-[100dvh] bg-[#021f3d] flex flex-col items-center justify-center px-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-[#378ADD]/20 flex items-center justify-center mb-6">
          <Stethoscope className="w-8 h-8 text-[#378ADD]" />
        </div>
        <h1 className="text-2xl font-extrabold text-white mb-2">diagnostic test</h1>
        <p className="text-[#85B7EB]/60 text-sm mb-1 max-w-xs">
          {ALL_SUBTOPICS.length} questions across all SAT topics
        </p>
        <p className="text-[#85B7EB]/40 text-xs mb-8 max-w-xs">
          No timer, no gems — just find your weak spots so you know what to practice.
        </p>

        <div className="w-full max-w-xs space-y-2 mb-8">
          {Object.entries(SUBTOPIC_MAP).map(([category, subtopics]) => (
            <div key={category} className="flex items-center gap-2 text-left">
              <div
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: CATEGORY_COLORS[category] }}
              />
              <span className="text-xs text-[#85B7EB]/60">
                <span className="text-white font-semibold">{CATEGORY_SHORT[category]}</span>
                {" · "}{subtopics.length} topics
              </span>
            </div>
          ))}
        </div>

        {error && (
          <p className="text-red-400 text-sm mb-4">{error}</p>
        )}

        <button
          onClick={startTest}
          disabled={isLoading}
          className="bg-[#378ADD] text-white rounded-2xl py-3.5 px-8 font-extrabold text-base active:scale-[0.98] disabled:opacity-50 flex items-center gap-2"
        >
          {isLoading ? <Spinner className="w-5 h-5" /> : <Target className="w-5 h-5" />}
          {isLoading ? "loading..." : "start diagnostic"}
        </button>

        <Link href="/" className="text-[#85B7EB]/40 text-sm mt-4 hover:text-[#85B7EB]/60">
          back to home
        </Link>
      </div>
    )
  }

  // Test screen
  if (phase === "test" && question) {
    const categoryColor = CATEGORY_COLORS[question.category] || "#378ADD"
    const subtopicLabel = SUBTOPIC_MAP[question.category]?.find(s => s.id === question.subtopic)?.label || question.subtopic

    return (
      <div className="h-[100dvh] bg-[#021f3d] flex flex-col overflow-hidden">
        {/* Header */}
        <header className="flex-shrink-0 bg-[#021f3d] px-4 pt-3 pb-2">
          <div className="flex items-center justify-between mb-2">
            <WorkAreaButton onClick={() => setShowWorkArea(true)} />
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: categoryColor + "30", color: categoryColor }}>
                {CATEGORY_SHORT[question.category]}
              </span>
              <span className="text-[10px] text-[#85B7EB]/40">{subtopicLabel}</span>
            </div>
            <span className="text-xs font-bold text-[#85B7EB]/60">{currentIdx + 1}/{questions.length}</span>
          </div>
          {/* Progress bar */}
          <div className="flex gap-1">
            {questions.map((_, i) => (
              <div
                key={i}
                className="h-1 flex-1 rounded-full transition-all duration-300"
                style={{
                  backgroundColor: i < currentIdx ? (answers[i]?.isCorrect ? "#22c55e" : "#ef4444")
                    : i === currentIdx ? categoryColor
                    : "#0a2d4a"
                }}
              />
            ))}
          </div>
        </header>

        {/* Question */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          <p className="text-white font-bold text-base leading-relaxed mb-6">{question.question}</p>

          <div className="space-y-2.5">
            {options.map((option, idx) => {
              const isSelected = selectedAnswer === idx
              const isCorrect = idx === correctIdx
              const hasAnswered = selectedAnswer !== null

              let borderColor = "border-[#1a3a5c]"
              let bgColor = "bg-[#0a2d4a]"
              let textColor = "text-white"

              if (hasAnswered) {
                if (isCorrect) {
                  borderColor = "border-green-500"
                  bgColor = "bg-green-500/10"
                } else if (isSelected && !isCorrect) {
                  borderColor = "border-red-500"
                  bgColor = "bg-red-500/10"
                }
              } else if (isSelected) {
                borderColor = "border-[#378ADD]"
                bgColor = "bg-[#378ADD]/10"
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelect(idx)}
                  disabled={hasAnswered}
                  className={`w-full text-left rounded-xl border-2 px-4 py-3.5 transition-all ${borderColor} ${bgColor} ${textColor} ${
                    !hasAnswered ? "active:scale-[0.98]" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ borderColor: hasAnswered && isCorrect ? "#22c55e" : hasAnswered && isSelected ? "#ef4444" : "#1a3a5c" }}>
                      {hasAnswered && isCorrect ? <Check className="w-4 h-4 text-green-500" /> :
                       hasAnswered && isSelected ? <X className="w-4 h-4 text-red-500" /> :
                       String.fromCharCode(65 + idx)}
                    </span>
                    <span className="text-sm">{option}</span>
                  </div>
                </button>
              )
            })}
          </div>

          {/* Explanation after answering */}
          {selectedAnswer !== null && (
            <div className="mt-4 bg-[#0a2d4a] rounded-xl p-4 border border-[#1a3a5c]">
              <div className="flex items-center gap-2 mb-1.5">
                <BookOpen className="w-4 h-4 text-[#378ADD]" />
                <span className="text-xs font-bold text-[#378ADD]">explanation</span>
              </div>
              <p className="text-sm text-[#85B7EB]/70 leading-relaxed">{question.explanation}</p>
            </div>
          )}
        </div>

        {/* Next button */}
        {selectedAnswer !== null && (
          <div className="flex-shrink-0 px-4 pb-6 pt-2">
            <button
              onClick={handleNext}
              className="w-full bg-[#378ADD] text-white rounded-2xl py-3.5 font-extrabold text-base active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {currentIdx < questions.length - 1 ? (
                <>next <ChevronRight className="w-5 h-5" /></>
              ) : (
                "see results"
              )}
            </button>
          </div>
        )}

        {/* Work Area (calculator/notepad/draw) */}
        <WorkArea isOpen={showWorkArea} onClose={() => setShowWorkArea(false)} />
      </div>
    )
  }

  // Results screen
  if (phase === "results") {
    return <DiagnosticResults answers={answers} onRetake={startTest} />
  }

  // Loading fallback
  return (
    <div className="min-h-screen bg-[#021f3d] flex flex-col items-center justify-center">
      <Spinner className="w-8 h-8 text-[#378ADD]" />
    </div>
  )
}

function DiagnosticResults({ answers, onRetake }: { answers: DiagnosticAnswer[]; onRetake: () => void }) {
  const { total, correct, byCategory, subtopicScores, weakSubtopics } = scoreDiagnostic(answers)
  const pct = total > 0 ? Math.round((correct / total) * 100) : 0

  return (
    <div className="min-h-[100dvh] bg-[#021f3d] px-4 py-6 overflow-y-auto pb-24">
      {/* Score header */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-extrabold text-white mb-1">diagnostic results</h1>
        <div className="flex items-center justify-center gap-3 mt-3">
          <div className="text-4xl font-extrabold text-white">{correct}/{total}</div>
          <div className="text-left">
            <div className="text-sm font-bold" style={{ color: pct >= 70 ? "#22c55e" : pct >= 50 ? "#f59e0b" : "#ef4444" }}>
              {pct}%
            </div>
            <div className="text-[10px] text-[#85B7EB]/40">overall accuracy</div>
          </div>
        </div>
      </div>

      {/* Category breakdown */}
      <div className="space-y-2 mb-6">
        {Object.entries(byCategory).map(([cat, stats]) => {
          const catPct = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0
          return (
            <div key={cat} className="bg-[#0a2d4a] rounded-xl px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[cat] }} />
                <span className="text-sm font-bold text-white">{CATEGORY_SHORT[cat]}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#85B7EB]/50">{stats.correct}/{stats.total}</span>
                <span className="text-xs font-bold" style={{ color: catPct >= 70 ? "#22c55e" : catPct >= 50 ? "#f59e0b" : "#ef4444" }}>
                  {catPct}%
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Subtopic grid by category */}
      {Object.entries(SUBTOPIC_MAP).map(([category, subtopics]) => {
        const catScores = subtopicScores.filter(s => s.category === category)
        if (catScores.length === 0) return null
        return (
          <div key={category} className="mb-5">
            <h3 className="text-xs font-bold mb-2" style={{ color: CATEGORY_COLORS[category] }}>
              {CATEGORY_SHORT[category]}
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {subtopics.map(sub => {
                const score = catScores.find(s => s.subtopic === sub.id)
                if (!score) return null
                return (
                  <div
                    key={sub.id}
                    className="text-xs font-semibold px-2.5 py-1.5 rounded-lg flex items-center gap-1.5"
                    style={{
                      backgroundColor: score.isCorrect ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)",
                      color: score.isCorrect ? "#22c55e" : "#ef4444",
                      border: `1px solid ${score.isCorrect ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}`,
                    }}
                  >
                    {score.isCorrect ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                    {sub.label}
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}

      {/* Weak spots with drill buttons */}
      {weakSubtopics.length > 0 && (
        <div className="mt-6">
          <h2 className="text-base font-extrabold text-white mb-3 flex items-center gap-2">
            <Target className="w-4 h-4 text-[#EF4444]" />
            drill your weak spots
          </h2>
          <div className="space-y-2">
            {weakSubtopics.map(ws => (
              <Link
                key={`${ws.category}-${ws.subtopic}`}
                href={`/play?category=${encodeURIComponent(ws.category)}&subtopic=${encodeURIComponent(ws.subtopic)}`}
                className="flex items-center justify-between bg-[#0a2d4a] border border-[#EF4444]/20 rounded-xl px-4 py-3 active:scale-[0.98] transition-transform"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[ws.category] }} />
                  <div>
                    <span className="text-sm font-bold text-white">{ws.label}</span>
                    <span className="text-[10px] text-[#85B7EB]/40 ml-2">{CATEGORY_SHORT[ws.category]}</span>
                  </div>
                </div>
                <span className="text-xs font-bold text-[#378ADD] flex items-center gap-1">
                  drill <ChevronRight className="w-3 h-3" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {weakSubtopics.length === 0 && (
        <div className="mt-6 text-center bg-green-500/10 border border-green-500/25 rounded-xl p-4">
          <Check className="w-8 h-8 text-green-500 mx-auto mb-2" />
          <p className="text-sm font-bold text-green-400">Perfect score! No weak spots found.</p>
          <p className="text-xs text-[#85B7EB]/40 mt-1">Try a harder practice round to challenge yourself.</p>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-2 mt-6">
        <button
          onClick={onRetake}
          className="flex-1 bg-transparent border-2 border-[#378ADD] text-[#378ADD] rounded-xl py-3 font-bold text-sm active:scale-[0.98] flex items-center justify-center gap-1.5"
        >
          <RotateCcw className="w-4 h-4" strokeWidth={2.5} />
          retake
        </button>
        <Link
          href="/"
          className="flex-1 bg-[#0a2d4a] text-[#85B7EB] rounded-xl py-3 font-bold text-sm active:scale-[0.98] flex items-center justify-center gap-1.5"
        >
          <Home className="w-4 h-4" />
          home
        </Link>
      </div>
    </div>
  )
}
