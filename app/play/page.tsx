"use client"

import { useState, useCallback, useEffect, Suspense, useRef } from "react"
import { Check, ChevronRight, Diamond, Heart } from "lucide-react"
import { useSearchParams } from "next/navigation"
import { useGems, GEM_VALUES, gemsForAnswer, markRoundCompleted } from "@/lib/gem-context"
import { completeReferralIfPending } from "@/lib/referrals"
// ChallengeWaitlistSheet removed — challenges are now created before playing
import { WorkArea, WorkAreaButton } from "@/components/rally/work-area"
import { toast } from "sonner"
import { Spinner } from "@/components/ui/spinner"
import { getOneQuestion, getQuestionsByIds, resetQuestionHistoryForCategory, type Question } from "@/lib/questions"
import { completeChallenge, updateCreatorResults, getChallenge, poolFromFlat, type ChallengeResult, type ChallengePool } from "@/lib/challenges"
import { saveRoundStats } from "@/lib/stats"
import { checkGemMilestone, GemMilestoneCelebration } from "@/components/rally/gem-milestone"
import { canPlaySolo, getHearts, loseHeart, incrementRoundsToday, refillHearts, HEARTS_CONFIG } from "@/lib/hearts"
import { usePremium } from "@/lib/premium-context"
import { useIsNativeIOS } from "@/lib/use-platform"
import { createClient } from "@/lib/supabase/client"
import { SUBTOPIC_MAP } from "@/lib/diagnostic"
import { StreakCelebration } from "@/components/rally/streak-celebration"
import { haptics } from "@/lib/haptics"
import { getSubtopicLevel, pickDifficultyForLevel, adjustSubtopicLevel } from "@/lib/subtopic-levels"
import { updateParentSnapshot } from "@/lib/parent-dashboard"
import { MathText } from "@/components/rally/math-text"
import { ALL_CATEGORIES } from "@/lib/categories"
import { CountdownTimer, SpeedBonusAnimation, getTimerForQuestion, getSpeedThreshold } from "@/components/rally/countdown-timer"
import { AnswerOption } from "@/components/rally/answer-option"
import { ResultsScreen } from "@/components/rally/results-screen"
import { notifyChallengeOpponent } from "@/lib/challenge-notify"
import { getGroupChallenge, getGroupPool, submitGroupEntry } from "@/lib/group-challenges"

/** Get display name from Supabase auth session, falling back to stored guest name. */
async function getDisplayName(): Promise<string> {
  try {
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) {
      const meta = session.user.user_metadata
      return meta?.display_name || meta?.full_name || meta?.name || session.user.email?.split("@")[0] || "anonymous"
    }
  } catch {}
  if (typeof window !== "undefined") {
    const guestName = localStorage.getItem("rally_guest_name")
    if (guestName) return guestName
  }
  return "anonymous"
}

async function getUserId(): Promise<string | undefined> {
  try {
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    return session?.user?.id
  } catch {}
  return undefined
}

const CATEGORIES = ALL_CATEGORIES

// Module-level ref so usedIds NEVER resets on component remount
// Using an object outside React so it persists for the entire browser session
const sessionUsedIds: Record<string, Set<number>> = {}

// Helper to convert letter answer (A, B, C, D) to index (0, 1, 2, 3)
function letterToIndex(letter: string): number {
  return letter.charCodeAt(0) - 'A'.charCodeAt(0)
}

const TOTAL_QUESTIONS = 5

