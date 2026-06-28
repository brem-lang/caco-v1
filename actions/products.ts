"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import type { CategoryFormValues, ProductFormValues } from "@/lib/validations/product"
import { categorySchema, productSchema } from "@/lib/validations/product"

export const createCategory = async (values: CategoryFormValues) => {
  const parsed = categorySchema.safeParse(values)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  try {
    const supabase = await createClient()
    const { error } = await supabase.from("categories").insert({
      name: parsed.data.name,
      description: parsed.data.description ?? null,
      image_url: parsed.data.image_url || null,
      is_active: parsed.data.is_active,
      sort_order: parsed.data.sort_order,
    })
    if (error) return { error: error.message }
    revalidatePath("/menu")
    revalidatePath("/categories")
    return { success: true }
  } catch {
    return { error: "Failed to create category" }
  }
}

export const updateCategory = async (id: string, values: CategoryFormValues) => {
  const parsed = categorySchema.safeParse(values)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  try {
    const supabase = await createClient()
    const { error } = await supabase.from("categories").update({
      name: parsed.data.name,
      description: parsed.data.description ?? null,
      image_url: parsed.data.image_url || null,
      is_active: parsed.data.is_active,
      sort_order: parsed.data.sort_order,
    }).eq("id", id)
    if (error) return { error: error.message }
    revalidatePath("/menu")
    revalidatePath("/categories")
    return { success: true }
  } catch {
    return { error: "Failed to update category" }
  }
}

export const deleteCategory = async (id: string) => {
  try {
    const supabase = await createClient()
    const { error } = await supabase.from("categories").delete().eq("id", id)
    if (error) return { error: error.message }
    revalidatePath("/menu")
    revalidatePath("/categories")
    return { success: true }
  } catch {
    return { error: "Failed to delete category" }
  }
}

export const createProduct = async (values: ProductFormValues) => {
  const parsed = productSchema.safeParse(values)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  try {
    const supabase = await createClient()
    const { data: product, error } = await supabase
      .from("products")
      .insert({
        category_id: parsed.data.category_id ?? null,
        name: parsed.data.name,
        description: parsed.data.description ?? null,
        image_url: parsed.data.image_url || null,
        base_price: parsed.data.base_price,
        is_available: parsed.data.is_available,
      })
      .select("id")
      .single()

    if (error || !product) return { error: error?.message ?? "Failed to create product" }

    if (parsed.data.variants.length > 0) {
      const { error: variantError } = await supabase.from("product_variants").insert(
        parsed.data.variants.map((v) => ({
          product_id: product.id,
          name: v.name,
          price_modifier: v.price_modifier,
          is_available: v.is_available,
        }))
      )
      if (variantError) return { error: variantError.message }
    }

    revalidatePath("/menu")
    revalidatePath("/pos")
    return { success: true, productId: product.id }
  } catch {
    return { error: "Failed to create product" }
  }
}

export const updateProduct = async (id: string, values: ProductFormValues) => {
  const parsed = productSchema.safeParse(values)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  try {
    const supabase = await createClient()
    const { error } = await supabase.from("products").update({
      category_id: parsed.data.category_id ?? null,
      name: parsed.data.name,
      description: parsed.data.description ?? null,
      image_url: parsed.data.image_url || null,
      base_price: parsed.data.base_price,
      is_available: parsed.data.is_available,
    }).eq("id", id)

    if (error) return { error: error.message }

    await supabase.from("product_variants").delete().eq("product_id", id)

    if (parsed.data.variants.length > 0) {
      const { error: variantError } = await supabase.from("product_variants").insert(
        parsed.data.variants.map((v) => ({
          product_id: id,
          name: v.name,
          price_modifier: v.price_modifier,
          is_available: v.is_available,
        }))
      )
      if (variantError) return { error: variantError.message }
    }

    revalidatePath("/menu")
    revalidatePath("/pos")
    return { success: true }
  } catch {
    return { error: "Failed to update product" }
  }
}

export const deleteProduct = async (id: string) => {
  try {
    const supabase = await createClient()
    const { error } = await supabase.from("products").delete().eq("id", id)
    if (error) return { error: error.message }
    revalidatePath("/menu")
    revalidatePath("/pos")
    return { success: true }
  } catch {
    return { error: "Failed to delete product" }
  }
}

export const addIngredient = async (
  productId: string,
  inventoryItemId: string,
  quantityUsed: number
) => {
  if (!productId || !inventoryItemId) return { error: "Missing required fields" }
  if (quantityUsed <= 0) return { error: "Quantity must be greater than 0" }

  try {
    const supabase = await createClient()
    const { error } = await supabase.from("product_ingredients").insert({
      product_id: productId,
      inventory_item_id: inventoryItemId,
      quantity_used: quantityUsed,
    })
    if (error) return { error: error.message }
    revalidatePath(`/menu/${productId}`)
    return { success: true }
  } catch {
    return { error: "Failed to add ingredient" }
  }
}

export const updateIngredient = async (ingredientId: string, quantityUsed: number, productId: string) => {
  if (quantityUsed <= 0) return { error: "Quantity must be greater than 0" }

  try {
    const supabase = await createClient()
    const { error } = await supabase
      .from("product_ingredients")
      .update({ quantity_used: quantityUsed })
      .eq("id", ingredientId)
    if (error) return { error: error.message }
    revalidatePath(`/menu/${productId}`)
    return { success: true }
  } catch {
    return { error: "Failed to update ingredient" }
  }
}

export const removeIngredient = async (ingredientId: string, productId: string) => {
  try {
    const supabase = await createClient()
    const { error } = await supabase.from("product_ingredients").delete().eq("id", ingredientId)
    if (error) return { error: error.message }
    revalidatePath(`/menu/${productId}`)
    return { success: true }
  } catch {
    return { error: "Failed to remove ingredient" }
  }
}

export const toggleProductAvailability = async (id: string, isAvailable: boolean) => {
  try {
    const supabase = await createClient()
    const { error } = await supabase
      .from("products")
      .update({ is_available: isAvailable })
      .eq("id", id)
    if (error) return { error: error.message }
    revalidatePath("/menu")
    revalidatePath("/pos")
    return { success: true }
  } catch {
    return { error: "Failed to update product availability" }
  }
}
