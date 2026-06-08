#!/usr/bin/env npx tsx
/**
 * Batch-remediate SAT question answer choices using Claude.
 *
 * Rewrites distractors so each maps to a named student misconception,
 * populates explanations, and flags off-spec items for human review.
 *
 * Usage:
 *   npx tsx scripts/remediate-answers.ts                          # dry-run
 *   npx tsx scripts/remediate-answers.ts --apply                  # write to DB
 *   npx tsx scripts/remediate-answers.ts --category "Algebra"     # filter
 *   npx tsx scripts/remediate-answers.ts --limit 20               # cap count
 *   npx tsx scripts/remediate-answers.ts --resume                 # skip already-processed
 *
 * Env vars (from .env.local or exported):
 *   ANTHROPIC_API_KEY           — Claude API key
 *   NEXT_PUBLIC_SUPABASE_URL    — Supabase project URL
 *   SUPABASE_SERVICE_ROLE_KEY   — Supabase service role key (bypasses RLS)
 */

import { createClient } from "@supabase/supabase-js"
import * as fs from "fs"
import * as path from "path"

// ---------------------------------------------------------------------------
// Env loading
// ---------------------------------------------------------------------------

function loadEnvFile(filepath: string) {
  if (!fs.existsSync(filepath)) return
  for (const line of fs.readFileSync(filepath, "utf-8").split("\n")) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#")) continue
    const eq = trimmed.indexOf("=")
    if (eq === -1) continue
    const key = trimmed.slice(0, eq).trim()
    const val = trimmed.slice(eq + 1).trim()
    if (!process.env[key]) process.env[key] = val
  }
}

const ROOT = path.resolve(import.meta.dirname ?? __dirname, "..")
loadEnvFile(path.join(ROOT, ".env.local"))
loadEnvFile(path.join(ROOT, ".env"))

// ---------------------------------------------------------------------------
// CLI args
// ---------------------------------------------------------------------------

const args = process.argv.slice(2)
const APPLY = args.includes("--apply")
const RESUME = args.includes("--resume")
const categoryIdx = args.indexOf("--category")
const CATEGORY_FILTER = categoryIdx !== -1 ? args[categoryIdx + 1] : null
const limitIdx = args.indexOf("--limit")
const LIMIT = limitIdx !== -1 ? parseInt(args[limitIdx + 1], 10) : null

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!ANTHROPIC_API_KEY) {
  console.error("Missing ANTHROPIC_API_KEY — set it in .env.local or export it")
  process.exit(1)
}
if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY")
  process.exit(1)
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const BATCH_SIZE = 5
const BATCH_DELAY_MS = 1000
const MAX_RETRIES = 3
const MODEL = "claude-sonnet-4-20250514"
const OUTPUT_DIR = path.join(ROOT, "scripts", "output")

const SYSTEM_PROMPT = `You are an expert SAT math item writer reviewing draft questions for the Rally practice tool. For each question, KEEP the stem and the correct answer unchanged, and REWRITE the three wrong answer choices so they match how the real Digital SAT is written.

Rules for distractors:
1. Every distractor must be the result of a SPECIFIC, REALISTIC student error — never a random number. Name the misconception for each. Common sources: sign error; forgetting to divide/multiply by the coefficient; reciprocal / inverted operation; off-by-one or dropped term; solving for the wrong quantity (found x but question asked for 2x or x²); common arithmetic slip.
2. All four choices must be plausible and similar in form, magnitude, units, and formatting (same decimal places, sign conventions).
3. Exactly ONE choice is correct; no ambiguous or second-correct answers.
4. Don't let the correct answer stand out (not the only positive, only fraction, longest option, or a fixed letter position). Shuffle its position.
5. Order choices logically (ascending numeric) when natural.

SAT fidelity check (flag, don't silently fix): if the stem tests something off-spec — e.g. an explicit inverse function f⁻¹(x), or anything outside Algebra / Advanced Math / Problem-Solving & Data Analysis / Geometry & Trig — set needs_review=true with a reason. Still rewrite the distractors.

Also produce a 1–3 sentence explanation of how to reach the correct answer.

Output ONLY valid JSON (no markdown fences, no extra text):
{ "stem": "<unchanged>", "topic": "<category>", "difficulty": "<difficulty>", "choices": ["A) …", "B) …", "C) …", "D) …"], "correct": "<letter>", "explanation": "<1-3 sentences>", "distractor_rationale": { "<letter>": "<misconception>" }, "needs_review": <bool>, "review_note": "" }`

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Question {
  id: number
  category: string
  difficulty: string
  subtopic?: string
  question: string
  option_a: string
  option_b: string
  option_c: string
  option_d: string
  correct: string
  explanation: string
}

