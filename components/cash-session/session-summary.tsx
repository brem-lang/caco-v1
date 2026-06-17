import type { Database } from "@/types/supabase"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ClockIcon } from "lucide-react"

type PaymentTotals = {
  cash: number
  card: number
  gcash: number
  maya: number
  total: number
}

type Session = Database["public"]["Tables"]["cash_sessions"]["Row"]

export const SessionSummary = ({
  session,
  paymentTotals,
}: {
  session: Session
  paymentTotals: PaymentTotals
}) => {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Current Session</CardTitle>
            <Badge variant="default" className="bg-green-600">Open</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <ClockIcon className="h-4 w-4" />
            <span>Opened {formatDate(session.opened_at)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Opening Amount</span>
            <span className="font-medium">{formatCurrency(session.opening_amount)}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Sales This Session</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Cash</span>
            <span>{formatCurrency(paymentTotals.cash)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Card</span>
            <span>{formatCurrency(paymentTotals.card)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">GCash</span>
            <span>{formatCurrency(paymentTotals.gcash)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Maya</span>
            <span>{formatCurrency(paymentTotals.maya)}</span>
          </div>
          <div className="flex justify-between border-t pt-2 font-medium">
            <span>Total Sales</span>
            <span>{formatCurrency(paymentTotals.total)}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
