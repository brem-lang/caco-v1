import { z } from "zod"

export const orderItemSchema = z.object({
  product_id: z.string().uuid(),
  variant_id: z.string().uuid().nullable().optional(),
  product_name: z.string(),
  variant_name: z.string().nullable().optional(),
  unit_price: z.number().min(0),
  quantity: z.number().int().min(1),
  subtotal: z.number().min(0),
})

export const createOrderSchema = z.object({
  cashier_id: z.string().uuid(),
  customer_name: z.string().max(100).optional(),
  payment_method: z.enum(["cash", "card", "gcash", "maya"]),
  subtotal: z.number().min(0),
  discount: z.number().min(0).default(0),
  total: z.number().min(0),
  notes: z.string().optional(),
  items: z.array(orderItemSchema).min(1, "Order must have at least one item"),
})

export const updateOrderStatusSchema = z.object({
  status: z.enum(["pending", "preparing", "ready", "completed", "cancelled"]),
})

export type CreateOrderValues = z.infer<typeof createOrderSchema>
export type UpdateOrderStatusValues = z.infer<typeof updateOrderStatusSchema>
