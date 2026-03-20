"use client"

import { useState, useCallback, useEffect, Suspense, useRef } from "react"
import { Check, X, RotateCcw, ChevronRight, Diamond, Zap, Sparkles } from "lucide-react"
import { useSearchParams } from "next/navigation"
import { useGems, calculateRoundGems, GEM_VALUES, markRoundCompleted } from "@/lib/gem-context"
import { ChallengeWaitlistSheet } from "@/components/rally/challenge-waitlist-sheet"
import { Calculator, CalculatorButton } from "@/components/rally/calculator"
import { toast } from "sonner"
import { Spinner } from "@/components/ui/spinner"
import { getQuestions, type Question } from "@/lib/questions"
import { saveRoundStats } from "@/lib/stats"

const CATEGORIES = [
  { id: "Algebra", name: "Algebra", color: "#378ADD", isMath: true },
  { id: "Reading Comprehension", name: "Reading", color: "#14B8A6", isMath: false },
  { id: "Grammar", name: "Grammar", color: "#A855F7", isMath: false },
  { id: "Data & Statistics", name: "Data & Stats", color: "#F97316", isMath: true },
]

// Timer settings per category type (in seconds)
const TIMER_SETTINGS = {
  math: 95,    // Algebra, Data & Stats
  reading: 71, // Reading, Grammar
}

// Speed bonus threshold (half the allocated time)
const SPEED_THRESHOLDS = {
  math: 47,    // 95/2 rounded down
  reading: 35, // 71/2 rounded down
}

// Helper to convert letter answer (A, B, C, D) to index (0, 1, 2, 3)
function letterToIndex(letter: string): number {
  return letter.charCodeAt(0) - 'A'.charCodeAt(0)
}

const TOTAL_QUESTIONS = 5

// Difficulty badge colors
const DIFFICULTY_COLORS = {
  easy: { bg: "bg-green-500/20", text: "text-green-400", border: "border-green-500/40" },
  medium: { bg: "bg-amber-500/20", text: "text-amber-400", border: "border-amber-500/40" },
  hard: { bg: "bg-red-500/20", text: "text-red-400", border: "border-red-500/40" },
}

// Timer ring colors
const TIMER_COLORS = {
  normal: "#378ADD",
  warning: "#F59E0B", // 30 seconds or less
  danger: "#EF4444",  // 10 seconds or less
}

// Floating gem animation component
function FloatingGemIndicator({ amount, isSpeedBonus }: { amount: number; isSpeedBonus: boolean }) {
  return (
    <div className="absolute -top-2 right-4 animate-gem-float pointer-events-none">
      <div className={`flex items-center gap-1 ${isSpeedBonus ? 'bg-gradient-to-r from-[#F59E0B] to-[#EF4444]' : 'bg-[#F59E0B]'} text-white px-2 py-1 rounded-full shadow-lg`}>
        <Diamond className="w-3 h-3 fill-white" />
        <span className="text-xs font-bold">+{amount}</span>
        {isSpeedBonus && <Zap className="w-3 h-3 fill-white" />}
      </div>
    </div>
  )
}

// Countdown Timer Ring Component
function CountdownTimer({ 
  timeRemaining, 
  totalTime 
}: { 
  timeRemaining: number
  totalTime: number 
}) {
  const radius = 18
  const circumference = 2 * Math.PI * radius
  const progress = timeRemaining / totalTime
  const strokeDashoffset = circumference * (1 - progress)
  
  let color = TIMER_COLORS.normal
  if (timeRemaining <= 10) {
    color = TIMER_COLORS.danger
  } else if (timeRemaining <= 30) {
    color = TIMER_COLORS.warning
  }

  return (
    <div className="relative w-12 h-12 flex items-center justify-center">
      <svg className="w-12 h-12 transform -rotate-90">
        {/* Background circle */}
        <circle
          cx="24"
          cy="24"
          r={radius}
          fill="none"
          stroke="#0a2d4a"
          strokeWidth="3"
        />
        {/* Progress circle */}
        <circle
          cx="24"
          cy="24"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-1000 ease-linear"
        />
      </svg>
      <span 
        className="absolute text-sm font-bold"
        style={{ color }}
      >
        {timeRemaining}
      </span>
    </div>
  )
}

