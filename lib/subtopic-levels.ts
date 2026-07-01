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
 *   2 = medium + easy mix (weighted toward medium — leveling up feels decisive)
 *   3 = medium only
 *   4 = hard + medium mix (weighted toward hard)
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
  /**
   * Rolling window of the last ≤6 attempt outcomes AT THE CURRENT LEVEL.
   * Reset to [] whenever the level changes. Drives threshold promote/demote.
   */
  recentAttempts: boolean[]
  /**
   * Consecutive-outcome streak at the current level: positive = correct in a
   * row, negative = wrong in a row, 0 = fresh/mixed. Drives fast-track promote
   * and safety-net demote. Reset to 0 whenever the level changes.
   */
  streak: number
}

export type SubtopicLevelsMap = Record<string, SubtopicLevel>

// ============================================================
// CONSTANTS
// ============================================================

const STORAGE_KEY = "rally_subtopic_levels"

export const MIN_LEVEL = 1
export const MAX_LEVEL = 5

// ---- Adaptive difficulty tuning (threshold + fast-track + safety net) -------
// See "Adaptive difficulty" in CLAUDE.md. Per subtopic × current level.

/** Size of the rolling accuracy window at the current level. */
export const WINDOW_SIZE = 6
/** Promote when window accuracy ≥ this ratio (needs a full window). */
export const PROMOTE_RATIO = 0.75
/** Demote when window accuracy < this ratio (needs a full window). */
export const DEMOTE_RATIO = 0.40
/** Fast-track: promote on this many correct in a row (ignores window). */
export const STREAK_PROMOTE = 4
/** Safety net: demote on this many wrong in a row. */
export const STREAK_DEMOTE = 4
/**
 * New-user floor: never demote until MORE than this many lifetime attempts
 * exist in the subtopic (protects the first-impression UX). Promotion is not
 * floored — a strong new user can still level up.
 */
export const DEMOTE_FLOOR = 20

/** Level labels for UI display — simple numeric tiers (1–5). */
export const LEVEL_LABELS: Record<number, string> = {
  1: "Level 1",
  2: "Level 2",
  3: "Level 3",
  4: "Level 4",
  5: "Level 5",
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
    case 2: return { primary: "medium", secondary: "easy" }
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

/** A fresh, level-1 subtopic record with empty window + streak. */
export function defaultSubtopicLevel(): SubtopicLevel {
  return { level: 1, totalCorrect: 0, totalAnswered: 0, recentAttempts: [], streak: 0 }
}

/**
 * Backfill the rolling-window fields on records written before adaptive v2
 * (they only had level/totalCorrect/totalAnswered). Safe on already-current
 * records. Always trims the window to the last WINDOW_SIZE attempts.
 */
function normalize(l: Partial<SubtopicLevel> | undefined): SubtopicLevel {
  return {
    level: l?.level ?? 1,
    totalCorrect: l?.totalCorrect ?? 0,
    totalAnswered: l?.totalAnswered ?? 0,
    recentAttempts: Array.isArray(l?.recentAttempts) ? l!.recentAttempts.slice(-WINDOW_SIZE) : [],
    streak: typeof l?.streak === "number" ? l!.streak : 0,
  }
}

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
  return normalize(levels[subtopicId])
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
    level: normalize(allLevels[s.id]),
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

    // Seeded levels start with an empty rolling window + streak — the diagnostic
    // sets the starting level, then live play fills the window from scratch.
    if (answer.isCorrect) {
      if (difficulty === "hard") {
        levels[answer.subtopic] = { level: 3, totalCorrect: 1, totalAnswered: 1, recentAttempts: [], streak: 0 }
      } else if (difficulty === "medium") {
        levels[answer.subtopic] = { level: 3, totalCorrect: 1, totalAnswered: 1, recentAttempts: [], streak: 0 }
      } else {
        levels[answer.subtopic] = { level: 2, totalCorrect: 1, totalAnswered: 1, recentAttempts: [], streak: 0 }
      }
    } else {
      levels[answer.subtopic] = { level: 1, totalCorrect: 0, totalAnswered: 1, recentAttempts: [], streak: 0 }
    }
  }

  saveSubtopicLevels(levels)
  return levels
}

