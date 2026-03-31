"use client"

import { useState, useCallback, useEffect, Suspense, useRef } from "react"
import { Check, X, RotateCcw, ChevronRight, Diamond, Zap, Sparkles, Heart, Clipboard } from "lucide-react"
import { useSearchParams } from "next/navigation"
import { useGems, gemsForAnswer, GEM_VALUES, markRoundCompleted } from "@/lib/gem-context"
import { ChallengeWaitlistSheet } from "@/components/rally/challenge-waitlist-sheet"
import { Calculator, CalculatorButton } from "@/components/rally/calculator"
import { toast } from "sonner"
import { Spinner } from "@/components/ui/spinner"
import { initQuestions, getOneQuestion, type Question } from "@/lib/questions"
import { saveRoundStats } from "@/lib/stats"
import Link from "next/link"

// ─── Constants ────────────────────────────────────────────────────────────
const CATEGORIES = [
  { id: "Algebra",              name: "Algebra",    color: "#378ADD", isMath: true  },
  { id: "Reading Comprehension",name: "Reading",    color: "#14B8A6", isMath: false },
  { id: "Grammar",              name: "Grammar",    color: "#A855F7", isMath: false },
  { id: "Data & Statistics",    name: "Data & Stats",color: "#F97316", isMath: true  },
]

const TOTAL_QUESTIONS = 5

// Timer varies by category AND difficulty (seconds)
function getTimer(category: string, difficulty: string): number {
  const isMath = category === "Algebra" || category === "Data & Statistics"
  if (isMath) {
    if (difficulty === "easy")   return 45
    if (difficulty === "medium") return 75
    return 120
  } else {
    if (difficulty === "easy")   return 35
    if (difficulty === "medium") return 55
    return 90
  }
}

function getSpeedThreshold(category: string, difficulty: string): number {
  return getTimer(category, difficulty) / 2
}

// Adaptive difficulty progression within a round
//   correct  → bump up  (easy→medium→hard, cap at hard)
//   wrong    → bump down (hard→medium→medium→easy, cap at easy)
function bumpDifficulty(current: string, wasCorrect: boolean): string {
  if (wasCorrect) {
    if (current === "easy")   return "medium"
    if (current === "medium") return "hard"
    return "hard"
  } else {
    if (current === "hard")   return "medium"
    if (current === "medium") return "easy"
    return "easy"
  }
}

// Module-level session used-IDs so they persist across rounds
const sessionUsedIds: Record<string, Set<number>> = {}

function getUsedIds(cat: string): number[] {
  return Array.from(sessionUsedIds[cat] ?? new Set<number>())
}
function markIdUsed(cat: string, id: number) {
  if (!sessionUsedIds[cat]) sessionUsedIds[cat] = new Set()
  sessionUsedIds[cat].add(id)
}
function clearUsedIds(cat: string) {
  sessionUsedIds[cat] = new Set()
}

// Difficulty badge colors
const DIFFICULTY_COLORS = {
  easy:   { bg: "bg-green-500/20", text: "text-green-400" },
  medium: { bg: "bg-amber-500/20",  text: "text-amber-400" },
  hard:   { bg: "bg-red-500/20",    text: "text-red-400"   },
}

// Timer ring colors
const TIMER_COLORS = { normal: "#378ADD", warning: "#F59E0B", danger: "#EF4444" }

// ─── Small UI Components ──────────────────────────────────────────────────

function FloatingGemIndicator({ amount, isSpeed }: { amount: number; isSpeed: boolean }) {
  return (
    <div className="absolute -top-2 right-4 animate-gem-float pointer-events-none">
      <div className={`flex items-center gap-1 ${isSpeed ? "bg-gradient-to-r from-[#F59E0B] to-[#EF4444]" : "bg-[#F59E0B]"} text-white px-2 py-1 rounded-full shadow-lg`}>
        <Diamond className="w-3 h-3 fill-white" />
        <span className="text-xs font-bold">+{amount}</span>
        {isSpeed && <Zap className="w-3 h-3 fill-white" />}
      </div>
    </div>
  )
}

