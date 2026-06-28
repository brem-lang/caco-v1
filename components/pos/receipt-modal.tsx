"use client"

import { formatCurrency, formatDate } from "@/lib/utils"
import type { ReceiptData } from "@/types/pos"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { PrinterIcon, CheckCircle2Icon } from "lucide-react"

export const ReceiptModal = ({
  receipt,
  onClose,
}: {
  receipt: ReceiptData | null
  onClose: () => void
}) => {
  if (!receipt) return null

  return (
    <Dialog open={!!receipt} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-green-600">
            <CheckCircle2Icon className="h-5 w-5" />
            Order Completed
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 font-mono text-sm">
          <div className="text-center">
            <p className="font-bold text-base">Coffee Shop POS</p>
            <p className="text-muted-foreground text-xs">Order #{receipt.orderNumber}</p>
            <p className="text-muted-foreground text-xs">{formatDate(receipt.createdAt)}</p>
            {receipt.customerName && (
              <p className="text-muted-foreground text-xs">Customer: {receipt.customerName}</p>
            )}
            <p className="text-muted-foreground text-xs">Cashier: {receipt.cashierName}</p>
          </div>

          <Separator />

          <div className="space-y-1">
            {receipt.items.map((item, i) => (
              <div key={i} className="flex justify-between gap-2">
                <span className="truncate">
                  {item.productName}
                  {item.variantName && ` (${item.variantName})`}
                  {" "}x{item.quantity}
                </span>
                <span className="shrink-0">{formatCurrency(item.unitPrice * item.quantity)}</span>
              </div>
            ))}
          </div>

          <Separator />

          <div className="space-y-1">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span>{formatCurrency(receipt.subtotal)}</span>
            </div>
            {receipt.discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount</span>
                <span>-{formatCurrency(receipt.discount)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold">
              <span>TOTAL</span>
              <span>{formatCurrency(receipt.total)}</span>
            </div>
          </div>

          {receipt.payment.method === "cash" && (
            <>
              <Separator />
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>Cash Tendered</span>
                  <span>{formatCurrency(receipt.payment.amountTendered ?? 0)}</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>Change</span>
                  <span>{formatCurrency(receipt.payment.change ?? 0)}</span>
                </div>
              </div>
            </>
          )}

          <div className="text-center text-xs text-muted-foreground pt-1">
            Payment: {receipt.payment.method.toUpperCase()}
          </div>
        </div>

        <div className="flex gap-2 mt-2">
          <Button variant="outline" className="flex-1" onClick={() => window.print()}>
            <PrinterIcon className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button className="flex-1" onClick={onClose}>
            New Order
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