// ============================================================
// PER-ATTEMPT LEVEL ADJUSTMENT (threshold + fast-track + safety net)
// ============================================================

/** Window of a rolling accuracy buffer, ignoring an incomplete window. */
function windowRatio(recentAttempts: boolean[]): number {
  if (recentAttempts.length < WINDOW_SIZE) return 0
  return recentAttempts.filter(Boolean).length / recentAttempts.length
}

/** Append an outcome to a rolling window (trimmed) + streak. Pure. */
export function pushAttempt(
  recentAttempts: boolean[],
  streak: number,
  isCorrect: boolean
): { recentAttempts: boolean[]; streak: number } {
  const nextWindow = [...recentAttempts, isCorrect].slice(-WINDOW_SIZE)
  // streak: extend if the sign matches, otherwise flip to ±1
  const nextStreak = isCorrect
    ? (streak >= 0 ? streak + 1 : 1)
    : (streak <= 0 ? streak - 1 : -1)
  return { recentAttempts: nextWindow, streak: nextStreak }
}

/**
 * Would this window+streak trigger a PROMOTION at the given level?
 * Used both by the real recorder and by untimed practice's shadow check
 * (untimed doesn't persist, but we still surface a "play timed to level up" nudge).
 */
export function wouldPromote(recentAttempts: boolean[], streak: number, level: number): boolean {
  if (level >= MAX_LEVEL) return false
  return streak >= STREAK_PROMOTE || windowRatio(recentAttempts) >= PROMOTE_RATIO
}

export interface AttemptResult {
  previousLevel: number
  newLevel: number
  promoted: boolean
  demoted: boolean
}

/**
 * Record a SINGLE graded attempt for a subtopic and adjust its level.
 *
 * Promote (level up) when EITHER:
 *   - streak of {@link STREAK_PROMOTE} correct in a row (fast-track), OR
 *   - ≥{@link PROMOTE_RATIO} accuracy across a full {@link WINDOW_SIZE} window.
 * Demote (level down) when EITHER (and only after {@link DEMOTE_FLOOR} lifetime
 * attempts — the new-user floor):
 *   - streak of {@link STREAK_DEMOTE} wrong in a row (safety net), OR
 *   - <{@link DEMOTE_RATIO} accuracy across a full window.
 *
 * The rolling window + streak reset on ANY level change so the new level starts
 * fresh. Lifetime totals are never reset. Call this once per graded question in
 * TIMED solo play and in challenges — NOT in untimed practice (see wouldPromote).
 */
export function recordAttempt(subtopicId: string, isCorrect: boolean): AttemptResult {
  const levels = loadSubtopicLevels()
  const cur = normalize(levels[subtopicId])

  // Lifetime stats
  cur.totalAnswered += 1
  if (isCorrect) cur.totalCorrect += 1

  // Rolling window + streak at the current level
  const advanced = pushAttempt(cur.recentAttempts, cur.streak, isCorrect)
  cur.recentAttempts = advanced.recentAttempts
  cur.streak = advanced.streak

  const previousLevel = cur.level
  let promoted = false
  let demoted = false

  const ratio = windowRatio(cur.recentAttempts)

  if (cur.level < MAX_LEVEL && (cur.streak >= STREAK_PROMOTE || ratio >= PROMOTE_RATIO)) {
    cur.level += 1
    promoted = true
  } else if (
    cur.level > MIN_LEVEL &&
    cur.totalAnswered > DEMOTE_FLOOR &&
    (cur.streak <= -STREAK_DEMOTE || (cur.recentAttempts.length >= WINDOW_SIZE && ratio < DEMOTE_RATIO))
  ) {
    cur.level -= 1
    demoted = true
  }

  // Reset the window + streak on any change so the new level starts clean.
  if (promoted || demoted) {
    cur.recentAttempts = []
    cur.streak = 0
  }

  levels[subtopicId] = cur
  saveSubtopicLevels(levels)

  return { previousLevel, newLevel: cur.level, promoted, demoted }
}

/**
 * Check if the user has any subtopic levels set (i.e., has taken the diagnostic
 * or played at least one subtopic-targeted round).
 */
export function hasSubtopicLevels(): boolean {
  const levels = loadSubtopicLevels()
  return Object.keys(levels).length > 0
}
