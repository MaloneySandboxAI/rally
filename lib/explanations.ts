import type { Question } from "@/lib/questions"

export function getDetailedExplanation(q: Question): {
  concept: string
  approach: string
  commonMistake: string
  takeaway: string
} {
  const questionLower = q.question.toLowerCase()

  let concept = "Problem Solving"
  let approach = "Break the problem into smaller pieces and work through each one. If you're stuck, try plugging in each answer choice to see which one satisfies the conditions."
  let commonMistake = "Rushing through without double-checking. On the SAT, many wrong answers are designed to be the result of common calculation errors — they're traps."
  let takeaway = "Always verify your answer by plugging it back into the original problem."

  if (q.category === "Algebra") {
    if (questionLower.includes("slope")) {
      concept = "Slope of a Line"
      approach = "Slope measures steepness — it's the ratio of vertical change to horizontal change between any two points. The formula is (y₂ – y₁) / (x₂ – x₁). The key is being consistent: always subtract the first point from the second in both numerator and denominator."
      commonMistake = "Mixing up the order of subtraction — putting x values on top instead of y values, or subtracting point 1 from point 2 on top but point 2 from point 1 on bottom."
      takeaway = "Slope = rise ÷ run = Δy ÷ Δx. Always do y on top, x on bottom, same subtraction order for both."
    } else if (questionLower.includes("root") || questionLower.includes("vieta") || (questionLower.includes("r") && questionLower.includes("s") && questionLower.includes("x²"))) {
      concept = "Vieta's Formulas (Roots & Coefficients)"
      approach = "For any quadratic x² – px + q = 0 with roots r and s: r + s = p and r × s = q. You can find expressions like r² + s² without solving individually: r² + s² = (r+s)² – 2rs."
      commonMistake = "Trying to solve for each root individually using the quadratic formula. Vieta's lets you work with sum and product directly."
      takeaway = "When a question gives you a quadratic and asks about its roots, use Vieta's: sum = –b/a, product = c/a."
    } else if (questionLower.includes("system") || (questionLower.includes("2x") && questionLower.includes("y ="))) {
      concept = "Systems of Equations"
      approach = "Substitution: solve one equation for a variable, plug it into the other. Elimination: add or subtract equations to cancel one variable."
      commonMistake = "Solving for x but forgetting the question asked for x + y. Always re-read what's being asked."
      takeaway = "After finding your variables, re-read the question. It might want a sum, difference, or product."
    } else if (questionLower.includes("percent") || questionLower.includes("%")) {
      concept = "Percent Change & Successive Percentages"
      approach = "Each percent change is a multiplier. 30% increase = ×1.30. 10% decrease = ×0.90. Multiply multipliers for successive changes: 1.30 × 0.90 = 1.17."
      commonMistake = "Thinking 30% up then 10% down = 20% up. It's 17% because the discount applies to the marked-up price."
      takeaway = "Successive % changes: convert each to a multiplier, multiply them all, subtract 1 to get net change."
    } else if (questionLower.includes("factor") || questionLower.includes("undefined") || questionLower.includes("denominator")) {
      concept = "Rational Expressions & Undefined Values"
      approach = "A fraction is undefined when its denominator equals zero. Factor the denominator completely, set each factor equal to zero, solve."
      commonMistake = "Only finding one factor of the denominator, or canceling before checking for undefined values."
      takeaway = "Undefined = denominator is zero. Always factor the denominator first, then set each factor = 0."
    } else if (questionLower.includes("f(") || questionLower.includes("function") || questionLower.includes("g(")) {
      concept = "Function Notation & Recursive Patterns"
      approach = "When given a rule like f(x+2) = f(x) + 4 and a starting value, build a chain step by step. Make a mini table."
      commonMistake = "Trying to skip steps. With recursive definitions, each value depends on the previous one."
      takeaway = "Recursive functions: make a table, go step by step. The pattern often becomes obvious after 2-3 steps."
    } else if (questionLower.includes("quadratic") || questionLower.includes("x²") || questionLower.includes("x^2")) {
      concept = "Quadratic Equations"
      approach = "Three ways: (1) Factoring (2) Completing the square (3) Quadratic formula. Check discriminant first: positive = 2 solutions, zero = 1, negative = none."
      commonMistake = "Sign errors in the quadratic formula, especially with the –b term."
      takeaway = "Try factoring first (fastest). If that fails, quadratic formula. Write each step carefully."
    } else if (questionLower.includes("inequalit")) {
      concept = "Inequalities"
      approach = "Solve like equations with one exception: multiply or divide by a negative number, flip the inequality sign."
      commonMistake = "Forgetting to flip when dividing by a negative. –2x > 6 becomes x < –3."
      takeaway = "Multiply or divide by a negative? Flip the sign. Always."
    } else if (questionLower.includes("exponent") || questionLower.includes("power")) {
      concept = "Exponent Rules"
      approach = "x^a × x^b = x^(a+b), x^a ÷ x^b = x^(a–b), (x^a)^b = x^(ab). Convert everything to the same base first."
      commonMistake = "Multiplying exponents when you should add them. x² × x³ = x⁵ (add), not x⁶."
      takeaway = "Same base, multiplying? Add exponents. Same base, power of a power? Multiply exponents."
    } else if (questionLower.includes("absolute")) {
      concept = "Absolute Value"
      approach = "|expression| = k splits into two cases: expression = k and expression = –k. For inequalities, |x| < k means –k < x < k."
      commonMistake = "Forgetting the negative case. |x – 3| = 5 has TWO solutions: x = 8 and x = –2."
      takeaway = "Absolute value = two cases. Always write both and solve each separately."
    } else {
      concept = "Algebraic Reasoning"
      approach = "Identify what's asked, work backwards. If stuck, try plugging in each answer choice."
      commonMistake = "Doing too many steps in your head. Write each step down."
      takeaway = "When stuck, try backsolving: plug each answer choice into the original problem."
    }
  }

  if (q.category === "Reading Comprehension") {
    if (questionLower.includes("main idea") || questionLower.includes("primarily") || questionLower.includes("central") || questionLower.includes("purpose")) {
      concept = "Main Idea & Author's Purpose"
      approach = "The main idea is what the entire passage is about. Ask: 'If I could summarize this whole passage in one sentence, what would it be?' The correct answer covers the full scope."
      commonMistake = "Picking a detail that appears in the passage but doesn't represent the overall argument."
      takeaway = "Could this answer be the title of the whole passage? If it only fits one paragraph, it's a detail."
    } else if (questionLower.includes("evidence") || questionLower.includes("support") || questionLower.includes("best describes") || questionLower.includes("according to")) {
      concept = "Evidence-Based Reasoning"
      approach = "Find answers directly supported by the text. Go back and find the specific sentence or phrase that proves your answer."
      commonMistake = "Choosing an answer that 'feels right' without verifying it against the passage."
      takeaway = "Point to the evidence. If you can't find the exact line, pick a different answer."
    } else if (questionLower.includes("infer") || questionLower.includes("imply") || questionLower.includes("suggest") || questionLower.includes("most likely")) {
      concept = "Inference & Implication"
      approach = "SAT inferences are small, logical steps from what's stated. If you have to make an assumption, it's probably wrong."
      commonMistake = "Over-thinking it. SAT inferences are conservative — big leaps or outside knowledge = trap."
      takeaway = "The best SAT inference is barely an inference at all. It should feel almost too obvious."
    } else if (questionLower.includes("tone") || questionLower.includes("attitude") || questionLower.includes("perspective")) {
      concept = "Tone & Author's Attitude"
      approach = "Look for word choice clues — adjectives, adverbs, and loaded words reveal the author's attitude."
      commonMistake = "Confusing the subject matter's tone with the author's attitude."
      takeaway = "Focus on HOW the author writes about the topic (word choice), not WHAT the topic is."
    } else {
      concept = "Active Reading Strategy"
      approach = "Read the question first, then return to the relevant section. Don't rely on memory."
      commonMistake = "Choosing the first answer that seems reasonable without checking the passage."
      takeaway = "The answer is always in the passage. Find it, underline it, then choose."
    }
  }

  if (q.category === "Grammar") {
    if (questionLower.includes("comma") || questionLower.includes("punctuat") || questionLower.includes("semicolon") || questionLower.includes("colon") || questionLower.includes("dash")) {
      concept = "Punctuation Rules"
      approach = "Commas separate items/set off non-essential info. Semicolons connect two complete sentences. Colons introduce lists after a complete sentence."
      commonMistake = "Adding commas wherever you'd naturally pause. Written grammar and spoken rhythm don't always match."
      takeaway = "Test commas by removing the phrase between them. Test semicolons by checking both sides are complete sentences."
    } else if (questionLower.includes("subject") || questionLower.includes("verb") || questionLower.includes("agree")) {
      concept = "Subject-Verb Agreement"
      approach = "Find the real subject by ignoring phrases between subject and verb. 'The box of chocolates IS' because subject is 'box.'"
      commonMistake = "Matching the verb to the nearest noun instead of the actual subject."
      takeaway = "Cross out everything between the subject and verb. Whatever's left tells you singular or plural."
    } else if (questionLower.includes("tense") || questionLower.includes("was") || questionLower.includes("were") || questionLower.includes("had") || questionLower.includes("will")) {
      concept = "Verb Tense Consistency"
      approach = "Verbs should stay in the same tense unless there's a clear reason to shift. Context clues tell you which tense is needed."
      commonMistake = "Mixing past and present tense in the same paragraph without noticing."
      takeaway = "Look at the verbs around the blank — they tell you which tense the answer should be in."
    } else if (questionLower.includes("pronoun") || questionLower.includes("which") || questionLower.includes("who") || questionLower.includes("whom")) {
      concept = "Pronoun Usage"
      approach = "Every pronoun must clearly refer to one specific noun. 'Who' for subjects, 'whom' for objects. 'Which' for things, 'who' for people."
      commonMistake = "Using 'they' or 'it' when it's unclear what the pronoun refers to."
      takeaway = "For every pronoun, ask: 'What specific noun does this replace?'"
    } else if (questionLower.includes("concise") || questionLower.includes("wordy") || questionLower.includes("redundan")) {
      concept = "Concision & Eliminating Wordiness"
      approach = "SAT favors clear, direct writing. If two choices say the same thing, pick the shorter one."
      commonMistake = "Thinking longer answers sound smarter. On the SAT, brevity wins."
      takeaway = "Can you say the same thing in fewer words? If yes, do it."
    } else if (questionLower.includes("transition") || questionLower.includes("however") || questionLower.includes("therefore") || questionLower.includes("moreover")) {
      concept = "Transition Words"
      approach = "Transitions show relationships: 'however' = contrast, 'therefore' = cause-effect, 'moreover' = adding on. Read before and after the blank."
      commonMistake = "Picking a transition that sounds good without checking the logical relationship."
      takeaway = "Identify the relationship first (contrast? addition? cause?), then pick the transition."
    } else {
      concept = "Grammar & Standard English"
      approach = "Read the entire sentence with each choice plugged in. Pick the shorter, simpler option that's grammatically correct."
      commonMistake = "Picking the most formal option. The SAT values clarity over fancy phrasing."
      takeaway = "Read the full sentence with your choice. Does it flow naturally and say what it means clearly?"
    }
  }

  if (q.category === "Data & Statistics") {
    if (questionLower.includes("mean") || questionLower.includes("average") || questionLower.includes("median") || questionLower.includes("mode")) {
      concept = "Measures of Center"
      approach = "Mean = sum ÷ count. Median = middle value when sorted. Mean gets pulled by outliers, median doesn't."
      commonMistake = "Calculating the mean when asked for the median, or vice versa. With even counts, average the two middle numbers."
      takeaway = "Outliers pull the mean but not the median. Check which measure the question asks for."
    } else if (questionLower.includes("probability") || questionLower.includes("likely") || questionLower.includes("chance") || questionLower.includes("random")) {
      concept = "Probability"
      approach = "P = (outcomes you want) ÷ (total possible). 'Or' = add. 'And' = multiply. 'Given that' = narrow the total."
      commonMistake = "Using the wrong total in conditional probability."
      takeaway = "Always identify numerator (what I want) and denominator (what's possible)."
    } else if (questionLower.includes("scatter") || questionLower.includes("best fit") || questionLower.includes("correlation") || questionLower.includes("trend")) {
      concept = "Scatterplots & Correlation"
      approach = "Line of best fit shows the trend. Slope = rate of change per unit of x. Positive = both increase. Negative = inverse."
      commonMistake = "Confusing correlation with causation. Also: misreading the axis scale."
      takeaway = "Read both axis labels first. Slope = rate of change. Correlation ≠ causation."
    } else if (questionLower.includes("table") || questionLower.includes("two-way") || questionLower.includes("row") || questionLower.includes("column")) {
      concept = "Two-Way Tables"
      approach = "Identify the right cell for the numerator, and the right total for the denominator. The question wording tells you which total."
      commonMistake = "Using the grand total when the question specifies a condition ('of those who...')."
      takeaway = "'Of those who...' = use that group's total. 'Overall' = use grand total."
    } else if (questionLower.includes("sample") || questionLower.includes("survey") || questionLower.includes("bias") || questionLower.includes("margin")) {
      concept = "Sampling & Statistical Inference"
      approach = "Conclusions only apply to the population that was sampled. Random sampling = generalizable. Convenience sampling = biased."
      commonMistake = "Assuming a study applies to everyone when it only sampled a specific group."
      takeaway = "Who was sampled? That's who the results apply to."
    } else {
      concept = "Data Analysis"
      approach = "Read every label: axis titles, column headers, units. Identify what the numbers represent before calculating."
      commonMistake = "Jumping into calculation without checking what the numbers represent."
      takeaway = "Read every label before calculating."
    }
  }

  return { concept, approach, commonMistake, takeaway }
}
