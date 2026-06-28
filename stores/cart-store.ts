"use client"

import { create } from "zustand"
import type { CartItem } from "@/types/pos"

type CartStore = {
  items: CartItem[]
  discount: number
  addItem: (item: CartItem) => void
  removeItem: (productId: string, variantId: string | null) => void
  updateQty: (productId: string, variantId: string | null, quantity: number) => void
  setDiscount: (amount: number) => void
  clearCart: () => void
  subtotal: () => number
  total: () => number
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  discount: 0,

  addItem: (newItem) => {
    set((state) => {
      const existing = state.items.find(
        (i) => i.productId === newItem.productId && i.variantId === newItem.variantId
      )
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.productId === newItem.productId && i.variantId === newItem.variantId
              ? { ...i, quantity: i.quantity + 1 }
              : i
          ),
        }
      }
      return { items: [...state.items, { ...newItem, quantity: 1 }] }
    })
  },

  removeItem: (productId, variantId) => {
    set((state) => ({
      items: state.items.filter(
        (i) => !(i.productId === productId && i.variantId === variantId)
      ),
    }))
  },

  updateQty: (productId, variantId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(productId, variantId)
      return
    }
    set((state) => ({
      items: state.items.map((i) =>
        i.productId === productId && i.variantId === variantId
          ? { ...i, quantity }
          : i
      ),
    }))
  },

  setDiscount: (amount) => set({ discount: amount }),

  clearCart: () => set({ items: [], discount: 0 }),

  subtotal: () => {
    const items = get().items
    return items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0)
  },

  total: () => {
    const subtotal = get().subtotal()
    const discount = get().discount
    return Math.max(0, subtotal - discount)
  },
}))
