"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { closeCashSession } from "@/actions/orders"
import { formatCurrency } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

type Props = {
  sessionId: string
  userId: string
  expectedCash: number
}

export const CloseSessionForm = ({ sessionId, userId, expectedCash }: Props) => {
  const [amount, setAmount] = useState("")
  const [notes, setNotes] = useState("")
  const [isPending, startTransition] = useTransition()

  const closingAmount = parseFloat(amount) || 0
  const difference = closingAmount - expectedCash
  const isOver = difference > 0
  const isShort = difference < 0

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const value = parseFloat(amount)
    if (isNaN(value) || value < 0) {
      toast.error("Please enter a valid closing amount")
      return
    }

    startTransition(async () => {
      const result = await closeCashSession(sessionId, value, userId, notes || undefined)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success("Cash session closed successfully")
      }
    })
  }

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Close Cash Session</CardTitle>
        <CardDescription>Count your cash and enter the total on hand.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Expected Cash on Hand</Label>
            <p className="text-lg font-semibold">{formatCurrency(expectedCash)}</p>
            <p className="text-xs text-muted-foreground">Opening amount + all cash sales</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="closing-amount">Actual Cash on Hand (₱)</Label>
            <Input
              id="closing-amount"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          {amount && (
            <div className={cn(
              "rounded-md p-3 text-sm",
              isOver && "bg-green-50 text-green-800 dark:bg-green-950 dark:text-green-200",
              isShort && "bg-red-50 text-red-800 dark:bg-red-950 dark:text-red-200",
              !isOver && !isShort && "bg-muted text-muted-foreground"
            )}>
              {isOver && `Over by ${formatCurrency(Math.abs(difference))}`}
              {isShort && `Short by ${formatCurrency(Math.abs(difference))}`}
              {!isOver && !isShort && "Balanced — exact amount"}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              placeholder="Any discrepancy notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>

          <Button type="submit" variant="destructive" className="w-full" disabled={isPending}>
            {isPending ? "Closing..." : "Close Session"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
