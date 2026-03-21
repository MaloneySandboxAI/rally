"use client"

import { useState, useCallback, useEffect, Suspense, useRef } from "react"
import { Check, X, RotateCcw, ChevronRight, Diamond, Zap, Sparkles, Heart, BookOpen, ChevronDown } from "lucide-react"
import { useSearchParams } from "next/navigation"
import { useGems, GEM_VALUES, gemsForAnswer, markRoundCompleted } from "@/lib/gem-context"
import { ChallengeWaitlistSheet } from "@/components/rally/challenge-waitlist-sheet"
import { Calculator, CalculatorButton } from "@/components/rally/calculator"
import { toast } from "sonner"
import { Spinner } from "@/components/ui/spinner"
import { getQuestions, getOneQuestion, type Question } from "@/lib/questions"
import { saveRoundStats, getAdaptiveDifficulty } from "@/lib/stats"
import { canPlaySolo, getHearts, loseHeart, incrementRoundsToday, refillHearts, HEARTS_CONFIG } from "@/lib/hearts"

const CATEGORIES = [
  { id: "Algebra", name: "Algebra", color: "#378ADD", isMath: true },
  { id: "Reading Comprehension", name: "Reading", color: "#14B8A6", isMath: false },
  { id: "Grammar", name: "Grammar", color: "#A855F7", isMath: false },
  { id: "Data & Statistics", name: "Data & Stats", color: "#F97316", isMath: true },
]

// Timer by difficulty (seconds)
const TIMER_BY_DIFFICULTY: Record<string, number> = {
  easy: 30,
  medium: 60,
  hard: 90,
}

// Speed bonus threshold = half the question's time
function getSpeedThreshold(difficulty: string): number {
  return Math.floor((TIMER_BY_DIFFICULTY[difficulty] ?? 60) / 2)
}

// Module-level ref so usedIds NEVER resets on component remount
// Using an object outside React so it persists for the entire browser session
const sessionUsedIds: Record<string, Set<number>> = {}

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

