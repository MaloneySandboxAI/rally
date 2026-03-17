"use client"

import { useState, useCallback, useEffect, Suspense, useRef } from "react"
import { Check, X, RotateCcw, ChevronRight, Diamond, Sparkles } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useGems, calculateRoundGems, GEM_VALUES } from "@/lib/gem-context"
import { useQuestionTracker, type CategoryKey } from "@/lib/question-tracker-context"
import { ChallengeWaitlistSheet } from "@/components/rally/challenge-waitlist-sheet"
import { toast } from "sonner"
import { Spinner } from "@/components/ui/spinner"
import { ALL_QUESTIONS, type Question } from "@/lib/questions"

const CATEGORIES = [
  { id: "Algebra", name: "Algebra", color: "#378ADD" },
  { id: "Reading Comprehension", name: "Reading", color: "#14B8A6" },
  { id: "Grammar", name: "Grammar", color: "#A855F7" },
  { id: "Data & Statistics", name: "Data & Stats", color: "#F97316" },
]

// Fisher-Yates shuffle
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

// Helper to convert letter answer (A, B, C, D) to index (0, 1, 2, 3)
function letterToIndex(letter: string): number {
  return letter.charCodeAt(0) - 'A'.charCodeAt(0)
}

// Helper to strip "A) ", "B) " etc prefixes from options
function stripOptionPrefix(option: string): string {
  return option.replace(/^[A-D]\)\s*/, '')
}

const TOTAL_QUESTIONS = 5
const LETTER_LABELS = ["A", "B", "C", "D"]

// Floating gem animation component
function FloatingGemIndicator({ amount, isChallenge }: { amount: number; isChallenge: boolean }) {
  return (
    <div className="absolute -top-2 right-4 animate-gem-float pointer-events-none">
      <div className="flex items-center gap-1 bg-[#F59E0B] text-white px-2 py-1 rounded-full shadow-lg">
        <Diamond className="w-3 h-3 fill-white" />
        <span className="text-xs font-bold">+{amount}</span>
      </div>
    </div>
  )
}

