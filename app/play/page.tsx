"use client"

import { useState, useCallback, useEffect, Suspense, useRef } from "react"
import { Check, X, RotateCcw, ChevronRight, Diamond, Zap, Sparkles, Heart, BookOpen, ChevronDown, Swords, Copy, Share2, Flame, TrendingUp } from "lucide-react"
import { useSearchParams } from "next/navigation"
import { useGems, GEM_VALUES, gemsForAnswer, markRoundCompleted } from "@/lib/gem-context"
// ChallengeWaitlistSheet removed — challenges are now created before playing
import { WorkArea, WorkAreaButton } from "@/components/rally/work-area"
import { toast } from "sonner"
import { Spinner } from "@/components/ui/spinner"
import { getOneQuestion, getQuestionsByIds, type Question } from "@/lib/questions"
import { getChallengeUrl, completeChallenge, updateCreatorResults, getChallenge, poolFromFlat, type ChallengeResult, type ChallengePool } from "@/lib/challenges"
import { saveRoundStats, getAdaptiveDifficulty } from "@/lib/stats"
import { checkGemMilestone, GemMilestoneCelebration } from "@/components/rally/gem-milestone"
import { canPlaySolo, getHearts, loseHeart, incrementRoundsToday, refillHearts, HEARTS_CONFIG } from "@/lib/hearts"
import { createClient } from "@/lib/supabase/client"

/** Get display name from Supabase auth session, falling back gracefully */
async function getDisplayName(): Promise<string> {
  try {
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) {
      const meta = session.user.user_metadata
      return meta?.full_name || meta?.name || session.user.email?.split("@")[0] || "anonymous"
    }
  } catch {}
  return "anonymous"
}

const CATEGORIES = [
  { id: "Algebra", name: "Algebra", color: "#378ADD", isMath: true },
  { id: "Reading Comprehension", name: "Reading", color: "#14B8A6", isMath: false },
  { id: "Grammar", name: "Grammar", color: "#A855F7", isMath: false },
  { id: "Data & Statistics", name: "Data & Stats", color: "#F97316", isMath: true },
]

// Timer by difficulty (seconds), per category type
const TIMER_BY_DIFFICULTY: Record<string, Record<string, number>> = {
  math: { easy: 45, medium: 75, hard: 120 },
  reading: { easy: 35, medium: 55, hard: 90 },
}

function getTimerForQuestion(difficulty: string, isMath: boolean): number {
  const timers = isMath ? TIMER_BY_DIFFICULTY.math : TIMER_BY_DIFFICULTY.reading
  return timers[difficulty] ?? 60
}

// Speed bonus threshold = half the question's time
function getSpeedThreshold(difficulty: string, isMath: boolean): number {
  return Math.floor(getTimerForQuestion(difficulty, isMath) / 2)
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
  chosenAnswerIndex: number | null // which option the user picked (null = timeout)
}