function CountdownTimer({ timeRemaining, totalTime }: { timeRemaining: number; totalTime: number }) {
  const radius = 18
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference * (1 - timeRemaining / totalTime)
  const color = timeRemaining <= 10 ? TIMER_COLORS.danger : timeRemaining <= 30 ? TIMER_COLORS.warning : TIMER_COLORS.normal

  return (
    <div className="relative w-12 h-12 flex items-center justify-center">
      <svg className="w-12 h-12 transform -rotate-90">
        <circle cx="24" cy="24" r={radius} fill="none" stroke="#0a2d4a" strokeWidth="3" />
        <circle cx="24" cy="24" r={radius} fill="none" stroke={color} strokeWidth="3"
          strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
          className="transition-all duration-1000 ease-linear" />
      </svg>
      <span className="absolute text-sm font-bold" style={{ color }}>{timeRemaining}</span>
    </div>
  )
}

function HeartsDisplay({ hearts, isPro }: { hearts: number; isPro: boolean }) {
  if (isPro) return null
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Heart
          key={i}
          className={`w-4 h-4 ${i < hearts ? "text-red-500 fill-red-500" : "text-[#0a2d4a] fill-[#0a2d4a]"}`}
        />
      ))}
    </div>
  )
}

// ─── Answer result type ───────────────────────────────────────────────────
interface AnswerResult {
  questionIndex: number
  isCorrect:     boolean
  difficulty:    string
  wasSpeedBonus: boolean
  gemsEarned:    number
}

// ─── No Hearts screen ─────────────────────────────────────────────────────
function NoHeartsScreen({ totalGems, onRefill }: { totalGems: number; onRefill: () => void }) {
  const canRefill = totalGems >= 200
  return (
    <div className="min-h-screen bg-[#021f3d] flex flex-col items-center justify-center px-6 gap-6">
      <div className="flex gap-1 mb-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Heart key={i} className="w-8 h-8 text-[#0a2d4a] fill-[#0a2d4a]" />
        ))}
      </div>
      <h2 className="text-2xl font-extrabold text-white text-center">no hearts left</h2>
      <p className="text-[#85B7EB] text-center text-sm max-w-xs">
        come back tomorrow or go Pro for unlimited play
      </p>
      <div className="flex flex-col gap-3 w-full max-w-sm">
        {canRefill && (
          <button
            onClick={onRefill}
            className="w-full bg-[#F59E0B] text-[#0a1628] rounded-2xl py-4 font-extrabold flex items-center justify-center gap-2"
          >
            <Diamond className="w-5 h-5 fill-current" />
            refill hearts · 200 gems
          </button>
        )}
        <button
          onClick={() => { /* remind tomorrow — just close */ window.location.href = "/" }}
          className="w-full bg-[#0a2d4a] text-[#85B7EB] rounded-2xl py-4 font-bold"
        >
          remind me tomorrow
        </button>
        <Link
          href="/store"
          className="w-full bg-[#378ADD] text-white rounded-2xl py-4 font-extrabold flex items-center justify-center"
        >
          upgrade to Pro
        </Link>
      </div>
    </div>
  )
}

// ─── Daily limit screen ───────────────────────────────────────────────────
function DailyLimitScreen() {
  return (
    <div className="min-h-screen bg-[#021f3d] flex flex-col items-center justify-center px-6 gap-6">
      <h2 className="text-2xl font-extrabold text-white text-center">daily limit reached</h2>
      <p className="text-[#85B7EB] text-center text-sm max-w-xs">
        Free accounts get 3 solo rounds per day. Go Pro for unlimited rounds.
      </p>
      <div className="flex flex-col gap-3 w-full max-w-sm">
        <Link href="/store" className="w-full bg-[#378ADD] text-white rounded-2xl py-4 font-extrabold flex items-center justify-center">
          upgrade to Pro
        </Link>
        <Link href="/" className="w-full bg-[#0a2d4a] text-[#85B7EB] rounded-2xl py-4 font-bold flex items-center justify-center">
          back to home
        </Link>
      </div>
    </div>
  )
}

