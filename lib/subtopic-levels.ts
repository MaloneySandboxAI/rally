"use client"

/**
 * Subtopic Levels — persistent per-subtopic difficulty progression
 *
 * Each subtopic has an independent level (1–5) that controls which difficulty
 * questions the student sees during solo practice. The diagnostic test seeds
 * initial levels; daily practice adjusts them up or down.
 *
 * Level → Difficulty mapping:
 *   1 = easy only
 *   2 = easy + medium mix (weighted toward easy)
 *   3 = medium only
 *   4 = medium + hard mix (weighted toward hard)
 *   5 = hard only
 *
 * Storage: localStorage (instant) + Supabase user_state.subtopic_levels (persistent)
 */

import { SUBTOPIC_MAP, type DiagnosticAnswer } from "@/lib/diagnostic"

// ============================================================
// TYPES
// ============================================================

export interface SubtopicLevel {
  level: number        // 1–5
  totalCorrect: number // lifetime correct in this subtopic
  totalAnswered: number // lifetime answered in this subtopic
}

export type SubtopicLevelsMap = Record<string, SubtopicLevel>

// ============================================================
// CONSTANTS
// ============================================================

const STORAGE_KEY = "rally_subtopic_levels"

export const MIN_LEVEL = 1
export const MAX_LEVEL = 5

/** How many correct out of 5 to level up */
export const LEVEL_UP_THRESHOLD = 4

/** How many correct out of 5 to level down */
export const LEVEL_DOWN_THRESHOLD = 1

/** Level labels for UI display */
export const LEVEL_LABELS: Record<number, string> = {
  1: "beginner",
  2: "developing",
  3: "intermediate",
  4: "advanced",
  5: "mastery",
}

/** Level colors for UI display */
export const LEVEL_COLORS: Record<number, string> = {
  1: "#85B7EB",   // muted blue (beginner)
  2: "#22c55e",   // green
  3: "#F59E0B",   // amber
  4: "#EF4444",   // red
  5: "#A855F7",   // purple (mastery)
}

/**
 * Map subtopic level → question difficulty for fetching.
 * Returns the primary difficulty and an optional secondary for mixed levels.
 */
export function levelToDifficulty(level: number): { primary: string; secondary?: string } {
  switch (level) {
    case 1: return { primary: "easy" }
    case 2: return { primary: "easy", secondary: "medium" }
    case 3: return { primary: "medium" }
    case 4: return { primary: "hard", secondary: "medium" }
    case 5: return { primary: "hard" }
    default: return { primary: "easy" }
  }
}

/**
 * Pick the actual difficulty for a single question at a given level.
 * For mixed levels (2 and 4), randomly picks between the two difficulties
 * with a 60/40 weighting toward the primary.
 */
export function pickDifficultyForLevel(level: number): string {
  const { primary, secondary } = levelToDifficulty(level)
  if (!secondary) return primary
  return Math.random() < 0.6 ? primary : secondary
}

// ============================================================
// PERSISTENCE (localStorage)
// ============================================================

export function loadSubtopicLevels(): SubtopicLevelsMap {
  if (typeof window === "undefined") return {}
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    return JSON.parse(raw) as SubtopicLevelsMap
  } catch {
    return {}
  }
}

export function saveSubtopicLevels(levels: SubtopicLevelsMap): void {
  if (typeof window === "undefined") return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(levels))
}

/**
 * Get a single subtopic's level, defaulting to 1 if not set.
 */
export function getSubtopicLevel(subtopicId: string): SubtopicLevel {
  const levels = loadSubtopicLevels()
  return levels[subtopicId] || { level: 1, totalCorrect: 0, totalAnswered: 0 }
}

/**
 * Get all subtopic levels for a given category.
 * Returns entries in the same order as SUBTOPIC_MAP.
 */