// Generate a genuinely helpful "learn more" breakdown for a wrong answer
// Structured as: concept → approach → walkthrough → common mistake → takeaway
function getDetailedExplanation(q: Question): {
  concept: string
  approach: string
  walkthrough: string[]
  commonMistake: string
  takeaway: string
} {
  const options = [q.option_a, q.option_b, q.option_c, q.option_d]
  const correctIdx = letterToIndex(q.correct)
  const correctAnswer = options[correctIdx]
  const questionLower = q.question.toLowerCase()

  // --- Identify the concept being tested ---
  let concept = "problem solving"
  let approach = "Break the problem into smaller pieces and work through each one."
  let commonMistake = "Rushing through without checking your work."
  let takeaway = "Always verify your answer by plugging it back into the original problem."

  // Algebra patterns
  if (q.category === "Algebra") {
    if (questionLower.includes("slope")) {
      concept = "Slope of a Line"
      approach = "Slope measures steepness: rise over run. Use the formula (y\u2082 \u2013 y\u2081) / (x\u2082 \u2013 x\u2081). The key is keeping the order consistent \u2014 subtract the same point's coordinates on top and bottom."
      commonMistake = "Mixing up the order of subtraction (putting x values on top instead of y values) or swapping which point is \u201Cpoint 1\u201D vs \u201Cpoint 2\u201D partway through."
      takeaway = "Slope = rise/run = \u0394y/\u0394x. Pick one point as \u201Cfirst,\u201D stick with it for both subtractions."
    } else if (questionLower.includes("system") || (questionLower.includes("2x") && questionLower.includes("y ="))) {
      concept = "Systems of Equations"
      approach = "You have two equations with two unknowns. Your goal is to eliminate one variable so you can solve for the other. You can either add/subtract the equations directly, or solve one equation for a variable and substitute into the other."
      commonMistake = "Solving for x but forgetting the question asked for x + y (or some other expression). Always re-read what the question is actually asking for."
      takeaway = "After finding one variable, substitute back to get the other. Then check: does your answer match what the question asked?"
    } else if (questionLower.includes("percent") || questionLower.includes("%")) {
      concept = "Percent Change & Successive Percentages"
      approach = "When applying multiple percentage changes, multiply the multipliers \u2014 don\u2019t just add the percentages. A 30% increase means \u00D71.30. A 10% decrease means \u00D70.90. Chain them: 1.30 \u00D7 0.90."
      commonMistake = "Adding percentages directly (thinking 30% up and 10% down = 20% up). That only works for one change, not successive ones."
      takeaway = "Convert each percent change to a multiplier (1 + rate for increase, 1 \u2013 rate for decrease), then multiply them together."
    } else if (questionLower.includes("factor") || questionLower.includes("undefined") || questionLower.includes("denominator")) {
      concept = "Rational Expressions & Factoring"
      approach = "An expression is undefined when its denominator equals zero. Factor the denominator completely, then set each factor equal to zero to find the restricted values."
      commonMistake = "Only finding one factor of the denominator, or confusing factors of the numerator with factors of the denominator. The numerator doesn\u2019t affect where the expression is undefined."
      takeaway = "Undefined = denominator is zero. Factor the denominator, set each factor = 0, solve."
    } else if (questionLower.includes("f(") || questionLower.includes("function")) {
      concept = "Function Notation & Recursive Patterns"
      approach = "When a function rule says f(x+k) = f(x) + c, it tells you how the output changes as x increases by k. Build a table: start with the known value and apply the rule step by step until you reach the target input."
      commonMistake = "Trying to jump straight to the answer instead of building up step by step. With recursive rules, you must go through each step in order."
      takeaway = "For recursive functions, make a table and compute each value in sequence. Don\u2019t skip steps."
    } else if (questionLower.includes("quadratic") || questionLower.includes("x\u00B2") || questionLower.includes("x^2")) {
      concept = "Quadratic Equations"
      approach = "Quadratics can be solved by factoring, completing the square, or using the quadratic formula. First check if it factors nicely. If not, use x = (\u2013b \u00B1 \u221A(b\u00B2\u20134ac)) / 2a."
      commonMistake = "Forgetting the \u00B1 (there are usually two solutions) or making sign errors when applying the formula."
      takeaway = "Always check: can I factor this? If not, quadratic formula. And remember \u00B1 means two answers."
    } else {
      concept = "Algebraic Reasoning"
      approach = "Identify what the question is asking, isolate the unknown variable step by step, and simplify. Work backwards from the answer choices if you\u2019re stuck."
      commonMistake = "Doing too many steps in your head. Write each step down to avoid sign errors and arithmetic mistakes."
      takeaway = "When stuck, try plugging each answer choice back into the original equation to see which one works."
    }
  }

  // Reading Comprehension patterns
  if (q.category === "Reading Comprehension") {
    if (questionLower.includes("main idea") || questionLower.includes("primarily") || questionLower.includes("central")) {
      concept = "Main Idea & Central Argument"
      approach = "The main idea is what the entire passage is about \u2014 not just one paragraph. Look for the claim that everything else supports. Wrong answers often focus on a detail from one section rather than the overall message."
      commonMistake = "Picking an answer that\u2019s true but only covers part of the passage. The main idea must account for the whole text."
      takeaway = "Ask: \u201CCould I use this as a title for the entire passage?\u201D If it only fits one paragraph, it\u2019s a detail, not the main idea."
    } else if (questionLower.includes("evidence") || questionLower.includes("support") || questionLower.includes("best describes")) {
      concept = "Evidence-Based Reasoning"
      approach = "The SAT wants you to find the answer that is directly supported by specific words in the passage \u2014 not your interpretation or outside knowledge. Go back to the text and put your finger on the sentence that proves your answer."
      commonMistake = "Choosing an answer that \u201Cfeels right\u201D but isn\u2019t directly stated in the passage. The SAT rewards literal reading."
      takeaway = "Before selecting, ask: \u201CWhich exact sentence in the passage proves this?\u201D If you can\u2019t find one, it\u2019s probably wrong."
    } else if (questionLower.includes("infer") || questionLower.includes("imply") || questionLower.includes("suggest")) {
      concept = "Inference & Implication"
      approach = "An inference on the SAT is a very small logical step from what\u2019s stated \u2014 not a big leap. The correct answer will be strongly supported by the text, just not stated in those exact words."
      commonMistake = "Making too big of a leap. SAT inferences are conservative \u2014 they\u2019re almost directly stated."
      takeaway = "The best inference is barely an inference at all. If you have to make a big assumption, it\u2019s probably wrong."
    } else {
      concept = "Reading Comprehension Strategy"
      approach = "Read the question first, then go back to the relevant part of the passage. Don\u2019t rely on memory \u2014 always return to the text to verify."
      commonMistake = "Choosing the first answer that seems reasonable without checking it against the passage."
      takeaway = "The answer is always in the passage. Find it before you choose."
    }
  }

  // Grammar patterns
  if (q.category === "Grammar") {
    if (questionLower.includes("comma") || questionLower.includes("punctuat")) {
      concept = "Comma Rules & Punctuation"
      approach = "Commas separate items in a list, set off introductory phrases, and surround non-essential information. If removing the phrase between two commas still leaves a complete sentence, the commas are correct."
      commonMistake = "Adding commas wherever you\u2019d naturally pause when speaking. Pauses don\u2019t always mean commas in writing."
      takeaway = "Test it: remove the phrase between commas. If the sentence still works, the commas belong."
    } else if (questionLower.includes("subject") || questionLower.includes("verb") || questionLower.includes("agree")) {
      concept = "Subject-Verb Agreement"
      approach = "Find the true subject of the sentence (ignore phrases between the subject and verb). Then match: singular subjects take singular verbs, plural subjects take plural verbs."
      commonMistake = "Being tricked by a prepositional phrase between the subject and verb. \u201CThe box of chocolates IS\u201D (not \u201Care\u201D) \u2014 the subject is \u201Cbox,\u201D not \u201Cchocolates.\u201D"
      takeaway = "Cross out everything between the subject and verb. What\u2019s left tells you which verb form is correct."
    } else if (questionLower.includes("tense") || questionLower.includes("was") || questionLower.includes("were") || questionLower.includes("had")) {
      concept = "Verb Tense Consistency"
      approach = "The verbs in a sentence or passage should stay in the same tense unless there\u2019s a clear reason to shift (like describing something that happened before something else). Look at the surrounding verbs for context clues."
      commonMistake = "Mixing past and present tense in the same paragraph without realizing it."
      takeaway = "Check the verbs around the blank. They tell you which tense to use."
    } else {
      concept = "Grammar & Standard English"
      approach = "Read the sentence with each answer choice inserted. The correct answer will be clear, concise, and follow standard grammar rules. When two options seem similar, pick the shorter one that doesn\u2019t lose meaning."
      commonMistake = "Picking the answer that sounds most \u201Cfancy\u201D or formal. The SAT prefers clear and concise over wordy and complex."
      takeaway = "Shorter is usually better on the SAT, as long as the meaning is preserved."
    }
  }

  // Data & Statistics patterns
  if (q.category === "Data & Statistics") {
    if (questionLower.includes("mean") || questionLower.includes("average") || questionLower.includes("median")) {
      concept = "Mean, Median & Measures of Center"
      approach = "Mean = sum of all values \u00F7 number of values. Median = the middle value when sorted. The mean is pulled toward outliers; the median isn\u2019t. Know which one the question is asking for."
      commonMistake = "Calculating the mean when the question asks for the median (or vice versa). They can give very different answers when outliers are present."
      takeaway = "Mean is sensitive to extreme values. Median is resistant. Always check which one the question wants."
    } else if (questionLower.includes("probability") || questionLower.includes("likely") || questionLower.includes("chance")) {
      concept = "Probability"
      approach = "Probability = favorable outcomes \u00F7 total possible outcomes. Make sure you\u2019re counting both correctly. For \u201Cor\u201D questions, add probabilities (but subtract overlap). For \u201Cand\u201D questions, multiply."
      commonMistake = "Forgetting to account for all possible outcomes in the denominator, or double-counting outcomes that overlap."
      takeaway = "P(event) = what you want \u00F7 everything possible. Write out both numbers before dividing."
    } else if (questionLower.includes("scatter") || questionLower.includes("best fit") || questionLower.includes("correlation")) {
      concept = "Scatterplots & Line of Best Fit"
      approach = "A line of best fit shows the general trend in scattered data. Use it to estimate values and identify whether the correlation is positive, negative, or none. The slope tells you the rate of change."
      commonMistake = "Confusing correlation with causation, or misreading the scale on the axes."
      takeaway = "The line of best fit is for estimation, not exact values. Always check the axis labels and scale."
    } else {
      concept = "Data Analysis & Interpretation"
      approach = "Read the chart or table carefully. Identify exactly what the numbers represent (counts? percentages? rates?). Then do the math the question asks for \u2014 don\u2019t assume."
      commonMistake = "Misreading what the y-axis or column headers represent. A \u201Cpercent\u201D and a \u201Ccount\u201D look very different even if the number is the same."
      takeaway = "Before calculating anything, ask: what do these numbers actually represent? Read every label."
    }
  }

  // Build the walkthrough from the existing explanation, made clearer
  const walkthrough: string[] = []
  const explParts = q.explanation
    .split(/[;.]/)
    .map(s => s.trim())
    .filter(s => s.length > 3)
  for (const part of explParts) {
    walkthrough.push(part + ".")
  }
  if (walkthrough.length === 0) {
    walkthrough.push(`The answer is ${q.correct}) ${correctAnswer}.`)
  }

  return { concept, approach, walkthrough, commonMistake, takeaway }
}

