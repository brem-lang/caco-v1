"use client"

import { useCart } from "@/hooks/use-cart"
import { formatCurrency } from "@/lib/utils"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { MinusIcon, PlusIcon, Trash2Icon, ShoppingCartIcon } from "lucide-react"

interface CartPanelProps {
  onCheckout: () => void
  className?: string
  hideHeader?: boolean
}

export const CartPanel = ({ onCheckout, className, hideHeader }: CartPanelProps) => {
  const { items, discount, subtotal, total, removeItem, updateQty, setDiscount, isEmpty } = useCart()

  return (
    <div className={cn("flex flex-col h-full border-l", className)}>
      {!hideHeader && (
        <div className="px-4 py-3 border-b">
          <h2 className="font-semibold flex items-center gap-2">
            <ShoppingCartIcon className="h-4 w-4" />
            Cart
          </h2>
        </div>
      )}

      {isEmpty ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-muted-foreground">Cart is empty</p>
        </div>
      ) : (
        <>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {items.map((item) => (
              <div key={`${item.productId}-${item.variantId}`} className="flex items-center gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{item.productName}</p>
                  {item.variantName && (
                    <p className="text-xs text-muted-foreground">{item.variantName}</p>
                  )}
                  <p className="text-xs font-semibold">{formatCurrency(item.unitPrice)}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    size="icon"
                    variant="outline"
                    className="h-6 w-6"
                    onClick={() => updateQty(item.productId, item.variantId, item.quantity - 1)}
                  >
                    <MinusIcon className="h-3 w-3" />
                  </Button>
                  <span className="w-6 text-center text-sm">{item.quantity}</span>
                  <Button
                    size="icon"
                    variant="outline"
                    className="h-6 w-6"
                    onClick={() => updateQty(item.productId, item.variantId, item.quantity + 1)}
                  >
                    <PlusIcon className="h-3 w-3" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6 text-destructive"
                    onClick={() => removeItem(item.productId, item.variantId)}
                  >
                    <Trash2Icon className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t p-3 space-y-3">
            <div className="space-y-1">
              <Label className="text-xs">Discount (₱)</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                className="h-8 text-sm"
                value={discount || ""}
                onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                placeholder="0.00"
              />
            </div>

            <Separator />

            <div className="space-y-1 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-muted-foreground">
                  <span>Discount</span>
                  <span className="text-green-600">-{formatCurrency(discount)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-base">
                <span>Total</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>

            <Button className="w-full" onClick={onCheckout}>
              Charge {formatCurrency(total)}
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
