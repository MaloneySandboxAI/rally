export interface Category {
  id: string
  name: string
  color: string
  isMath: boolean
}

export const ALL_CATEGORIES: Category[] = [
  { id: "Algebra", name: "Algebra", color: "#378ADD", isMath: true },
  { id: "Reading Comprehension", name: "Reading", color: "#14B8A6", isMath: false },
  { id: "Grammar", name: "Grammar", color: "#A855F7", isMath: false },
  { id: "Data & Statistics", name: "Data & Stats", color: "#F97316", isMath: true },
  { id: "AP Biology", name: "AP Bio", color: "#22C55E", isMath: false },
  { id: "AP Pre Calculus", name: "AP Pre Calc", color: "#EC4899", isMath: true },
  { id: "AP US History", name: "APUSH", color: "#F59E0B", isMath: false },
  { id: "AP English Language", name: "AP English", color: "#6366F1", isMath: false },
]

export const SAT_CATEGORIES = ALL_CATEGORIES.filter(c => !c.id.startsWith("AP"))
export const AP_CATEGORIES = ALL_CATEGORIES.filter(c => c.id.startsWith("AP"))

export const SAT_CATEGORY_IDS = SAT_CATEGORIES.map(c => c.id)
export const AP_CATEGORY_IDS = AP_CATEGORIES.map(c => c.id)

export const CATEGORY_COLORS: Record<string, string> = Object.fromEntries(
  ALL_CATEGORIES.map(c => [c.id, c.color])
)

export const CATEGORY_SHORT: Record<string, string> = Object.fromEntries(
  ALL_CATEGORIES.map(c => [c.id, c.name])
)
