"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { createOrder } from "@/actions/orders"
import { useCart } from "@/hooks/use-cart"
import { formatCurrency } from "@/lib/utils"
import type { PaymentMethod, ReceiptData } from "@/types/pos"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: "cash", label: "Cash" },
  { value: "card", label: "Card" },
  { value: "gcash", label: "GCash" },
  { value: "maya", label: "Maya" },
]

type Props = {
  open: boolean
  onClose: () => void
  cashierId: string
  cashierName: string
  onSuccess: (receipt: ReceiptData) => void
}

export const PaymentModal = ({ open, onClose, cashierId, cashierName, onSuccess }: Props) => {
  const [method, setMethod] = useState<PaymentMethod>("cash")
  const [tendered, setTendered] = useState("")
  const [customerName, setCustomerName] = useState("")
  const [isPending, startTransition] = useTransition()
  const { items, subtotal, total, discount, clearCart } = useCart()

  const tenderedAmount = parseFloat(tendered) || 0
  const change = method === "cash" ? Math.max(0, tenderedAmount - total) : 0
  const canProcess = method !== "cash" || tenderedAmount >= total

  const handleConfirm = () => {
    startTransition(async () => {
      const result = await createOrder({
        cashier_id: cashierId,
        customer_name: customerName.trim() || undefined,
        payment_method: method,
        subtotal,
        discount,
        total,
        items: items.map((item) => ({
          product_id: item.productId,
          variant_id: item.variantId,
          product_name: item.productName,
          variant_name: item.variantName,
          unit_price: item.unitPrice,
          quantity: item.quantity,
          subtotal: item.unitPrice * item.quantity,
        })),
      })

      if (result.error) {
        toast.error(result.error)
        return
      }

      const receipt: ReceiptData = {
        orderNumber: result.orderNumber!,
        customerName: customerName.trim() || undefined,
        items: [...items],
        subtotal,
        discount,
        total,
        payment: { method, amountTendered: tenderedAmount, change },
        cashierName,
        createdAt: new Date().toISOString(),
      }

      clearCart()
      setTendered("")
      setCustomerName("")
      setMethod("cash")
      onSuccess(receipt)
    })
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Payment</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="text-center">
            <p className="text-3xl font-bold">{formatCurrency(total)}</p>
            <p className="text-sm text-muted-foreground">{items.length} item{items.length !== 1 ? "s" : ""}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="customer-name">Customer Name <span className="text-muted-foreground">(optional)</span></Label>
            <Input
              id="customer-name"
              placeholder="e.g. Juan dela Cruz"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Payment Method</Label>
            <div className="grid grid-cols-4 gap-2">
              {PAYMENT_METHODS.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => setMethod(value)}
                  className={cn(
                    "rounded-md border py-2 text-sm font-medium transition-colors",
                    method === value
                      ? "bg-primary text-primary-foreground border-primary"
                      : "hover:bg-accent"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {method === "cash" && (
            <div className="space-y-2">
              <Label>Amount Tendered (₱)</Label>
              <Input
                type="number"
                min={total}
                step="0.01"
                placeholder={formatCurrency(total)}
                value={tendered}
                onChange={(e) => setTendered(e.target.value)}
              />
              {tenderedAmount >= total && tenderedAmount > 0 && (
                <p className="text-sm font-medium text-green-600">
                  Change: {formatCurrency(change)}
                </p>
              )}
            </div>
          )}

          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={onClose} disabled={isPending}>
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={handleConfirm}
              disabled={!canProcess || isPending}
            >
              {isPending ? "Processing..." : "Confirm Payment"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
