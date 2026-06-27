import { createClient } from "@supabase/supabase-js"
import * as dotenv from "dotenv"
import * as readline from "readline"

dotenv.config({ path: ".env.local" })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local"
  )
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const confirm = (question: string): Promise<boolean> => {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close()
      resolve(answer.trim().toLowerCase() === "yes")
    })
  })
}

const deleteTable = async (table: string) => {
  const { error, count } = await supabase
    .from(table)
    .delete({ count: "exact" })
    .neq("id", "00000000-0000-0000-0000-000000000000") // match all rows

  if (error) {
    console.error(`  fail  ${table}: ${error.message}`)
    process.exit(1)
  }
  console.log(`  ok    ${table} — ${count ?? 0} row(s) deleted`)
}

const resetData = async () => {
  console.log("╔══════════════════════════════════════════════╗")
  console.log("║              ⚠  WARNING ⚠                   ║")
  console.log("╠══════════════════════════════════════════════╣")
  console.log("║  This will permanently delete ALL data in:  ║")
  console.log("║    • inventory_logs                          ║")
  console.log("║    • order_items                             ║")
  console.log("║    • orders                                  ║")
  console.log("║    • cash_sessions                           ║")
  console.log("║    • product_ingredients                     ║")
  console.log("║    • product_variants                        ║")
  console.log("║    • products                                ║")
  console.log("║    • categories                              ║")
  console.log("║                                              ║")
  console.log("║  inventory_items will NOT be deleted.        ║")
  console.log("╚══════════════════════════════════════════════╝")
  console.log()

  const ok = await confirm('Type "yes" to confirm and proceed: ')

  if (!ok) {
    console.log("\nAborted. No data was deleted.")
    process.exit(0)
  }

  console.log("\nDeleting data...\n")

  // Order matters: delete dependents before parents
  await deleteTable("inventory_logs")
  await deleteTable("order_items")
  await deleteTable("orders")
  await deleteTable("cash_sessions")
  await deleteTable("product_ingredients")
  await deleteTable("product_variants")
  await deleteTable("products")
  await deleteTable("categories")

  console.log("\nDone. All data cleared.")
}

resetData().catch((err) => {
  console.error(err)
  process.exit(1)
})
