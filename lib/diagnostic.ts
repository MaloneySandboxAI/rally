"use client"

// Diagnostic test: 1 question per subtopic to identify weak areas

export const SUBTOPIC_MAP: Record<string, { id: string; label: string }[]> = {
  "Algebra": [
    { id: "linear-equations", label: "Linear Equations" },
    { id: "systems-of-equations", label: "Systems of Equations" },
    { id: "quadratics", label: "Quadratics" },
    { id: "functions", label: "Functions" },
    { id: "inequalities", label: "Inequalities" },
  ],
  "Reading Comprehension": [
    { id: "main-idea", label: "Main Idea" },
    { id: "evidence-based", label: "Evidence-Based" },
    { id: "vocabulary-in-context", label: "Vocabulary in Context" },
    { id: "inference", label: "Inference" },
  ],
  "Grammar": [
    { id: "sentence-structure", label: "Sentence Structure" },
    { id: "punctuation", label: "Punctuation" },
    { id: "subject-verb-agreement", label: "Subject-Verb Agreement" },
    { id: "pronoun-clarity", label: "Pronoun Clarity" },
    { id: "transitions", label: "Transitions" },
  ],
  "Data & Statistics": [
    { id: "tables-and-graphs", label: "Tables & Graphs" },
    { id: "probability", label: "Probability" },
    { id: "mean-median-mode", label: "Mean, Median & Mode" },
    { id: "scatterplots", label: "Scatterplots" },
  ],
  "AP Biology": [
    { id: "cell-structure", label: "Cell Structure & Function" },
    { id: "genetics", label: "Genetics & Heredity" },
    { id: "evolution", label: "Evolution & Natural Selection" },
    { id: "ecology", label: "Ecology & Ecosystems" },
    { id: "molecular-biology", label: "Molecular Biology" },
    { id: "energy-metabolism", label: "Energy & Metabolism" },
    { id: "animal-physiology", label: "Animal Physiology" },
    { id: "diversity-of-life", label: "Diversity of Life" },
  ],
  "AP Pre Calculus": [
    { id: "polynomial-rational", label: "Polynomial & Rational Functions" },
    { id: "exponential-logarithmic", label: "Exponential & Logarithmic Functions" },
    { id: "trigonometric", label: "Trigonometric Functions" },
    { id: "polar-parametric", label: "Polar & Parametric Functions" },
  ],
  "AP US History": [
    { id: "colonial-founding", label: "Colonial Era & Founding" },
    { id: "civil-war-reconstruction", label: "Civil War & Reconstruction" },
    { id: "industrialization-progressive", label: "Industrialization & Progressive Era" },
    { id: "modern-america", label: "Modern America (1945–Present)" },
  ],
  "AP English Language": [
    { id: "rhetorical-analysis", label: "Rhetorical Analysis" },
    { id: "argument-evidence", label: "Argument & Evidence" },
    { id: "synthesis", label: "Synthesis" },
    { id: "style-tone", label: "Style & Tone" },
  ],
}

export const ALL_SUBTOPICS = Object.entries(SUBTOPIC_MAP).flatMap(
  ([category, subtopics]) => subtopics.map(s => ({ category, ...s }))
)

export const CATEGORY_COLORS: Record<string, string> = {
  "Algebra": "#378ADD",
  "Reading Comprehension": "#14B8A6",
  "Grammar": "#A855F7",
  "Data & Statistics": "#F97316",
  "AP Biology": "#22C55E",
  "AP Pre Calculus": "#EC4899",
  "AP US History": "#F59E0B",
  "AP English Language": "#6366F1",
}

export const CATEGORY_SHORT: Record<string, string> = {
  "Algebra": "Algebra",
  "Reading Comprehension": "Reading",
  "Grammar": "Grammar",
  "Data & Statistics": "Data & Stats",
  "AP Biology": "AP Bio",
  "AP Pre Calculus": "AP Pre Calc",
  "AP US History": "APUSH",
  "AP English Language": "AP English",
}

export interface DiagnosticAnswer {
  category: string
  subtopic: string
  questionId: number
  isCorrect: boolean
}

export interface DiagnosticResult {
  date: string
  answers: DiagnosticAnswer[]
}

const DIAGNOSTIC_KEY = "rally_diagnostic"

export function saveDiagnosticResult(result: DiagnosticResult): void {
  if (typeof window === "undefined") return
  localStorage.setItem(DIAGNOSTIC_KEY, JSON.stringify(result))
}

export function loadDiagnosticResult(): DiagnosticResult | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(DIAGNOSTIC_KEY)
    if (!raw) return null
    return JSON.parse(raw) as DiagnosticResult
  } catch {
    return null
  }
}

export interface SubtopicScore {
  category: string
  subtopic: string
  label: string
  isCorrect: boolean
}

export function scoreDiagnostic(answers: DiagnosticAnswer[]): {
  total: number
  correct: number
  byCategory: Record<string, { correct: number; total: number }>
  subtopicScores: SubtopicScore[]
  weakSubtopics: SubtopicScore[]
} {
  const byCategory: Record<string, { correct: number; total: number }> = {}
  const subtopicScores: SubtopicScore[] = []

  for (const a of answers) {
    if (!byCategory[a.category]) byCategory[a.category] = { correct: 0, total: 0 }
    byCategory[a.category].total += 1
    if (a.isCorrect) byCategory[a.category].correct += 1

    const subtopicInfo = SUBTOPIC_MAP[a.category]?.find(s => s.id === a.subtopic)
    subtopicScores.push({
      category: a.category,
      subtopic: a.subtopic,
      label: subtopicInfo?.label || a.subtopic,
      isCorrect: a.isCorrect,
    })
  }

  const correct = answers.filter(a => a.isCorrect).length
  const weakSubtopics = subtopicScores.filter(s => !s.isCorrect)

  return {
    total: answers.length,
    correct,
    byCategory,
    subtopicScores,
    weakSubtopics,
  }
}
