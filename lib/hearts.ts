"use client"

// Hearts system — solo play only, never applies to challenges
// Free users get 5 hearts per day, resetting at midnight local time.
// Wrong answers and timeouts cost 1 heart. 3 solo rounds per day limit.
// Hearts can be refilled for 200 gems. Pro users bypass all limits.

const HEARTS_KEY = "rally_hearts"
const HEARTS_DATE_KEY = "rally_hearts_date"
const ROUNDS_TODAY_KEY = "rally_rounds_today"
const ROUNDS_DATE_KEY = "rally_rounds_date"
const PRO_KEY = "rally_is_pro"

const MAX_HEARTS = 5
const MAX_FREE_ROUNDS = 3
const HEART_REFILL_COST = 200

function todayStr(): string {
  return new Date().toISOString().split("T")[0]
}

function isPro(): boolean {
  if (typeof window === "undefined") return false
  return localStorage.getItem(PRO_KEY) === "true"
}

// Check if hearts/rounds need a daily reset (new day = fresh hearts)
function maybeResetForNewDay(): void {
  if (typeof window === "undefined") return
  const today = todayStr()
  const heartsDate = localStorage.getItem(HEARTS_DATE_KEY)

  if (heartsDate !== today) {
    localStorage.setItem(HEARTS_KEY, MAX_HEARTS.toString())
    localStorage.setItem(HEARTS_DATE_KEY, today)
    localStorage.setItem(ROUNDS_TODAY_KEY, "0")
    localStorage.setItem(ROUNDS_DATE_KEY, today)
  }
}

export function getHearts(): number {
  if (typeof window === "undefined") return MAX_HEARTS
  maybeResetForNewDay()
  const stored = localStorage.getItem(HEARTS_KEY)
  if (stored === null) {
    localStorage.setItem(HEARTS_KEY, MAX_HEARTS.toString())
    localStorage.setItem(HEARTS_DATE_KEY, todayStr())
    return MAX_HEARTS
  }
  return parseInt(stored, 10) || 0
}

export function loseHeart(): number {
  if (typeof window === "undefined") return MAX_HEARTS
  if (isPro()) return getHearts() // Pro users never lose hearts
  const current = getHearts()
  const next = Math.max(0, current - 1)
  localStorage.setItem(HEARTS_KEY, next.toString())
  return next
}

export function getRoundsToday(): number {
  if (typeof window === "undefined") return 0
  maybeResetForNewDay()
  const roundsDate = localStorage.getItem(ROUNDS_DATE_KEY)
  if (roundsDate !== todayStr()) return 0
  return parseInt(localStorage.getItem(ROUNDS_TODAY_KEY) || "0", 10)
}

export function incrementRoundsToday(): void {
  if (typeof window === "undefined") return
  maybeResetForNewDay()
  const current = getRoundsToday()
  localStorage.setItem(ROUNDS_TODAY_KEY, (current + 1).toString())
  localStorage.setItem(ROUNDS_DATE_KEY, todayStr())
}

// Can the user start a new solo round?
export function canPlaySolo(): { allowed: boolean; reason: string | null } {
  if (isPro()) return { allowed: true, reason: null }

  const hearts = getHearts()
  if (hearts <= 0) {
    return { allowed: false, reason: "no hearts left \u00b7 come back tomorrow or go Pro" }
  }

  const rounds = getRoundsToday()
  if (rounds >= MAX_FREE_ROUNDS) {
    return { allowed: false, reason: "3 rounds done for today \u00b7 come back tomorrow or go Pro" }
  }

  return { allowed: true, reason: null }
}

// Refill hearts by spending gems. Returns true if successful.
export function refillHearts(currentGems: number, spendGems: (amount: number) => void): boolean {
  if (currentGems < HEART_REFILL_COST) return false
  spendGems(-HEART_REFILL_COST) // negative to deduct
  localStorage.setItem(HEARTS_KEY, MAX_HEARTS.toString())
  localStorage.setItem(HEARTS_DATE_KEY, todayStr())
  return true
}

export const HEARTS_CONFIG = {
  maxHearts: MAX_HEARTS,
  maxFreeRounds: MAX_FREE_ROUNDS,
  refillCost: HEART_REFILL_COST,
}
