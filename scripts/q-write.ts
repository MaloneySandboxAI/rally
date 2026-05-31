#!/usr/bin/env tsx
import { createClient } from "@supabase/supabase-js"
import * as fs from "fs"
import * as dotenv from "dotenv"
dotenv.config({ path: ".env.local" })
dotenv.config()
const path = process.argv[2]
if (!path) { console.error("usage: tsx scripts/q-write.ts <json-file>"); process.exit(1) }
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } })
const items = JSON.parse(fs.readFileSync(path, "utf-8")) as Array<{ id: number; improvement_v2: any }>
console.log(`Writing ${items.length} improvements...`)
let ok = 0, fail = 0
for (const item of items) {
  const v2 = { ...item.improvement_v2, generated_at: item.improvement_v2.generated_at ?? new Date().toISOString(), model: item.improvement_v2.model ?? "claude-via-conductor" }
  const { error } = await supabase.from("sat_questions").update({ improvement_v2: v2 }).eq("id", item.id)
  if (error) { console.error(`  id=${item.id} ${error.message}`); fail++ } else { ok++ }
}
console.log(`${ok} written, ${fail} failed.`)
console.log(`${items.filter(i => i.improvement_v2.needs_review).length} flagged for review.`)
