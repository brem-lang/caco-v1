export type CartItem = {
  productId: string
  variantId: string | null
  productName: string
  variantName: string | null
  unitPrice: number
  quantity: number
}

export type PaymentMethod = "cash" | "card" | "gcash" | "maya"

export type PaymentInfo = {
  method: PaymentMethod
  amountTendered?: number
  change?: number
}

export type ReceiptData = {
  orderNumber: number
  items: CartItem[]
  subtotal: number
  tax: number
  discount: number
  total: number
  payment: PaymentInfo
  cashierName: string
  createdAt: string
}
