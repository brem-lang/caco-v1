"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { openCashSession } from "@/actions/orders"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { WalletIcon } from "lucide-react"

export const OpenSessionForm = ({ userId }: { userId: string }) => {
  const [amount, setAmount] = useState("")
  const [isPending, startTransition] = useTransition()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const value = parseFloat(amount)
    if (isNaN(value) || value < 0) {
      toast.error("Please enter a valid opening amount")
      return
    }

    startTransition(async () => {
      const result = await openCashSession(value, userId)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success("Cash session opened successfully")
      }
    })
  }

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <WalletIcon className="h-6 w-6 text-primary" />
        </div>
        <CardTitle>Open Cash Session</CardTitle>
        <CardDescription>
          Enter the opening cash amount to start the session and enable the POS terminal.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="opening-amount">Opening Cash Amount (₱)</Label>
            <Input
              id="opening-amount"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Opening..." : "Open Session"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
