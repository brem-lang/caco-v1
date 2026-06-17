import { z } from "zod"

export const inventoryItemSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  unit: z.string().min(1, "Unit is required").max(20),
  current_stock: z.number().min(0),
  minimum_stock: z.number().min(0),
  cost_per_unit: z.number().min(0).nullable().optional(),
  supplier: z.string().max(100).optional(),
})

export const restockSchema = z.object({
  quantity: z.number().positive("Quantity must be greater than 0"),
  cost_per_unit: z.number().min(0).optional(),
  notes: z.string().max(500).optional(),
})

export const adjustStockSchema = z.object({
  quantity_change: z.number().refine((v) => v !== 0, "Change must not be zero"),
  type: z.enum(["adjustment", "waste"]),
  notes: z.string().max(500).optional(),
})

export const cashSessionSchema = z.object({
  opening_amount: z.number().min(0, "Opening amount must be 0 or more"),
  notes: z.string().max(500).optional(),
})

export const closeCashSessionSchema = z.object({
  closing_amount: z.number().min(0, "Closing amount must be 0 or more"),
  notes: z.string().max(500).optional(),
})

export type InventoryItemFormValues = z.infer<typeof inventoryItemSchema>
export type RestockFormValues = z.infer<typeof restockSchema>
export type AdjustStockFormValues = z.infer<typeof adjustStockSchema>
export type CashSessionFormValues = z.infer<typeof cashSessionSchema>
export type CloseCashSessionFormValues = z.infer<typeof closeCashSessionSchema>
