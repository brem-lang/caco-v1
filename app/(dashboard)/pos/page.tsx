import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { PosTerminal } from "@/components/pos/pos-terminal"

export default async function PosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: session } = await supabase
    .from("cash_sessions")
    .select("id")
    .eq("status", "open")
    .maybeSingle()

  if (!session) redirect("/cash-session")

  const [{ data: products }, { data: categories }, { data: profile }] = await Promise.all([
    supabase
      .from("products")
      .select("*, variants:product_variants(*), categories(*)")
      .eq("is_available", true)
      .order("name"),
    supabase.from("categories").select("*").eq("is_active", true).order("sort_order"),
    supabase.from("profiles").select("full_name").eq("id", user.id).single(),
  ])

  const cashierName = profile?.full_name ?? user.email?.split("@")[0] ?? "Staff"

  return (
    <PosTerminal
      products={(products ?? []) as Parameters<typeof PosTerminal>[0]["products"]}
      categories={categories ?? []}
      cashierId={user.id}
      cashierName={cashierName}
    />
  )
}