interface AnswerResult {
  questionIndex: number
  isCorrect: boolean
  difficulty: string
  wasSpeedBonus: boolean
  gemsEarned: number
  chosenAnswerIndex: number | null
}
function PlayPageContent() {
  const searchParams = useSearchParams()
  const challengeCode = searchParams.get("challengeCode") || null
  const creatorChallengeCode = searchParams.get("creatorChallenge") || null
  const groupCode = searchParams.get("group") || null
  const isChallenge = searchParams.get("challenge") === "true" || !!creatorChallengeCode || !!challengeCode || !!groupCode
  const isCreatorChallenge = !!creatorChallengeCode
  const isGroupChallenge = !!groupCode
  const categoryParam = searchParams.get("category") || "Algebra"
  const subtopicParam = searchParams.get("subtopic") || null
  const isUntimed = searchParams.get("untimed") === "true" && !isChallenge // untimed practice mode (solo only)
  const { totalGems, addGems } = useGems()
  const { isPremium, dailyGemsCapped, dailyGemsRemaining, recordGemsEarned } = usePremium()
  // Hide Stripe-backed upgrade prompts inside the iOS app (Apple Guideline 3.1.1)
  const isNativeIOS = useIsNativeIOS()

  // Find category info
  const categoryInfo = CATEGORIES.find(c => c.id === categoryParam) || CATEGORIES[0]
  const categoryName = categoryInfo.name
  const isMathCategory = categoryInfo.isMath

  // usedIds lives at module level (sessionUsedIds) — never reset on remount
  function getUsedIdsForCategory(cat: string): number[] {
    const ids = Array.from(sessionUsedIds[cat] ?? new Set<number>())
    console.log(`[v0] Used IDs for ${cat}: [${ids.join(', ')}] (${ids.length} total)`)
    return ids
  }
  function markIdsUsed(cat: string, ids: number[]) {
    if (!sessionUsedIds[cat]) sessionUsedIds[cat] = new Set()
    ids.forEach(id => sessionUsedIds[cat].add(id))
  }
  function resetUsedIds(cat: string) {
    console.log(`[v0] Resetting used IDs for ${cat} — all questions exhausted`)
    sessionUsedIds[cat] = new Set()
  }
  
  // Hearts state — solo only (challenges bypass all limits)
  const [hearts, setHearts] = useState(HEARTS_CONFIG.maxHearts)
  const [soloBlocked, setSoloBlocked] = useState<string | null>(null)

  // Challenge creator's score (for win/loss/tie outcome bonus)
  const [creatorScore, setCreatorScore] = useState<number | null>(null)

  // Challenge question pool — shared between both players
  // Both players draw from the same pool based on their adaptive path
  const challengePoolRef = useRef<ChallengePool | null>(null)
  const challengePoolQuestionsRef = useRef<Map<number, Question>>(new Map()) // id → Question cache
  const poolDrawCountRef = useRef<Record<string, number>>({ easy: 0, medium: 0, hard: 0 })

  // Questions state - fetched from Supabase one at a time (adaptive difficulty)
  const [sessionQuestions, setSessionQuestions] = useState<Question[]>([])
  const [isQuestionsReady, setIsQuestionsReady] = useState(false)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [isMounted, setIsMounted] = useState(false)
  const [isLoadingNext, setIsLoadingNext] = useState(false)

  // Within-round adaptive difficulty — uses useRef so it's never lost on re-render
  // and NEVER depends on localStorage. Resets to 'easy' at the start of every round.
  const difficultyRef = useRef<string>("easy")

  // Current Supabase user id, resolved once per round and reused by both the
  // initial fetch and fetchNextQuestion so getOneQuestion can layer the
  // per-user persistent history on top of the session-used-IDs set.
  // undefined for guest play.
  const userIdRef = useRef<string | undefined>(undefined)

  // Mark component as mounted (client-side only)
  useEffect(() => {
    setIsMounted(true)
    // Track last played category so Quick Challenge can default to it
    if (typeof window !== "undefined") {
      localStorage.setItem("rally_last_category", categoryParam)
    }
    // Check hearts/round limits for solo play (challenges + untimed are always allowed)
    if (!isChallenge && !isUntimed) {
      setHearts(getHearts())
      const check = canPlaySolo()
      if (!check.allowed) {
        setSoloBlocked(check.reason)
      }
      // Note: dailyGemsCapped no longer blocks gameplay — earning is capped
      // automatically in the results screen via recordGemsEarned + Math.min().
      // Users always get to play; they just stop accumulating gems past the
      // daily cap.
    }
  }, [])

  // Helper: draw the next question from challenge pool at current difficulty
  function drawFromPool(difficulty: string): Question | null {
    const pool = challengePoolRef.current
    const cache = challengePoolQuestionsRef.current
    const counts = poolDrawCountRef.current
    if (!pool) return null

    // Try requested difficulty, fall back to others
    const tryDifficulties = [difficulty, "easy", "medium", "hard"]
    for (const diff of tryDifficulties) {
      const ids = pool[diff as keyof ChallengePool] || []
      const idx = counts[diff] || 0
      if (idx < ids.length) {
        const qId = ids[idx]
        counts[diff] = idx + 1
        const question = cache.get(qId)
        if (question) return question
      }
    }
    return null
  }

  // Fetch the FIRST question when the round starts
  useEffect(() => {
    if (!isMounted) return
    if (isQuestionsReady) return

    async function loadFirstQuestion() {
      try {
        // GROUP CHALLENGE MODE: load shared pool from group_challenges table
        if (groupCode) {
          const gc = await getGroupChallenge(groupCode)
          if (!gc) {
            throw new Error("Group challenge not found — the link may be expired or invalid.")
          }
          if (gc.status === "closed") {
            window.location.href = `/group/${groupCode}`
            return
          }

          const pool = getGroupPool(gc)
          if (!pool.easy.length && !pool.medium.length && !pool.hard.length) {
            throw new Error("Challenge data is invalid — please try a new challenge.")
          }
          challengePoolRef.current = pool
          poolDrawCountRef.current = { easy: 0, medium: 0, hard: 0 }

          const allIds = [...pool.easy, ...pool.medium, ...pool.hard]
          const allQuestions = await getQuestionsByIds(allIds)
          const cache = new Map<number, Question>()
          for (const q of allQuestions) cache.set(q.id, q)
          challengePoolQuestionsRef.current = cache

          difficultyRef.current = "easy"
          const firstQuestion = drawFromPool("easy")
          if (!firstQuestion) {
            throw new Error("couldn't load challenge questions — try again")
          }
          setSessionQuestions([firstQuestion])
          setIsQuestionsReady(true)
          setFetchError(null)
          return
        }

        const isChallengeMode = !!challengeCode || !!creatorChallengeCode
        const activeCode = challengeCode || creatorChallengeCode

        // 1v1 CHALLENGE MODE: load shared pool and pre-fetch all questions
        if (isChallengeMode && activeCode) {
          const challenge = await getChallenge(activeCode)
          if (!challenge) {
            throw new Error("Challenge not found — the link may be expired or invalid.")
          }
          if (challengeCode && challenge.status === "completed") {
            window.location.href = `/challenge/${challengeCode}`
            return
          }
          if (challengeCode) {
            setCreatorScore(challenge.creator_score)
          }

          const pool = poolFromFlat(challenge.question_ids)
          if (!pool.easy.length && !pool.medium.length && !pool.hard.length) {
            throw new Error("Challenge data is invalid — please try a new challenge.")
          }
          challengePoolRef.current = pool
          poolDrawCountRef.current = { easy: 0, medium: 0, hard: 0 }

          // Pre-fetch ALL pool questions in one batch
          const allIds = [...pool.easy, ...pool.medium, ...pool.hard]
          const allQuestions = await getQuestionsByIds(allIds)
          const cache = new Map<number, Question>()
          for (const q of allQuestions) cache.set(q.id, q)
          challengePoolQuestionsRef.current = cache

          console.log(`[rally] Challenge pool loaded: ${pool.easy.length}E/${pool.medium.length}M/${pool.hard.length}H`)

          // Draw first question at 'easy'
          difficultyRef.current = "easy"
          const firstQuestion = drawFromPool("easy")
          if (!firstQuestion) {
            throw new Error("couldn't load challenge questions — try again")
          }
          setSessionQuestions([firstQuestion])
          setIsQuestionsReady(true)
          setFetchError(null)
          return
        }

        // SOLO MODE: difficulty based on subtopic level (or easy if no subtopic)
        if (subtopicParam) {
          const subLevel = getSubtopicLevel(subtopicParam)
          difficultyRef.current = pickDifficultyForLevel(subLevel.level)
        } else {
          difficultyRef.current = "easy"
        }
        // Resolve current user id once for this round — getOneQuestion uses it
        // to merge persistent history into the excluded set.
        userIdRef.current = await getUserId()
        const uid = userIdRef.current
        const excluded = getUsedIdsForCategory(categoryParam)
        let question = await getOneQuestion(categoryParam, difficultyRef.current, excluded, subtopicParam, uid)
        if (!question) {
          // True exhaustion: wipe both the in-memory set AND the persistent history.
          resetUsedIds(categoryParam)
          if (uid) {
            await resetQuestionHistoryForCategory(uid, categoryParam)
          }
          question = await getOneQuestion(categoryParam, difficultyRef.current, [], subtopicParam, uid)
          if (question) {
            toast.success("You've seen all questions! Starting fresh.", { duration: 3000 })
          }
        }
        if (!question) {
          throw new Error("couldn't load questions — check your connection and try again")
        }
        markIdsUsed(categoryParam, [question.id])
        console.log(`[v0] Round start — difficulty: ${difficultyRef.current}, question id: ${question.id}`)
        setSessionQuestions([question])
        setIsQuestionsReady(true)
        setFetchError(null)
      } catch (err: unknown) {
        setFetchError(err instanceof Error ? err.message : "couldn't load questions — check your connection and try again")
        setSessionQuestions([])
      }
    }

    loadFirstQuestion()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMounted, isQuestionsReady, categoryParam, challengeCode, creatorChallengeCode, groupCode])

  // Fetch the NEXT question adaptively after each answer
  const fetchNextQuestion = useCallback(async () => {
    setIsLoadingNext(true)
    try {
      // CHALLENGE MODE: draw from shared pool (instant, no fetch)
      if (challengePoolRef.current) {
        const question = drawFromPool(difficultyRef.current)
        if (question) {
          setSessionQuestions(prev => [...prev, question])
          console.log(`[rally] Pool draw — difficulty: ${difficultyRef.current}, question id: ${question.id}`)
        }
        setIsLoadingNext(false)
        return
      }

      // SOLO MODE: fetch from Supabase
      const uid = userIdRef.current
      const excluded = getUsedIdsForCategory(categoryParam)
      let question = await getOneQuestion(categoryParam, difficultyRef.current, excluded, subtopicParam, uid)
      if (!question) {
        resetUsedIds(categoryParam)
        if (uid) {
          await resetQuestionHistoryForCategory(uid, categoryParam)
        }
        question = await getOneQuestion(categoryParam, difficultyRef.current, [], subtopicParam, uid)
        if (question) {
          toast.success("You've seen all questions! Starting fresh.", { duration: 3000 })
        }
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
  const [pendingAnswer, setPendingAnswer] = useState<number | null>(null) // selected but not confirmed
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null) // confirmed answer
  const [score, setScore] = useState(0)
  const [showResults, setShowResults] = useState(false)
  const [showGemAnimation, setShowGemAnimation] = useState(false)
  const [showSpeedBonus, setShowSpeedBonus] = useState(false)
  const [gemsAwarded, setGemsAwarded] = useState(false)
  const [gemMilestone, setGemMilestone] = useState<number | null>(null)
  const [streakCelebration, setStreakCelebration] = useState<number | null>(null)
  const [showWorkArea, setShowWorkArea] = useState(false)
  
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

  // Timer effect (disabled in untimed mode)
  useEffect(() => {
    if (isUntimed) return // no timer in untimed practice
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
  }, [isQuestionsReady, isTimerActive, selectedAnswer, currentQuestion, isUntimed])
  
  // Handle time up in a separate effect to avoid stale closure
  useEffect(() => {
    if (isUntimed) return // no timeout in untimed practice
    if (!isQuestionsReady || timeRemaining !== 0 || selectedAnswer !== null) return

    // Timeout counts as wrong — drop difficulty
    if (subtopicParam) {
      const subLevel = getSubtopicLevel(subtopicParam)
      difficultyRef.current = pickDifficultyForLevel(Math.max(subLevel.level - 1, 1))
    } else {
      if (difficultyRef.current === "hard") {
        difficultyRef.current = "medium"
      } else if (difficultyRef.current === "medium") {
        difficultyRef.current = "easy"
      }
    }

    // Record wrong answer due to timeout (hearts deducted at end of round, not mid-game)
    setAnswerResults(prev => [...prev, {
      questionIndex: currentQuestion,
      isCorrect: false,
      difficulty: question?.difficulty || "medium",
      wasSpeedBonus: false,
      gemsEarned: 0,
      chosenAnswerIndex: null, // timeout — no answer given
    }])

    // Show the correct answer briefly then auto-advance
    setPendingAnswer(null) // clear any pending selection
    setSelectedAnswer(-1) // -1 indicates timeout

    setTimeout(async () => {
      if (currentQuestion < TOTAL_QUESTIONS - 1) {
        await fetchNextQuestion()
        setCurrentQuestion(prev => prev + 1)
        setPendingAnswer(null)
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
    const t = getTimerForQuestion(diff, isMathCategory)
    setTotalTime(t)
    setTimeRemaining(t)
    setIsTimerActive(true)
    questionStartTimeRef.current = Date.now()
    setCurrentQuestionSpeedBonus(false)
  }, [isQuestionsReady, currentQuestion, sessionQuestions])

  // Step 1: Select an answer (highlight it, but don't submit yet)
  const handleAnswerSelect = useCallback((answerIndex: number) => {
    if (selectedAnswer !== null) return // already confirmed
    haptics.light()
    setPendingAnswer(answerIndex)
  }, [selectedAnswer])

  // Step 2: Confirm the selected answer (submit it)
  const handleConfirmAnswer = useCallback(() => {
    if (pendingAnswer === null || selectedAnswer !== null) return
    haptics.medium()

    // Stop timer
    setIsTimerActive(false)
    if (timerRef.current) clearInterval(timerRef.current)

    setSelectedAnswer(pendingAnswer)

    // Calculate time taken — speed threshold is half of this question's difficulty time
    const timeTaken = (Date.now() - questionStartTimeRef.current) / 1000
    const speedThreshold = getSpeedThreshold(question?.difficulty || "medium", isMathCategory)
    const isSpeedBonus = !isUntimed && timeTaken <= speedThreshold // no speed bonus in untimed

    if (pendingAnswer === correctAnswerIndex) {
      haptics.success()
      setScore(prev => prev + 1)

      const gemsForThis = gemsForAnswer(question?.difficulty || "easy", isChallenge, isSpeedBonus)

      // Adaptive difficulty: bump UP on correct answer
      // For subtopic mode, re-pick from level (stays in range); for generic, escalate
      if (subtopicParam) {
        const subLevel = getSubtopicLevel(subtopicParam)
        difficultyRef.current = pickDifficultyForLevel(Math.min(subLevel.level + 1, 5))
      } else {
        if (difficultyRef.current === "easy") {
          difficultyRef.current = "medium"
        } else if (difficultyRef.current === "medium") {
          difficultyRef.current = "hard"
        }
      }

      // Record correct answer
      setAnswerResults(prev => [...prev, {
        questionIndex: currentQuestion,
        isCorrect: true,
        difficulty: question?.difficulty || "medium",
        wasSpeedBonus: isSpeedBonus,
        gemsEarned: gemsForThis,
        chosenAnswerIndex: pendingAnswer,
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
      if (subtopicParam) {
        const subLevel = getSubtopicLevel(subtopicParam)
        difficultyRef.current = pickDifficultyForLevel(Math.max(subLevel.level - 1, 1))
      } else {
        if (difficultyRef.current === "hard") {
          difficultyRef.current = "medium"
        } else if (difficultyRef.current === "medium") {
          difficultyRef.current = "easy"
        }
      }

      // Record wrong answer (hearts deducted at end of round, not mid-game)
      haptics.heavy()
      setAnswerResults(prev => [...prev, {
        questionIndex: currentQuestion,
        isCorrect: false,
        difficulty: question?.difficulty || "medium",
        wasSpeedBonus: false,
        gemsEarned: 0,
        chosenAnswerIndex: pendingAnswer,
      }])
    }
  }, [pendingAnswer, selectedAnswer, correctAnswerIndex, currentQuestion, question, isChallenge, baseGemPerCorrect, speedGemPerCorrect])

  const handleNextQuestion = useCallback(async () => {
    if (isUntimed) {
      // Untimed: always fetch next, endless play
      await fetchNextQuestion()
      setCurrentQuestion(prev => prev + 1)
      setPendingAnswer(null)
      setSelectedAnswer(null)
    } else if (currentQuestion < TOTAL_QUESTIONS - 1) {
      // fetchNextQuestion handles both modes: draws from pool in challenge, fetches from Supabase in solo
      await fetchNextQuestion()
      setCurrentQuestion(prev => prev + 1)
      setPendingAnswer(null)
      setSelectedAnswer(null)
    } else {
      setShowResults(true)
    }
  }, [currentQuestion, fetchNextQuestion, isUntimed])

  // Untimed mode: done practicing — go to results
  const handleDonePracticing = useCallback(() => {
    if (answerResults.length === 0) {
      // No questions answered yet, just go home
      window.location.href = "/home"
      return
    }
    setShowResults(true)
  }, [answerResults])

  const handlePlayAgain = useCallback(() => {
    // Re-check hearts/round limits before allowing another round (skip for untimed)
    if (!isChallenge && !isUntimed) {
      const currentHearts = getHearts()
      setHearts(currentHearts)
      const check = canPlaySolo()
      if (!check.allowed) {
        setSoloBlocked(check.reason)
        setShowResults(false)
        setGemsAwarded(false)
        return
      }
    }
    // Reset all game state in-place so usedIds ref is preserved across rounds
    difficultyRef.current = "easy" // Always restart at easy
    setCurrentQuestion(0)
    setPendingAnswer(null)
    setSelectedAnswer(null)
    setScore(0)
    setShowResults(false)
    setShowGemAnimation(false)
    setShowSpeedBonus(false)
    setGemsAwarded(false)
    setGemMilestone(null)
    setStreakCelebration(null)
    setAnswerResults([])
    setCurrentQuestionSpeedBonus(false)
    setSessionQuestions([])
    setIsQuestionsReady(false)
    setIsLoadingNext(false)
    setFetchError(null)
  }, [isChallenge])

  // Award gems when showing results — only correct answers + speed bonuses
  useEffect(() => {
    if (showResults && !gemsAwarded) {
      const correctGems = answerResults
        .filter(r => r.isCorrect)
        .reduce((sum, r) => sum + r.gemsEarned, 0)
      const correctCount = answerResults.filter(r => r.isCorrect).length
      const totalAnswered = answerResults.length

      // Untimed mode: earns gems at solo rate (no speed bonus, no hearts, no round limit)
      if (isUntimed) {
        let totalEarned = correctGems
        let wasCapped = false
        if (!isPremium) {
          const capped = Math.min(totalEarned, dailyGemsRemaining)
          if (capped < totalEarned) wasCapped = true
          totalEarned = capped
          recordGemsEarned(totalEarned)
        }
        const gemsBefore = totalGems
        addGems(totalEarned)
        const milestone = checkGemMilestone(gemsBefore, gemsBefore + totalEarned)
        if (milestone) setGemMilestone(milestone)
        const streakResult = markRoundCompleted()
        if (streakResult.isNewDay) setStreakCelebration(streakResult.newStreak)
        const unlockMessage = saveRoundStats({
          categoryId: categoryParam,
          correct: correctCount,
          total: totalAnswered,
          gemsEarned: totalEarned,
          answerResults,
        })
        if (unlockMessage) toast.success(`\u{1F3AF} ${unlockMessage}`, { duration: 5000 })
        if (subtopicParam && totalAnswered >= 3) {
          const levelResult = adjustSubtopicLevel({
            subtopicId: subtopicParam,
            correct: correctCount,
            total: totalAnswered,
          })
          if (levelResult.message) toast.success(levelResult.message, { duration: 4000 })
        }
        updateParentSnapshot()
        setGemsAwarded(true)
        if (wasCapped) {
          if (isNativeIOS) {
            // Apple Guideline 3.1.1: no upgrade upsell on iOS — just inform.
            // Gameplay isn't blocked, so frame it positively.
            toast("you’ve maxed out today’s gems!", {
              description: "keep playing for streak + practice",
              duration: 4000,
            })
          } else {
            toast("you hit today’s gem limit!", {
              description: "upgrade to earn unlimited gems",
              action: { label: "unlock", onClick: () => { window.location.href = "/upgrade?reason=gem_cap" } },
              duration: 8000,
            })
          }
        }
        return
      }

      // Challenge outcome bonus (win/loss/tie) — compare gems, not correct count
      let outcomeBonus = 0
      if (isChallenge && creatorScore !== null && creatorScore >= 0) {
        if (correctGems > creatorScore) {
          outcomeBonus = GEM_VALUES.challengeOutcome.win
        } else if (correctGems < creatorScore) {
          outcomeBonus = GEM_VALUES.challengeOutcome.loss
        } else {
          outcomeBonus = GEM_VALUES.challengeOutcome.tie
        }
      }

      // Apply daily gem cap for free users
      let totalEarned = correctGems + outcomeBonus
      let wasCapped = false
      if (!isPremium && !isChallenge) {
        const capped = Math.min(totalEarned, dailyGemsRemaining)
        if (capped < totalEarned) {
          wasCapped = true
        }
        totalEarned = capped
        recordGemsEarned(totalEarned)
      }

      // Check for gem milestone before adding (compare before vs after)
      const gemsBefore = totalGems
      addGems(totalEarned)
      const milestone = checkGemMilestone(gemsBefore, gemsBefore + totalEarned)
      if (milestone) {
        setGemMilestone(milestone)
      }
      const streakResult = markRoundCompleted()
      if (streakResult.isNewDay) {
        setStreakCelebration(streakResult.newStreak)
      }
      // Complete referral bonus if this is the referred user's first round
      completeReferralIfPending(addGems).then(({ completed, referrerName }) => {
        if (completed) {
          toast.success(`🎉 +500 referral bonus gems! thanks for joining via ${referrerName || "a friend"}`, {
            duration: 5000,
          })
        }
      })
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
      // Adjust subtopic level after solo round (not challenges)
      if (!isChallenge && subtopicParam) {
        const levelResult = adjustSubtopicLevel({
          subtopicId: subtopicParam,
          correct: correctCount,
          total: TOTAL_QUESTIONS,
        })
        if (levelResult.message) {
          toast.success(levelResult.message, { duration: 4000 })
        }
      }
      // Update parent dashboard snapshot (best-effort, non-blocking)
      updateParentSnapshot()
      setGemsAwarded(true)

      // Show upsell if free user hit the daily gem cap
      if (wasCapped) {
        if (isNativeIOS) {
          // Apple Guideline 3.1.1: no upgrade upsell on iOS \u2014 just inform.
          // Gameplay isn't blocked, so frame it positively.
          toast("you\u2019ve maxed out today\u2019s gems!", {
            description: "keep playing for streak + practice",
            duration: 4000,
          })
        } else {
          toast("you hit today\u2019s gem limit!", {
            description: "upgrade to earn unlimited gems",
            action: {
              label: "unlock",
              onClick: () => { window.location.href = "/upgrade?reason=gem_cap" },
            },
            duration: 8000,
          })
        }
      }

      // GROUP CHALLENGE: submit entry to group_challenge_entries
      if (groupCode) {
        ;(async () => {
          const gc = await getGroupChallenge(groupCode)
          if (gc) {
            const playerName = await getDisplayName()
            const playerId = await getUserId()
            await submitGroupEntry({
              groupChallengeId: gc.id,
              playerId,
              playerName,
              score: correctGems,
              gemsEarned: correctGems,
              correctCount: correctCount,
            })
            console.log(`[rally] Group entry submitted — ${correctGems} gems`)
          }
        })()
      }
      // 1v1: If creator just finished their own challenge, update their results
      else if (creatorChallengeCode) {
        ;(async () => {
          const challengeResults: ChallengeResult[] = answerResults.map((r, i) => ({
            questionIndex: i,
            isCorrect: r.isCorrect,
            difficulty: r.difficulty,
            wasSpeedBonus: r.wasSpeedBonus,
            gemsEarned: r.gemsEarned,
            chosenAnswerIndex: r.chosenAnswerIndex,
          }))
          const success = await updateCreatorResults({
            shareCode: creatorChallengeCode,
            creatorScore: correctGems, // gems, not correct count
            creatorResults: challengeResults,
          })
          if (success) {
            console.log(`[rally] Creator results updated — ${correctGems} gems`)
            // Notify challenger if they've already played (challenge has a challenger)
            const challenge = await getChallenge(creatorChallengeCode)
            if (challenge?.challenger_id) {
              notifyChallengeOpponent({
                recipientUserId: challenge.challenger_id,
                senderName: challenge.creator_name,
                category: categoryParam,
                challengeCode: creatorChallengeCode,
                type: "creator_finished",
              })
            }
          } else {
            console.error("[rally] Failed to update creator results")
          }
        })()
      }
      // If challenger just finished, submit results to complete the challenge
      else if (challengeCode) {
        ;(async () => {
          const challengerName = await getDisplayName()
          const challengerId = await getUserId()
          const challengeResults: ChallengeResult[] = answerResults.map((r, i) => ({
            questionIndex: i,
            isCorrect: r.isCorrect,
            difficulty: r.difficulty,
            wasSpeedBonus: r.wasSpeedBonus,
            gemsEarned: r.gemsEarned,
            chosenAnswerIndex: r.chosenAnswerIndex,
          }))
          const success = await completeChallenge({
            shareCode: challengeCode,
            challengerName,
            challengerId,
            challengerScore: correctGems,
            challengerResults: challengeResults,
          })
          if (success) {
            console.log(`[rally] Challenge completed — ${correctGems} gems`)
            const challenge = await getChallenge(challengeCode)
            if (challenge?.creator_id) {
              notifyChallengeOpponent({
                recipientUserId: challenge.creator_id,
                senderName: challengerName,
                category: categoryParam,
                challengeCode,
                type: "challenger_finished",
              })
            }
          } else {
            console.error("[rally] Failed to submit challenge results")
          }
        })()
      }
    }
  }, [showResults, gemsAwarded, isChallenge, addGems, answerResults, categoryParam, challengeCode, creatorChallengeCode, creatorScore])

  // Derived values for rendering (always computed, never early return)
  const hasAnswered = selectedAnswer !== null
  const isTimeout = selectedAnswer === -1

  // Solo play blocked (no hearts, daily round limit, or gem cap reached)
  if (soloBlocked && !isChallenge) {
    // Gem cap no longer reaches this branch — it only handles hearts/round-limit
    // gating, where the user can refill hearts with gems to keep playing.
    return (
      <div className="min-h-screen bg-[#021f3d] flex flex-col items-center justify-center px-6 text-center">
        <Heart className="w-16 h-16 text-red-400 mb-4" />
        <h1 className="text-2xl font-extrabold text-white mb-2">{soloBlocked}</h1>
        <p className="text-[#85B7EB]/60 text-sm mb-2">
          wrong answers cost hearts. come back tomorrow or refill now.
        </p>
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
          <
            href="/home"
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
      <>
        <ResultsScreen
          score={score}
          isChallenge={isChallenge}
          isCreatorChallenge={isCreatorChallenge}
          challengeCode={challengeCode}
          creatorChallengeCode={creatorChallengeCode}
          categoryId={categoryParam}
          categoryName={categoryName}
          onPlayAgain={handlePlayAgain}
          answerResults={answerResults}
          sessionQuestions={sessionQuestions}
          creatorScore={creatorScore}
          isUntimed={isUntimed}
          gemsCapped={dailyGemsCapped}
        />
        {gemMilestone && (
          <GemMilestoneCelebration
            milestone={gemMilestone}
            onDismiss={() => setGemMilestone(null)}
          />
        )}
        {streakCelebration && (
          <StreakCelebration
            streak={streakCelebration}
            onDismiss={() => setStreakCelebration(null)}
          />
        )}
      </>
    )
  }

  // Main game screen
  return (
    <div className="h-[100dvh] bg-[#021f3d] flex flex-col overflow-hidden">
      {/* Speed Bonus Animation */}
      {showSpeedBonus && !isUntimed && <SpeedBonusAnimation />}

      {/* Header — compact */}
      <header className="flex-shrink-0 bg-[#021f3d] px-4 pt-3 pb-2">
        <div className="flex items-center justify-between mb-2">
          <WorkAreaButton onClick={() => setShowWorkArea(true)} />
          <div className="text-center">
            <h1 className="text-lg font-extrabold text-white">{categoryName}</h1>
            {subtopicParam && (
              <p className="text-[10px] text-[#85B7EB]/50 -mt-0.5">
                {SUBTOPIC_MAP[categoryParam]?.find(s => s.id === subtopicParam)?.label || subtopicParam}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2.5">
            {isUntimed ? (
              /* Untimed: show question count + done button */
              <>
                <span className="text-xs font-bold text-[#A855F7]">#{currentQuestion + 1}</span>
                <button
                  onClick={handleDonePracticing}
                  className="text-xs font-bold text-[#85B7EB]/60 bg-[#0a2d4a] px-3 py-1.5 rounded-full hover:text-[#85B7EB] transition-colors"
                >
                  done
                </button>
              </>
            ) : (
              /* Timed: hearts + timer */
              <>
                {!isChallenge && (
                  <div className="flex items-center gap-1">
                    <Heart className="w-3.5 h-3.5 text-red-400 fill-red-400" />
                    <span className="text-xs font-bold text-red-400">{hearts}</span>
                  </div>
                )}
                <CountdownTimer timeRemaining={timeRemaining} totalTime={totalTime} />
              </>
            )}
          </div>
        </div>
        {isUntimed ? (
          /* Untimed: no progress bar, just a subtle label */
          <div className="flex items-center justify-center gap-1.5">
            <span className="text-[10px] text-[#A855F7]/60 font-medium">untimed practice</span>
          </div>
        ) : (
          <div className="flex gap-1.5">
            {Array.from({ length: TOTAL_QUESTIONS }).map((_, index) => (
              <div
                key={index}
                className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                  index <= currentQuestion ? "bg-[#378ADD]" : "bg-[#0a2d4a]"
                }`}
              />
            ))}
          </div>
        )}
      </header>

      {/* Question Content — fills remaining space, scrollable in untimed mode for long explanations */}
      <main className={`flex-1 flex flex-col px-4 pt-2 pb-3 min-h-0 ${isUntimed && hasAnswered ? "overflow-y-auto" : ""}`}>
        {/* Question Text */}
        <div className="mb-2 flex-shrink-0">
          <h2 className="text-base font-extrabold text-white text-center leading-snug px-1 max-w-xl mx-auto">
            {question?.question && <MathText text={question.question} />}
          </h2>
        </div>

        {/* Answer Options — take available space */}
        <div className="w-full max-w-[480px] mx-auto space-y-1.5 relative flex-1 flex flex-col justify-center">
          {answerOptions.map((opt, index) => (
            <AnswerOption
              key={opt.letter}
              option={opt.text}
              index={index}
              letter={opt.letter}
              pendingAnswer={pendingAnswer}
              selectedAnswer={selectedAnswer}
              correctAnswer={correctAnswerIndex}
              explanation={question.explanation}
              onSelect={handleAnswerSelect}
              showGemAnimation={showGemAnimation && index === correctAnswerIndex}
              gemAmount={currentQuestionSpeedBonus ? speedGemPerCorrect : baseGemPerCorrect}
              isSpeedBonus={currentQuestionSpeedBonus && !isUntimed}
              isTimeout={isTimeout}
              isUntimed={isUntimed}
            />
          ))}
        </div>

        {/* Confirm / Next Button — pinned to bottom */}
        <div className="w-full max-w-[480px] mx-auto mt-2 flex-shrink-0">
          {pendingAnswer !== null && selectedAnswer === null && (
            <button
              onClick={handleConfirmAnswer}
              className="w-full bg-[#378ADD] text-white rounded-xl py-3 px-5 flex items-center justify-center gap-2 font-extrabold text-sm shadow-lg shadow-[#378ADD]/30 active:scale-[0.98] animate-in fade-in duration-200"
            >
              lock in answer
              <Check className="w-4 h-4" strokeWidth={3} />
            </button>
          )}
          {hasAnswered && !isTimeout && (
            <button
              onClick={handleNextQuestion}
              className="w-full bg-[#378ADD] text-white rounded-xl py-3 px-5 flex items-center justify-center gap-2 font-extrabold text-sm shadow-lg shadow-[#378ADD]/30 active:scale-[0.98] animate-in fade-in slide-in-from-bottom-4 duration-300"
            >
              {isUntimed ? "next question" : (currentQuestion < TOTAL_QUESTIONS - 1 ? "next question" : "see results")}
              <ChevronRight className="w-4 h-4" strokeWidth={3} />
            </button>
          )}
        </div>
      </main>

      {/* Work Area (Notepad / Calculator / Draw) */}
      <WorkArea
        isOpen={showWorkArea}
        onClose={() => setShowWorkArea(false)}
        questionText={question?.question}
        questionKey={question?.id ?? currentQuestion}
        isMath={isMathCategory}
      />

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