// Generate a genuinely helpful "learn more" breakdown for a wrong answer
// Teaches the concept, not the specific answer (that's already shown above)
function getDetailedExplanation(q: Question): {
  concept: string
  approach: string
  commonMistake: string
  takeaway: string
} {
  const questionLower = q.question.toLowerCase()

  // Defaults
  let concept = "Problem Solving"
  let approach = "Break the problem into smaller pieces and work through each one. If you're stuck, try plugging in each answer choice to see which one satisfies the conditions."
  let commonMistake = "Rushing through without double-checking. On the SAT, many wrong answers are designed to be the result of common calculation errors — they're traps."
  let takeaway = "Always verify your answer by plugging it back into the original problem."

  // ===== ALGEBRA =====
  if (q.category === "Algebra") {
    if (questionLower.includes("slope")) {
      concept = "Slope of a Line"
      approach = "Slope measures steepness — it's the ratio of vertical change to horizontal change between any two points. The formula is (y\u2082 \u2013 y\u2081) / (x\u2082 \u2013 x\u2081). The key is being consistent: always subtract the first point from the second in both numerator and denominator. A positive slope means the line goes up-right; negative means down-right; zero means flat; undefined means vertical."
      commonMistake = "Mixing up the order of subtraction — putting x values on top instead of y values, or subtracting point 1 from point 2 on top but point 2 from point 1 on bottom. This flips the sign."
      takeaway = "Slope = rise \u00F7 run = \u0394y \u00F7 \u0394x. Always do y on top, x on bottom, same subtraction order for both."
    } else if (questionLower.includes("root") || questionLower.includes("vieta") || (questionLower.includes("r") && questionLower.includes("s") && questionLower.includes("x\u00B2"))) {
      concept = "Vieta's Formulas (Roots & Coefficients)"
      approach = "For any quadratic x\u00B2 \u2013 px + q = 0 with roots r and s, Vieta's formulas give you two powerful relationships: r + s = p (sum of roots equals the negative of the x-coefficient) and r \u00D7 s = q (product of roots equals the constant). You can use these to find expressions like r\u00B2 + s\u00B2 without ever solving for r and s individually. The trick: rewrite the expression using (r+s) and (rs). For example, r\u00B2 + s\u00B2 = (r+s)\u00B2 \u2013 2rs."
      commonMistake = "Trying to solve for each root individually using the quadratic formula. That's unnecessary and error-prone. Vieta's lets you work with the sum and product directly, which is much faster."
      takeaway = "When a question gives you a quadratic and asks about its roots, use Vieta's: sum = \u2013b/a, product = c/a. Rewrite the target expression in terms of sum and product."
    } else if (questionLower.includes("system") || (questionLower.includes("2x") && questionLower.includes("y ="))) {
      concept = "Systems of Equations"
      approach = "A system of two equations with two unknowns can be solved two ways. Substitution: solve one equation for a variable, plug it into the other. Elimination: add or subtract the equations to cancel one variable. Pick whichever method makes the arithmetic simpler — if coefficients already match, use elimination."
      commonMistake = "Solving for x but forgetting the question asked for x + y (or some other combination). Always re-read what's being asked after you find the individual values."
      takeaway = "After finding your variables, re-read the question. It might want a sum, difference, or product — not just a single variable."
    } else if (questionLower.includes("percent") || questionLower.includes("%")) {
      concept = "Percent Change & Successive Percentages"
      approach = "Each percent change is a multiplier. A 30% increase means \u00D71.30. A 10% decrease means \u00D70.90. When changes happen one after another, multiply the multipliers: 1.30 \u00D7 0.90 = 1.17, which is a 17% increase. Never add percentages directly — that only works for a single change."
      commonMistake = "Thinking 30% up then 10% down = 20% up. It's actually 17% because the 10% discount applies to the already-marked-up price, not the original."
      takeaway = "Successive % changes: convert each to a multiplier, multiply them all, subtract 1 to get net change."
    } else if (questionLower.includes("factor") || questionLower.includes("undefined") || questionLower.includes("denominator")) {
      concept = "Rational Expressions & Undefined Values"
      approach = "A fraction is undefined when its denominator equals zero. To find those values: (1) factor the denominator completely, (2) set each factor equal to zero, (3) solve. The numerator doesn't matter — even if it also equals zero at that point, the expression is still undefined."
      commonMistake = "Only finding one factor of the denominator, or canceling the numerator and denominator before checking for undefined values. A 'hole' (where both top and bottom are zero) is still undefined."
      takeaway = "Undefined = denominator is zero. Always factor the denominator first, then set each factor = 0."
    } else if (questionLower.includes("f(") || questionLower.includes("function") || questionLower.includes("g(")) {
      concept = "Function Notation & Recursive Patterns"
      approach = "When given a rule like f(x+2) = f(x) + 4 and a starting value, build a chain: compute f at each step using the rule. Make a mini table — write the input values in one column and outputs in the other. This avoids mistakes from trying to jump ahead."
      commonMistake = "Trying to skip steps or compute the final answer in one leap. With recursive definitions, each value depends on the previous one, so you must go in order."
      takeaway = "Recursive functions: make a table, go step by step. The pattern often becomes obvious after 2-3 steps."
    } else if (questionLower.includes("quadratic") || questionLower.includes("x\u00B2") || questionLower.includes("x^2")) {
      concept = "Quadratic Equations"
      approach = "Three ways to solve: (1) Factoring — works when the quadratic factors into nice integers. (2) Completing the square — useful for vertex form. (3) Quadratic formula x = (\u2013b \u00B1 \u221A(b\u00B2\u20134ac)) / 2a — always works. Check the discriminant (b\u00B2\u20134ac) first: positive = 2 real solutions, zero = 1, negative = none."
      commonMistake = "Sign errors in the quadratic formula, especially with the \u2013b term. If b is already negative, \u2013b becomes positive — that trips people up constantly."
      takeaway = "Try factoring first (fastest). If that fails, quadratic formula. Write each step carefully — sign errors are the #1 mistake."
    } else if (questionLower.includes("inequalit")) {
      concept = "Inequalities"
      approach = "Solve inequalities the same way as equations with one critical exception: when you multiply or divide both sides by a negative number, you must flip the inequality sign. Graph your solution on a number line to visualize it."
      commonMistake = "Forgetting to flip the inequality when dividing by a negative. For example, \u20132x > 6 becomes x < \u20133 (not x > \u20133)."
      takeaway = "Multiply or divide by a negative? Flip the sign. Always."
    } else if (questionLower.includes("exponent") || questionLower.includes("power")) {
      concept = "Exponent Rules"
      approach = "The key rules: x^a \u00D7 x^b = x^(a+b), x^a \u00F7 x^b = x^(a\u2013b), (x^a)^b = x^(ab), x^0 = 1, x^(\u2013n) = 1/x^n. When simplifying, convert everything to the same base first, then apply the rules."
      commonMistake = "Multiplying exponents when you should add them (or vice versa). x\u00B2 \u00D7 x\u00B3 = x\u2075 (add), not x\u2076 (multiply)."
      takeaway = "Same base, multiplying? Add exponents. Same base, power of a power? Multiply exponents."
    } else if (questionLower.includes("absolute")) {
      concept = "Absolute Value"
      approach = "Absolute value |x| means 'distance from zero' — it's always non-negative. To solve |expression| = k, split into two cases: expression = k and expression = \u2013k. For inequalities, |x| < k means \u2013k < x < k, and |x| > k means x < \u2013k or x > k."
      commonMistake = "Forgetting the negative case. |x \u2013 3| = 5 has TWO solutions: x = 8 and x = \u20132."
      takeaway = "Absolute value = two cases. Always write both and solve each separately."
    } else {
      concept = "Algebraic Reasoning"
      approach = "Identify what the question is asking for, then work backwards. Isolate the unknown variable step by step, simplify at each stage, and check your arithmetic. If you're stuck, try plugging in each answer choice — one of them must work."
      commonMistake = "Doing too many steps in your head. Write each step down — most algebra mistakes come from mental arithmetic, not from misunderstanding the concept."
      takeaway = "When stuck, try backsolving: plug each answer choice into the original problem to see which one works."
    }
  }

  // ===== READING COMPREHENSION =====
  if (q.category === "Reading Comprehension") {
    if (questionLower.includes("main idea") || questionLower.includes("primarily") || questionLower.includes("central") || questionLower.includes("purpose")) {
      concept = "Main Idea & Author's Purpose"
      approach = "The main idea is what the entire passage is about — not just one paragraph or detail. To find it, ask: 'If I could summarize this whole passage in one sentence, what would it be?' The correct answer covers the full scope. Wrong answers often describe something that's true but only applies to one section."
      commonMistake = "Picking a detail that appears in the passage but doesn't represent the overall argument. Just because something is mentioned doesn't make it the main idea."
      takeaway = "Could this answer be the title of the whole passage? If it only fits one paragraph, it's a detail — not the main idea."
    } else if (questionLower.includes("evidence") || questionLower.includes("support") || questionLower.includes("best describes") || questionLower.includes("according to")) {
      concept = "Evidence-Based Reasoning"
      approach = "The SAT tests whether you can find answers that are directly supported by the text — not your opinion or outside knowledge. Before choosing, go back to the passage and find the specific sentence or phrase that proves your answer. If you can't point to it, you're guessing."
      commonMistake = "Choosing an answer that 'feels right' from general knowledge without verifying it against the passage. The SAT rewards careful reading, not intuition."
      takeaway = "Point to the evidence. If you can't find the exact line in the passage that supports your answer, pick a different one."
    } else if (questionLower.includes("infer") || questionLower.includes("imply") || questionLower.includes("suggest") || questionLower.includes("most likely")) {
      concept = "Inference & Implication"
      approach = "SAT inferences are small, logical steps from what's stated — never big leaps. Think of it as 'what must be true based on what the passage says?' The correct answer is almost directly stated, just not in those exact words. If you have to make an assumption to justify the answer, it's probably wrong."
      commonMistake = "Over-thinking it. SAT inferences are conservative — if the answer requires a big logical leap or outside knowledge, it's a trap."
      takeaway = "The best SAT inference is barely an inference at all. It should feel almost too obvious."
    } else if (questionLower.includes("tone") || questionLower.includes("attitude") || questionLower.includes("perspective")) {
      concept = "Tone & Author's Attitude"
      approach = "Look for word choice clues — adjectives, adverbs, and loaded words reveal the author's attitude. Is the language positive, negative, or neutral? Enthusiastic or skeptical? Also check: does the author use hedging words ('might,' 'perhaps') or definitive ones ('clearly,' 'undoubtedly')?"
      commonMistake = "Confusing the subject matter's tone with the author's attitude. A passage about a tragedy can be written in an analytical, objective tone."
      takeaway = "Focus on HOW the author writes about the topic (word choice), not WHAT the topic is."
    } else {
      concept = "Active Reading Strategy"
      approach = "Read the question first, then return to the relevant section of the passage. Don't rely on memory — always verify against the actual text. For paired passages, identify each author's position before comparing them."
      commonMistake = "Choosing the first answer that seems reasonable without checking it against the passage. Wrong answers are designed to sound plausible."
      takeaway = "The answer is always in the passage. Find it, underline it, then choose."
    }
  }

  // ===== GRAMMAR =====
  if (q.category === "Grammar") {
    if (questionLower.includes("comma") || questionLower.includes("punctuat") || questionLower.includes("semicolon") || questionLower.includes("colon") || questionLower.includes("dash")) {
      concept = "Punctuation Rules"
      approach = "Each punctuation mark has specific rules. Commas separate items in lists, set off introductory phrases, and surround non-essential information. Semicolons connect two complete sentences about related ideas. Colons introduce lists or explanations after a complete sentence. Dashes set off extra information with more emphasis than commas."
      commonMistake = "Adding commas wherever you'd naturally pause when speaking. Written grammar and spoken rhythm don't always match."
      takeaway = "Test commas by removing the phrase between them — if the sentence still works, they belong. Test semicolons by checking that both sides are complete sentences."
    } else if (questionLower.includes("subject") || questionLower.includes("verb") || questionLower.includes("agree")) {
      concept = "Subject-Verb Agreement"
      approach = "The verb must match its subject in number (singular/plural). The trick: find the real subject by ignoring everything between the subject and verb — prepositional phrases, relative clauses, and parenthetical expressions are all distractions. 'The box of chocolates IS' (not 'are') because the subject is 'box,' not 'chocolates.'"
      commonMistake = "Matching the verb to the nearest noun instead of the actual subject. Phrases like 'of the students,' 'along with the team,' etc. don't change the subject."
      takeaway = "Cross out everything between the subject and verb. Whatever's left tells you whether to use singular or plural."
    } else if (questionLower.includes("tense") || questionLower.includes("was") || questionLower.includes("were") || questionLower.includes("had") || questionLower.includes("will")) {
      concept = "Verb Tense Consistency"
      approach = "Verbs in a sentence or paragraph should stay in the same tense unless there's a clear reason to shift (like describing something that happened before another past event — that's past perfect, 'had done'). Context clues like 'yesterday,' 'currently,' 'by the time' tell you which tense is needed."
      commonMistake = "Mixing past and present tense in the same paragraph without noticing. Read the surrounding sentences to see what tense they use."
      takeaway = "Look at the verbs around the blank — they tell you which tense the answer should be in."
    } else if (questionLower.includes("pronoun") || questionLower.includes("which") || questionLower.includes("who") || questionLower.includes("whom")) {
      concept = "Pronoun Usage"
      approach = "Every pronoun must clearly refer to one specific noun (its antecedent). 'Who' is for subjects (who did it?), 'whom' is for objects (to whom?). 'Which' refers to things, 'who' refers to people. If a pronoun could refer to multiple nouns, the sentence is ambiguous and needs to be rewritten."
      commonMistake = "Using 'they' or 'it' when it's unclear what the pronoun refers to. If two people are mentioned and you say 'he,' which one?"
      takeaway = "For every pronoun, ask: 'What specific noun does this replace?' If the answer isn't obvious, there's a problem."
    } else if (questionLower.includes("concise") || questionLower.includes("wordy") || questionLower.includes("redundan")) {
      concept = "Concision & Eliminating Wordiness"
      approach = "The SAT favors clear, direct writing. If two answer choices say the same thing but one uses fewer words without losing meaning, pick the shorter one. Watch for redundancies like 'each and every,' 'past history,' or 'in order to' (just use 'to')."
      commonMistake = "Thinking longer answers sound smarter or more complete. On the SAT, brevity wins when meaning is preserved."
      takeaway = "Can you say the same thing in fewer words? If yes, do it. The SAT rewards concision."
    } else if (questionLower.includes("transition") || questionLower.includes("however") || questionLower.includes("therefore") || questionLower.includes("moreover")) {
      concept = "Transition Words"
      approach = "Transitions show the relationship between ideas. 'However/but/yet' = contrast. 'Therefore/thus/consequently' = cause-effect. 'Moreover/furthermore/additionally' = adding on. 'For example/for instance' = illustration. Read the sentences before and after the blank to understand the logical relationship, then pick the transition that matches."
      commonMistake = "Picking a transition that sounds good without checking the logical relationship. 'However' after a sentence doesn't always mean contrast — check what comes next."
      takeaway = "Identify the relationship first (contrast? addition? cause?), then pick the transition that fits."
    } else {
      concept = "Grammar & Standard English"
      approach = "Read the entire sentence with each answer choice plugged in. The correct answer will sound natural, be grammatically complete, and convey the meaning clearly. When two choices seem similar, pick the one that's shorter and simpler — the SAT prefers clear writing over complex writing."
      commonMistake = "Picking the most formal or elaborate option. The SAT values clarity and correctness, not fancy phrasing."
      takeaway = "Read the full sentence with your choice. Does it flow naturally and say what it means clearly? If yes, it's probably right."
    }
  }

  // ===== DATA & STATISTICS =====
  if (q.category === "Data & Statistics") {
    if (questionLower.includes("mean") || questionLower.includes("average") || questionLower.includes("median") || questionLower.includes("mode")) {
      concept = "Measures of Center"
      approach = "Mean = add all values, divide by count. Median = sort the values, pick the middle one (or average the two middle ones if even count). The key difference: the mean gets pulled toward outliers (extreme values), but the median doesn't. If the data has outliers, the median is a better representation of 'typical.'"
      commonMistake = "Calculating the mean when the question asks for the median, or vice versa. Also: with an even number of values, forgetting to average the two middle numbers for the median."
      takeaway = "Outliers pull the mean but not the median. Check which measure the question asks for before you start calculating."
    } else if (questionLower.includes("probability") || questionLower.includes("likely") || questionLower.includes("chance") || questionLower.includes("random")) {
      concept = "Probability"
      approach = "Probability = (outcomes you want) \u00F7 (total possible outcomes). For 'or' questions: add probabilities, but subtract the overlap if events can happen together. For 'and' questions: multiply probabilities. For 'given that' (conditional): narrow down the total to only the cases where the condition is met, then count."
      commonMistake = "Using the wrong total. In conditional probability, the denominator isn't all outcomes — it's only the outcomes where the given condition is true."
      takeaway = "Always identify: what's the numerator (what I want) and what's the denominator (what's possible)? Write both down before dividing."
    } else if (questionLower.includes("scatter") || questionLower.includes("best fit") || questionLower.includes("correlation") || questionLower.includes("trend")) {
      concept = "Scatterplots & Correlation"
      approach = "A scatterplot shows the relationship between two variables. The line of best fit shows the general trend. Positive correlation: as x increases, y tends to increase. Negative: as x increases, y decreases. No correlation: no clear pattern. The slope of the best-fit line tells you the rate of change — for every 1 unit increase in x, y changes by [slope] units."
      commonMistake = "Confusing correlation with causation. Just because two things move together doesn't mean one causes the other. Also: misreading the scale on the axes."
      takeaway = "Read both axis labels first. The slope of the line = rate of change. Correlation \u2260 causation."
    } else if (questionLower.includes("table") || questionLower.includes("two-way") || questionLower.includes("row") || questionLower.includes("column")) {
      concept = "Two-Way Tables"
      approach = "Two-way tables organize data by two categories. To find a probability or proportion, identify the right cell (intersection of row and column) for the numerator, and the right total (row total, column total, or grand total) for the denominator. The question wording tells you which total to use."
      commonMistake = "Using the grand total as the denominator when the question specifies a condition ('of those who...' or 'given that...'). Conditional questions use a row or column total, not the grand total."
      takeaway = "'Of those who...' = use that group's total as denominator. 'Overall' = use grand total."
    } else if (questionLower.includes("sample") || questionLower.includes("survey") || questionLower.includes("bias") || questionLower.includes("margin")) {
      concept = "Sampling & Statistical Inference"
      approach = "A study's conclusions are only valid for the population that was actually sampled. Random sampling lets you generalize to the larger population. Convenience samples (e.g., surveying only your friends) introduce bias. The margin of error tells you the range of likely values — a larger sample gives a smaller margin."
      commonMistake = "Assuming a study applies to everyone when it only sampled a specific group. If only college students were surveyed, you can't generalize to all adults."
      takeaway = "Who was sampled? That's who the results apply to. Random = generalizable. Non-random = only that group."
    } else {
      concept = "Data Analysis"
      approach = "Before doing any math, read every label: axis titles, column headers, units, footnotes. Identify exactly what the numbers represent — are they counts, percentages, rates, or averages? Then do exactly what the question asks, step by step."
      commonMistake = "Jumping into calculation without checking what the numbers represent. A 'percent' and a 'count' can look the same but require completely different math."
      takeaway = "Read every label before calculating. What do these numbers actually represent?"
    }
  }

  return { concept, approach, commonMistake, takeaway }
}

