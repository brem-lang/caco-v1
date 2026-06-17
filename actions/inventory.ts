"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import {
  inventoryItemSchema,
  restockSchema,
  adjustStockSchema,
  type InventoryItemFormValues,
  type RestockFormValues,
  type AdjustStockFormValues,
} from "@/lib/validations/inventory"

export const createInventoryItem = async (values: InventoryItemFormValues) => {
  const parsed = inventoryItemSchema.safeParse(values)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  try {
    const supabase = await createClient()
    const { error } = await supabase.from("inventory_items").insert({
      name: parsed.data.name,
      unit: parsed.data.unit,
      current_stock: parsed.data.current_stock,
      minimum_stock: parsed.data.minimum_stock,
      cost_per_unit: parsed.data.cost_per_unit ?? null,
      supplier: parsed.data.supplier ?? null,
    })
    if (error) return { error: error.message }
    revalidatePath("/inventory")
    return { success: true }
  } catch {
    return { error: "Failed to create inventory item" }
  }
}

export const updateInventoryItem = async (id: string, values: InventoryItemFormValues) => {
  const parsed = inventoryItemSchema.safeParse(values)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  try {
    const supabase = await createClient()
    const { error } = await supabase.from("inventory_items").update({
      name: parsed.data.name,
      unit: parsed.data.unit,
      minimum_stock: parsed.data.minimum_stock,
      cost_per_unit: parsed.data.cost_per_unit ?? null,
      supplier: parsed.data.supplier ?? null,
    }).eq("id", id)
    if (error) return { error: error.message }
    revalidatePath("/inventory")
    return { success: true }
  } catch {
    return { error: "Failed to update inventory item" }
  }
}

export const restockItem = async (id: string, values: RestockFormValues) => {
  const parsed = restockSchema.safeParse(values)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "Not authenticated" }

    const { data: item, error: fetchError } = await supabase
      .from("inventory_items")
      .select("current_stock")
      .eq("id", id)
      .single()
    if (fetchError || !item) return { error: "Item not found" }

    const newStock = item.current_stock + parsed.data.quantity
    const { error: updateError } = await supabase
      .from("inventory_items")
      .update({
        current_stock: newStock,
        last_restocked_at: new Date().toISOString(),
        ...(parsed.data.cost_per_unit !== undefined ? { cost_per_unit: parsed.data.cost_per_unit } : {}),
      })
      .eq("id", id)
    if (updateError) return { error: updateError.message }

    await supabase.from("inventory_logs").insert({
      inventory_item_id: id,
      type: "restock",
      quantity_change: parsed.data.quantity,
      notes: parsed.data.notes ?? null,
      created_by: user.id,
    })

    revalidatePath("/inventory")
    return { success: true }
  } catch {
    return { error: "Failed to restock item" }
  }
}

export const adjustStock = async (id: string, values: AdjustStockFormValues) => {
  const parsed = adjustStockSchema.safeParse(values)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "Not authenticated" }

    const { data: item, error: fetchError } = await supabase
      .from("inventory_items")
      .select("current_stock")
      .eq("id", id)
      .single()
    if (fetchError || !item) return { error: "Item not found" }

    const newStock = Math.max(0, item.current_stock + parsed.data.quantity_change)

    const { error: updateError } = await supabase
      .from("inventory_items")
      .update({ current_stock: newStock })
      .eq("id", id)
    if (updateError) return { error: updateError.message }

    await supabase.from("inventory_logs").insert({
      inventory_item_id: id,
      type: parsed.data.type,
      quantity_change: parsed.data.quantity_change,
      notes: parsed.data.notes ?? null,
      created_by: user.id,
    })

    revalidatePath("/inventory")
    return { success: true }
  } catch {
    return { error: "Failed to adjust stock" }
  }
}

export const deleteInventoryItem = async (id: string) => {
  try {
    const supabase = await createClient()
    const { error } = await supabase.from("inventory_items").delete().eq("id", id)
    if (error) return { error: error.message }
    revalidatePath("/inventory")
    return { success: true }
  } catch {
    return { error: "Failed to delete inventory item" }
  }
}
