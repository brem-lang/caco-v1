import { createClient } from "@supabase/supabase-js"
import * as dotenv from "dotenv"

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
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

const users = [
  { email: "admin@example.com", password: "Password123!", role: "admin" },
  { email: "user@example.com", password: "Password123!", role: "user" },
]

const seed = async () => {
  console.log("Seeding database...\n")

  for (const user of users) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: user.email,
      password: user.password,
      email_confirm: true,
      user_metadata: { role: user.role },
    })

    if (error) {
      const msg = error.message || JSON.stringify(error)
      const alreadyExists = msg.toLowerCase().includes("already")
      console.log(
        alreadyExists
          ? `  skip  ${user.email} (already exists)`
          : `  fail  ${user.email}: [${error.status}] ${msg}`
      )
      if (!alreadyExists) console.dir(error, { depth: null })
    } else {
      console.log(`  ok    ${user.email} (id: ${data.user.id})`)
    }
  }

  console.log("\nDone.")
}

seed().catch((err) => {
  console.error(err)
  process.exit(1)
})