interface RemediatedOutput {
  stem: string
  topic: string
  difficulty: string
  choices: string[]
  correct: string
  explanation: string
  distractor_rationale: Record<string, string>
  needs_review: boolean
  review_note: string
}

interface DiffEntry {
  id: number
  category: string
  difficulty: string
  subtopic?: string
  stem: string
  before: { option_a: string; option_b: string; option_c: string; option_d: string; correct: string; explanation: string }
  after: { option_a: string; option_b: string; option_c: string; option_d: string; correct: string; explanation: string }
  distractor_rationale: Record<string, string>
  needs_review: boolean
  review_note: string
}

// ---------------------------------------------------------------------------
// Supabase
// ---------------------------------------------------------------------------

const supabase = createClient(SUPABASE_URL!, SUPABASE_KEY!)

async function fetchQuestions(): Promise<Question[]> {
  let query = supabase.from("sat_questions").select("*").order("id")

  if (CATEGORY_FILTER) {
    query = query.eq("category", CATEGORY_FILTER)
  }
  if (LIMIT) {
    query = query.limit(LIMIT)
  }

  const { data, error } = await query
  if (error) {
    console.error("Failed to fetch questions:", error.message)
    process.exit(1)
  }
  return (data ?? []) as Question[]
}

async function updateQuestion(id: number, updates: {
  option_a: string
  option_b: string
  option_c: string
  option_d: string
  correct: string
  explanation: string
}): Promise<boolean> {
  const { error } = await supabase
    .from("sat_questions")
    .update(updates)
    .eq("id", id)

  if (error) {
    console.error(`  ✗ Failed to update question ${id}:`, error.message)
    return false
  }
  return true
}

// ---------------------------------------------------------------------------
// Claude API
// ---------------------------------------------------------------------------

function formatUserMessage(q: Question): string {
  return JSON.stringify({
    id: q.id,
    stem: q.question,
    category: q.category,
    difficulty: q.difficulty,
    choices: [
      `A) ${q.option_a}`,
      `B) ${q.option_b}`,
      `C) ${q.option_c}`,
      `D) ${q.option_d}`,
    ],
    correct: q.correct,
    existing_explanation: q.explanation || "(none)",
  })
}

async function callClaude(question: Question, attempt = 0): Promise<RemediatedOutput | null> {
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY!,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: formatUserMessage(question) }],
      }),
    })

    if (res.status === 429 || res.status >= 500) {
      if (attempt < MAX_RETRIES) {
        const wait = Math.pow(2, attempt + 1) * 1000
        console.log(`  ⏳ Rate limited / server error (${res.status}), retrying in ${wait / 1000}s...`)
        await sleep(wait)
        return callClaude(question, attempt + 1)
      }
      console.error(`  ✗ API error ${res.status} after ${MAX_RETRIES} retries for question ${question.id}`)
      return null
    }

    if (!res.ok) {
      const body = await res.text()
      console.error(`  ✗ API error ${res.status} for question ${question.id}: ${body.slice(0, 200)}`)
      return null
    }

    const data = await res.json()
    const textBlock = data.content?.find((b: any) => b.type === "text")
    if (!textBlock?.text) {
      console.error(`  ✗ No text in response for question ${question.id}`)
      return null
    }

    let jsonStr = textBlock.text.trim()
    const fenceMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/)
    if (fenceMatch) jsonStr = fenceMatch[1].trim()

    return JSON.parse(jsonStr) as RemediatedOutput
  } catch (err: any) {
    if (attempt < MAX_RETRIES) {
      const wait = Math.pow(2, attempt + 1) * 1000
      console.log(`  ⏳ Error "${err.message}", retrying in ${wait / 1000}s...`)
      await sleep(wait)
      return callClaude(question, attempt + 1)
    }
    console.error(`  ✗ Failed after retries for question ${question.id}:`, err.message)
    return null
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function parseChoice(choice: string): string {
  return choice.replace(/^[A-D]\)\s*/, "")
}

function extractUpdates(output: RemediatedOutput) {
  if (output.choices.length !== 4) return null
  return {
    option_a: parseChoice(output.choices[0]),
    option_b: parseChoice(output.choices[1]),
    option_c: parseChoice(output.choices[2]),
    option_d: parseChoice(output.choices[3]),
    correct: output.correct.toUpperCase(),
    explanation: output.explanation,
  }
}

