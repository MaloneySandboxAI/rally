// Rally stats stored in localStorage as 'rally_stats'

const DIFFICULTY_LEVEL_KEY = "rally_difficulty_level"
// Default target score used for cross-session difficulty thresholds
const DEFAULT_TARGET_SCORE = 1200
const TARGET_SCORE_KEY = "rally_target_score"

function getUserTargetScore(): number {
  if (typeof window === "undefined") return DEFAULT_TARGET_SCORE
  const stored = localStorage.getItem(TARGET_SCORE_KEY)
  if (!stored) return DEFAULT_TARGET_SCORE
  const parsed = parseInt(stored, 10)
  return isNaN(parsed) ? DEFAULT_TARGET_SCORE : parsed
}

// Per-round game history for adaptive difficulty (last N games per category)
const ROUND_HISTORY_KEY = "rally_round_history"

// Thresholds to unlock medium/hard by target SAT score range
interface DifficultyThresholds {
  mediumAccuracy: number // % to unlock medium
  hardAccuracy: number   // % to unlock hard
  gamesRequired: number  // consecutive games above threshold
}

function getThresholdsForTarget(targetScore: number): DifficultyThresholds {
  if (targetScore >= 1500) return { mediumAccuracy: 40, hardAccuracy: 60, gamesRequired: 5 }
  if (targetScore >= 1400) return { mediumAccuracy: 45, hardAccuracy: 65, gamesRequired: 5 }
  if (targetScore >= 1200) return { mediumAccuracy: 50, hardAccuracy: 70, gamesRequired: 5 }
  if (targetScore >= 1000) return { mediumAccuracy: 55, hardAccuracy: 75, gamesRequired: 5 }
  return { mediumAccuracy: 60, hardAccuracy: 80, gamesRequired: 5 }
}

// Returns the current difficulty level for a category
export function getAdaptiveDifficulty(categoryId: string): string | null {
  if (typeof window === "undefined") return null
  try {
    const stored = localStorage.getItem(DIFFICULTY_LEVEL_KEY)
    if (!stored) return null
    const levels = JSON.parse(stored) as Record<string, string>
    return levels[categoryId] || null
  } catch {
    return null
  }
}

function setDifficultyLevel(categoryId: string, level: string): void {
  if (typeof window === "undefined") return
  try {
    const stored = localStorage.getItem(DIFFICULTY_LEVEL_KEY)
    const levels = stored ? JSON.parse(stored) as Record<string, string> : {}
    levels[categoryId] = level
    localStorage.setItem(DIFFICULTY_LEVEL_KEY, JSON.stringify(levels))
  } catch {
    // ignore
  }
}

// Round history: last 5 accuracy values per category
function getRoundHistory(categoryId: string): number[] {
  if (typeof window === "undefined") return []
  try {
    const stored = localStorage.getItem(ROUND_HISTORY_KEY)
    if (!stored) return []
    const history = JSON.parse(stored) as Record<string, number[]>
    return history[categoryId] || []
  } catch {
    return []
  }
}

function addRoundToHistory(categoryId: string, accuracy: number): void {
  if (typeof window === "undefined") return
  try {
    const stored = localStorage.getItem(ROUND_HISTORY_KEY)
    const history = stored ? JSON.parse(stored) as Record<string, number[]> : {}
    const existing = history[categoryId] || []
    // Keep last 5
    history[categoryId] = [...existing, accuracy].slice(-5)
    localStorage.setItem(ROUND_HISTORY_KEY, JSON.stringify(history))
  } catch {
    // ignore
  }
}

// Check and apply adaptive difficulty unlock — called after each round
// Returns a message string if difficulty was just unlocked, otherwise null
export function checkAdaptiveDifficultyUnlock(categoryId: string, roundAccuracy: number): string | null {
  if (typeof window === "undefined") return null

  addRoundToHistory(categoryId, roundAccuracy)
  const history = getRoundHistory(categoryId)

  const thresholds = getThresholdsForTarget(getUserTargetScore())
  const currentLevel = getAdaptiveDifficulty(categoryId) || "easy"

  if (currentLevel === "hard") return null // already at max

  // Need last N games all above threshold
  if (history.length < thresholds.gamesRequired) return null
  const lastN = history.slice(-thresholds.gamesRequired)
  const allAbove = (threshold: number) => lastN.every(a => a >= threshold)

  if (currentLevel === "medium" && allAbove(thresholds.hardAccuracy)) {
    setDifficultyLevel(categoryId, "hard")
    return `leveling up — hard questions unlocked for ${categoryId}!`
  }

  if (currentLevel === "easy" && allAbove(thresholds.mediumAccuracy)) {
    setDifficultyLevel(categoryId, "medium")
    return `leveling up — medium questions unlocked for ${categoryId}!`
  }

  return null
}

