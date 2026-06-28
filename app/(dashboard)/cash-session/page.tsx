import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { OpenSessionForm } from "@/components/cash-session/open-session-form"
import { CloseSessionForm } from "@/components/cash-session/close-session-form"
import { SessionSummary } from "@/components/cash-session/session-summary"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"

export default async function CashSessionPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: session } = await supabase
    .from("cash_sessions")
    .select("*")
    .eq("status", "open")
    .maybeSingle()

  let paymentTotals = { cash: 0, card: 0, gcash: 0, maya: 0, total: 0 }

  if (session) {
    const { data: orders } = await supabase
      .from("orders")
      .select("payment_method, total")
      .eq("status", "completed")
      .gte("created_at", session.opened_at)

    if (orders) {
      for (const order of orders) {
        const method = order.payment_method as keyof typeof paymentTotals
        if (method in paymentTotals) {
          paymentTotals[method] += order.total ?? 0
        }
        paymentTotals.total += order.total ?? 0
      }
    }
  }

  const expectedCash = session
    ? session.opening_amount + paymentTotals.cash
    : 0

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage>Cash Session</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      <div className="p-4 sm:p-6 lg:p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight">Cash Session</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {session ? "Session is open — POS terminal is active." : "No active session — open one to enable the POS."}
          </p>
        </div>

        {session ? (
          <div className="grid gap-6 lg:grid-cols-2 max-w-3xl">
            <SessionSummary session={session} paymentTotals={paymentTotals} />
            <CloseSessionForm
              sessionId={session.id}
              userId={user.id}
              expectedCash={expectedCash}
            />
          </div>
        ) : (
          <OpenSessionForm userId={user.id} />
        )}
      </div>
    </>
  )
}
