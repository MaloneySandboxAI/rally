#!/usr/bin/env tsx
import { createClient } from "@supabase/supabase-js"
import * as dotenv from "dotenv"
dotenv.config({ path: ".env.local" })
dotenv.config()
const args = process.argv.slice(2)
const arg = (n: string, d?: string) => { const i = args.findIndex(a => a === n); return i === -1 ? d : args[i + 1] ?? d }
const BATCH = parseInt(arg("--batch", "50")!, 10)
const CATEGORY = arg("--category")
const MATH = ["Algebra", "Data & Stats", "AP Pre Calc"]
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } })
const { data, error } = await supabase.from("sat_questions")
  .select("id, category, difficulty, subtopic, question, option_a, option_b, option_c, option_d, correct, explanation")
  .in("category", CATEGORY ? [CATEGORY] : MATH)
  .is("improvement_v2", null)
  .order("id").limit(BATCH)
if (error) { console.error(error.message); process.exit(1) }
process.stdout.write(JSON.stringify(data ?? [], null, 2))
