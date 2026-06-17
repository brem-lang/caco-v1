import { z } from "zod"

export const categorySchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().max(500).optional(),
  image_url: z.string().url().optional().or(z.literal("")),
  is_active: z.boolean(),
  sort_order: z.number().int(),
})

export const productVariantSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, "Variant name is required").max(50),
  price_modifier: z.number(),
  is_available: z.boolean(),
})

export const productSchema = z.object({
  category_id: z.string().uuid().nullable().optional(),
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().max(500).optional(),
  image_url: z.string().url().optional().or(z.literal("")),
  base_price: z.number().min(0, "Price must be 0 or more"),
  is_available: z.boolean(),
  variants: z.array(productVariantSchema),
})

export type CategoryFormValues = z.infer<typeof categorySchema>
export type ProductFormValues = z.infer<typeof productSchema>
export type ProductVariantFormValues = z.infer<typeof productVariantSchema>
