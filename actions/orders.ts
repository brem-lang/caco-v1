"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import {
  createOrderSchema,
  updateOrderStatusSchema,
  type CreateOrderValues,
  type UpdateOrderStatusValues,
} from "@/lib/validations/order"

export const createOrder = async (values: CreateOrderValues) => {
  const parsed = createOrderSchema.safeParse(values)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  try {
    const supabase = await createClient()

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        cashier_id: parsed.data.cashier_id,
        customer_name: parsed.data.customer_name ?? null,
        status: "pending",
        payment_method: parsed.data.payment_method,
        subtotal: parsed.data.subtotal,
        tax: 0,
        discount: parsed.data.discount,
        total: parsed.data.total,
        notes: parsed.data.notes ?? null,
      })
      .select("id, order_number")
      .single()

    if (orderError || !order) return { error: orderError?.message ?? "Failed to create order" }

    const { error: itemsError } = await supabase.from("order_items").insert(
      parsed.data.items.map((item) => ({
        order_id: order.id,
        product_id: item.product_id,
        variant_id: item.variant_id ?? null,
        product_name: item.product_name,
        variant_name: item.variant_name ?? null,
        unit_price: item.unit_price,
        quantity: item.quantity,
        subtotal: item.subtotal,
      }))
    )

    if (itemsError) return { error: itemsError.message }

    await deductInventory(supabase, parsed.data.items)

    revalidatePath("/orders")
    revalidatePath("/inventory")
    revalidatePath("/")
    return { success: true, orderId: order.id, orderNumber: order.order_number }
  } catch {
    return { error: "Failed to create order" }
  }
}

async function deductInventory(
  supabase: Awaited<ReturnType<typeof import("@/lib/supabase/server").createClient>>,
  items: CreateOrderValues["items"]
) {
  const { data: { user } } = await supabase.auth.getUser()

  for (const item of items) {
    const { data: ingredients } = await supabase
      .from("product_ingredients")
      .select("inventory_item_id, quantity_used")
      .eq("product_id", item.product_id)

    if (!ingredients?.length) continue

    for (const ingredient of ingredients) {
      const totalUsed = ingredient.quantity_used * item.quantity

      const { data: inv } = await supabase
        .from("inventory_items")
        .select("current_stock")
        .eq("id", ingredient.inventory_item_id)
        .single()

      if (!inv) continue

      const newStock = Math.max(0, inv.current_stock - totalUsed)

      await supabase
        .from("inventory_items")
        .update({ current_stock: newStock })
        .eq("id", ingredient.inventory_item_id)

      await supabase.from("inventory_logs").insert({
        inventory_item_id: ingredient.inventory_item_id,
        type: "usage",
        quantity_change: -totalUsed,
        notes: `Used in order`,
        created_by: user?.id ?? null,
      })
    }
  }
}

export const deleteOrder = async (id: string) => {
  try {
    const supabase = await createClient()
    const { error } = await supabase.from("orders").delete().eq("id", id)
    if (error) return { error: error.message }
    revalidatePath("/orders")
    revalidatePath("/")
    return { success: true }
  } catch {
    return { error: "Failed to delete order" }
  }
}

export const voidOrder = async (id: string) => {
  try {
    const supabase = await createClient()
    const { error } = await supabase
      .from("orders")
      .update({ status: "cancelled" })
      .eq("id", id)
    if (error) return { error: error.message }
    revalidatePath("/orders")
    revalidatePath(`/orders/${id}`)
    revalidatePath("/")
    return { success: true }
  } catch {
    return { error: "Failed to void order" }
  }
}

export const updateOrderStatus = async (id: string, values: UpdateOrderStatusValues) => {
  const parsed = updateOrderStatusSchema.safeParse(values)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  try {
    const supabase = await createClient()
    const { error } = await supabase.from("orders").update({
      status: parsed.data.status,
      ...(parsed.data.status === "completed" ? { completed_at: new Date().toISOString() } : {}),
    }).eq("id", id)
    if (error) return { error: error.message }
    revalidatePath("/orders")
    revalidatePath(`/orders/${id}`)
    return { success: true }
  } catch {
    return { error: "Failed to update order status" }
  }
}

export const openCashSession = async (openingAmount: number, userId: string) => {
  if (openingAmount < 0) return { error: "Opening amount must be 0 or more" }

  try {
    const supabase = await createClient()

    const { data: existing } = await supabase
      .from("cash_sessions")
      .select("id")
      .eq("status", "open")
      .maybeSingle()

    if (existing) return { error: "A cash session is already open" }

    const { data, error } = await supabase
      .from("cash_sessions")
      .insert({ opened_by: userId, opening_amount: openingAmount, status: "open" })
      .select("id")
      .single()

    if (error || !data) return { error: error?.message ?? "Failed to open session" }
    revalidatePath("/cash-session")
    return { success: true, sessionId: data.id }
  } catch {
    return { error: "Failed to open cash session" }
  }
}

export const closeCashSession = async (
  sessionId: string,
  closingAmount: number,
  userId: string,
  notes?: string
) => {
  if (closingAmount < 0) return { error: "Closing amount must be 0 or more" }

  try {
    const supabase = await createClient()

    const { data: session } = await supabase
      .from("cash_sessions")
      .select("opening_amount, opened_at")
      .eq("id", sessionId)
      .single()

    if (!session) return { error: "Session not found" }

    const { data: cashSales } = await supabase
      .from("orders")
      .select("total")
      .eq("payment_method", "cash")
      .eq("status", "completed")
      .gte("created_at", session.opened_at)

    const totalCashSales = cashSales?.reduce((sum, o) => sum + (o.total ?? 0), 0) ?? 0
    const expectedCash = session.opening_amount + totalCashSales
    const cashDifference = closingAmount - expectedCash

    const { error } = await supabase.from("cash_sessions").update({
      closed_by: userId,
      closing_amount: closingAmount,
      expected_cash: expectedCash,
      cash_difference: cashDifference,
      status: "closed",
      notes: notes ?? null,
      closed_at: new Date().toISOString(),
    }).eq("id", sessionId)

    if (error) return { error: error.message }
    revalidatePath("/cash-session")
    revalidatePath("/")
    return { success: true, expectedCash, cashDifference }
  } catch {
    return { error: "Failed to close cash session" }
  }
}