function loadProcessedIds(): Set<number> {
  const progressFile = path.join(OUTPUT_DIR, "progress.json")
  if (!fs.existsSync(progressFile)) return new Set()
  try {
    const ids = JSON.parse(fs.readFileSync(progressFile, "utf-8"))
    return new Set(ids as number[])
  } catch {
    return new Set()
  }
}

function saveProcessedIds(ids: Set<number>) {
  fs.writeFileSync(
    path.join(OUTPUT_DIR, "progress.json"),
    JSON.stringify([...ids], null, 2)
  )
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log("=== Rally Answer-Choice Remediation ===")
  console.log(`Mode: ${APPLY ? "APPLY (writing to DB)" : "DRY-RUN (diff only)"}`)
  if (CATEGORY_FILTER) console.log(`Category filter: ${CATEGORY_FILTER}`)
  if (LIMIT) console.log(`Limit: ${LIMIT}`)
  console.log()

  fs.mkdirSync(OUTPUT_DIR, { recursive: true })

  const questions = await fetchQuestions()
  console.log(`Fetched ${questions.length} questions from sat_questions`)

  const processedIds = RESUME ? loadProcessedIds() : new Set<number>()
  const toProcess = questions.filter(q => !processedIds.has(q.id))

  if (RESUME && processedIds.size > 0) {
    console.log(`Resuming — skipping ${processedIds.size} already-processed questions`)
  }
  console.log(`Processing ${toProcess.length} questions in batches of ${BATCH_SIZE}\n`)

  const diffs: DiffEntry[] = []
  const reviewQueue: any[] = []
  let successCount = 0
  let errorCount = 0

  for (let i = 0; i < toProcess.length; i += BATCH_SIZE) {
    const batch = toProcess.slice(i, i + BATCH_SIZE)
    const batchNum = Math.floor(i / BATCH_SIZE) + 1
    const totalBatches = Math.ceil(toProcess.length / BATCH_SIZE)
    console.log(`--- Batch ${batchNum}/${totalBatches} (questions ${i + 1}–${i + batch.length}) ---`)

    const results = await Promise.all(
      batch.map(async (q) => {
        process.stdout.write(`  [${q.id}] ${q.category}/${q.difficulty}: "${q.question.slice(0, 60)}…" `)
        const output = await callClaude(q)
        if (!output) {
          console.log("— SKIPPED (API error)")
          errorCount++
          return null
        }

        const updates = extractUpdates(output)
        if (!updates) {
          console.log("— SKIPPED (bad choices format)")
          errorCount++
          return null
        }

        const diff: DiffEntry = {
          id: q.id,
          category: q.category,
          difficulty: q.difficulty,
          subtopic: q.subtopic,
          stem: q.question,
          before: {
            option_a: q.option_a,
            option_b: q.option_b,
            option_c: q.option_c,
            option_d: q.option_d,
            correct: q.correct,
            explanation: q.explanation || "",
          },
          after: updates,
          distractor_rationale: output.distractor_rationale,
          needs_review: output.needs_review,
          review_note: output.review_note || "",
        }

        diffs.push(diff)

        if (output.needs_review) {
          reviewQueue.push({
            id: q.id,
            category: q.category,
            difficulty: q.difficulty,
            stem: q.question,
            review_note: output.review_note,
            choices_after: output.choices,
            correct_after: output.correct,
          })
          console.log("— OK (⚠ needs_review)")
        } else {
          console.log("— OK")
        }

        if (APPLY) {
          const ok = await updateQuestion(q.id, updates)
          if (!ok) {
            errorCount++
            return null
          }
        }

        processedIds.add(q.id)
        successCount++
        return diff
      })
    )

    saveProcessedIds(processedIds)

    if (i + BATCH_SIZE < toProcess.length) {
      await sleep(BATCH_DELAY_MS)
    }
  }

  // Write outputs
  const diffFile = path.join(OUTPUT_DIR, "remediation-diff.json")
  fs.writeFileSync(diffFile, JSON.stringify(diffs, null, 2))
  console.log(`\nDiff written to ${diffFile}`)

  if (reviewQueue.length > 0) {
    const reviewFile = path.join(OUTPUT_DIR, "review-queue.json")
    fs.writeFileSync(reviewFile, JSON.stringify(reviewQueue, null, 2))
    console.log(`Review queue (${reviewQueue.length} items) written to ${reviewFile}`)
  }

  console.log(`\n=== Done ===`)
  console.log(`Processed: ${successCount}  Errors: ${errorCount}  Review: ${reviewQueue.length}`)
  if (!APPLY) {
    console.log(`\nThis was a DRY RUN. To apply changes to the database, re-run with --apply`)
  }
}

main().catch((err) => {
  console.error("Fatal error:", err)
  process.exit(1)
})