function PlayPageContent() {
  const searchParams = useSearchParams()
  const isChallenge = searchParams.get("challenge") === "true"
  const categoryParam = searchParams.get("category") || "Algebra"
  const { totalGems, addGems } = useGems()
  
  // Find category info
  const categoryInfo = CATEGORIES.find(c => c.id === categoryParam) || CATEGORIES[0]
  const categoryName = categoryInfo.name
  const isMathCategory = categoryInfo.isMath

  // usedIds lives at module level (sessionUsedIds) — never reset on remount
  function getUsedIdsForCategory(cat: string): number[] {
    return Array.from(sessionUsedIds[cat] ?? new Set<number>())
  }
  function markIdsUsed(cat: string, ids: number[]) {
    if (!sessionUsedIds[cat]) sessionUsedIds[cat] = new Set()
    ids.forEach(id => sessionUsedIds[cat].add(id))
  }
  function resetUsedIds(cat: string) {
    sessionUsedIds[cat] = new Set()
  }
  
  // Hearts state — solo only (challenges bypass all limits)
  const [hearts, setHearts] = useState(HEARTS_CONFIG.maxHearts)
  const [soloBlocked, setSoloBlocked] = useState<string | null>(null)

  // Questions state - fetched from Supabase one at a time (adaptive difficulty)
  const [sessionQuestions, setSessionQuestions] = useState<Question[]>([])
  const [isQuestionsReady, setIsQuestionsReady] = useState(false)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [isMounted, setIsMounted] = useState(false)
  const [isLoadingNext, setIsLoadingNext] = useState(false)

  // Within-round adaptive difficulty — uses useRef so it's never lost on re-render
  // and NEVER depends on localStorage. Resets to 'easy' at the start of every round.
  const difficultyRef = useRef<string>("easy")

  // Mark component as mounted (client-side only)
  useEffect(() => {
    setIsMounted(true)
    // Check hearts/round limits for solo play (challenges are always allowed)
    if (!isChallenge) {
      setHearts(getHearts())
      const check = canPlaySolo()
      if (!check.allowed) {
        setSoloBlocked(check.reason)
      }
    }
  }, [])

  // Fetch the FIRST question when the round starts
  useEffect(() => {
    if (!isMounted) return
    if (isQuestionsReady) return

    async function loadFirstQuestion() {
      try {
        // Always start a new round at 'easy'
        difficultyRef.current = "easy"
        const excluded = getUsedIdsForCategory(categoryParam)
        let question = await getOneQuestion(categoryParam, difficultyRef.current, excluded)
        if (!question) {
          // All questions seen — reset and try again
          resetUsedIds(categoryParam)
          question = await getOneQuestion(categoryParam, difficultyRef.current, [])
          toast.success("You've seen all questions! Starting fresh.", { duration: 3000 })
        }
        if (!question) {
          throw new Error("couldn't load questions — check your connection and try again")
        }
        markIdsUsed(categoryParam, [question.id])
        console.log(`[v0] Round start — difficulty: ${difficultyRef.current}, question id: ${question.id}`)
        setSessionQuestions([question])
        setIsQuestionsReady(true)
        setFetchError(null)
      } catch {
        setFetchError("couldn't load questions — check your connection and try again")
        setSessionQuestions([])
      }
    }

    loadFirstQuestion()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMounted, isQuestionsReady, categoryParam])

  // Fetch the NEXT question adaptively after each answer
  const fetchNextQuestion = useCallback(async () => {
    setIsLoadingNext(true)
    try {
      const excluded = getUsedIdsForCategory(categoryParam)
      let question = await getOneQuestion(categoryParam, difficultyRef.current, excluded)
      if (!question) {
        // All questions at this difficulty seen — reset IDs and try again
        resetUsedIds(categoryParam)
        question = await getOneQuestion(categoryParam, difficultyRef.current, [])
      }
      if (question) {
        markIdsUsed(categoryParam, [question.id])
        setSessionQuestions(prev => [...prev, question!])
        console.log(`[v0] Next question — difficulty: ${difficultyRef.current}, question id: ${question.id}`)
      }
    } catch (err) {
      console.error("[v0] Error fetching next question:", err)
    } finally {
      setIsLoadingNext(false)
    }
  }, [categoryParam])

  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [showResults, setShowResults] = useState(false)
  const [showGemAnimation, setShowGemAnimation] = useState(false)
  const [showSpeedBonus, setShowSpeedBonus] = useState(false)
  const [gemsAwarded, setGemsAwarded] = useState(false)
  const [showCalculator, setShowCalculator] = useState(false)
  
  // Timer state — totalTime is per-question based on difficulty
  const [totalTime, setTotalTime] = useState(60) // default medium until question loads
  const [timeRemaining, setTimeRemaining] = useState(60)
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
  // Per-question gem values based on current question's difficulty
  const questionDifficulty = question?.difficulty || "easy"
  const baseGemPerCorrect = gemsForAnswer(questionDifficulty, isChallenge, false)
  const speedGemPerCorrect = gemsForAnswer(questionDifficulty, isChallenge, true)

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

    // Timeout counts as wrong — drop difficulty
    if (difficultyRef.current === "hard") {
      difficultyRef.current = "medium"
    } else if (difficultyRef.current === "medium") {
      difficultyRef.current = "easy"
    }

    // Record wrong answer due to timeout (hearts deducted at end of round, not mid-game)
    setAnswerResults(prev => [...prev, {
      questionIndex: currentQuestion,
      isCorrect: false,
      difficulty: question?.difficulty || "medium",
      wasSpeedBonus: false,
      gemsEarned: 0,
    }])

    // Show the correct answer briefly then auto-advance
    setSelectedAnswer(-1) // -1 indicates timeout

    setTimeout(async () => {
      if (currentQuestion < TOTAL_QUESTIONS - 1) {
        await fetchNextQuestion()
        setCurrentQuestion(prev => prev + 1)
        setSelectedAnswer(null)
      } else {
        setShowResults(true)
      }
    }, 2000)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isQuestionsReady, timeRemaining, selectedAnswer, currentQuestion, question])
  
  // Reset timer when moving to next question — use difficulty-based time
  useEffect(() => {
    if (!isQuestionsReady) return
    const diff = sessionQuestions[currentQuestion]?.difficulty || "medium"
    const t = TIMER_BY_DIFFICULTY[diff] ?? 60
    setTotalTime(t)
    setTimeRemaining(t)
    setIsTimerActive(true)
    questionStartTimeRef.current = Date.now()
    setCurrentQuestionSpeedBonus(false)
  }, [isQuestionsReady, currentQuestion, sessionQuestions])

  const handleAnswerSelect = useCallback((answerIndex: number) => {
    if (selectedAnswer !== null) return
    
    // Stop timer
    setIsTimerActive(false)
    if (timerRef.current) clearInterval(timerRef.current)
    
    setSelectedAnswer(answerIndex)
    
    // Calculate time taken — speed threshold is half of this question's difficulty time
    const timeTaken = (Date.now() - questionStartTimeRef.current) / 1000
    const speedThreshold = getSpeedThreshold(question?.difficulty || "medium")
    const isSpeedBonus = timeTaken <= speedThreshold
    
    if (answerIndex === correctAnswerIndex) {
      setScore(prev => prev + 1)

      const gemsForThis = gemsForAnswer(question?.difficulty || "easy", isChallenge, isSpeedBonus)

      // Adaptive difficulty: bump UP on correct answer
      if (difficultyRef.current === "easy") {
        difficultyRef.current = "medium"
      } else if (difficultyRef.current === "medium") {
        difficultyRef.current = "hard"
      }
      // Already hard — stay hard

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
      // Adaptive difficulty: drop DOWN on wrong answer
      if (difficultyRef.current === "hard") {
        difficultyRef.current = "medium"
      } else if (difficultyRef.current === "medium") {
        difficultyRef.current = "easy"
      }
      // Already easy — stay easy

      // Record wrong answer (hearts deducted at end of round, not mid-game)
      setAnswerResults(prev => [...prev, {
        questionIndex: currentQuestion,
        isCorrect: false,
        difficulty: question?.difficulty || "medium",
        wasSpeedBonus: false,
        gemsEarned: 0,
      }])
    }
  }, [selectedAnswer, correctAnswerIndex, currentQuestion, question, isChallenge, baseGemPerCorrect, speedGemPerCorrect])

  const handleNextQuestion = useCallback(async () => {
    if (currentQuestion < TOTAL_QUESTIONS - 1) {
      // Fetch the next question at the current adaptive difficulty
      await fetchNextQuestion()
      setCurrentQuestion(prev => prev + 1)
      setSelectedAnswer(null)
    } else {
      setShowResults(true)
    }
  }, [currentQuestion, fetchNextQuestion])

  const handlePlayAgain = useCallback(() => {
    // Reset all game state in-place so usedIds ref is preserved across rounds
    difficultyRef.current = "easy" // Always restart at easy
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
    setIsLoadingNext(false)
    setFetchError(null)
  }, [])

  // Award gems when showing results — only correct answers + speed bonuses
  useEffect(() => {
    if (showResults && !gemsAwarded) {
      const correctGems = answerResults
        .filter(r => r.isCorrect)
        .reduce((sum, r) => sum + r.gemsEarned, 0)
      const correctCount = answerResults.filter(r => r.isCorrect).length

      addGems(correctGems)
      markRoundCompleted()
      if (!isChallenge) {
        incrementRoundsToday()
        // Deduct hearts at end of round — 1 per wrong answer
        const wrongCount = answerResults.filter(r => !r.isCorrect).length
        for (let i = 0; i < wrongCount; i++) {
          loseHeart()
        }
        setHearts(getHearts())
      }
      const unlockMessage = saveRoundStats({
        categoryId: categoryParam,
        correct: correctCount,
        total: TOTAL_QUESTIONS,
        gemsEarned: correctGems,
        answerResults,
      })
      if (unlockMessage) {
        toast.success(`\u{1F3AF} ${unlockMessage}`, { duration: 5000 })
      }
      setGemsAwarded(true)
    }
  }, [showResults, gemsAwarded, isChallenge, addGems, answerResults, categoryParam])

  // Derived values for rendering (always computed, never early return)
  const hasAnswered = selectedAnswer !== null
  const isTimeout = selectedAnswer === -1

  // Solo play blocked (no hearts or daily limit reached)
  if (soloBlocked && !isChallenge) {
    return (
      <div className="min-h-screen bg-[#021f3d] flex flex-col items-center justify-center px-6 text-center">
        <Heart className="w-16 h-16 text-red-400 mb-4" />
        <h1 className="text-2xl font-extrabold text-white mb-2">{soloBlocked}</h1>
        <div className="flex flex-col gap-3 mt-6 w-full max-w-xs">
          <button
            onClick={() => {
              const success = refillHearts(totalGems, addGems)
              if (success) {
                setHearts(HEARTS_CONFIG.maxHearts)
                setSoloBlocked(null)
                toast.success("hearts refilled!", { duration: 2000 })
              } else {
                toast.error("not enough gems", { duration: 2000 })
              }
            }}
            className="bg-[#EF9F27] text-white rounded-2xl py-3 px-6 font-bold flex items-center justify-center gap-2"
          >
            <Diamond className="w-4 h-4 fill-white" />
            refill 5 hearts ({HEARTS_CONFIG.refillCost} gems)
          </button>
          <a
            href="/"
            className="bg-[#0a2d4a] text-[#85B7EB] rounded-2xl py-3 px-6 font-bold text-center"
          >
            back to home
          </a>
        </div>
      </div>
    )
  }

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

  // Loading state - not mounted yet, questions not ready, loading next, or current question missing
  if (!isMounted || !isQuestionsReady || isLoadingNext || !sessionQuestions[currentQuestion]) {
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

          <div className="flex items-center gap-3">
            {/* Hearts (solo only) */}
            {!isChallenge && (
              <div className="flex items-center gap-1">
                <Heart className="w-4 h-4 text-red-400 fill-red-400" />
                <span className="text-sm font-bold text-red-400">{hearts}</span>
              </div>
            )}
            {/* Timer */}
            <CountdownTimer timeRemaining={timeRemaining} totalTime={totalTime} />
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
  const { totalGems } = useGems() // Use context — stays in sync with parent's addGems call
  const [isGuest, setIsGuest] = useState(false)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set())

  const toggleExpanded = (idx: number) => {
    setExpandedCards(prev => {
      const next = new Set(prev)
      if (next.has(idx)) next.delete(idx)
      else next.add(idx)
      return next
    })
  }

  // Auto-show review modal if there are wrong answers
  const wrongAnswers = answerResults
    .map((r, i) => ({ ...r, question: sessionQuestions[i] }))
    .filter(r => !r.isCorrect && r.question)

  // Show review modal automatically when results load if there are wrong answers
  useEffect(() => {
    if (wrongAnswers.length > 0) {
      setShowReviewModal(true)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setIsGuest(localStorage.getItem("rally_is_guest") === "true")
  }, [])
  
  // Single source of truth: count correct answers directly from answerResults
  const correctCount = answerResults.filter(r => r.isCorrect).length
  const speedBonusCount = answerResults.filter(r => r.isCorrect && r.wasSpeedBonus).length
  const gemsEarned = answerResults.reduce((sum, r) => sum + r.gemsEarned, 0)

  // Build breakdown by difficulty tier — show base gems, then speed bonus extra separately
  const breakdown: { label: string; amount: number }[] = []
  const diffGroups = { easy: [] as AnswerResult[], medium: [] as AnswerResult[], hard: [] as AnswerResult[] }
  for (const r of answerResults.filter(r => r.isCorrect)) {
    const d = (r.difficulty || "easy") as keyof typeof diffGroups
    if (diffGroups[d]) diffGroups[d].push(r)
  }
  let speedBonusExtra = 0
  for (const [diff, results] of Object.entries(diffGroups)) {
    if (results.length > 0) {
      const baseRate = GEM_VALUES.solo[diff as keyof typeof GEM_VALUES.solo] ?? GEM_VALUES.solo.easy
      const baseGems = results.length * baseRate
      const actualGems = results.reduce((sum, r) => sum + r.gemsEarned, 0)
      speedBonusExtra += actualGems - baseGems
      breakdown.push({
        label: `${results.length} ${diff} correct`,
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
  if (correctCount === 0) {
    breakdown.push({ label: "no correct answers", amount: 0 })
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
          {correctCount} out of {TOTAL_QUESTIONS}
        </h1>
        <p className="text-[#85B7EB] text-xl font-semibold">{categoryName}</p>
        <p className="text-[#85B7EB]/80 text-lg mt-4 max-w-xs mx-auto">
          {getEncouragementMessage(correctCount)}
        </p>
      </div>

      {/* Running gem total */}
      <div className="flex items-center gap-1.5 mb-2">
        <Diamond className="w-3.5 h-3.5 text-[#F59E0B] fill-[#F59E0B]" />
        <span className="text-sm text-[#85B7EB]/70">your total: {totalGems} gems</span>
      </div>

      {/* Guest save-progress banner */}
      {isGuest && (
        <div className="w-full max-w-sm mb-4 bg-[#0a2d4a] border border-[#378ADD]/40 rounded-2xl px-5 py-4 flex items-center justify-between gap-3">
          <p className="text-[#85B7EB] text-sm font-medium leading-snug flex-1">
            save your progress — create a free account
          </p>
          <a
            href="/login"
            className="bg-[#378ADD] text-white text-sm font-bold rounded-xl px-4 py-2 whitespace-nowrap hover:brightness-110 transition-all"
          >
            sign up free
          </a>
        </div>
      )}

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

      {/* Review Wrong Answers Modal */}
      {showReviewModal && wrongAnswers.length > 0 && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-end sm:items-center justify-center">
          <div className="bg-[#0a2d4a] w-full max-w-md max-h-[85vh] rounded-t-3xl sm:rounded-3xl flex flex-col animate-in slide-in-from-bottom duration-300">
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-[#85B7EB]/20">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#378ADD]" />
                <h2 className="text-lg font-extrabold text-white">review mistakes</h2>
              </div>
              <span className="text-sm text-[#85B7EB]/60">{wrongAnswers.length} to review</span>
            </div>

            {/* Scrollable list */}
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
                    {/* Difficulty badge */}
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${diffColors.bg} ${diffColors.text}`}>
                      {q.difficulty}
                    </span>
                    {/* Question */}
                    <p className="text-white font-semibold text-sm mt-2 mb-3 leading-relaxed">{q.question}</p>
                    {/* Correct answer */}
                    <div className="flex items-center gap-2 bg-green-500/15 border border-green-500/30 rounded-xl px-3 py-2 mb-3">
                      <Check className="w-4 h-4 text-green-400 flex-shrink-0" strokeWidth={3} />
                      <span className="text-green-400 text-sm font-semibold">{q.correct}) {options[correctIdx]}</span>
                    </div>
                    {/* Short explanation */}
                    <p className="text-[#85B7EB]/80 text-sm leading-relaxed">{q.explanation}</p>

                    {/* Learn more toggle */}
                    <button
                      onClick={() => toggleExpanded(idx)}
                      className="mt-3 flex items-center gap-1.5 text-[#378ADD] text-sm font-bold transition-all hover:brightness-125"
                    >
                      <BookOpen className="w-4 h-4" />
                      {isExpanded ? "hide details" : "learn more"}
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                    </button>

                    {/* Expanded detailed explanation */}
                    {isExpanded && detailed && (
                      <div className="mt-3 space-y-3 animate-in fade-in slide-in-from-top-1 duration-200">
                        {/* Concept */}
                        <div className="bg-[#378ADD]/10 border border-[#378ADD]/20 rounded-xl px-3 py-2.5">
                          <p className="text-xs font-bold text-[#378ADD] uppercase tracking-wide mb-1">concept: {detailed.concept}</p>
                          <p className="text-[#85B7EB] text-sm leading-relaxed">{detailed.approach}</p>
                        </div>

                        {/* Solution walkthrough */}
                        <div className="bg-[#0a2d4a] border border-[#85B7EB]/10 rounded-xl px-3 py-2.5">
                          <p className="text-xs font-bold text-green-400 uppercase tracking-wide mb-1.5">solving this one</p>
                          <ol className="space-y-1">
                            {detailed.walkthrough.map((step, si) => (
                              <li key={si} className="text-[#85B7EB]/90 text-sm leading-relaxed flex gap-2">
                                <span className="text-green-400 font-bold flex-shrink-0">{si + 1}.</span>
                                <span>{step}</span>
                              </li>
                            ))}
                          </ol>
                        </div>

                        {/* Common mistake */}
                        <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2.5">
                          <p className="text-xs font-bold text-red-400 uppercase tracking-wide mb-1">common mistake</p>
                          <p className="text-red-300/80 text-sm leading-relaxed">{detailed.commonMistake}</p>
                        </div>

                        {/* Takeaway */}
                        <div className="bg-[#EF9F27]/10 border border-[#EF9F27]/20 rounded-xl px-3 py-2.5">
                          <p className="text-xs font-bold text-[#EF9F27] uppercase tracking-wide mb-1">remember this</p>
                          <p className="text-[#EF9F27]/80 text-sm leading-relaxed">{detailed.takeaway}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Dismiss button */}
            <div className="px-5 pb-5 pt-3 border-t border-[#85B7EB]/20">
              <button
                onClick={() => setShowReviewModal(false)}
                className="w-full bg-[#378ADD] text-white rounded-2xl py-3.5 font-extrabold text-base transition-all active:scale-[0.98] hover:brightness-110"
              >
                got it
              </button>
            </div>
          </div>
        </div>
      )}
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
