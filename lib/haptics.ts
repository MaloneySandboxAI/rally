/**
 * Haptic feedback utility for Rally
 *
 * Uses the Web Vibration API for now. When Capacitor is added for iOS,
 * swap to @capacitor/haptics for native haptic engine support.
 *
 * Gracefully degrades to no-op on unsupported platforms (desktop browsers).
 *
 * Usage:
 *   haptics.light()    — tap an answer, navigate
 *   haptics.medium()   — lock in answer, complete round
 *   haptics.heavy()    — wrong answer, lose heart
 *   haptics.success()  — correct answer, earn gems
 *   haptics.error()    — timeout, out of hearts
 *   haptics.selection() — scroll picker, toggle
 */

function vibrate(pattern: number | number[]): void {
  if (typeof navigator !== "undefined" && navigator.vibrate) {
    try {
      navigator.vibrate(pattern)
    } catch {
      // Silently fail on unsupported platforms
    }
  }
}

export const haptics = {
  /** Light tap — selecting an answer, tapping a button */
  light: () => vibrate(10),

  /** Medium tap — locking in an answer, completing a round */
  medium: () => vibrate(20),

  /** Heavy tap — wrong answer, losing a heart */
  heavy: () => vibrate(40),

  /** Success — correct answer, earning gems, unlocking something */
  success: () => vibrate([10, 30, 10]),

  /** Error — timeout, out of hearts, purchase failed */
  error: () => vibrate([20, 50, 20]),

  /** Warning — low time, last heart */
  warning: () => vibrate([15, 30, 15]),

  /** Selection change — scroll pickers, toggles */
  selection: () => vibrate(5),
}
