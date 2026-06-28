"use client"

import { useCartStore } from "@/stores/cart-store"
import type { CartItem } from "@/types/pos"

export const useCart = () => {
  const store = useCartStore()
  return {
    items: store.items,
    discount: store.discount,
    subtotal: store.subtotal(),
    total: store.total(),
    addItem: store.addItem,
    removeItem: store.removeItem,
    updateQty: store.updateQty,
    setDiscount: store.setDiscount,
    clearCart: store.clearCart,
    isEmpty: store.items.length === 0,
    itemCount: store.items.reduce((sum: number, i: CartItem) => sum + i.quantity, 0),
  }
}