export function getCategorySubtopicLevels(category: string): {
  id: string
  label: string
  level: SubtopicLevel
}[] {
  const subtopics = SUBTOPIC_MAP[category]
  if (!subtopics) return []
  const allLevels = loadSubtopicLevels()
  return subtopics.map(s => ({
    id: s.id,
    label: s.label,
    level: allLevels[s.id] || { level: 1, totalCorrect: 0, totalAnswered: 0 },
  }))
}

/**
 * Compute a category's average level (for display on home screen).
 */
export function getCategoryAverageLevel(category: string): number {
  const subs = getCategorySubtopicLevels(category)
  if (subs.length === 0) return 1
  const sum = subs.reduce((acc, s) => acc + s.level.level, 0)
  return Math.round((sum / subs.length) * 10) / 10
}

// ============================================================
// DIAGNOSTIC SEEDING
// ============================================================

/**
 * Seed subtopic levels from diagnostic test results.
 * - Correct on a hard/medium question → Level 3
 * - Correct on an easy question → Level 2
 * - Wrong → Level 1
 *
 * This gives students a meaningful starting point without being too aggressive.
 * Called once after the diagnostic completes.
 */
export function seedFromDiagnostic(
  answers: DiagnosticAnswer[],
  questionDifficulties: Record<number, string>
): SubtopicLevelsMap {
  const levels = loadSubtopicLevels()

  for (const answer of answers) {
    const difficulty = questionDifficulties[answer.questionId] || "medium"

    if (answer.isCorrect) {
      if (difficulty === "hard") {
        levels[answer.subtopic] = { level: 3, totalCorrect: 1, totalAnswered: 1 }
      } else if (difficulty === "medium") {
        levels[answer.subtopic] = { level: 3, totalCorrect: 1, totalAnswered: 1 }
      } else {
        levels[answer.subtopic] = { level: 2, totalCorrect: 1, totalAnswered: 1 }
      }
    } else {
      levels[answer.subtopic] = { level: 1, totalCorrect: 0, totalAnswered: 1 }
    }
  }

  saveSubtopicLevels(levels)
  return levels
}

// ============================================================
// POST-ROUND LEVEL ADJUSTMENT
// ============================================================

export interface RoundSubtopicResult {
  subtopicId: string
  correct: number
  total: number
}

/**
 * Adjust a subtopic's level after a practice round.
 * Returns the new level and a message if the level changed.
 *
 * Logic:
 * - 4+ out of 5 correct → level up (capped at 5)
 * - 0–1 out of 5 correct → level down (floored at 1)
 * - 2–3 out of 5 → stay at current level
 */
export function adjustSubtopicLevel(result: RoundSubtopicResult): {
  previousLevel: number
  newLevel: number
  message: string | null
} {
  const levels = loadSubtopicLevels()
  const current = levels[result.subtopicId] || { level: 1, totalCorrect: 0, totalAnswered: 0 }

  // Update lifetime stats
  current.totalCorrect += result.correct
  current.totalAnswered += result.total

  const previousLevel = current.level

  if (result.correct >= LEVEL_UP_THRESHOLD && current.level < MAX_LEVEL) {
    current.level += 1
  } else if (result.correct <= LEVEL_DOWN_THRESHOLD && current.level > MIN_LEVEL) {
    current.level -= 1
  }

  levels[result.subtopicId] = current
  saveSubtopicLevels(levels)

  let message: string | null = null
  if (current.level > previousLevel) {
    message = `leveled up to ${LEVEL_LABELS[current.level]}!`
  } else if (current.level < previousLevel) {
    message = `dropped to ${LEVEL_LABELS[current.level]} — keep practicing!`
  }

  return { previousLevel, newLevel: current.level, message }
}

/**
 * Check if the user has any subtopic levels set (i.e., has taken the diagnostic
 * or played at least one subtopic-targeted round).
 */
export function hasSubtopicLevels(): boolean {
  const levels = loadSubtopicLevels()
  return Object.keys(levels).length > 0
}