function PlayPageContent() {
  const searchParams = useSearchParams()
  const challengeCode = searchParams.get("challengeCode") || null
  const creatorChallengeCode = searchParams.get("creatorChallenge") || null
  const isChallenge = searchParams.get("challenge") === "true" || !!creatorChallengeCode || !!challengeCode
  const isCreatorChallenge = !!creatorChallengeCode // creator playing their own challenge (pre-play flow)
  const categoryParam = searchParams.get("category") || "Algebra"
  const { totalGems, addGems } = useGems()
  
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
        const isChallengeMode = !!challengeCode || !!creatorChallengeCode
        const activeCode = challengeCode || creatorChallengeCode

        // CHALLENGE MODE: load shared pool and pre-fetch all questions
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

          // Reconstruct the shared pool from flat array [5 easy, 5 medium, 5 hard]
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

        // SOLO MODE: adaptive difficulty from Supabase
        difficultyRef.current = "easy"
        const excluded = getUsedIdsForCategory(categoryParam)
        let question = await getOneQuestion(categoryParam, difficultyRef.current, excluded)
        if (!question && excluded.length > 0) {
          resetUsedIds(categoryParam)
          question = await getOneQuestion(categoryParam, difficultyRef.current, [])
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
  }, [isMounted, isQuestionsReady, categoryParam, challengeCode, creatorChallengeCode])

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
      const excluded = getUsedIdsForCategory(categoryParam)
      let question = await getOneQuestion(categoryParam, difficultyRef.current, excluded)
      if (!question) {
        resetUsedIds(categoryParam)
        question = await getOneQuestion(categoryParam, difficultyRef.current, [])
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
      chosenAnswerIndex: null, // timeout — no answer given
    }])

    // Show the correct answer briefly then auto-advance
    setPendingAnswer(null) // clear any pending selection
    setSelectedAnswer(-1) // -1 indicates timeout

    setTimeout(async () => {
      if (currentQuestion < TOTAL_QUESTIONS - 1) {
        if (!challengeCode) await fetchNextQuestion()
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
    setPendingAnswer(answerIndex)
  }, [selectedAnswer])

  // Step 2: Confirm the selected answer (submit it)
  const handleConfirmAnswer = useCallback(() => {
    if (pendingAnswer === null || selectedAnswer !== null) return

    // Stop timer
    setIsTimerActive(false)
    if (timerRef.current) clearInterval(timerRef.current)

    setSelectedAnswer(pendingAnswer)

    // Calculate time taken — speed threshold is half of this question's difficulty time
    const timeTaken = (Date.now() - questionStartTimeRef.current) / 1000
    const speedThreshold = getSpeedThreshold(question?.difficulty || "medium", isMathCategory)
    const isSpeedBonus = timeTaken <= speedThreshold

    if (pendingAnswer === correctAnswerIndex) {
      setScore(prev => prev + 1)

      const gemsForThis = gemsForAnswer(question?.difficulty || "easy", isChallenge, isSpeedBonus)

      // Adaptive difficulty: bump UP on correct answer
      if (difficultyRef.current === "easy") {
        difficultyRef.current = "medium"
      } else if (difficultyRef.current === "medium") {
        difficultyRef.current = "hard"
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
      if (difficultyRef.current === "hard") {
        difficultyRef.current = "medium"
      } else if (difficultyRef.current === "medium") {
        difficultyRef.current = "easy"
      }

      // Record wrong answer (hearts deducted at end of round, not mid-game)
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
    if (currentQuestion < TOTAL_QUESTIONS - 1) {
      // In challenge mode, questions are pre-loaded; in solo mode, fetch next adaptively
      if (!challengeCode) await fetchNextQuestion()
      setCurrentQuestion(prev => prev + 1)
      setPendingAnswer(null)
      setSelectedAnswer(null)
    } else {
      setShowResults(true)
    }
  }, [currentQuestion, fetchNextQuestion])

  const handlePlayAgain = useCallback(() => {
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

      // Check for gem milestone before adding (compare before vs after)
      const gemsBefore = totalGems
      addGems(correctGems + outcomeBonus)
      const milestone = checkGemMilestone(gemsBefore, gemsBefore + correctGems + outcomeBonus)
      if (milestone) {
        setGemMilestone(milestone)
      }
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

      // If creator just finished their own challenge, update their results
      // Score = total gems earned (rewards harder difficulty)
      if (creatorChallengeCode) {
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
          } else {
            console.error("[rally] Failed to update creator results")
          }
        })()
      }
      // If challenger just finished, submit results to complete the challenge
      else if (challengeCode) {
        ;(async () => {
          const challengerName = await getDisplayName()
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
            challengerScore: correctGems, // gems, not correct count
            challengerResults: challengeResults,
          })
          if (success) {
            console.log(`[rally] Challenge completed — ${correctGems} gems`)
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
        />
        {gemMilestone && (
          <GemMilestoneCelebration
            milestone={gemMilestone}
            onDismiss={() => setGemMilestone(null)}
          />
        )}
      </>
    )
  }

  // Main game screen
  return (
    <div className="h-[100dvh] bg-[#021f3d] flex flex-col overflow-hidden">
      {/* Speed Bonus Animation */}
      {showSpeedBonus && <SpeedBonusAnimation />}

      {/* Header — compact */}
      <header className="flex-shrink-0 bg-[#021f3d] px-4 pt-3 pb-2">
        <div className="flex items-center justify-between mb-2">
          <WorkAreaButton onClick={() => setShowWorkArea(true)} />
          <h1 className="text-lg font-extrabold text-white">{categoryName}</h1>
          <div className="flex items-center gap-2.5">
            {!isChallenge && (
              <div className="flex items-center gap-1">
                <Heart className="w-3.5 h-3.5 text-red-400 fill-red-400" />
                <span className="text-xs font-bold text-red-400">{hearts}</span>
              </div>
            )}
            <CountdownTimer timeRemaining={timeRemaining} totalTime={totalTime} />
          </div>
        </div>
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
      </header>

      {/* Question Content — fills remaining space, no scroll */}
      <main className="flex-1 flex flex-col px-4 pt-2 pb-3 min-h-0">
        {/* Question Text */}
        <div className="mb-2 flex-shrink-0">
          <h2 className="text-base font-extrabold text-white text-center leading-snug px-1 max-w-xl mx-auto">
            {question?.question}
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
              isSpeedBonus={currentQuestionSpeedBonus}
              isTimeout={isTimeout}
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
              {currentQuestion < TOTAL_QUESTIONS - 1 ? "next question" : "see results"}
              <ChevronRight className="w-4 h-4" strokeWidth={3} />
            </button>
          )}
        </div>
      </main>

      {/* Work Area (Notepad / Calculator / Draw) */}
      <WorkArea isOpen={showWorkArea} onClose={() => setShowWorkArea(false)} />

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
  pendingAnswer: number | null
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
  pendingAnswer,
  selectedAnswer,
  correctAnswer,
  explanation,
  onSelect,
  showGemAnimation,
  gemAmount,
  isSpeedBonus,
  isTimeout,
}: AnswerOptionProps) {
  const isPending = pendingAnswer === index && selectedAnswer === null
  const isSelected = selectedAnswer === index
  const isCorrect = index === correctAnswer
  const hasConfirmed = selectedAnswer !== null
  const showAsCorrect = hasConfirmed && isCorrect
  const showAsWrong = isSelected && !isCorrect

  const getBackgroundColor = () => {
    if (showAsCorrect) return "#16a34a"
    if (showAsWrong) return "#dc2626"
    if (isPending) return "#378ADD"
    return "#ffffff"
  }

  const getTextColor = () => {
    if (showAsCorrect || showAsWrong || isPending) return "#ffffff"
    return "#0a1628"
  }

  const getLetterBgColor = () => {
    if (showAsCorrect || showAsWrong) return "rgba(255,255,255,0.2)"
    if (isPending) return "rgba(255,255,255,0.25)"
    return "#378ADD"
  }

  return (
    <div className="relative">
      <button
        onClick={() => onSelect(index)}
        disabled={hasConfirmed}
        className={`w-full rounded-xl py-2 px-3 flex items-center gap-2.5 transition-all duration-200 ${
          hasConfirmed ? "cursor-default" : "active:scale-[0.98] hover:shadow-lg cursor-pointer"
        } ${isPending ? "ring-2 ring-white/30 shadow-lg shadow-[#378ADD]/30" : ""}`}
        style={{
          backgroundColor: getBackgroundColor(),
          color: getTextColor(),
        }}
      >
        {/* Letter Circle */}
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-xs"
          style={{
            backgroundColor: getLetterBgColor(),
            color: "#ffffff",
          }}
        >
          {letter}
        </div>

        {/* Answer Text */}
        <span className="text-sm font-bold flex-1 text-left leading-snug">{option}</span>

        {/* Check/X Icon */}
        {showAsCorrect && <Check className="w-5 h-5 flex-shrink-0" strokeWidth={3} />}
        {showAsWrong && <X className="w-5 h-5 flex-shrink-0" strokeWidth={3} />}
      </button>

      {/* Floating Gem Animation */}
      {showGemAnimation && (
        <FloatingGemIndicator amount={gemAmount} isSpeedBonus={isSpeedBonus} />
      )}

      {/* Brief explanation inline — only for correct answer after confirm */}
      {showAsCorrect && (
        <p className="mt-1 px-4 text-xs text-[#85B7EB] italic leading-snug animate-in fade-in slide-in-from-top-2 duration-300 line-clamp-2">
          {explanation}
        </p>
      )}
    </div>
  )
}

