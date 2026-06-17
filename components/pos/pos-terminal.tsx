"use client"

import { useState } from "react"
import { ProductGrid } from "@/components/pos/product-grid"
import { CartPanel } from "@/components/pos/cart-panel"
import { PaymentModal } from "@/components/pos/payment-modal"
import { ReceiptModal } from "@/components/pos/receipt-modal"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { ShoppingCartIcon } from "lucide-react"
import { useCart } from "@/hooks/use-cart"
import { formatCurrency } from "@/lib/utils"
import type { ReceiptData } from "@/types/pos"
import type { Database } from "@/types/supabase"

type Product = Database["public"]["Tables"]["products"]["Row"] & {
  variants: Database["public"]["Tables"]["product_variants"]["Row"][]
  categories: Database["public"]["Tables"]["categories"]["Row"] | null
}
type Category = Database["public"]["Tables"]["categories"]["Row"]

type Props = {
  products: Product[]
  categories: Category[]
  cashierId: string
  cashierName: string
}

export const PosTerminal = ({ products, categories, cashierId, cashierName }: Props) => {
  const [paymentOpen, setPaymentOpen] = useState(false)
  const [receipt, setReceipt] = useState<ReceiptData | null>(null)
  const [cartOpen, setCartOpen] = useState(false)
  const { itemCount, total } = useCart()

  const handleSuccess = (receiptData: ReceiptData) => {
    setPaymentOpen(false)
    setCartOpen(false)
    setReceipt(receiptData)
  }

  return (
    <div className="flex h-svh flex-col">
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
        <span className="font-semibold">POS Terminal</span>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-hidden">
          <ProductGrid products={products} categories={categories} />
        </div>
        {/* Desktop cart — hidden on mobile */}
        <div className="hidden lg:block w-72 shrink-0">
          <CartPanel onCheckout={() => setPaymentOpen(true)} />
        </div>
      </div>

      {/* Mobile cart button */}
      <div className="lg:hidden border-t p-3 shrink-0">
        <Button
          className="w-full gap-2"
          onClick={() => setCartOpen(true)}
        >
          <ShoppingCartIcon className="h-4 w-4" />
          <span>View Cart</span>
          {itemCount > 0 && (
            <span className="bg-primary-foreground text-primary rounded-full px-2 py-0.5 text-xs font-bold leading-none">
              {itemCount}
            </span>
          )}
          {total > 0 && (
            <span className="ml-auto font-semibold">{formatCurrency(total)}</span>
          )}
        </Button>
      </div>

      {/* Mobile cart sheet */}
      <Sheet open={cartOpen} onOpenChange={setCartOpen}>
        <SheetContent side="bottom" className="h-[85dvh] p-0 flex flex-col">
          <SheetHeader className="px-4 py-3 border-b shrink-0">
            <SheetTitle className="flex items-center gap-2">
              <ShoppingCartIcon className="h-4 w-4" />
              Cart
            </SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-hidden">
            <CartPanel
              onCheckout={() => { setCartOpen(false); setPaymentOpen(true) }}
              hideHeader
              className="border-l-0"
            />
          </div>
        </SheetContent>
      </Sheet>

      <PaymentModal
        open={paymentOpen}
        onClose={() => setPaymentOpen(false)}
        cashierId={cashierId}
        cashierName={cashierName}
        onSuccess={handleSuccess}
      />

      <ReceiptModal receipt={receipt} onClose={() => setReceipt(null)} />
    </div>
  )
}
