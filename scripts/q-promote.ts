#!/usr/bin/env tsx
import { createClient } from "@supabase/supabase-js"
import * as dotenv from "dotenv"
dotenv.config({ path: ".env.local" })
dotenv.config()
const args = process.argv.slice(2)
const arg = (n: string) => { const i = args.findIndex(a => a === n); return i === -1 ? undefined : args[i + 1] }
const CATEGORY = arg("--category")
const DRY = args.includes("--dry-run")
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } })
let q = supabase.from("sat_questions").select("id, improvement_v2").not("improvement_v2", "is", null).filter("improvement_v2->>needs_review", "eq", "false")
if (CATEGORY) q = q.eq("category", CATEGORY)
const { data: rows, error } = await q
if (error) { console.error(error.message); process.exit(1) }
if (!rows || rows.length === 0) { console.log("No promotable rows."); process.exit(0) }
console.log(`Will promote ${rows.length}${CATEGORY ? ` in "${CATEGORY}"` : ""}.${DRY ? " (DRY)" : ""}`)
if (DRY) process.exit(0)
let n = 0
for (const r of rows) {
  const v2 = r.improvement_v2 as any
  const { error: upErr } = await supabase.from("sat_questions").update({ option_a: v2.option_a, option_b: v2.option_b, option_c: v2.option_c, option_d: v2.option_d, correct: v2.correct, explanation: v2.explanation }).eq("id", r.id)
  if (upErr) console.error(`  id=${r.id} ${upErr.message}`); else n++
}
console.log(`Promoted ${n}/${rows.length}.`)