function PlayPageContent() {
  const searchParams = useSearchParams()
  const isChallenge = searchParams.get("challenge") === "true"
  const categoryParam = searchParams.get("category") || "Algebra"
  const roundId = searchParams.get("t") || "initial" // Used to force new question selection
  const { addGems } = useGems()
  const { getUsedIds, markQuestionsUsed, resetCategory, getUsedCount } = useQuestionTracker()
  
  // Find category info
  const categoryInfo = CATEGORIES.find(c => c.id === categoryParam) || CATEGORIES[0]
  const categoryName = categoryInfo.name
  const categoryKey = categoryParam as CategoryKey
  
  // Track if we've shown the reset message this round
  const hasShownResetMessage = useRef(false)
  
  // Select questions once per round - using ref to store them
  const questionsRef = useRef<typeof ALL_QUESTIONS | null>(null)
  
  // Initialize questions on first render or when roundId/category changes
  if (questionsRef.current === null || questionsRef.current[0]?.category !== categoryParam) {
    const allCategoryQuestions = ALL_QUESTIONS.filter(q => q.category === categoryParam)
    const usedIds = getUsedIds(categoryKey)
    
    // Debug: log the state
    console.log(`[v0] Category: ${categoryParam}, Total questions: ${allCategoryQuestions.length}, Used: ${usedIds.size}, Available: ${allCategoryQuestions.length - usedIds.size}`)
    
    // Filter out used questions
    let availableQuestions = allCategoryQuestions.filter(q => !usedIds.has(q.id))
    
    // Only reset if we truly don't have enough questions (all exhausted)
    if (availableQuestions.length < TOTAL_QUESTIONS && usedIds.size >= allCategoryQuestions.length - TOTAL_QUESTIONS) {
      console.log(`[v0] Resetting category ${categoryParam} - all questions exhausted`)
      resetCategory(categoryKey)
      availableQuestions = allCategoryQuestions
      hasShownResetMessage.current = false
      
      // Show toast only once
      if (!hasShownResetMessage.current) {
        hasShownResetMessage.current = true
        setTimeout(() => {
          toast.success(`You've completed all ${categoryName} questions! Starting over with a fresh set.`, {
            duration: 3000,
          })
        }, 100)
      }
    }
    
    // Fisher-Yates shuffle and take first 5
    const selected = shuffleArray(availableQuestions).slice(0, TOTAL_QUESTIONS)
    
    // Mark these questions as used immediately
    markQuestionsUsed(categoryKey, selected.map(q => q.id))
    
    questionsRef.current = selected
  }
  
  const sessionQuestions = questionsRef.current || []

  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [showResults, setShowResults] = useState(false)
  const [showGemAnimation, setShowGemAnimation] = useState(false)
  const [gemsAwarded, setGemsAwarded] = useState(false)

  const question = sessionQuestions[currentQuestion]
  const correctAnswerIndex = letterToIndex(question.correct)
  const gemPerCorrect = isChallenge ? GEM_VALUES.challenge.correctAnswer : GEM_VALUES.solo.correctAnswer

  const handleAnswerSelect = useCallback((answerIndex: number) => {
    if (selectedAnswer !== null) return
    
    setSelectedAnswer(answerIndex)
    
    if (answerIndex === correctAnswerIndex) {
      setScore((prev) => prev + 1)
      // Show gem animation for correct answer
      setShowGemAnimation(true)
      setTimeout(() => setShowGemAnimation(false), 1000)
    }
  }, [selectedAnswer, correctAnswerIndex])

  const handleNextQuestion = () => {
    if (currentQuestion < TOTAL_QUESTIONS - 1) {
      setCurrentQuestion((prev) => prev + 1)
      setSelectedAnswer(null)
    } else {
      setShowResults(true)
    }
  }

  const handlePlayAgain = () => {
    // Add timestamp to force fresh question selection while keeping the same category
    window.location.href = `/play?category=${encodeURIComponent(categoryParam)}&t=${Date.now()}`
  }

  // Award gems when showing results
  useEffect(() => {
    if (showResults && !gemsAwarded) {
      const { total } = calculateRoundGems(score, TOTAL_QUESTIONS, isChallenge, true)
      addGems(total)
      setGemsAwarded(true)
    }
  }, [showResults, gemsAwarded, score, isChallenge, addGems])

  if (showResults) {
    return (
      <ResultsScreen 
        score={score} 
        isChallenge={isChallenge}
        categoryName={categoryName}
        onPlayAgain={handlePlayAgain} 
      />
    )
  }

  const hasAnswered = selectedAnswer !== null

  return (
    <div className="min-h-screen bg-[#021f3d] flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-[#021f3d] px-5 pt-4 pb-3">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-extrabold text-white">{categoryName}</h1>
          <div className="flex items-center gap-3">
            {/* Gem indicator */}
            <div className="flex items-center gap-1 text-[#F59E0B]">
              <Diamond className="w-4 h-4 fill-[#F59E0B]" />
              <span className="text-xs font-bold">+{gemPerCorrect}</span>
            </div>
            <span className="text-sm font-semibold text-[#85B7EB]">
              Q{currentQuestion + 1} of {TOTAL_QUESTIONS}
            </span>
          </div>
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
            {question.question}
          </h2>
        </div>

        {/* Answer Options */}
        <div className="w-full max-w-[480px] mx-auto space-y-3 pb-4 relative">
          {question.options.map((option, index) => (
            <AnswerOption
              key={index}
              option={stripOptionPrefix(option)}
              index={index}
              letter={LETTER_LABELS[index]}
              selectedAnswer={selectedAnswer}
              correctAnswer={correctAnswerIndex}
              explanation={question.explanation}
              onSelect={handleAnswerSelect}
              showGemAnimation={showGemAnimation && index === correctAnswerIndex}
              gemAmount={gemPerCorrect}
              isChallenge={isChallenge}
            />
          ))}
        </div>

        {/* Next Question Button */}
        {hasAnswered && (
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
  isChallenge: boolean
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
  isChallenge,
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
        <FloatingGemIndicator amount={gemAmount} isChallenge={isChallenge} />
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
}

function getEncouragementMessage(score: number): string {
  if (score === 5) return "Perfect score! Dare someone to match it"
  if (score === 4) return "Really strong! Think your friends can beat that?"
  if (score === 3) return "Not bad! Bet you can beat your friends though"
  return "Tough round. Challenge a friend and see how they do"
}

function ResultsScreen({ score, isChallenge, categoryName, onPlayAgain }: ResultsScreenProps) {
  const [showWaitlistSheet, setShowWaitlistSheet] = useState(false)
  
  // Calculate gems earned
  const { total: gemsEarned, breakdown } = calculateRoundGems(score, TOTAL_QUESTIONS, isChallenge, true)

  const handleCategorySelect = (categoryId: string) => {
    // Force full page reload to reset all state (score, progress, questions)
    window.location.href = `/play?category=${encodeURIComponent(categoryId)}`
  }

  return (
    <div className="min-h-screen bg-[#021f3d] flex flex-col items-center justify-center px-5 py-8">
      <div className="text-center mb-6">
        {/* Score Circles */}
        <div className="flex items-center justify-center gap-3 mb-6">
          {Array.from({ length: TOTAL_QUESTIONS }).map((_, index) => (
            <div
              key={index}
              className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all ${
                index < score
                  ? "bg-[#378ADD] border-[#378ADD]"
                  : "bg-transparent border-[#378ADD]/40"
              }`}
            >
              {index < score && <Check className="w-5 h-5 text-white" strokeWidth={3} />}
            </div>
          ))}
        </div>

        <h1 className="text-5xl font-extrabold text-white mb-2">
          {score} out of {TOTAL_QUESTIONS}
        </h1>
        <p className="text-[#85B7EB] text-xl font-semibold">{categoryName}</p>
        <p className="text-[#85B7EB]/80 text-lg mt-4 max-w-xs mx-auto">
          {getEncouragementMessage(score)}
        </p>
      </div>

      {/* Gems Earned Card */}
      <div className="w-full max-w-sm mb-6 bg-gradient-to-r from-[#F59E0B]/20 to-[#F97316]/20 border border-[#F59E0B]/40 rounded-2xl p-5">
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

      {/* Play Again Button */}
      <button
        onClick={onPlayAgain}
        className="w-full max-w-sm mb-6 bg-transparent border-2 border-[#378ADD] text-[#378ADD] rounded-2xl py-4 px-6 flex items-center justify-center gap-2 font-extrabold text-lg transition-all active:scale-[0.98] hover:bg-[#378ADD]/10"
      >
        <RotateCcw className="w-5 h-5" strokeWidth={2.5} />
        play again
      </button>

      {/* Category Picker - Always Visible */}
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

      <div className="w-full max-w-sm space-y-3">
        {/* Challenge a Friend Button - Coming Soon */}
        <div className="relative">
          <button
            onClick={() => setShowWaitlistSheet(true)}
            className="w-full bg-[#378ADD] text-white rounded-2xl py-4 px-6 flex flex-col items-center justify-center gap-1 font-extrabold shadow-lg shadow-[#378ADD]/30 transition-all active:scale-[0.98] hover:brightness-110"
          >
            <span className="text-lg">challenge a friend</span>
            <span className="text-xs font-semibold text-white/70">4x gems when it launches</span>
          </button>
          {/* Coming Soon Badge */}
          <div className="absolute -top-2 -right-2 bg-[#F59E0B] text-[#0a1628] text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            soon
          </div>
        </div>

        {/* Challenge CTA Line */}
        <button
          onClick={() => setShowWaitlistSheet(true)}
          className="w-full flex items-center justify-center gap-1 text-[#378ADD] text-sm font-semibold py-1 transition-all hover:brightness-125"
        >
          get 500 bonus gems when challenges launch
        </button>
      </div>

      {/* Waitlist Sheet */}
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
