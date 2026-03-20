// Rally stats stored in localStorage as 'rally_stats'

export interface CategoryStats {
  correct: number
  total: number
}

export interface RallyStats {
  totalGames: number
  totalCorrect: number
  totalQuestions: number
  byCategory: Record<string, CategoryStats>
  byDifficulty: {
    easy: CategoryStats
    medium: CategoryStats
    hard: CategoryStats
  }
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

function defaultStats(): RallyStats {
  return {
    totalGames: 0,
    totalCorrect: 0,
    totalQuestions: 0,
    byCategory: {},
    byDifficulty: {
      easy: { correct: 0, total: 0 },
      medium: { correct: 0, total: 0 },
      hard: { correct: 0, total: 0 },
    },
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

export function saveRoundStats(round: RoundResult): void {
  if (typeof window === "undefined") return

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

  // By difficulty
  for (const r of round.answerResults) {
    const diff = (r.difficulty || "medium") as "easy" | "medium" | "hard"
    if (!stats.byDifficulty[diff]) {
      stats.byDifficulty[diff] = { correct: 0, total: 0 }
    }
    stats.byDifficulty[diff].total += 1
    if (r.isCorrect) stats.byDifficulty[diff].correct += 1
  }

  // Best streak
  const currentStreak = parseInt(localStorage.getItem("rally_streak") || "0", 10)
  if (currentStreak > stats.bestStreak) {
    stats.bestStreak = currentStreak
  }

  localStorage.setItem(STATS_KEY, JSON.stringify(stats))
}