export interface CategoryStats {
  correct: number
  total: number
}

export interface DifficultyBreakdown {
  easy: CategoryStats
  medium: CategoryStats
  hard: CategoryStats
}

export interface CategoryDetail {
  correct: number
  total: number
  byDifficulty: DifficultyBreakdown
}

export interface RallyStats {
  totalGames: number
  totalCorrect: number
  totalQuestions: number
  byCategory: Record<string, CategoryStats>
  byCategoryDifficulty: Record<string, CategoryDetail>
  byDifficulty: DifficultyBreakdown
  bestStreak: number
  totalGemsEarned: number
}

const STATS_KEY = "rally_stats"

export function loadStats(): RallyStats {
  if (typeof window === "undefined") return defaultStats()
  try {
    const raw = localStorage.getItem(STATS_KEY)
    if (!raw) return defaultStats()
    const parsed = JSON.parse(raw) as RallyStats
    // Ensure all keys exist (handles old versions)
    return { ...defaultStats(), ...parsed }
  } catch {
    return defaultStats()
  }
}

function defaultDifficultyBreakdown(): DifficultyBreakdown {
  return {
    easy: { correct: 0, total: 0 },
    medium: { correct: 0, total: 0 },
    hard: { correct: 0, total: 0 },
  }
}

function defaultStats(): RallyStats {
  return {
    totalGames: 0,
    totalCorrect: 0,
    totalQuestions: 0,
    byCategory: {},
    byCategoryDifficulty: {},
    byDifficulty: defaultDifficultyBreakdown(),
    bestStreak: 0,
    totalGemsEarned: 0,
  }
}

export interface RoundResult {
  categoryId: string   // e.g. "Algebra"
  correct: number
  total: number
  gemsEarned: number
  answerResults: Array<{ isCorrect: boolean; difficulty: string }>
}

export function saveRoundStats(round: RoundResult): string | null {
  if (typeof window === "undefined") return null

  const stats = loadStats()

  // Totals
  stats.totalGames += 1
  stats.totalCorrect += round.correct
  stats.totalQuestions += round.total
  stats.totalGemsEarned += round.gemsEarned

  // By category
  if (!stats.byCategory[round.categoryId]) {
    stats.byCategory[round.categoryId] = { correct: 0, total: 0 }
  }
  stats.byCategory[round.categoryId].correct += round.correct
  stats.byCategory[round.categoryId].total += round.total

  // By difficulty (global + per-category)
  if (!stats.byCategoryDifficulty) stats.byCategoryDifficulty = {}
  if (!stats.byCategoryDifficulty[round.categoryId]) {
    stats.byCategoryDifficulty[round.categoryId] = {
      correct: 0,
      total: 0,
      byDifficulty: defaultDifficultyBreakdown(),
    }
  }
  const catDetail = stats.byCategoryDifficulty[round.categoryId]
  catDetail.correct += round.correct
  catDetail.total += round.total

  for (const r of round.answerResults) {
    const diff = (r.difficulty || "medium") as "easy" | "medium" | "hard"
    if (!stats.byDifficulty[diff]) {
      stats.byDifficulty[diff] = { correct: 0, total: 0 }
    }
    stats.byDifficulty[diff].total += 1
    if (r.isCorrect) stats.byDifficulty[diff].correct += 1

    // Per-category difficulty
    if (!catDetail.byDifficulty[diff]) {
      catDetail.byDifficulty[diff] = { correct: 0, total: 0 }
    }
    catDetail.byDifficulty[diff].total += 1
    if (r.isCorrect) catDetail.byDifficulty[diff].correct += 1
  }

  // Best streak
  const currentStreak = parseInt(localStorage.getItem("rally_streak") || "0", 10)
  if (currentStreak > stats.bestStreak) {
    stats.bestStreak = currentStreak
  }

  localStorage.setItem(STATS_KEY, JSON.stringify(stats))

  // Check adaptive difficulty unlock
  const roundAccuracy = round.total > 0 ? Math.round((round.correct / round.total) * 100) : 0
  return checkAdaptiveDifficultyUnlock(round.categoryId, roundAccuracy)
}
