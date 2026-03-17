import algebraQuestions from './questions-algebra.json'
import readingQuestions from './questions-reading.json'
import grammarQuestions from './questions-grammar.json'
import dataStatsQuestions from './questions-data-stats.json'

export interface Question {
  id: number
  category: string
  difficulty: string
  question: string
  options: string[]
  correct: string
  explanation: string
}

// Combine all 400 questions (100 per category)
export const ALL_QUESTIONS: Question[] = [
  ...algebraQuestions,
  ...readingQuestions,
  ...grammarQuestions,
  ...dataStatsQuestions,
] as Question[]

// Log the question bank size for verification
console.log("[v0] Question bank size:", ALL_QUESTIONS.length)
console.log("[v0] Algebra count:", ALL_QUESTIONS.filter(q => q.category === "Algebra").length)
console.log("[v0] Reading count:", ALL_QUESTIONS.filter(q => q.category === "Reading Comprehension").length)
console.log("[v0] Grammar count:", ALL_QUESTIONS.filter(q => q.category === "Grammar").length)
console.log("[v0] Data & Stats count:", ALL_QUESTIONS.filter(q => q.category === "Data & Statistics").length)