interface ResultsScreenProps {
  score: number
  isChallenge: boolean
  isCreatorChallenge: boolean
  challengeCode: string | null
  creatorChallengeCode: string | null
  categoryId: string
  categoryName: string
  onPlayAgain: () => void
  answerResults: AnswerResult[]
  sessionQuestions: Question[]
  creatorScore: number | null
}

function getEncouragementMessage(score: number): string {
  if (score === 5) return "Perfect score! Dare someone to match it"
  if (score === 4) return "Really strong! Think your friends can beat that?"
  if (score === 3) return "Not bad! Bet you can beat your friends though"
  return "Tough round. Challenge a friend and see how they do"
}

function ResultsScreen({ score, isChallenge, isCreatorChallenge, challengeCode, creatorChallengeCode, categoryId, categoryName, onPlayAgain, answerResults, sessionQuestions, creatorScore }: ResultsScreenProps) {
  const { totalGems } = useGems() // Use context — stays in sync with parent's addGems call
  const [isGuest, setIsGuest] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set())
  const [copiedPromptIdx, setCopiedPromptIdx] = useState<number | null>(null)
  const [linkCopied, setLinkCopied] = useState(false)

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
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session)
    })
  }, [])
  
  // Single source of truth: count correct answers directly from answerResults
  const correctCount = answerResults.filter(r => r.isCorrect).length
  const speedBonusCount = answerResults.filter(r => r.isCorrect && r.wasSpeedBonus).length
  const answerGems = answerResults.reduce((sum, r) => sum + r.gemsEarned, 0)

  // Build breakdown by difficulty tier — show base gems, then speed bonus extra separately
  const breakdown: { label: string; amount: number }[] = []
  const gemMode = isChallenge ? GEM_VALUES.challenge : GEM_VALUES.solo
  const diffGroups = { easy: [] as AnswerResult[], medium: [] as AnswerResult[], hard: [] as AnswerResult[] }
  for (const r of answerResults.filter(r => r.isCorrect)) {
    const d = (r.difficulty || "easy") as keyof typeof diffGroups
    if (diffGroups[d]) diffGroups[d].push(r)
  }
  let speedBonusExtra = 0
  for (const [diff, results] of Object.entries(diffGroups)) {
    if (results.length > 0) {
      const baseRate = gemMode[diff as keyof typeof gemMode] ?? gemMode.easy
      const baseGems = results.length * baseRate
      const actualGems = results.reduce((sum, r) => sum + r.gemsEarned, 0)
      speedBonusExtra += actualGems - baseGems
      breakdown.push({
        label: `${results.length} ${diff} correct${isChallenge ? " (4x)" : ""}`,
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
  // Challenge outcome bonus — compare gems earned, not correct count
  let outcomeBonus = 0
  let outcomeLabel = ""
  if (isChallenge && creatorScore !== null && creatorScore >= 0) {
    if (answerGems > creatorScore) {
      outcomeBonus = GEM_VALUES.challengeOutcome.win
      outcomeLabel = "challenge won!"
    } else if (answerGems < creatorScore) {
      outcomeBonus = GEM_VALUES.challengeOutcome.loss
      outcomeLabel = "challenge participation"
    } else {
      outcomeBonus = GEM_VALUES.challengeOutcome.tie
      outcomeLabel = "challenge tied"
    }
    breakdown.push({ label: outcomeLabel, amount: outcomeBonus })
  }
  if (correctCount === 0 && outcomeBonus === 0) {
    breakdown.push({ label: "no correct answers", amount: 0 })
  }
  const gemsEarned = answerGems + outcomeBonus

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
    <div className="min-h-[100dvh] bg-[#021f3d] flex flex-col items-center px-4 pt-6 pb-4">
      {/* Score + Answer Pips — compact top section */}
      <div className="text-center mb-3">
        {/* Answer circles with difficulty color-coded borders */}
        <div className="flex items-center justify-center gap-2.5 mb-3">
          {answerResults.map((result, index) => {
            const diffColor = result.difficulty === "hard" ? "#EF4444" : result.difficulty === "medium" ? "#F59E0B" : "#22C55E"
            return (
              <div key={index} className="flex flex-col items-center gap-1">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center ${
                    result.isCorrect ? "bg-green-500" : "bg-red-500"
                  }`}
                >
                  {result.isCorrect ? (
                    <Check className="w-4 h-4 text-white" strokeWidth={3} />
                  ) : (
                    <X className="w-4 h-4 text-white" strokeWidth={3} />
                  )}
                </div>
                <span className="text-[9px] font-bold" style={{ color: diffColor }}>{result.difficulty}</span>
              </div>
            )
          })}
        </div>

        <h1 className="text-4xl font-extrabold text-white leading-none">
          {correctCount}/{TOTAL_QUESTIONS}
        </h1>
        <p className="text-[#85B7EB] text-base font-semibold mt-0.5">{categoryName}</p>
        <p className="text-[#85B7EB]/70 text-sm mt-1.5 max-w-[280px] mx-auto leading-snug">
          {getEncouragementMessage(correctCount)}
        </p>
      </div>

      {/* Guest save-progress banner — compact */}
      {isGuest && (
        <div className="w-full max-w-sm mb-3 bg-[#0a2d4a] border border-[#378ADD]/40 rounded-xl px-4 py-2.5 flex items-center justify-between gap-2">
          <p className="text-[#85B7EB] text-xs font-medium leading-snug flex-1">
            save your progress — create a free account
          </p>
          <a
            href="/login"
            className="bg-[#378ADD] text-white text-xs font-bold rounded-lg px-3 py-1.5 whitespace-nowrap"
          >
            sign up
          </a>
        </div>
      )}

      {/* Gems Earned — merged with difficulty stats */}
      <div className="w-full max-w-sm mb-3 bg-gradient-to-r from-[#F59E0B]/15 to-[#F97316]/15 border border-[#F59E0B]/30 rounded-xl p-3.5">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <Diamond className="w-5 h-5 text-[#F59E0B] fill-[#F59E0B]" />
            <span className="text-xl font-extrabold text-white">+{gemsEarned}</span>
          </div>
          <span className="text-xs text-[#85B7EB]/50">total: {totalGems}</span>
        </div>
        {/* Breakdown — single line items */}
        <div className="space-y-0.5">
          {breakdown.map((item, index) => (
            <div key={index} className="flex justify-between text-xs">
              <span className="text-[#85B7EB]/70">{item.label}</span>
              <span className="text-[#F59E0B] font-semibold">+{item.amount}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Streak + Difficulty Reached + Weak Spot Nudge */}
      <div className="w-full max-w-sm mb-3 space-y-2">
        {/* Streak status */}
        {(() => {
          const streak = typeof window !== "undefined" ? parseInt(localStorage.getItem("rally_streak") || "0", 10) : 0
          if (streak > 0) {
            return (
              <div className="flex items-center gap-2 bg-[#EF9F27]/10 border border-[#EF9F27]/25 rounded-xl px-3.5 py-2.5">
                <Flame className="w-5 h-5 text-[#EF9F27]" />
                <span className="text-sm font-bold text-[#EF9F27]">Day {streak} streak</span>
                {streak >= 7 && <span className="text-xs text-[#EF9F27]/60 ml-auto">keep it going!</span>}
              </div>
            )
          }
          return null
        })()}

        {/* Highest difficulty reached */}
        {(() => {
          const hardCount = answerResults.filter(r => r.difficulty === "hard").length
          const medCount = answerResults.filter(r => r.difficulty === "medium").length
          const hardCorrect = answerResults.filter(r => r.difficulty === "hard" && r.isCorrect).length
          if (hardCount > 0 && hardCorrect > 0) {
            return (
              <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/25 rounded-xl px-3.5 py-2.5">
                <TrendingUp className="w-5 h-5 text-red-400" />
                <span className="text-sm font-bold text-red-400">You nailed {hardCorrect} hard question{hardCorrect > 1 ? "s" : ""}!</span>
              </div>
            )
          } else if (medCount > 0) {
            const medCorrect = answerResults.filter(r => r.difficulty === "medium" && r.isCorrect).length
            if (medCorrect > 0) {
              return (
                <div className="flex items-center gap-2 bg-[#F59E0B]/10 border border-[#F59E0B]/25 rounded-xl px-3.5 py-2.5">
                  <TrendingUp className="w-5 h-5 text-[#F59E0B]" />
                  <span className="text-sm font-bold text-[#F59E0B]">Reached medium difficulty!</span>
                </div>
              )
            }
          }
          return null
        })()}

        {/* Weak spot nudge — suggest weakest category */}
        {(() => {
          if (typeof window === "undefined") return null
          try {
            const raw = localStorage.getItem("rally_stats")
            if (!raw) return null
            const stats = JSON.parse(raw)
            const cats = stats.byCategory as Record<string, { correct: number; total: number }> | undefined
            if (!cats) return null
            let weakest = ""
            let weakestAcc = 100
            for (const [cat, data] of Object.entries(cats)) {
              if (data.total >= 10 && cat !== categoryId) {
                const acc = Math.round((data.correct / data.total) * 100)
                if (acc < weakestAcc) {
                  weakestAcc = acc
                  weakest = cat
                }
              }
            }
            if (weakest && weakestAcc < 70) {
              const wrongInCat = answerResults.filter(r => !r.isCorrect).length
              return (
                <a
                  href={`/play?category=${encodeURIComponent(weakest)}`}
                  className="flex items-center gap-2 bg-[#378ADD]/10 border border-[#378ADD]/25 rounded-xl px-3.5 py-2.5 active:scale-[0.98] transition-transform"
                >
                  <Sparkles className="w-5 h-5 text-[#378ADD]" />
                  <span className="text-sm text-[#85B7EB] flex-1">
                    Your weak spot: <span className="font-bold text-white">{weakest}</span> ({weakestAcc}%)
                  </span>
                  <ChevronRight className="w-4 h-4 text-[#378ADD]" />
                </a>
              )
            }
          } catch {}
          return null
        })()}
      </div>

      {/* Action buttons — primary actions first */}
      <div className="w-full max-w-sm space-y-2.5 mb-3">
        {/* Challenge section — top priority */}
        {isCreatorChallenge && creatorChallengeCode ? (
          /* Creator just finished — share reminder */
          <div className="bg-[#0a2d4a] border border-[#378ADD]/40 rounded-xl p-3.5">
            <p className="text-white font-bold text-sm text-center mb-1">score locked in!</p>
            <p className="text-[#85B7EB]/60 text-xs text-center mb-3">share so your friend can try to beat you</p>
            <div className="flex items-center gap-2 bg-[#021f3d] rounded-lg px-3 py-2 mb-2.5">
              <span className="text-[#85B7EB] text-xs flex-1 truncate font-mono">{getChallengeUrl(creatorChallengeCode)}</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(getChallengeUrl(creatorChallengeCode))
                  setLinkCopied(true)
                  setTimeout(() => setLinkCopied(false), 2000)
                }}
                className="text-[#378ADD] flex-shrink-0"
              >
                {linkCopied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(getChallengeUrl(creatorChallengeCode))
                  setLinkCopied(true)
                  setTimeout(() => setLinkCopied(false), 2000)
                }}
                className="flex-1 bg-[#378ADD] text-white rounded-lg py-2.5 font-bold text-sm flex items-center justify-center gap-1.5 active:scale-[0.98]"
              >
                <Copy className="w-3.5 h-3.5" />
                {linkCopied ? "copied!" : "copy link"}
              </button>
              {typeof navigator !== "undefined" && navigator.share && (
                <button
                  onClick={() => {
                    navigator.share({
                      title: "Rally Challenge",
                      text: `I scored ${score}/5 in ${categoryName} on Rally! Think you can beat me?`,
                      url: getChallengeUrl(creatorChallengeCode),
                    }).catch(() => {})
                  }}
                  className="bg-[#378ADD]/20 text-[#378ADD] rounded-lg px-3.5 py-2.5 font-bold text-sm flex items-center justify-center gap-1.5 active:scale-[0.98]"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  share
                </button>
              )}
            </div>
          </div>
        ) : challengeCode ? (
          /* Challenger — see results */
          <a
            href={`/challenge/${challengeCode}`}
            className="w-full bg-[#378ADD] text-white rounded-xl py-3.5 px-5 flex items-center justify-center gap-2 font-extrabold text-base shadow-lg shadow-[#378ADD]/30 active:scale-[0.98]"
          >
            <Swords className="w-4 h-4" />
            see head-to-head results
          </a>
        ) : (
          /* Solo — challenge from home */
          <a
            href="/"
            className="w-full bg-[#378ADD] text-white rounded-xl py-3.5 px-5 flex items-center justify-center gap-2 font-extrabold text-base shadow-lg shadow-[#378ADD]/30 active:scale-[0.98]"
          >
            <Swords className="w-4 h-4" />
            challenge a friend
          </a>
        )}

        {/* Play again + category picker row */}
        <div className="flex gap-2">
          <button
            onClick={onPlayAgain}
            className="flex-1 bg-transparent border-2 border-[#378ADD] text-[#378ADD] rounded-xl py-3 flex items-center justify-center gap-1.5 font-bold text-sm active:scale-[0.98]"
          >
            <RotateCcw className="w-4 h-4" strokeWidth={2.5} />
            play again
          </button>
          <a
            href="/"
            className="flex-1 bg-[#0a2d4a] text-[#85B7EB] rounded-xl py-3 flex items-center justify-center gap-1.5 font-bold text-sm active:scale-[0.98]"
          >
            home
          </a>
        </div>
      </div>

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
                    {/* Your answer */}
                    {item.chosenAnswerIndex !== null ? (
                      <div className="flex items-center gap-2 bg-red-500/15 border border-red-500/30 rounded-xl px-3 py-2 mb-2">
                        <X className="w-4 h-4 text-red-400 flex-shrink-0" strokeWidth={3} />
                        <span className="text-red-400 text-sm font-semibold">
                          your answer: {String.fromCharCode(65 + item.chosenAnswerIndex)}) {options[item.chosenAnswerIndex]}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 bg-red-500/15 border border-red-500/30 rounded-xl px-3 py-2 mb-2">
                        <X className="w-4 h-4 text-red-400 flex-shrink-0" strokeWidth={3} />
                        <span className="text-red-400 text-sm font-semibold italic">time ran out — no answer given</span>
                      </div>
                    )}
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
                        {/* How to approach this type of problem */}
                        <div className="bg-[#378ADD]/10 border border-[#378ADD]/20 rounded-xl px-3 py-2.5">
                          <p className="text-xs font-bold text-[#378ADD] uppercase tracking-wide mb-1">{detailed.concept}</p>
                          <p className="text-[#85B7EB] text-sm leading-relaxed">{detailed.approach}</p>
                        </div>

                        {/* Common mistake */}
                        <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2.5">
                          <p className="text-xs font-bold text-red-400 uppercase tracking-wide mb-1">where students go wrong</p>
                          <p className="text-red-300/80 text-sm leading-relaxed">{detailed.commonMistake}</p>
                        </div>

                        {/* Takeaway */}
                        <div className="bg-[#EF9F27]/10 border border-[#EF9F27]/20 rounded-xl px-3 py-2.5">
                          <p className="text-xs font-bold text-[#EF9F27] uppercase tracking-wide mb-1">remember this</p>
                          <p className="text-[#EF9F27]/80 text-sm leading-relaxed">{detailed.takeaway}</p>
                        </div>

                        {/* Still don't get it? AI prompt copier */}
                        <button
                          onClick={() => {
                            const userAnswer = item.chosenAnswerIndex !== null
                              ? `${String.fromCharCode(65 + item.chosenAnswerIndex)}) ${options[item.chosenAnswerIndex]}`
                              : "I ran out of time"
                            const prompt = `I'm studying for the SAT and got this question wrong. Can you explain it step by step like I'm in high school?\n\nQuestion: ${q.question}\n\nA) ${q.option_a}\nB) ${q.option_b}\nC) ${q.option_c}\nD) ${q.option_d}\n\nCorrect answer: ${q.correct}) ${options[correctIdx]}\nMy answer: ${userAnswer}\n\nPlease explain:\n1. Why the correct answer is right\n2. Why my answer was wrong\n3. How to recognize this type of problem in the future`
                            navigator.clipboard.writeText(prompt)
                            setCopiedPromptIdx(idx)
                            setTimeout(() => setCopiedPromptIdx(null), 2000)
                          }}
                          className="w-full mt-2 bg-purple-500/15 border border-purple-500/30 rounded-xl px-3 py-2.5 flex items-center justify-center gap-2 transition-all hover:bg-purple-500/25 active:scale-[0.98]"
                        >
                          {copiedPromptIdx === idx ? (
                            <>
                              <Check className="w-4 h-4 text-green-400" strokeWidth={3} />
                              <span className="text-green-400 text-sm font-bold">copied! paste into ChatGPT or Claude</span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-4 h-4 text-purple-400" />
                              <span className="text-purple-400 text-sm font-bold">still don&apos;t get it? copy AI prompt</span>
                            </>
                          )}
                        </button>
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