// Speed Bonus Animation Component
function SpeedBonusAnimation() {
  return (
    <div className="fixed inset-0 pointer-events-none flex items-center justify-center z-50 animate-in fade-in zoom-in duration-300">
      <div className="bg-gradient-to-r from-[#F59E0B] to-[#EF4444] text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-2 animate-bounce">
        <Zap className="w-6 h-6 fill-white" />
        <span className="text-lg font-extrabold">+150 gems</span>
        <span className="text-sm font-bold opacity-80">speed bonus!</span>
      </div>
    </div>
  )
}

// Answer result type for tracking
interface AnswerResult {
  questionIndex: number
  isCorrect: boolean
  difficulty: string
  wasSpeedBonus: boolean
  gemsEarned: number
}

function PlayPageContent() {
  const searchParams = useSearchParams()
  const isChallenge = searchParams.get("challenge") === "true"
  const categoryParam = searchParams.get("category") || "Algebra"
  const roundId = searchParams.get("t") || "initial"
  const { addGems } = useGems()
  
  // Find category info
  const categoryInfo = CATEGORIES.find(c => c.id === categoryParam) || CATEGORIES[0]
  const categoryName = categoryInfo.name
  const isMathCategory = categoryInfo.isMath
  
  // Timer settings based on category
  const totalTime = isMathCategory ? TIMER_SETTINGS.math : TIMER_SETTINGS.reading
  const speedThreshold = isMathCategory ? SPEED_THRESHOLDS.math : SPEED_THRESHOLDS.reading
  
  // Track if we've shown the reset message this round
  const hasShownResetMessage = useRef(false)

  // Track used question IDs per category to prevent repeats
  // useRef so it survives re-renders without triggering them
  const usedIds = useRef<Record<string, Set<number>>>({})

  function getUsedIdsForCategory(cat: string): number[] {
    return Array.from(usedIds.current[cat] ?? new Set<number>())
  }

  function markIdsUsed(cat: string, ids: number[]) {
    if (!usedIds.current[cat]) usedIds.current[cat] = new Set()
    ids.forEach(id => usedIds.current[cat].add(id))
  }

  function resetUsedIds(cat: string) {
    usedIds.current[cat] = new Set()
  }
  
  // Questions state - fetched from Supabase (client-side only)
  const [sessionQuestions, setSessionQuestions] = useState<Question[]>([])
  const [isQuestionsReady, setIsQuestionsReady] = useState(false)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [isMounted, setIsMounted] = useState(false)
  
  // Mark component as mounted (client-side only)
  useEffect(() => {
    setIsMounted(true)
  }, [])
  
  // Fetch questions from Supabase ONLY on client after mount
  useEffect(() => {
    if (!isMounted) return
    if (isQuestionsReady) return

    async function loadQuestions() {
      try {
        const excluded = getUsedIdsForCategory(categoryParam)
        let questions = await getQuestions(categoryParam, excluded)
        // If all questions exhausted, reset and fetch fresh
        if (!questions || questions.length === 0) {
          resetUsedIds(categoryParam)
          questions = await getQuestions(categoryParam, [])
          toast.success("You've seen all questions! Starting fresh.", { duration: 3000 })
        }
        markIdsUsed(categoryParam, questions.map(q => q.id))
        setSessionQuestions(questions)
        setIsQuestionsReady(true)
        setFetchError(null)
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : ""
        if (msg === "RESET_NEEDED") {
          // All questions exhausted — reset and retry once
          resetUsedIds(categoryParam)
          try {
            const fresh = await getQuestions(categoryParam, [])
            markIdsUsed(categoryParam, fresh.map(q => q.id))
            setSessionQuestions(fresh)
            setIsQuestionsReady(true)
            setFetchError(null)
            toast.success("You've seen all questions! Starting fresh.", { duration: 3000 })
          } catch {
            setFetchError("couldn't load questions — check your connection and try again")
            setSessionQuestions([])
          }
        } else {
          setFetchError("couldn't load questions — check your connection and try again")
          setSessionQuestions([])
        }
      }
    }

    loadQuestions()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMounted, isQuestionsReady, categoryParam])

  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [showResults, setShowResults] = useState(false)
  const [showGemAnimation, setShowGemAnimation] = useState(false)
  const [showSpeedBonus, setShowSpeedBonus] = useState(false)
  const [gemsAwarded, setGemsAwarded] = useState(false)
  const [showCalculator, setShowCalculator] = useState(false)
  
  // Timer state
  const [timeRemaining, setTimeRemaining] = useState(totalTime)
  const [isTimerActive, setIsTimerActive] = useState(true)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  
  // Track answer results for each question
  const [answerResults, setAnswerResults] = useState<AnswerResult[]>([])
  
  // Speed bonus tracking for current question
  const questionStartTimeRef = useRef(Date.now())
  const [currentQuestionSpeedBonus, setCurrentQuestionSpeedBonus] = useState(false)

  // Compute derived values (safe even when questions not ready - will use defaults)
  const question = sessionQuestions[currentQuestion]
  const correctLetter = question?.correct || "A"
  const correctAnswerIndex = letterToIndex(correctLetter)
  const baseGemPerCorrect = isChallenge ? GEM_VALUES.challenge.correctAnswer : GEM_VALUES.solo.correctAnswer
  const speedGemPerCorrect = isChallenge ? GEM_VALUES.challenge.correctAnswerSpeed : GEM_VALUES.solo.correctAnswerSpeed

  // Build the 4 answer options from individual columns
  const answerOptions = question ? [
    { letter: "A", text: question.option_a },
    { letter: "B", text: question.option_b },
    { letter: "C", text: question.option_c },
    { letter: "D", text: question.option_d },
  ] : []

  // Timer effect
  useEffect(() => {
    if (!isQuestionsReady || !isTimerActive || selectedAnswer !== null) return
    
    timerRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          // Time's up! Auto-mark as wrong and advance
          clearInterval(timerRef.current!)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isQuestionsReady, isTimerActive, selectedAnswer, currentQuestion])
  
  // Handle time up in a separate effect to avoid stale closure
  useEffect(() => {
    if (!isQuestionsReady || timeRemaining !== 0 || selectedAnswer !== null) return
    
    // Record wrong answer due to timeout
    setAnswerResults(prev => [...prev, {
      questionIndex: currentQuestion,
      isCorrect: false,
      difficulty: question?.difficulty || "medium",
      wasSpeedBonus: false,
      gemsEarned: 0,
    }])
    
    // Show the correct answer briefly then auto-advance
    setSelectedAnswer(-1) // -1 indicates timeout
    
    setTimeout(() => {
      if (currentQuestion < TOTAL_QUESTIONS - 1) {
        setCurrentQuestion(prev => prev + 1)
        setSelectedAnswer(null)
      } else {
        setShowResults(true)
      }
    }, 2000)
  }, [isQuestionsReady, timeRemaining, selectedAnswer, currentQuestion, question])
  
  // Reset timer when moving to next question
  useEffect(() => {
    if (!isQuestionsReady) return
    setTimeRemaining(totalTime)
    setIsTimerActive(true)
    questionStartTimeRef.current = Date.now()
    setCurrentQuestionSpeedBonus(false)
  }, [isQuestionsReady, currentQuestion, totalTime])

  const handleAnswerSelect = useCallback((answerIndex: number) => {
    if (selectedAnswer !== null) return
    
    // Stop timer
    setIsTimerActive(false)
    if (timerRef.current) clearInterval(timerRef.current)
    
    setSelectedAnswer(answerIndex)
    
    // Calculate time taken
    const timeTaken = (Date.now() - questionStartTimeRef.current) / 1000
    const isSpeedBonus = timeTaken <= speedThreshold
    
    if (answerIndex === correctAnswerIndex) {
      setScore(prev => prev + 1)
      
      const gemsForThis = isSpeedBonus ? speedGemPerCorrect : baseGemPerCorrect
      
      // Record correct answer
      setAnswerResults(prev => [...prev, {
        questionIndex: currentQuestion,
        isCorrect: true,
        difficulty: question?.difficulty || "medium",
        wasSpeedBonus: isSpeedBonus,
        gemsEarned: gemsForThis,
      }])
      
      if (isSpeedBonus) {
        setCurrentQuestionSpeedBonus(true)
        setShowSpeedBonus(true)
        setTimeout(() => setShowSpeedBonus(false), 1500)
      }
      
      setShowGemAnimation(true)
      setTimeout(() => setShowGemAnimation(false), 1000)
    } else {
      // Record wrong answer
      setAnswerResults(prev => [...prev, {
        questionIndex: currentQuestion,
        isCorrect: false,
        difficulty: question?.difficulty || "medium",
        wasSpeedBonus: false,
        gemsEarned: 0,
      }])
    }
  }, [selectedAnswer, correctAnswerIndex, currentQuestion, question, speedThreshold, baseGemPerCorrect, speedGemPerCorrect])

  const handleNextQuestion = useCallback(() => {
    if (currentQuestion < TOTAL_QUESTIONS - 1) {
      setCurrentQuestion(prev => prev + 1)
      setSelectedAnswer(null)
    } else {
      setShowResults(true)
    }
  }, [currentQuestion])

  const handlePlayAgain = useCallback(() => {
    // Reset all game state in-place so usedIds ref is preserved across rounds
    setCurrentQuestion(0)
    setSelectedAnswer(null)
    setScore(0)
    setShowResults(false)
    setShowGemAnimation(false)
    setShowSpeedBonus(false)
    setGemsAwarded(false)
    setAnswerResults([])
    setCurrentQuestionSpeedBonus(false)
    setSessionQuestions([])
    setIsQuestionsReady(false)
    setFetchError(null)
  }, [])

  // Award gems and mark round completed when showing results
  useEffect(() => {
    if (showResults && !gemsAwarded) {
      // Calculate total gems including speed bonuses
      const speedBonusGems = answerResults
        .filter(r => r.wasSpeedBonus)
        .reduce((sum) => sum + (speedGemPerCorrect - baseGemPerCorrect), 0)
      
      const { total: baseTotal } = calculateRoundGems(score, TOTAL_QUESTIONS, isChallenge, true)
      const totalWithSpeed = baseTotal + speedBonusGems
      
      addGems(totalWithSpeed)
      markRoundCompleted() // Track streak
      saveRoundStats({
        categoryId: categoryParam,
        correct: score,
        total: TOTAL_QUESTIONS,
        gemsEarned: totalWithSpeed,
        answerResults,
      })
      setGemsAwarded(true)
    }
  }, [showResults, gemsAwarded, score, isChallenge, addGems, answerResults, speedGemPerCorrect, baseGemPerCorrect])

  // Derived values for rendering (always computed, never early return)
  const hasAnswered = selectedAnswer !== null
  const isTimeout = selectedAnswer === -1

  // Error state - failed to fetch questions
  if (fetchError) {
    return (
      <div className="min-h-screen bg-[#021f3d] flex flex-col items-center justify-center px-6">
        <p className="text-red-400 text-center font-medium mb-4">{fetchError}</p>
        <button
          onClick={() => {
            setFetchError(null)
            setIsQuestionsReady(false)
          }}
          className="bg-[#378ADD] text-white rounded-xl py-3 px-6 font-bold"
        >
          Try Again
        </button>
      </div>
    )
  }

  // Loading state - not mounted yet, questions not ready, or current question missing
  if (!isMounted || !isQuestionsReady || !sessionQuestions[currentQuestion]) {
    return (
      <div className="min-h-screen bg-[#021f3d] flex flex-col items-center justify-center">
        <Spinner className="w-8 h-8 text-[#378ADD]" />
        <p className="text-[#85B7EB] mt-4 font-medium">Loading questions...</p>
      </div>
    )
  }

  // Results screen
  if (showResults) {
    return (
      <ResultsScreen 
        score={score} 
        isChallenge={isChallenge}
        categoryName={categoryName}
        onPlayAgain={handlePlayAgain}
        answerResults={answerResults}
        sessionQuestions={sessionQuestions}
      />
    )
  }

  // Main game screen
  return (
    <div className="min-h-screen bg-[#021f3d] flex flex-col">
      {/* Speed Bonus Animation */}
      {showSpeedBonus && <SpeedBonusAnimation />}
      
      {/* Header */}
      <header className="sticky top-0 z-10 bg-[#021f3d] px-5 pt-4 pb-3">
        <div className="flex items-center justify-between mb-3">
          {/* Calculator Button (Math categories only) */}
          <div className="w-10">
            {isMathCategory && (
              <CalculatorButton onClick={() => setShowCalculator(true)} />
            )}
          </div>
          
          <h1 className="text-xl font-extrabold text-white">{categoryName}</h1>
          
          {/* Timer */}
          <CountdownTimer timeRemaining={timeRemaining} totalTime={totalTime} />
        </div>
        
        {/* Progress Pips */}
        <div className="flex gap-2">
          {Array.from({ length: TOTAL_QUESTIONS }).map((_, index) => (
            <div
              key={index}
              className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                index <= currentQuestion
                  ? "bg-[#378ADD]"
                  : "bg-[#0a2d4a]"
              }`}
            />
          ))}
        </div>
      </header>

      {/* Question Content */}
      <main className="flex-1 flex flex-col px-5 py-6">
        {/* Question Text */}
        <div className="flex-1 flex items-center justify-center mb-8">
          <h2 className="text-2xl font-extrabold text-white text-center leading-relaxed px-2 max-w-xl">
            {question?.question}
          </h2>
        </div>

        {/* Answer Options */}
        <div className="w-full max-w-[480px] mx-auto space-y-3 pb-4 relative">
          {answerOptions.map((opt, index) => (
            <AnswerOption
              key={opt.letter}
              option={opt.text}
              index={index}
              letter={opt.letter}
              selectedAnswer={selectedAnswer}
              correctAnswer={correctAnswerIndex}
              explanation={question.explanation}
              onSelect={handleAnswerSelect}
              showGemAnimation={showGemAnimation && index === correctAnswerIndex}
              gemAmount={currentQuestionSpeedBonus ? speedGemPerCorrect : baseGemPerCorrect}
              isSpeedBonus={currentQuestionSpeedBonus}
              isTimeout={isTimeout}
            />
          ))}
        </div>

        {/* Next Question Button */}
        {hasAnswered && !isTimeout && (
          <div className="w-full max-w-[480px] mx-auto pt-4 pb-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <button
              onClick={handleNextQuestion}
              className="w-full bg-[#378ADD] text-white rounded-2xl py-4 px-6 flex items-center justify-center gap-2 font-extrabold text-lg shadow-lg shadow-[#378ADD]/30 transition-all active:scale-[0.98] hover:brightness-110"
            >
              {currentQuestion < TOTAL_QUESTIONS - 1 ? "next question" : "see results"}
              <ChevronRight className="w-5 h-5" strokeWidth={3} />
            </button>
          </div>
        )}
      </main>

      {/* Calculator Modal */}
      <Calculator isOpen={showCalculator} onClose={() => setShowCalculator(false)} />

      {/* CSS for gem animation */}
      <style jsx global>{`
        @keyframes gem-float {
          0% {
            opacity: 1;
            transform: translateY(0);
          }
          100% {
            opacity: 0;
            transform: translateY(-30px);
          }
        }
        .animate-gem-float {
          animation: gem-float 1s ease-out forwards;
        }
      `}</style>
    </div>
  )
}

interface AnswerOptionProps {
  option: string
  index: number
  letter: string
  selectedAnswer: number | null
  correctAnswer: number
  explanation: string
  onSelect: (index: number) => void
  showGemAnimation: boolean
  gemAmount: number
  isSpeedBonus: boolean
  isTimeout: boolean
}

function AnswerOption({
  option,
  index,
  letter,
  selectedAnswer,
  correctAnswer,
  explanation,
  onSelect,
  showGemAnimation,
  gemAmount,
  isSpeedBonus,
  isTimeout,
}: AnswerOptionProps) {
  const isSelected = selectedAnswer === index
  const isCorrect = index === correctAnswer
  const hasAnswered = selectedAnswer !== null
  const showAsCorrect = hasAnswered && isCorrect
  const showAsWrong = isSelected && !isCorrect

  const getBackgroundColor = () => {
    if (showAsCorrect) return "#16a34a"
    if (showAsWrong) return "#dc2626"
    return "#ffffff"
  }

  const getTextColor = () => {
    if (showAsCorrect || showAsWrong) return "#ffffff"
    return "#0a1628"
  }

  const getLetterBgColor = () => {
    if (showAsCorrect) return "rgba(255,255,255,0.2)"
    if (showAsWrong) return "rgba(255,255,255,0.2)"
    return "#378ADD"
  }

  return (
    <div className="relative">
      <button
        onClick={() => onSelect(index)}
        disabled={hasAnswered}
        className={`w-full rounded-2xl py-3 px-5 flex items-center gap-4 transition-all duration-300 ${
          hasAnswered ? "cursor-default" : "active:scale-[0.98] hover:shadow-lg cursor-pointer"
        }`}
        style={{
          backgroundColor: getBackgroundColor(),
          color: getTextColor(),
        }}
      >
        {/* Letter Circle */}
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm"
          style={{
            backgroundColor: getLetterBgColor(),
            color: "#ffffff",
          }}
        >
          {letter}
        </div>
        
        {/* Answer Text */}
        <span className="text-lg font-bold flex-1 text-left">{option}</span>
        
        {/* Check/X Icon */}
        {showAsCorrect && <Check className="w-6 h-6 flex-shrink-0" strokeWidth={3} />}
        {showAsWrong && <X className="w-6 h-6 flex-shrink-0" strokeWidth={3} />}
      </button>
      
      {/* Floating Gem Animation */}
      {showGemAnimation && (
        <FloatingGemIndicator amount={gemAmount} isSpeedBonus={isSpeedBonus} />
      )}
      
      {/* Explanation */}
      {showAsCorrect && (
        <p className="mt-2 px-4 text-sm text-[#85B7EB] italic leading-relaxed animate-in fade-in slide-in-from-top-2 duration-300">
          {explanation}
        </p>
      )}
    </div>
  )
}

interface ResultsScreenProps {
  score: number
  isChallenge: boolean
  categoryName: string
  onPlayAgain: () => void
  answerResults: AnswerResult[]
  sessionQuestions: Question[]
}

function getEncouragementMessage(score: number): string {
  if (score === 5) return "Perfect score! Dare someone to match it"
  if (score === 4) return "Really strong! Think your friends can beat that?"
  if (score === 3) return "Not bad! Bet you can beat your friends though"
  return "Tough round. Challenge a friend and see how they do"
}

function ResultsScreen({ score, isChallenge, categoryName, onPlayAgain, answerResults, sessionQuestions }: ResultsScreenProps) {
  const [showWaitlistSheet, setShowWaitlistSheet] = useState(false)
  const [totalGems, setTotalGems] = useState(0)

  // Read cumulative gem total from localStorage after gems have been added
  useEffect(() => {
    const stored = parseInt(localStorage.getItem("rally_gems") || "0", 10)
    setTotalGems(isNaN(stored) ? 0 : stored)
  }, [])
  
  // Calculate gems earned including speed bonuses
  const speedBonusCount = answerResults.filter(r => r.wasSpeedBonus).length
  const baseGem = isChallenge ? GEM_VALUES.challenge.correctAnswer : GEM_VALUES.solo.correctAnswer
  const speedGem = isChallenge ? GEM_VALUES.challenge.correctAnswerSpeed : GEM_VALUES.solo.correctAnswerSpeed
  const speedBonusExtra = speedBonusCount * (speedGem - baseGem)
  
  const { total: baseTotal, breakdown: baseBreakdown } = calculateRoundGems(score, TOTAL_QUESTIONS, isChallenge, true)
  const gemsEarned = baseTotal + speedBonusExtra
  
  // Build breakdown with speed bonus
  const breakdown = [...baseBreakdown]
  if (speedBonusCount > 0) {
    breakdown.push({
      label: `${speedBonusCount} speed bonus${speedBonusCount > 1 ? 'es' : ''}`,
      amount: speedBonusExtra,
    })
  }
  
  // Difficulty breakdown
  const difficultyStats = {
    easy: answerResults.filter(r => r.difficulty === "easy" && r.isCorrect).length,
    medium: answerResults.filter(r => r.difficulty === "medium" && r.isCorrect).length,
    hard: answerResults.filter(r => r.difficulty === "hard" && r.isCorrect).length,
  }

  const handleCategorySelect = (categoryId: string) => {
    window.location.href = `/play?category=${encodeURIComponent(categoryId)}`
  }

  return (
    <div className="min-h-screen bg-[#021f3d] flex flex-col items-center justify-center px-5 py-8">
      <div className="text-center mb-6">
        {/* Answer Circles with Check/X */}
        <div className="flex items-center justify-center gap-3 mb-3">
          {answerResults.map((result, index) => (
            <div
              key={index}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                result.isCorrect
                  ? "bg-green-500"
                  : "bg-red-500"
              }`}
            >
              {result.isCorrect ? (
                <Check className="w-5 h-5 text-white" strokeWidth={3} />
              ) : (
                <X className="w-5 h-5 text-white" strokeWidth={3} />
              )}
            </div>
          ))}
        </div>
        
        {/* Difficulty Badges */}
        <div className="flex items-center justify-center gap-3 mb-6">
          {answerResults.map((result, index) => {
            const colors = DIFFICULTY_COLORS[result.difficulty as keyof typeof DIFFICULTY_COLORS] || DIFFICULTY_COLORS.medium
            return (
              <span
                key={index}
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${colors.bg} ${colors.text}`}
              >
                {result.difficulty}
              </span>
            )
          })}
        </div>

        <h1 className="text-5xl font-extrabold text-white mb-2">
          {score} out of {TOTAL_QUESTIONS}
        </h1>
        <p className="text-[#85B7EB] text-xl font-semibold">{categoryName}</p>
        <p className="text-[#85B7EB]/80 text-lg mt-4 max-w-xs mx-auto">
          {getEncouragementMessage(score)}
        </p>
      </div>

      {/* Running gem total */}
      <div className="flex items-center gap-1.5 mb-2">
        <Diamond className="w-3.5 h-3.5 text-[#F59E0B] fill-[#F59E0B]" />
        <span className="text-sm text-[#85B7EB]/70">your total: {totalGems} gems</span>
      </div>

      {/* Gems Earned Card */}
      <div className="w-full max-w-sm mb-4 bg-gradient-to-r from-[#F59E0B]/20 to-[#F97316]/20 border border-[#F59E0B]/40 rounded-2xl p-5">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Diamond className="w-6 h-6 text-[#F59E0B] fill-[#F59E0B]" />
          <span className="text-2xl font-extrabold text-white">+{gemsEarned} gems</span>
        </div>
        
        {/* Breakdown */}
        <div className="space-y-1">
          {breakdown.map((item, index) => (
            <div key={index} className="flex justify-between text-sm">
              <span className="text-[#85B7EB]/80">{item.label}</span>
              <span className="text-[#F59E0B] font-semibold">+{item.amount}</span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Difficulty Breakdown Stats */}
      <div className="w-full max-w-sm mb-6 bg-[#0a2d4a] rounded-2xl p-4">
        <p className="text-xs font-bold text-[#85B7EB]/60 mb-2 uppercase tracking-wide">By Difficulty</p>
        <div className="flex justify-between gap-2">
          <div className="flex-1 text-center">
            <span className={`text-lg font-bold ${DIFFICULTY_COLORS.easy.text}`}>{difficultyStats.easy}</span>
            <p className="text-xs text-[#85B7EB]/60">easy</p>
          </div>
          <div className="flex-1 text-center border-x border-[#85B7EB]/20">
            <span className={`text-lg font-bold ${DIFFICULTY_COLORS.medium.text}`}>{difficultyStats.medium}</span>
            <p className="text-xs text-[#85B7EB]/60">medium</p>
          </div>
          <div className="flex-1 text-center">
            <span className={`text-lg font-bold ${DIFFICULTY_COLORS.hard.text}`}>{difficultyStats.hard}</span>
            <p className="text-xs text-[#85B7EB]/60">hard</p>
          </div>
        </div>
      </div>

      {/* Play Again Button */}
      <button
        onClick={onPlayAgain}
        className="w-full max-w-sm mb-6 bg-transparent border-2 border-[#378ADD] text-[#378ADD] rounded-2xl py-4 px-6 flex items-center justify-center gap-2 font-extrabold text-lg transition-all active:scale-[0.98] hover:bg-[#378ADD]/10"
      >
        <RotateCcw className="w-5 h-5" strokeWidth={2.5} />
        play again
      </button>

      {/* Category Picker */}
      <div className="w-full max-w-sm mb-6">
        <p className="text-[#85B7EB]/60 text-sm font-medium mb-3 text-center">try a different category</p>
        <div className="grid grid-cols-2 gap-2">
          {CATEGORIES.map((category) => (
            <button
              key={category.id}
              onClick={() => handleCategorySelect(category.id)}
              className="bg-white rounded-xl p-3 flex flex-col items-start transition-all active:scale-[0.98] hover:shadow-lg"
              style={{
                borderLeft: `3px solid ${category.color}`,
              }}
            >
              <span className="text-[#0a1628] font-bold text-sm">{category.name}</span>
              <span 
                className="text-xs font-semibold mt-0.5 flex items-center gap-0.5"
                style={{ color: category.color }}
              >
                play <ChevronRight className="w-3 h-3" strokeWidth={3} />
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Home link */}
      <a
        href="/"
        className="text-[#85B7EB]/50 text-sm font-medium mb-4 hover:text-[#85B7EB] transition-colors"
      >
        ← back to home
      </a>

      <div className="w-full max-w-sm space-y-3">
        {/* Challenge a Friend Button */}
        <div className="relative">
          <button
            onClick={() => setShowWaitlistSheet(true)}
            className="w-full bg-[#378ADD] text-white rounded-2xl py-4 px-6 flex flex-col items-center justify-center gap-1 font-extrabold shadow-lg shadow-[#378ADD]/30 transition-all active:scale-[0.98] hover:brightness-110"
          >
            <span className="text-lg">challenge a friend</span>
            <span className="text-xs font-semibold text-white/70">4x gems when it launches</span>
          </button>
          <div className="absolute -top-2 -right-2 bg-[#F59E0B] text-[#0a1628] text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            soon
          </div>
        </div>

        <button
          onClick={() => setShowWaitlistSheet(true)}
          className="w-full flex items-center justify-center gap-1 text-[#378ADD] text-sm font-semibold py-1 transition-all hover:brightness-125"
        >
          get 500 bonus gems when challenges launch
        </button>
      </div>

      <ChallengeWaitlistSheet 
        isOpen={showWaitlistSheet}
        onClose={() => setShowWaitlistSheet(false)}
        variant="challenge"
      />
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