// ─── Main game component ──────────────────────────────────────────────────
function PlayPageContent() {
  const searchParams = useSearchParams()
  const isChallenge = searchParams.get("challenge") === "true"
  const categoryParam = searchParams.get("category") || "Algebra"
  const { addGems, loseHeart, refillHearts, canPlaySolo, incrementRoundsToday, hearts, isPro, totalGems } = useGems()

  const categoryInfo = CATEGORIES.find(c => c.id === categoryParam) || CATEGORIES[0]
  const categoryName = categoryInfo.name
  const isMathCategory = categoryInfo.isMath

  // ── Game state ───────────────────────────────────────────────────────────
  const [currentQuestionNum, setCurrentQuestionNum] = useState(0)   // 0-indexed, 0..4
  const [question, setQuestion] = useState<Question | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)

  // Adaptive difficulty — starts at easy, bumps up/down each answer
  const [roundDifficulty, setRoundDifficulty] = useState("easy")

  // Plain integer score — incremented only on correct tap
  const [score, setScore] = useState(0)

  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showResults, setShowResults] = useState(false)
  const [showGemAnimation, setShowGemAnimation] = useState(false)
  const [showCalculator, setShowCalculator] = useState(false)
  const [gemsAwarded, setGemsAwarded] = useState(false)
  const [answerResults, setAnswerResults] = useState<AnswerResult[]>([])
  const [currentQuestionIsSpeed, setCurrentQuestionIsSpeed] = useState(false)
  const [showNoHearts, setShowNoHearts] = useState(false)

  // Timer
  const [totalTime, setTotalTime] = useState(30)
  const [timeRemaining, setTimeRemaining] = useState(30)
  const [isTimerActive, setIsTimerActive] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const questionStartRef = useRef(Date.now())

  // ── Fetch one question (synchronous local lookup) ─────────────────────────
  const fetchQuestion = useCallback((difficulty: string) => {
    setIsLoading(true)
    setFetchError(null)
    try {
      const excluded = getUsedIds(categoryParam)
      const q = getOneQuestion(categoryParam, difficulty, excluded)
      markIdUsed(categoryParam, q.id)
      setQuestion(q)
      const t = getTimer(categoryParam, q.difficulty)
      setTotalTime(t)
      setTimeRemaining(t)
      setIsTimerActive(true)
      questionStartRef.current = Date.now()
      setCurrentQuestionIsSpeed(false)
    } catch {
      setFetchError("couldn't load question — no questions found for this category")
    } finally {
      setIsLoading(false)
    }
  }, [categoryParam])

  // Initial load — await question bank, then fetch first question
  useEffect(() => {
    if (!isChallenge && !canPlaySolo()) return
    initQuestions()
      .then(() => fetchQuestion(roundDifficulty))
      .catch(() => setFetchError("couldn't load questions — check your connection and try again"))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])  // only on mount

  // ── Timer tick ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isTimerActive || selectedAnswer !== null || isLoading) return
    timerRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [isTimerActive, selectedAnswer, isLoading, currentQuestionNum])

  // ── Handle time-up ────────────────────────────────────────────────────────
  useEffect(() => {
    if (timeRemaining !== 0 || selectedAnswer !== null || isLoading) return
    // Timeout = wrong answer
    if (!isChallenge) loseHeart()
    const newDiff = bumpDifficulty(question?.difficulty || roundDifficulty, false)
    setRoundDifficulty(newDiff)
    setAnswerResults(prev => [...prev, {
      questionIndex: currentQuestionNum,
      isCorrect: false,
      difficulty: question?.difficulty || roundDifficulty,
      wasSpeedBonus: false,
      gemsEarned: 0,
    }])
    setSelectedAnswer(-1)
    setTimeout(() => advanceOrFinish(newDiff), 2000)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeRemaining, selectedAnswer, isLoading])

  function advanceOrFinish(nextDifficulty: string) {
    if (currentQuestionNum < TOTAL_QUESTIONS - 1) {
      setCurrentQuestionNum(prev => prev + 1)
      setSelectedAnswer(null)
      fetchQuestion(nextDifficulty)
    } else {
      setShowResults(true)
    }
  }

  // ── Answer selection ──────────────────────────────────────────────────────
  const handleAnswerSelect = useCallback((answerIndex: number) => {
    if (selectedAnswer !== null || !question) return
    setIsTimerActive(false)
    if (timerRef.current) clearInterval(timerRef.current)
    setSelectedAnswer(answerIndex)

    const correctIndex = question.correct.charCodeAt(0) - "A".charCodeAt(0)
    const isCorrect = answerIndex === correctIndex
    const timeTaken = (Date.now() - questionStartRef.current) / 1000
    const isSpeed = timeTaken <= getSpeedThreshold(categoryParam, question.difficulty)
    const gems = isCorrect ? gemsForAnswer(question.difficulty, isChallenge, isSpeed) : 0

    if (isCorrect) {
      setScore(prev => prev + 1)
      setCurrentQuestionIsSpeed(isSpeed)
      setShowGemAnimation(true)
      setTimeout(() => setShowGemAnimation(false), 1000)
    } else {
      if (!isChallenge) loseHeart()
    }

    const newDiff = bumpDifficulty(question.difficulty, isCorrect)
    setRoundDifficulty(newDiff)

    setAnswerResults(prev => [...prev, {
      questionIndex: currentQuestionNum,
      isCorrect,
      difficulty: question.difficulty,
      wasSpeedBonus: isSpeed && isCorrect,
      gemsEarned: gems,
    }])
  }, [selectedAnswer, question, isChallenge, currentQuestionNum, loseHeart])

  const handleNextQuestion = useCallback(() => {
    advanceOrFinish(roundDifficulty)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuestionNum, roundDifficulty])

  const handlePlayAgain = useCallback(() => {
    setCurrentQuestionNum(0)
    setScore(0)
    setSelectedAnswer(null)
    setShowResults(false)
    setShowGemAnimation(false)
    setGemsAwarded(false)
    setAnswerResults([])
    setRoundDifficulty("easy")
    setShowNoHearts(false)
    initQuestions()
      .then(() => fetchQuestion("easy"))
      .catch(() => setFetchError("couldn't load questions — check your connection and try again"))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchQuestion])

  // ── Award gems at round end ─────���─────────────��───────────────────────────
  useEffect(() => {
    if (!showResults || gemsAwarded) return
    const totalEarned = answerResults.reduce((sum, r) => sum + r.gemsEarned, 0)
    addGems(totalEarned)
    markRoundCompleted()
    if (!isChallenge) incrementRoundsToday()
    saveRoundStats({
      categoryId: categoryParam,
      correct: score,
      total: TOTAL_QUESTIONS,
      gemsEarned: totalEarned,
      answerResults,
    })
    setGemsAwarded(true)
  }, [showResults, gemsAwarded, addGems, answerResults, categoryParam, score, isChallenge, incrementRoundsToday])

  // ── Gate checks (solo only) ───────────────────────────────────────────────
  if (!isChallenge && !isPro) {
    if (hearts <= 0 && !showResults) {
      return (
        <NoHeartsScreen
          totalGems={totalGems}
          onRefill={() => { if (refillHearts()) setShowNoHearts(false) }}
        />
      )
    }
  }

  // ── Error ─────────────────────────────────────────────────────────────────
  if (fetchError) {
    return (
      <div className="min-h-screen bg-[#021f3d] flex flex-col items-center justify-center px-6">
        <p className="text-red-400 text-center font-medium mb-4">{fetchError}</p>
        <button
          onClick={() => fetchQuestion(roundDifficulty)}
          className="bg-[#378ADD] text-white rounded-xl py-3 px-6 font-bold"
        >
          Try Again
        </button>
      </div>
    )
  }

  // ── Loading ───────────────────────────────────────────────────────────────
  if (isLoading || !question) {
    return (
      <div className="min-h-screen bg-[#021f3d] flex flex-col items-center justify-center">
        <Spinner className="w-8 h-8 text-[#378ADD]" />
        <p className="text-[#85B7EB] mt-4 font-medium">Loading...</p>
      </div>
    )
  }

  // ── Results ───────────────────────────────────────────────────────────────
  if (showResults) {
    return (
      <ResultsScreen
        score={score}
        isChallenge={isChallenge}
        categoryName={categoryName}
        onPlayAgain={handlePlayAgain}
        answerResults={answerResults}
      />
    )
  }

  // ── Game screen ───────────────────────────────────────────────────────────
  const correctIndex = question.correct.charCodeAt(0) - "A".charCodeAt(0)
  const hasAnswered = selectedAnswer !== null
  const isTimeout = selectedAnswer === -1
  const gemsThisQuestion = gemsForAnswer(question.difficulty, isChallenge, currentQuestionIsSpeed)
  const diffColors = DIFFICULTY_COLORS[question.difficulty as keyof typeof DIFFICULTY_COLORS] || DIFFICULTY_COLORS.medium

  return (
    <div className="min-h-screen bg-[#021f3d] flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-[#021f3d] px-5 pt-4 pb-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            {isMathCategory && <CalculatorButton onClick={() => setShowCalculator(true)} />}
            {!isChallenge && <HeartsDisplay hearts={hearts} isPro={isPro} />}
          </div>
          <h1 className="text-xl font-extrabold text-white">{categoryName}</h1>
          <CountdownTimer timeRemaining={timeRemaining} totalTime={totalTime} />
        </div>
        {/* Progress pips */}
        <div className="flex gap-2">
          {Array.from({ length: TOTAL_QUESTIONS }).map((_, i) => (
            <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${i <= currentQuestionNum ? "bg-[#378ADD]" : "bg-[#0a2d4a]"}`} />
          ))}
        </div>
      </header>

      {/* Question */}
      <main className="flex-1 flex flex-col px-5 py-6">
        {/* Difficulty badge */}
        <div className="flex justify-center mb-4">
          <span className={`text-xs font-bold px-3 py-1 rounded-full ${diffColors.bg} ${diffColors.text}`}>
            {question.difficulty}
          </span>
        </div>

        <div className="flex-1 flex items-center justify-center mb-8">
          <h2 className="text-2xl font-extrabold text-white text-center leading-relaxed px-2 max-w-xl">
            {question.question}
          </h2>
        </div>

        {/* Answer options */}
        <div className="w-full max-w-[480px] mx-auto space-y-3 pb-4 relative">
          {(["A","B","C","D"] as const).map((letter, index) => {
            const optKey = `option_${letter.toLowerCase()}` as keyof Question
            const correctLetter = question.correct
            const correctOptKey = `option_${correctLetter.toLowerCase()}` as keyof Question
            return (
              <AnswerOption
                key={letter}
                option={question[optKey] as string}
                index={index}
                letter={letter}
                selectedAnswer={selectedAnswer}
                correctAnswer={correctIndex}
                explanation={question.explanation}
                onSelect={handleAnswerSelect}
                showGemAnimation={showGemAnimation && index === correctIndex}
                gemAmount={gemsThisQuestion}
                isSpeedBonus={currentQuestionIsSpeed}
                isTimeout={isTimeout}
                questionText={question.question}
                correctLetter={correctLetter}
                correctOptionText={question[correctOptKey] as string}
              />
            )
          })}
        </div>

        {/* Next button */}
        {hasAnswered && !isTimeout && (
          <div className="w-full max-w-[480px] mx-auto pt-4 pb-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <button
              onClick={handleNextQuestion}
              className="w-full bg-[#378ADD] text-white rounded-2xl py-4 px-6 flex items-center justify-center gap-2 font-extrabold text-lg shadow-lg shadow-[#378ADD]/30 transition-all active:scale-[0.98] hover:brightness-110"
            >
              {currentQuestionNum < TOTAL_QUESTIONS - 1 ? "next question" : "see results"}
              <ChevronRight className="w-5 h-5" strokeWidth={3} />
            </button>
          </div>
        )}
      </main>

      <Calculator isOpen={showCalculator} onClose={() => setShowCalculator(false)} />

      <style jsx global>{`
        @keyframes gem-float {
          0%   { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-30px); }
        }
        .animate-gem-float { animation: gem-float 1s ease-out forwards; }
      `}</style>
    </div>
  )
}

// ─── AnswerOption ─────────────────────────────────────────────────────────
interface AnswerOptionProps {
  option: string; index: number; letter: string
  selectedAnswer: number | null; correctAnswer: number
  explanation: string; onSelect: (i: number) => void
  showGemAnimation: boolean; gemAmount: number
  isSpeedBonus: boolean; isTimeout: boolean
  // For "Still don't get it?" prompt
  questionText: string
  correctLetter: string
  correctOptionText: string
}

function StillDontGetIt({ questionText, correctLetter, correctOptionText }: {
  questionText: string
  correctLetter: string
  correctOptionText: string
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const prompt = `I'm studying for the SAT and I got this question wrong: ${questionText}. The correct answer is ${correctLetter}: ${correctOptionText}. Can you explain why this is the correct answer, walk me through the concept step by step, and give me two similar practice questions?`

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(prompt)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback for older browsers
      const el = document.createElement("textarea")
      el.value = prompt
      document.body.appendChild(el)
      el.select()
      document.execCommand("copy")
      document.body.removeChild(el)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="mt-3 px-1">
      <button
        onClick={() => setIsOpen(v => !v)}
        className="flex items-center gap-1.5 text-sm text-[#378ADD]/70 hover:text-[#378ADD] transition-colors"
      >
        <span>Still don&apos;t get it?</span>
        <ChevronRight
          className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? "rotate-90" : ""}`}
          strokeWidth={2.5}
        />
      </button>

      {isOpen && (
        <div className="mt-2 animate-in fade-in slide-in-from-top-1 duration-200">
          {/* Prompt text box */}
          <div className="bg-[#0a2d4a] border border-[#378ADD]/20 rounded-xl p-3 mb-2">
            <p className="text-xs text-[#85B7EB]/80 leading-relaxed select-all">{prompt}</p>
          </div>

          {/* Copy button */}
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 bg-[#378ADD] text-white text-sm font-bold rounded-xl px-4 py-2 transition-all active:scale-95"
          >
            <Clipboard className="w-4 h-4" strokeWidth={2} />
            {copied ? "copied! ✓" : "copy prompt"}
          </button>

          {/* Helper text */}
          <p className="mt-2 text-xs text-[#85B7EB]/40">
            paste into ChatGPT, Claude, or any AI assistant
          </p>
        </div>
      )}
    </div>
  )
}

function AnswerOption({ option, index, letter, selectedAnswer, correctAnswer, explanation, onSelect, showGemAnimation, gemAmount, isSpeedBonus, isTimeout, questionText, correctLetter, correctOptionText }: AnswerOptionProps) {
  const isSelected   = selectedAnswer === index
  const isCorrect    = index === correctAnswer
  const hasAnswered  = selectedAnswer !== null
  const showCorrect  = hasAnswered && isCorrect
  const showWrong    = isSelected && !isCorrect

  const bg     = showCorrect ? "#16a34a" : showWrong ? "#dc2626" : "#ffffff"
  const fg     = showCorrect || showWrong ? "#ffffff" : "#0a1628"
  const letterBg = showCorrect || showWrong ? "rgba(255,255,255,0.2)" : "#378ADD"

  return (
    <div className="relative">
      <button
        onClick={() => onSelect(index)}
        disabled={hasAnswered}
        className={`w-full rounded-2xl py-3 px-5 flex items-center gap-4 transition-all duration-300 ${hasAnswered ? "cursor-default" : "active:scale-[0.98] hover:shadow-lg cursor-pointer"}`}
        style={{ backgroundColor: bg, color: fg }}
      >
        <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm" style={{ backgroundColor: letterBg, color: "#ffffff" }}>
          {letter}
        </div>
        <span className="text-lg font-bold flex-1 text-left">{option}</span>
        {showCorrect && <Check className="w-6 h-6 flex-shrink-0" strokeWidth={3} />}
        {showWrong   && <X    className="w-6 h-6 flex-shrink-0" strokeWidth={3} />}
      </button>
      {showGemAnimation && <FloatingGemIndicator amount={gemAmount} isSpeed={isSpeedBonus} />}
      {showCorrect && (
        <div className="mt-2 px-1 animate-in fade-in slide-in-from-top-2 duration-300">
          <p className="px-3 text-sm text-[#85B7EB] italic leading-relaxed">{explanation}</p>
          <StillDontGetIt
            questionText={questionText}
            correctLetter={correctLetter}
            correctOptionText={correctOptionText}
          />
        </div>
      )}
      {showWrong && hasAnswered && (
        <div className="mt-2 px-1 animate-in fade-in slide-in-from-top-2 duration-300">
          <StillDontGetIt
            questionText={questionText}
            correctLetter={correctLetter}
            correctOptionText={correctOptionText}
          />
        </div>
      )}
    </div>
  )
}

// ─── ResultsScreen ────────────────────────────────────────────────────────
interface ResultsScreenProps {
  score: number; isChallenge: boolean; categoryName: string
  onPlayAgain: () => void; answerResults: AnswerResult[]
}

function getEncouragementMessage(score: number): string {
  if (score === 5) return "Perfect score! Dare someone to match it"
  if (score === 4) return "Really strong! Think your friends can beat that?"
  if (score === 3) return "Not bad! Bet you can beat your friends though"
  return "Tough round. Challenge a friend and see how they do"
}

function ResultsScreen({ score, isChallenge, categoryName, onPlayAgain, answerResults }: ResultsScreenProps) {
  const [showWaitlistSheet, setShowWaitlistSheet] = useState(false)
  const [totalGems, setTotalGems] = useState(0)
  const [isGuest, setIsGuest] = useState(false)

  useEffect(() => {
    setTotalGems(parseInt(localStorage.getItem("rally_gems") || "0", 10) || 0)
    setIsGuest(localStorage.getItem("rally_is_guest") === "true")
  }, [])

  const totalEarned = answerResults.reduce((sum, r) => sum + r.gemsEarned, 0)
  const speedCount  = answerResults.filter(r => r.isCorrect && r.wasSpeedBonus).length

  // Build breakdown
  const breakdown: { label: string; amount: number }[] = []
  const byDiff: Record<string, { count: number; gems: number }> = {}
  for (const r of answerResults) {
    if (!r.isCorrect) continue
    if (!byDiff[r.difficulty]) byDiff[r.difficulty] = { count: 0, gems: 0 }
    byDiff[r.difficulty].count++
    byDiff[r.difficulty].gems += r.gemsEarned
  }
  for (const [diff, { count, gems }] of Object.entries(byDiff)) {
    breakdown.push({ label: `${count} ${diff} correct`, amount: gems })
  }
  if (speedCount > 0) {
    breakdown.push({ label: `${speedCount} speed bonus${speedCount > 1 ? "es" : ""}`, amount: 0 })
  }
  if (score === 0) breakdown.push({ label: "no correct answers", amount: 0 })

  const diffStats = {
    easy:   answerResults.filter(r => r.difficulty === "easy"   && r.isCorrect).length,
    medium: answerResults.filter(r => r.difficulty === "medium" && r.isCorrect).length,
    hard:   answerResults.filter(r => r.difficulty === "hard"   && r.isCorrect).length,
  }

  return (
    <div className="min-h-screen bg-[#021f3d] flex flex-col items-center justify-center px-5 py-8">
      <div className="text-center mb-6">
        {/* Answer circles */}
        <div className="flex items-center justify-center gap-3 mb-3">
          {answerResults.map((r, i) => (
            <div key={i} className={`w-10 h-10 rounded-full flex items-center justify-center ${r.isCorrect ? "bg-green-500" : "bg-red-500"}`}>
              {r.isCorrect ? <Check className="w-5 h-5 text-white" strokeWidth={3} /> : <X className="w-5 h-5 text-white" strokeWidth={3} />}
            </div>
          ))}
        </div>
        {/* Difficulty badges */}
        <div className="flex items-center justify-center gap-3 mb-6">
          {answerResults.map((r, i) => {
            const c = DIFFICULTY_COLORS[r.difficulty as keyof typeof DIFFICULTY_COLORS] || DIFFICULTY_COLORS.medium
            return <span key={i} className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${c.bg} ${c.text}`}>{r.difficulty}</span>
          })}
        </div>
        <h1 className="text-5xl font-extrabold text-white mb-2">{score} out of {TOTAL_QUESTIONS}</h1>
        <p className="text-[#85B7EB] text-xl font-semibold">{categoryName}</p>
        <p className="text-[#85B7EB]/80 text-lg mt-4 max-w-xs mx-auto">{getEncouragementMessage(score)}</p>
      </div>

      {/* Gem total */}
      <div className="flex items-center gap-1.5 mb-2">
        <Diamond className="w-3.5 h-3.5 text-[#F59E0B] fill-[#F59E0B]" />
        <span className="text-sm text-[#85B7EB]/70">your total: {totalGems} gems</span>
      </div>

      {/* Guest banner */}
      {isGuest && (
        <div className="w-full max-w-sm mb-4 bg-[#0a2d4a] border border-[#378ADD]/40 rounded-2xl px-5 py-4 flex items-center justify-between gap-3">
          <p className="text-[#85B7EB] text-sm font-medium leading-snug flex-1">save your progress — create a free account</p>
          <a href="/login" className="bg-[#378ADD] text-white text-sm font-bold rounded-xl px-4 py-2 whitespace-nowrap hover:brightness-110 transition-all">sign up free</a>
        </div>
      )}

      {/* Gems earned card */}
      <div className="w-full max-w-sm mb-4 bg-gradient-to-r from-[#F59E0B]/20 to-[#F97316]/20 border border-[#F59E0B]/40 rounded-2xl p-5">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Diamond className="w-6 h-6 text-[#F59E0B] fill-[#F59E0B]" />
          <span className="text-2xl font-extrabold text-white">+{totalEarned} gems</span>
        </div>
        <div className="space-y-1">
          {breakdown.map((item, i) => (
            <div key={i} className="flex justify-between text-sm">
              <span className="text-[#85B7EB]/80">{item.label}</span>
              {item.amount > 0 && <span className="text-[#F59E0B] font-semibold">+{item.amount}</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Difficulty stats */}
      <div className="w-full max-w-sm mb-6 bg-[#0a2d4a] rounded-2xl p-4">
        <p className="text-xs font-bold text-[#85B7EB]/60 mb-2 uppercase tracking-wide">By Difficulty</p>
        <div className="flex justify-between gap-2">
          {(["easy","medium","hard"] as const).map((d, i) => (
            <div key={d} className={`flex-1 text-center ${i === 1 ? "border-x border-[#85B7EB]/20" : ""}`}>
              <span className={`text-lg font-bold ${DIFFICULTY_COLORS[d].text}`}>{diffStats[d]}</span>
              <p className="text-xs text-[#85B7EB]/60">{d}</p>
            </div>
          ))}
        </div>
      </div>

      <button onClick={onPlayAgain} className="w-full max-w-sm mb-6 bg-transparent border-2 border-[#378ADD] text-[#378ADD] rounded-2xl py-4 px-6 flex items-center justify-center gap-2 font-extrabold text-lg transition-all active:scale-[0.98] hover:bg-[#378ADD]/10">
        <RotateCcw className="w-5 h-5" strokeWidth={2.5} />
        play again
      </button>

      {/* Category picker */}
      <div className="w-full max-w-sm mb-6">
        <p className="text-[#85B7EB]/60 text-sm font-medium mb-3 text-center">try a different category</p>
        <div className="grid grid-cols-2 gap-2">
          {CATEGORIES.map((cat) => (
            <button key={cat.id} onClick={() => { window.location.href = `/play?category=${encodeURIComponent(cat.id)}` }}
              className="bg-white rounded-xl p-3 flex flex-col items-start transition-all active:scale-[0.98] hover:shadow-lg"
              style={{ borderLeft: `3px solid ${cat.color}` }}>
              <span className="text-[#0a1628] font-bold text-sm">{cat.name}</span>
              <span className="text-xs font-semibold mt-0.5 flex items-center gap-0.5" style={{ color: cat.color }}>
                play <ChevronRight className="w-3 h-3" strokeWidth={3} />
              </span>
            </button>
          ))}
        </div>
      </div>

      <a href="/" className="text-[#85B7EB]/50 text-sm font-medium mb-4 hover:text-[#85B7EB] transition-colors">
        ← back to home
      </a>

      <div className="w-full max-w-sm space-y-3">
        <div className="relative">
          <button onClick={() => setShowWaitlistSheet(true)}
            className="w-full bg-[#378ADD] text-white rounded-2xl py-4 px-6 flex flex-col items-center justify-center gap-1 font-extrabold shadow-lg shadow-[#378ADD]/30 transition-all active:scale-[0.98] hover:brightness-110">
            <span className="text-lg">challenge a friend</span>
            <span className="text-xs font-semibold text-white/70">4x gems when it launches</span>
          </button>
          <div className="absolute -top-2 -right-2 bg-[#F59E0B] text-[#0a1628] text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> soon
          </div>
        </div>
        <button onClick={() => setShowWaitlistSheet(true)}
          className="w-full flex items-center justify-center gap-1 text-[#378ADD] text-sm font-semibold py-1 transition-all hover:brightness-125">
          get 500 bonus gems when challenges launch
        </button>
      </div>

      <ChallengeWaitlistSheet isOpen={showWaitlistSheet} onClose={() => setShowWaitlistSheet(false)} variant="challenge" />
    </div>
  )
}

function PlayPageLoading() {
  return (
    <div className="min-h-screen bg-[#021f3d] flex items-center justify-center">
      <Spinner className="w-8 h-8 text-[#378ADD]" />
    </div>
  )
}

export default function PlayPage() {
  return (
    <Suspense fallback={<PlayPageLoading />}>
      <PlayPageContent />
    </Suspense>
  )
}
